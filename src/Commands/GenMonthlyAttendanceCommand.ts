import { file } from "googleapis/build/src/apis/file";
import * as dateUtils from "../Utils/dateUtils"
import {DATA_RANGE_MORN, DATA_RANGE_AFTN} from "./CommandConstants"
import {SheetManipulationCommand} from "./SheetManipulationCommand"
import * as dfd from "danfojs-node"
import { drive_v3, sheets_v4 } from "googleapis";

require('dotenv').config();

export class GenMonthlyAttendanceCommand extends SheetManipulationCommand {
    private googleDriveInstance: drive_v3.Drive;
    private FOLDER_ID: string = process.env.FOLDER_ID as string;

    public constructor(googleSheetInstance: sheets_v4.Sheets, googleDriveInstance: drive_v3.Drive) {
        super(googleSheetInstance)
        this.googleDriveInstance = googleDriveInstance;
    }

    /**
     * Computes the date of the previous month from the current date
     *
     * @protected
     * @param {Date} date current date
     * @return {Date} date of start of last month 
     * @memberof GenMonthlyAttendanceCommand
     */
    protected getLastMonthFrom(date: Date): Date {
        return date.getMonth() == 0 ? new Date(date.getFullYear()-1, 11, 1): new Date(date.getFullYear(), date.getMonth() - 1, 1);
    }

    /**
     * Computes number of days in the month of the given date
     *
     * @protected
     * @param {Date} date current date
     * @return {number} the number of days in the month of the given date
     * @memberof GenMonthlyAttendanceCommand
     */
    protected getNumOfDaysIn(date: Date): number {
        const tmp: Date = new Date(date);
        tmp.setMonth(tmp.getMonth()+1);
        tmp.setDate(0);
        return tmp.getDate();
    }

    /**
     * Computes the name of the sheets of interest based on the date and the number of days in the month of the give date
     *
     * @protected
     * @param {Date} date the date of interest 
     * @param {number} numOfDaysInLastMonth the number of days in the month of the given date
     * @return {string[]} the list of sheet names
     * @memberof GenMonthlyAttendanceCommand
     */
    protected getSheetNames(date: Date, numOfDaysInLastMonth: number): string[] {
        const sheetNames: string[] = [];
        for (let i = 1; i < numOfDaysInLastMonth; i = i + 7) {
            date.setDate(i);
            sheetNames.push(dateUtils.getWeekFromDate(date));
        }
        date.setDate(numOfDaysInLastMonth);
        if (!sheetNames.includes(dateUtils.getWeekFromDate(date))){
            sheetNames.push(dateUtils.getWeekFromDate(date));
        }
        return sheetNames
    }

    /**
     * parses the weekly attendance into dictionary format
     *
     * @protected
     * @param {string[][]} amAttendance
     * @param {string[][]} pmAttendance
     * @return {{[key: string]: string[]}} weekly attendance in dictionary format
     * @memberof GenMonthlyAttendanceCommand
     */
    protected parseRawWeeklyAttendance(amAttendance: string[][], pmAttendance: string[][]): {[key: string]: string[]} {
        var weeklyAttendance: {[key:string]: string[]} = {};
        for (let i = 0; i < 7; i++) {
            const date: string = amAttendance[i * 3][0];
            const names: string[] = amAttendance[i * 3].splice(1).concat(pmAttendance[i * 3].splice(1));
            weeklyAttendance[date] = names.filter((name) => {return name != 'Name' && name != ''});
        }
        return weeklyAttendance
    }

    /**
     * Gets the weekly attendance based on the sheetname
     *
     * @private
     * @param {string} sheetName
     * @return {Promise<{[key: string]: string[]}>} weekly attendance
     * @memberof GenMonthlyAttendanceCommand
     */
    private async getWeeklyAttendanceData(sheetName: string): Promise<{[key: string]: string[]}> {
        const AM: Boolean = true;
        const amAttendance: string[][] = await this.getWeeklyAttendanceOn(sheetName, AM);
        const pmAttendance: string[][] = await this.getWeeklyAttendanceOn(sheetName, !AM);
        const weeklyAttendanceParsed = this.parseRawWeeklyAttendance(amAttendance,pmAttendance);
        return weeklyAttendanceParsed
    }

    /**
     * removes dates which are not in the target month
     *
     * @protected
     * @param {number} month
     * @param {{[key: string]: string[]}} unfilteredDates
     * @return {{[key: string]: string[]}}
     * @memberof GenMonthlyAttendanceCommand
     */
    protected filteredDates(month: number, unfilteredDates:{[key: string]: string[]}): {[key: string]: string[]} {
        const filteredDates: {[key: string]: string[]}= {}
        for (let key in unfilteredDates) {
            const date:Date = dateUtils.stringToDate(key);
            if (date.getMonth() == month){
                filteredDates[key] = unfilteredDates[key];
            }
        }
        return filteredDates
    }

    /**
     * Computes the mapping between full name and nick name from raw data retrieved from google sheets
     * 
     * @param rawNicknameTableMap 
     * @returns dictionary containintg the nickname to full name mapping
     */
    protected parseNicknameTableMap(rawNicknameTableMap: string[][]): {[key: string]: string} {
        const nicknames: string[]= rawNicknameTableMap[0];
        const names: string[] = rawNicknameTableMap[1];
        const nicknameTableMap: {[key: string]: string} = {}
        for (let i = 0; i < nicknames.length; i++) {
            nicknameTableMap[nicknames[i]] = names[i]
        }
        return nicknameTableMap
    }

    /**
     * Gets the nickname table from google sheets
     * 
     * @returns raw nickname table to be parsed
     */
    private async getNickNames(): Promise<string[][]> {
        const sheet = await this.googleSpreadsheetInstance.values.get({   
            range: "Nicknames!A:B",
            spreadsheetId: this.spreadSheetId,
            majorDimension: "COLUMNS"
        }) 
        return sheet.data.values as string[][]
    }

    /**
     * Maps the nicknames from the raw monthly attendance to the full name
     * 
     * @param rawMonthlyData 
     * @param nicknameTable 
     * @returns Monthly attendance with full name
     */
    protected parseData(rawMonthlyData: {[key: string]: string[]}, nicknameTable: {[key:string]:string} ): {[key: string]: string[]} {
        for (let key in rawMonthlyData) {
            rawMonthlyData[key] = rawMonthlyData[key].map((nickname) => nicknameTable[nickname]).filter((name) => {return name != undefined})
        }
        return rawMonthlyData
    }

    /**
     * gets the attendance data of the last month 
     * @param nicknameTable 
     * @returns attendance data of the last month
     */
    private async getLastMonthData(nicknameTable: {[key:string]:string}): Promise<{[key: string]: string[]}> {
        const date: Date = this.getLastMonthFrom(new Date());
        const numOfDaysInMonth: number = this.getNumOfDaysIn(date);
        const sheetNames: string[] = this.getSheetNames(new Date(date), numOfDaysInMonth);
        const rawData: {[key: string]: string[]} = {};
        for (let sheetName of sheetNames) {
            const weeklyAttendance: {[key: string]: string[]} = await this.getWeeklyAttendanceData(sheetName)
            Object.assign(rawData, this.filteredDates(date.getMonth(), weeklyAttendance));
        }
        return this.parseData(rawData, nicknameTable);
    }

    /**
     * Writes the attendance data to an google sheet file and save it into the drive
     *
     * @private
     * @param {string[][]} attendance
     * @memberof GenMonthlyAttendanceCommand
     */
    private async writeToDrive(attendance: string[][]) {
        const sheetName: string = (this.getLastMonthFrom(new Date()).toLocaleDateString('en-GB',{month:'long'})) + ' Training Attendance'
        const driveReqBody: {[key: string]: any} = {
            'name': sheetName,
            'parents': [this.FOLDER_ID],
            'mimeType': 'application/vnd.google-apps.spreadsheet',
            }
        const res = await this.googleDriveInstance.files.create({requestBody: driveReqBody})
        const fileID: string = res.data.id as string
        const sheetReqBody: {[key: string]: any} = {values: attendance}
        this.googleSpreadsheetInstance.values.update({spreadsheetId:fileID, range:"Sheet1", valueInputOption:'USER_ENTERED', requestBody:sheetReqBody})
    }

    /**
     * command called by user from the telegram interface
     *
     * @memberof GenMonthlyAttendanceCommand
     */
    public async generateAttendance() {
        const nicknameTable: string[][] = await this.getNickNames();
        const fullnameList: string[] = nicknameTable[1].slice(1);
        const attendanceData: {[key: string]: string[]}= await this.getLastMonthData(this.parseNicknameTableMap(nicknameTable));
        const dates = Object.keys(attendanceData);
        const formalData = new dfd.DataFrame({index:fullnameList});
        for (let date of dates) {
            const dailyAttendance: number[] = [];
            for (let name of fullnameList){
                dailyAttendance.push(attendanceData[date].includes(name)?1:0) ;
            }
            formalData.addColumn(date, dailyAttendance, {inplace: true});
        }
        const output:string[][] = formalData.values as string[][]
        output.unshift(formalData.columns)
        this.writeToDrive(output)
    }
}