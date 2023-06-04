import {google, sheets_v4, Auth} from "googleapis";

import * as dateUtils from "../Utils/dateUtils"
import {DATA_RANGE_MORN, DATA_RANGE_AFTN} from "./CommandConstants"
import {SheetManipulationCommand} from "./SheetManipulationCommand"

export class DispBoatAllocCommand extends SheetManipulationCommand {

    private parse(todaysAlloc:[string,string][]): string {
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

    public async getBoatAllocation() {
        const today = new Date();
        const AM: Boolean = true;
        const currentWeekAttendance: {[key: string]: [string, string][]} = await this.getWeeklyAttendanceOn(new Date(), AM);
        const todaysAlloc: [string, string][] = currentWeekAttendance[dateUtils.dateToString(today)];
        return this.parse(todaysAlloc)
    }

}