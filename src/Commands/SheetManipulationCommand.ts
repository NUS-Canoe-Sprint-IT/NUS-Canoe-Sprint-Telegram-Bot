import {google, sheets_v4, Auth} from "googleapis";
import * as dotenv from "dotenv";

import * as dateUtils from "../Utils/dateUtils"
import {zipNameAndBoatAlloc} from "../Utils/googleSheetsUtils"
import {DATA_RANGE_MORN, DATA_RANGE_AFTN} from "./CommandConstants"

require('dotenv').config();

export class SheetManipulationCommand {
    protected googleSpreadsheetInstance: sheets_v4.Resource$Spreadsheets
    protected spreadSheetId: string = process.env.SPREADSHEET_ID as string

    public constructor(googleSheetInstance: sheets_v4.Sheets) {
        this.googleSpreadsheetInstance = googleSheetInstance.spreadsheets;
    }

    protected async getWeeklyAttendanceOn(week: string, AM: Boolean): Promise<string[][]> {
        const dataRange = AM ? DATA_RANGE_MORN : DATA_RANGE_AFTN
        const sheet = await this.googleSpreadsheetInstance.values.get({   
            range : week + "!" + dataRange,
            spreadsheetId: this.spreadSheetId,
            majorDimension: "COLUMNS"
        })
        return sheet.data.values as string[][]
    }
}
