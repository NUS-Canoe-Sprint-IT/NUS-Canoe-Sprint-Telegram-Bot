import * as dateUtils from "../src/Utils/dateUtils"
import {DATA_RANGE_MORN, DATA_RANGE_AFTN} from "../src/Commands/CommandConstants"
import {GenMonthlyAttendanceCommand} from "../src/Commands/GenMonthlyAttendanceCommand"
import {google, sheets_v4, Auth, Common} from "googleapis";

class GenMonthlyAttendanceCommandTest extends  GenMonthlyAttendanceCommand {

    public testGetLastMonthFrom(date: Date): Date {
        return this.getLastMonthFrom(date);
    }

    public testGetNumOfDaysIn(date: Date): number {
        return this.getNumOfDaysIn(date);
    }

    public testGetSheetNames(date: Date): string[] {
        return this.getSheetNames(date)
    }
}

const auth: Auth.GoogleAuth = new google.auth.GoogleAuth({
    keyFile: "./credentials.json",
    scopes: "https://www.googleapis.com/auth/spreadsheets", 
});
const googleSheetInstance: sheets_v4.Sheets = google.sheets({ version: "v4", auth: auth});
const testCommand: GenMonthlyAttendanceCommandTest = new GenMonthlyAttendanceCommandTest(googleSheetInstance);

describe( "Method - getLastMonthFrom()", () => {
    test ("Test 1 - May", () =>{
        const date: Date = testCommand.testGetLastMonthFrom(new Date(2023, 4, 28)); // Monday falls on 2023-05-22
        const expected: Date = new Date(2023, 3, 1);
        expect(date).toEqual(expected);
    });

    test ("Test 2 - Jan", () =>{
        const date: Date = testCommand.testGetLastMonthFrom(new Date(2023, 0, 28)); // Monday falls on 2023-05-22
        const expected: Date = new Date(2022, 11, 1);
        expect(date).toEqual(expected);
    });
});

describe( "Method - testGetNumOfDays()", () => {
    test ("Test 1 - Feb, 28 days", () =>{
        const numOfDays: number = testCommand.testGetNumOfDaysIn(new Date(2023, 1, 1))
        expect(numOfDays).toEqual(28);
    });

    test ("Test 2 - Feb, 29 days", () =>{
        const numOfDays: number = testCommand.testGetNumOfDaysIn(new Date(2020, 1, 1))
        expect(numOfDays).toEqual(29);
    });

    test ("Test 3 - Jun, 30 days", () =>{
        const numOfDays: number = testCommand.testGetNumOfDaysIn(new Date(2023, 5, 1))
        expect(numOfDays).toEqual(30);
    });

    test ("Test 4 - Jul, 31 days", () =>{
        const numOfDays: number = testCommand.testGetNumOfDaysIn(new Date(2023, 6, 1))
        expect(numOfDays).toEqual(31);
    });
});

describe( "Method - testGetSheetNames()", () => {
    test ("Test 1 - Jan", () =>{
        const sheetNames: string[] = testCommand.testGetSheetNames(new Date(2023, 1, 1))
        const expected: string[] = [
            "Dec 26/12 - Jan 01/01",
            "Jan 02/01 - Jan 08/01",
            "Jan 09/01 - Jan 15/01",
            "Jan 16/01 - Jan 22/01",
            "Jan 23/01 - Jan 29/01",
            "Jan 30/01 - Feb 05/02"
        ]
        expect(sheetNames).toEqual(expected);
    });

    test ("Test 1 - May", () =>{
        const sheetNames: string[] = testCommand.testGetSheetNames(new Date(2023, 5, 1))
        const expected: string[] = [
            "May 01/05 - May 07/05",
            "May 08/05 - May 14/05",
            "May 15/05 - May 21/05",
            "May 22/05 - May 28/05",
            "May 29/05 - Jun 04/06",
        ]
        expect(sheetNames).toEqual(expected);
    });

})