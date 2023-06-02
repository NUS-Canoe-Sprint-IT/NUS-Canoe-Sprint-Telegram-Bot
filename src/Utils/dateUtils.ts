import {months} from "./UtilsConstants";

/**
 * Computes the date of monday in the week of the supplied date
 *
 * @export
 * @param {Date} d the date of which that week's monday's date is to be computed from  
 * @return {Date} Monday's date of the week which the supplied date is in
 */
export function getFirstDateOfWeek(d: Date): Date {
    var mondayDate: number = d.getDate() - d.getDay() + (d.getDay() == 0 ? -6:1);
    return new Date(d.setDate(mondayDate));
}

/**
 * Computes the date of Sunday in the week of the supplied date
 *
 * @export
 * @param {Date} d the date of which that week's monday's date is to be computed from
 * @return {Date} monday's date of the week which the supplied date is in
 */
export function getLastDateOfWeek(d: Date): Date {
    var sundayDate: number = d.getDate() + (d.getDay() == 0 ? 0:(7 - d.getDay()));
    return new Date(d.setDate(sundayDate));
}

/**
 * Computes the start date and end date of the week in MMM MM/DD - MMM MM/DD format 
 * to be used to identify the target sheet based on name
 *
 * @export
 * @param {Date} mondayDate
 * @param {Date} sundayDate
 * @return {string} The start date and end date of the week in MMM MM/DD - MMM MM/DD format 
 */
export function getWeekToString(mondayDate: Date, sundayDate: Date): string {
    const startMonthNum: string = ("0" + (mondayDate.getMonth() + 1)).slice(-2);
    const startMonth: string = months[mondayDate.getMonth() ];
    const startDate: string = ("0" + mondayDate.getDate()).slice(-2);

    const endMonthNum: string = ("0" + (sundayDate.getMonth() + 1)).slice(-2);
    const endMonth: string = months[sundayDate.getMonth()];
    const endDate: string = ("0" + sundayDate.getDate()).slice(-2);

    return `${startMonth} ${startDate}/${startMonthNum} - ${endMonth} ${endDate}/${endMonthNum}`;
}