import {months} from "./UtilsConstants";

export function getFirstDateOfWeek(d: Date): Date {
    var mondayDate: number = d.getDate() - d.getDay() + (d.getDay() == 0 ? -6:1);
    return new Date(d.setDate(mondayDate));
}

export function getLastDateOfWeek(d: Date): Date {
    var sundayDate: number = d.getDate() + (d.getDay() == 0 ? 0:(7 - d.getDay()));
    return new Date(d.setDate(sundayDate));
}

export function getWeekToString(mondayDate: Date, sundayDate: Date): string {
    const startMonthNum: string = ('0' + (mondayDate.getMonth() + 1)).slice(-2);
    const startMonth: string = months[mondayDate.getMonth() ];
    const startDate: string = ('0' + mondayDate.getDate()).slice(-2);

    const endMonthNum: string = ('0' + (sundayDate.getMonth() + 1)).slice(-2);
    const endMonth: string = months[sundayDate.getMonth()];
    const endDate: string = ('0' + sundayDate.getDate()).slice(-2);

    return `${startMonth} ${startDate}/${startMonthNum} - ${endMonth} ${endDate}/${endMonthNum}`;
}