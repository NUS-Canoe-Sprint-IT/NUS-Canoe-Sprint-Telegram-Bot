import {google, sheets_v4, Auth} from "googleapis";
import * as dotenv from "dotenv";

import * as dateUtils from "../Utils/dateUtils"
import {zipNameAndBoatAlloc} from "../Utils/googleSheetsUtils"
import {DATA_RANGE_MORN, DATA_RANGE_AFTN} from "./CommandConstants"
import { promises } from "dns";

require('dotenv').config();

export class SheetManipulationCommand {
    private googleSpreadsheetInstance: sheets_v4.Resource$Spreadsheets
    private spreadSheetId: string = process.env.SPREADSHEET_ID as string
    private currentWeek: string;

    public constructor(googleSheetInstance: sheets_v4.Sheets) {
        this.googleSpreadsheetInstance = googleSheetInstance.spreadsheets;
        this.currentWeek = dateUtils.getWeekFromDate(new Date())
    }

    private parseRawWeeklyAttendance(sheetName: string ,data: string[][]): {[key: string]: [string, string][]} {
        var weeklyAttendance: {[key:string]: [string, string][]} = {}
        for (let i = 0; i < 7; i++) {
            const date: string = data[i * 3][0]
            const names: string[] = data[i * 3].splice(1)
            const boats: string[] = data[(i * 3 )+ 2].splice(1)
            weeklyAttendance[date] =  zipNameAndBoatAlloc(names, boats)
        }
        return weeklyAttendance
    }

    protected async getWeeklyAttendanceOn(date: Date, AM: Boolean): Promise<{[key: string]: [string, string][]}> {
        const sheetName:string = dateUtils.getWeekFromDate(date)
        const dataRange = AM ? DATA_RANGE_MORN : DATA_RANGE_AFTN
        const sheet = await this.googleSpreadsheetInstance.values.get({   
            range : sheetName + "!" + dataRange,
            spreadsheetId: this.spreadSheetId,
            majorDimension: "COLUMNS"
        })
        return this.parseRawWeeklyAttendance(sheetName, sheet.data.values as string[][])
    }

}