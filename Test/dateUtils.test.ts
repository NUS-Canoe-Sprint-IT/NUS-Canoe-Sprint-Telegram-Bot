import { start } from "repl";
import {getFirstDateOfWeek, getLastDateOfWeek, getWeekToString, getWeekFromDate, dateToString} from "../src/Utils/dateUtils"

describe( "Method - getFirstDateOfWeek()", () => {
    test ("Test 1 - date falls on Sunday", () =>{
        const date: Date = new Date("2023-05-28"); // Monday falls on 2023-05-22
        const firstDayOfWeek: Date = getFirstDateOfWeek(date);
        const expectedDate: Date = new Date("2023-05-22");
        expect(firstDayOfWeek).toEqual(expectedDate);
    });

    test ("Test 2 - date falls on Monday", () =>{
        const date: Date = new Date("2022-10-17"); // Monday falls on 2022-10-17
        const firstDayOfWeek: Date = getFirstDateOfWeek(date);
        const expectedDate: Date = new Date("2022-10-17");
        expect(firstDayOfWeek).toEqual(expectedDate);
    });

    test ("Test 3.1 - date falls on any other day (Wed)", () =>{
        const date: Date = new Date("2021-11-17"); // Monday falls on 2021-11-15
        const firstDayOfWeek: Date = getFirstDateOfWeek(date);
        const expectedDate: Date = new Date("2021-11-15");
        expect(firstDayOfWeek).toEqual(expectedDate);
    });

    test ("Test 3.2 - date falls on any other day (Fri)", () =>{
        const date: Date = new Date("2019-01-18"); // Monday falls on 2021-11-15
        const firstDayOfWeek: Date = getFirstDateOfWeek(date);
        const expectedDate: Date = new Date("2019-01-14");
        expect(firstDayOfWeek).toEqual(expectedDate);
    });

});

describe( "Method - getLastDateOfWeek()", () => {
    test ("Test 1 - date falls on Monday", () =>{
        const date: Date = new Date("2023-05-22"); // Sunday falls on 2023-05-28
        const lastDayOfWeek: Date = getLastDateOfWeek(date);
        const expectedDate: Date = new Date("2023-05-28"); 
        expect(lastDayOfWeek).toEqual(expectedDate);
    });

    test ("Test 2 - date falls on Sunday", () =>{
        const date: Date = new Date("2022-10-16"); // Sunday falls on 2022-10-16
        const firstDayOfWeek: Date = getLastDateOfWeek(date);
        const expectedDate: Date = new Date("2022-10-16");
        expect(firstDayOfWeek).toEqual(expectedDate);
    });

    test ("Test 3.1 - date falls on any other day (Wed)", () =>{
        const date: Date = new Date("2021-11-17"); // Sunday falls on 2021-11-21
        const firstDayOfWeek: Date = getLastDateOfWeek(date);
        const expectedDate: Date = new Date("2021-11-21");
        expect(firstDayOfWeek).toEqual(expectedDate);
    });

    test ("Test 3.2 - date falls on any other day (Fri)", () =>{
        const date: Date = new Date("2019-01-18"); // Monday falls on 2021-11-15
        const firstDayOfWeek: Date = getLastDateOfWeek(date);
        const expectedDate: Date = new Date("2019-01-20");
        expect(firstDayOfWeek).toEqual(expectedDate);
    });
});

describe( "Method - getWeekToString", () => {
    test ("Test 1 - May 29/05 - Jun 04/06", () =>{
        const startDate: Date = new Date("2023-05-29"); 
        const endDate: Date = new Date("2023-06-04"); 
        const expected: string = "May 29/05 - Jun 04/06";
        const actual: string = getWeekToString(startDate, endDate);
        expect(actual).toEqual(expected);
    });

    test ("Test 2 - Jun 05/06 - Jun 11/06", () =>{
        const startDate: Date = new Date("2023-06-05"); 
        const endDate: Date = new Date("2023-06-11"); 
        const expected: string = "Jun 05/06 - Jun 11/06";
        const actual: string = getWeekToString(startDate, endDate);
        expect(actual).toEqual(expected);
    });

    test ("Test 3 - Mar 27/03 - Apr 02/04", () =>{
        const startDate: Date = new Date("2023-03-27"); 
        const endDate: Date = new Date("2023-04-02"); 
        const expected: string = "Mar 27/03 - Apr 02/04";
        const actual: string = getWeekToString(startDate, endDate);
        expect(actual).toEqual(expected);
    });
});

describe( "Method - getWeekFromDate", () => {
    test ("Test 1 - 2023-06-02", () =>{
        const date: Date = new Date("2023-06-02"); 
        const expected: string = "May 29/05 - Jun 04/06";
        const actual: string = getWeekFromDate(date);
        expect(actual).toEqual(expected);
    });

    test ("Test 2 - 2023-01-10", () =>{
        const date: Date = new Date("2023-01-10"); 
        const expected: string = "Jan 09/01 - Jan 15/01";
        const actual: string = getWeekFromDate(date);
        expect(actual).toEqual(expected);
    });

    test ("Test 3 - 2023-03-03", () =>{
        const date: Date = new Date("2023-03-03"); 
        const expected: string = "Feb 27/02 - Mar 05/03";
        const actual: string = getWeekFromDate(date);
        expect(actual).toEqual(expected);
    });
});

describe( "Method - dateToString", () => {
    test ("Test 1 - 2023-06-02", () =>{
        const date: Date = new Date("2023-06-02"); 
        const expected: string = "2/6/2023";
        const actual: string = dateToString(date);
        expect(actual).toEqual(expected);
    });

    test ("Test 2 - 2023-01-10", () =>{
        const date: Date = new Date("2023-01-10"); 
        const expected: string = "10/1/2023";
        const actual: string = dateToString(date);
        expect(actual).toEqual(expected);
    });

    test ("Test 3 - 2023-03-03", () =>{
        const date: Date = new Date("2023-03-03"); 
        const expected: string = "3/3/2023";
        const actual: string = dateToString(date);
        expect(actual).toEqual(expected);
    });
});