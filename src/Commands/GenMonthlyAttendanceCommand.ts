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

    protected getLastMonthFrom(date: Date): Date {
        return date.getMonth() == 0 ? new Date(date.getFullYear()-1, 11, 1): new Date(date.getFullYear(), date.getMonth() - 1, 1);
    }

    protected getNumOfDaysIn(date: Date): number {
        const tmp: Date = new Date(date);
        tmp.setMonth(tmp.getMonth()+1);
        tmp.setDate(0);
        return tmp.getDate();
    }

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

    protected parseRawWeeklyBoatAlloc(amAttendance: string[][], pmAttendance: string[][]): {[key: string]: string[]} {
        var weeklyAttendance: {[key:string]: string[]} = {};
        for (let i = 0; i < 7; i++) {
            const date: string = amAttendance[i * 3][0];
            const names: string[] = amAttendance[i * 3].splice(1).concat(pmAttendance[i * 3].splice(1));
            weeklyAttendance[date] = names.filter((name) => {return name != 'Name' && name != ''});
        }
        return weeklyAttendance
    }

    private async getWeeklyAttendanceData(sheetName: string): Promise<{[key: string]: string[]}> {
        const AM: Boolean = true;
        const amAttendance: string[][] = await this.getWeeklyAttendanceOn(sheetName, AM);
        const pmAttendance: string[][] = await this.getWeeklyAttendanceOn(sheetName, !AM);
        const weeklyAttendanceParsed = this.parseRawWeeklyBoatAlloc(amAttendance,pmAttendance);
        return weeklyAttendanceParsed
    }

    protected filteredDates(month: number, data:{[key: string]: string[]}): {[key: string]: string[]} {
        const filteredDates: {[key: string]: string[]}= {}
        for (let key in data) {
            const date:Date = dateUtils.stringToDate(key);
            if (date.getMonth() == month){
                filteredDates[key] = data[key];
            }
        }
        return filteredDates
    }

    protected parseNicknameTableMap(rawNicknameTableMap: string[][]): {[key: string]: string} {
        const nicknames: string[]= rawNicknameTableMap[0];
        const names: string[] = rawNicknameTableMap[1];
        const nicknameTableMap: {[key: string]: string} = {}
        for (let i = 0; i < nicknames.length; i++) {
            nicknameTableMap[nicknames[i]] = names[i]
        }
        return nicknameTableMap
    }

    private async getNickNames(): Promise<string[][]> {
        const sheet = await this.googleSpreadsheetInstance.values.get({   
            range: "Nicknames!A:B",
            spreadsheetId: this.spreadSheetId,
            majorDimension: "COLUMNS"
        }) 
        return sheet.data.values as string[][]
    }

    protected parseData(rawData: {[key: string]: string[]}, nicknameTable: {[key:string]:string} ): {[key: string]: string[]} {
        for (let key in rawData) {
            rawData[key] = rawData[key].map((nickname) => nicknameTable[nickname]).filter((name) => {return name != undefined})
        }
        return rawData
    }

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

    public async writeToDrive(attendance: string[][]) {
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
        return (this.getLastMonthFrom(new Date()).toLocaleDateString('en-GB',{month:'long'}))
    }
}