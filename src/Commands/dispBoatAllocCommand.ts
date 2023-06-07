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

    private nobodyPaddling(data: [string, string][]): Boolean {
        return data.length <= 1 
    }

    public async getBoatAllocation(): Promise<string> {
        const today = new Date();
        const isAM: Boolean = (today.getHours() <= 12) ;
        const currentWeekAttendance: {[key: string]: [string, string][]} = await this.getWeeklyAttendanceOn(new Date(), isAM);
        const todaysAlloc: [string, string][] = currentWeekAttendance[dateUtils.dateToString(today)];
        if (this.nobodyPaddling(todaysAlloc)) {
            return "Nobody is training in the " + isAM ? "morning":"afternoon"
        }
        return this.parse(todaysAlloc)
    }

}