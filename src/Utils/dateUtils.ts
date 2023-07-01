import {months} from "./UtilsConstants";

/**
 * Computes the date of monday in the week of the supplied date
 *
 * @export
 * @param {Date} d the date of which that week's monday's date is to be computed from  
 * @return {Date} Monday's date of the week which the supplied date is in
 */
export function getFirstDateOfWeek(d: Date): Date {
    const mondayDate: number = d.getDate() - d.getDay() + (d.getDay() == 0 ? -6:1);
    const tmp: Date = new Date(d.getFullYear(), d.getMonth(), mondayDate)
    return tmp
}

/**
 * Computes the date of Sunday in the week of the supplied date
 *
 * @export
 * @param {Date} d the date of which that week's monday's date is to be computed from
 * @return {Date} monday's date of the week which the supplied date is in
 */
export function getLastDateOfWeek(d: Date): Date {
    const sundayDate: number = d.getDate() + (d.getDay() == 0 ? 0:(7 - d.getDay()));
    const tmp: Date = new Date(d.getFullYear(), d.getMonth(), sundayDate)
    return tmp
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
    const startMonth: string = months[mondayDate.getMonth()];
    const startDate: string = mondayDate.toLocaleString("en-GB", {day:"numeric",month:"numeric"})

    const endMonth: string = months[sundayDate.getMonth()];
    const endDate: string = sundayDate.toLocaleString("en-GB", {day:"numeric",month:"numeric"})

    return `${startMonth} ${startDate} - ${endMonth} ${endDate}`;
}


/**
 * from the supplied date get the week in "MMM MM/DD - MMM MM/DD" format
 *
 * @export
 * @param {Date} d date 
 * @return {string} week in "MMM MM/DD - MMM MM/DD" format
 */
export function getWeekFromDate(d: Date): string {
    const monday: Date = getFirstDateOfWeek(d);
    const sunday: Date = getLastDateOfWeek(d);
    return getWeekToString(monday, sunday);
}


/**
 * from the supplied date get the date in dd/mm/yyyy format for cell reference
 *
 * @export
 * @param {Date} d
 * @return {string} date in dd/mm/yyyy format 
 */
export function dateToString(d: Date): string {
    const dateString = d.getDate() + "/" + (d.getMonth() + 1) + "/" + d.getFullYear()
    return dateString
}

export function stringToDate(date: string): Date {
    const [day, month, year]: string[] = date.split("/")
    return new Date(+year, +month - 1, +day)
}