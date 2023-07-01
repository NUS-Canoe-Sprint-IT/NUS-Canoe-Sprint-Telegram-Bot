import * as dateUtils from "../Utils/dateUtils"
import { zipNameAndBoatAlloc } from "../Utils/googleSheetsUtils"
import {DATA_RANGE_MORN, DATA_RANGE_AFTN} from "./CommandConstants"
import {SheetManipulationCommand} from "./SheetManipulationCommand"

export class DispBoatAllocCommand extends SheetManipulationCommand {

    private parseRawWeeklyBoatAlloc(data: string[][]): {[key: string]: [string, string][]} {
        var weeklyAttendance: {[key:string]: [string, string][]} = {}
        for (let i = 0; i < 7; i++) {
            const date: string = data[i * 3][0]
            const names: string[] = data[i * 3].splice(1)
            const boats: string[] = data[(i * 3 )+ 2].splice(1)
            weeklyAttendance[date] = zipNameAndBoatAlloc(names, boats)
        }
        return weeklyAttendance
    }

    private toString(todaysAlloc:[string,string][]): string {
        var message: string = "";
        var longestNameLength: number = 0;
        for (var tuple of todaysAlloc) {
            if (tuple[0].length > longestNameLength) { longestNameLength = tuple[0].length}
        }
        for (var tuple of todaysAlloc) {
            const name: string = tuple[0].padEnd(longestNameLength," ")
            const boat: string = tuple[1].trim()
            message += `${name} - ${boat}\n`;
        }
        return "```\n" + message + "```";
    }

    private nobodyPaddling(data: [string, string][]): Boolean {
        return data.length <= 1 
    }

    public async getBoatAllocation(): Promise<string> {
        const today: Date = new Date();
        const thisWeek: string = dateUtils.getWeekFromDate(today);
        const isAM: Boolean = (today.getHours() <= 12) ;
        const currentWeekAttendanceRaw: string[][] = await this.getWeeklyAttendanceOn(thisWeek , isAM);
        const currentWeekAttendanceParsed: {[key: string]: [string, string][]} = this.parseRawWeeklyBoatAlloc(currentWeekAttendanceRaw)
        const todaysAlloc: [string, string][] = currentWeekAttendanceParsed[dateUtils.dateToString(today)];
        if (this.nobodyPaddling(todaysAlloc)) {
            return "Nobody is training in the " + (isAM ? "morning":"afternoon")
        }
        return this.toString(todaysAlloc)
    }

}