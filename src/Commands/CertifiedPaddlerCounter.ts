import * as dateUtils from "../Utils/dateUtils"
import { zipNameAndBoatAlloc } from "../Utils/googleSheetsUtils"
import {DATA_RANGE_MORN, DATA_RANGE_AFTN} from "./CommandConstants"
import {SheetManipulationCommand} from "./SheetManipulationCommand"

export class CertifiedPaddlerCounter extends SheetManipulationCommand {

    /*
     * Returns a map from date (as a string) to name list (as an array of strings).
     */
    private parseDailyNameList(data: string[][]): {[key: string]: string[]} {
        var dateToNameList: {[key:string]: string[]} = {}
        for (let i = 0; i < 7; i++) {
            const date: string = data[i * 3][0]
            const names: string[] = data[i * 3].splice(1)
            dateToNameList[date] = names
        }
        return dateToNameList
    } 

    /*
     * Returns all columns of the nickname sheet
     * Nickname | Full Name | Birthday | Jersey Size | One Star
     */
    private async getNicknamesSheet(): Promise<string[][]> {
        const sheet = await this.googleSpreadsheetInstance.values.get({   
            range: "Nicknames!A:H",
            spreadsheetId: this.spreadSheetId,
            majorDimension: "COLUMNS"
        })
        return sheet.data.values as string[][]
    }

    /*
     * Returns a map from nickname to one star status
     */
    private async getNicknameToOneStar(): Promise<Map<string, boolean>> {
        let nicknameToOneStar: Map<string, boolean> = new Map();
        const nicknamesSheet: string[][] = await this.getNicknamesSheet();
        const nicknames: string[] = nicknamesSheet[0];
        const oneStars: string[] = nicknamesSheet[7];
        for (let i = 0; i < nicknames.length; i++) {
            const oneStarStatus: boolean = oneStars[i] == '1'
            nicknameToOneStar.set(nicknames[i], oneStarStatus);
        }
        return nicknameToOneStar;
    }

    /*
     * Returns a pair (oneStarCertifiedCount, nonCertifiedCount)
     */
    public async getOneStarZeroStarCount(): Promise<number[]> {
        const today: Date = new Date();
        const thisWeek: string = dateUtils.getWeekFromDate(today);
        const isAM: Boolean = (today.getHours() <= 12) ;
        const currentWeekAttendanceRaw: string[][] = await this.getWeeklyAttendanceOn(thisWeek , isAM);
        const currentWeekAttendanceParsed: {[key: string]: string[]} = this.parseDailyNameList(currentWeekAttendanceRaw)
        const todaysNameList: string[] = currentWeekAttendanceParsed[dateUtils.dateToString(today)];
        const nicknameToOneStar: Map<string, boolean> = await this.getNicknameToOneStar();

        let numCertified: number = 0;
        for (var name in todaysNameList) {
            if (nicknameToOneStar.has(name) && nicknameToOneStar.get(name)) {
                numCertified += 1;
            }
        }
        const numUncertified = todaysNameList.length - numCertified;
        return [numCertified, numUncertified]
    }
}
