import { tmpdir } from "os";
import * as dateUtils from "../Utils/dateUtils"
import {DATA_RANGE_MORN, DATA_RANGE_AFTN} from "./CommandConstants"
import {SheetManipulationCommand} from "./SheetManipulationCommand"

export class GenMonthlyAttendanceCommand extends SheetManipulationCommand {

    protected getLastMonthFrom(date: Date): Date {
        return date.getMonth() == 0 ? new Date(date.getFullYear()-1, 11, 1): new Date(date.getFullYear(), date.getMonth() - 1, 1);
    }

    protected getNumOfDaysIn(date: Date): number {
        const tmp: Date = new Date(date)
        tmp.setMonth(tmp.getMonth()+1);
        tmp.setDate(0);
        return tmp.getDate();
    }

    protected getSheetNames(date: Date): string[] {
        const lastMonth: Date = this.getLastMonthFrom(date);
        const numOfDaysInLastMonth: number = this.getNumOfDaysIn(lastMonth) ;
        const sheetNames: string[] = [];
        for (let i = 1; i < numOfDaysInLastMonth; i = i + 7) {
            lastMonth.setDate(i)
            sheetNames.push(dateUtils.getWeekFromDate(lastMonth));
        }
        lastMonth.setDate(numOfDaysInLastMonth);
        if (!sheetNames.includes(dateUtils.getWeekFromDate(lastMonth))){
            sheetNames.push(dateUtils.getWeekFromDate(lastMonth));
        }
        return sheetNames
    }


}