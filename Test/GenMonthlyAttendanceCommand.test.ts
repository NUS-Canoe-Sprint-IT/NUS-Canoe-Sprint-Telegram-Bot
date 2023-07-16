import * as dateUtils from "../src/Utils/dateUtils"
import {DATA_RANGE_MORN, DATA_RANGE_AFTN} from "../src/Commands/CommandConstants"
import {GenMonthlyAttendanceCommand} from "../src/Commands/GenMonthlyAttendanceCommand"
import {google, sheets_v4, Auth, Common, drive_v3} from "googleapis";

class GenMonthlyAttendanceCommandTest extends  GenMonthlyAttendanceCommand {

    public testGetLastMonthFrom(date: Date): Date {
        return this.getLastMonthFrom(date);
    }

    public testGetNumOfDaysIn(date: Date): number {
        return this.getNumOfDaysIn(date);
    }

    public testGetSheetNames(date: Date, numberOfDays:number): string[] {
        return this.getSheetNames(date, numberOfDays)
    }

    public testParseRawWeeklyBoatAlloc (amAttendance: string[][], pmAttendance: string[][]): {[key: string]: string[]}  {
        return this.parseRawWeeklyBoatAlloc(amAttendance, pmAttendance)
    }

    public testFilteredDates(month: number, data:{[key: string]: string[]}): {[key: string]: string[]} {
        return this.filteredDates(month, data)
    }

    public testParseNicknameTableMap(rawNicknameTableMap: string[][]): {[key: string]: string} {
        return this.parseNicknameTableMap(rawNicknameTableMap)
    }

    public testParseData(rawData: {[key: string]: string[]}, nicknameTable: {[key:string]:string} ): {[key: string]: string[]} {
        return this.parseData(rawData, nicknameTable)
    }
    
}

const auth: Auth.GoogleAuth = new google.auth.GoogleAuth({
    keyFile: "./credentials.json",
    scopes: "https://www.googleapis.com/auth/spreadsheets", 
});
const googleSheetInstance: sheets_v4.Sheets = google.sheets({ version: "v4", auth: auth});
const googleDriveInstance: drive_v3.Drive = google.drive({version:"v3", auth: auth});

const testCommand: GenMonthlyAttendanceCommandTest = new GenMonthlyAttendanceCommandTest(googleSheetInstance, googleDriveInstance);


describe( "Method - testGetLastMonthFrom()", () => {
    test ("Test 1 - May - normal case", () =>{
        const date: Date = testCommand.testGetLastMonthFrom(new Date(2023, 4, 28)); 
        const expected: Date = new Date(2023, 3, 1);
        expect(date).toEqual(expected);
    });

    test ("Test 2 - Jan - edge case where previous month is also from previous year", () =>{
        const date: Date = testCommand.testGetLastMonthFrom(new Date(2023, 0, 28)); 
        const expected: Date = new Date(2022, 11, 1);
        expect(date).toEqual(expected);
    });
});

describe( "Method - testGetNumOfDays()", () => {
    test ("Test 1 - Feb, 28 days - test for feb ", () =>{
        const numOfDays: number = testCommand.testGetNumOfDaysIn(new Date(2023, 1, 1))
        expect(numOfDays).toEqual(28);
    });

    test ("Test 2 - Feb, 29 days - test leap year", () =>{
        const numOfDays: number = testCommand.testGetNumOfDaysIn(new Date(2020, 1, 1))
        expect(numOfDays).toEqual(29);
    });

    test ("Test 3 - Jun, 30 days - test for 30-day months", () =>{
        const numOfDays: number = testCommand.testGetNumOfDaysIn(new Date(2023, 5, 1))
        expect(numOfDays).toEqual(30);
    });

    test ("Test 4 - Jul, 31 days - test for 31-day months", () =>{
        const numOfDays: number = testCommand.testGetNumOfDaysIn(new Date(2023, 6, 1))
        expect(numOfDays).toEqual(31);
    });
});

describe( "Method - testGetSheetNames()", () => {
    test ("Test 1 - both first and last week of month overlaps into the previous and next month", () =>{
        const sheetNames: string[] = testCommand.testGetSheetNames(new Date(2023, 0, 1),31)
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

    test ("Test 2 - last week overlaps into next month", () =>{
        const sheetNames: string[] = testCommand.testGetSheetNames(new Date(2023, 4, 1),31)
        const expected: string[] = [
            "May 01/05 - May 07/05",
            "May 08/05 - May 14/05",
            "May 15/05 - May 21/05",
            "May 22/05 - May 28/05",
            "May 29/05 - Jun 04/06",
        ]
        expect(sheetNames).toEqual(expected);
    });

    test ("Test 3 - first week overlaps into previous month", () =>{
        const sheetNames: string[] = testCommand.testGetSheetNames(new Date(2023, 11, 1),31)
        const expected: string[] = [
            "Nov 27/11 - Dec 03/12",
            "Dec 04/12 - Dec 10/12",
            "Dec 11/12 - Dec 17/12",
            "Dec 18/12 - Dec 24/12",
            "Dec 25/12 - Dec 31/12",
        ]
        expect(sheetNames).toEqual(expected);
    });


})

describe( "Method - testParseRawWeeklyBoatAlloc()", () => {
    test ("Test 1 - normal case scenario", () =>{
        const amAttendance: string[][] = [
            ["1/1/2023","Name","abc","def"],[],[],
            ["2/1/2023","Name","abc",""],[],[],
            ["3/1/2023","Name","abc","def"],[],[],
            ["4/1/2023","Name","abc","def"],[],[],
            ["5/1/2023","Name","abc","def"],[],[],
            ["6/1/2023","Name","abc","def"],[],[],
            ["7/1/2023","Name","abc","def"],[],[],
        ] ;
        const pmAttendance: string[][] = [
            ["1/1/2023","Name",""],[],[],
            ["2/1/2023","Name","ADA"],[],[],
            ["3/1/2023","Name",""],[],[],
            ["4/1/2023","Name",""],[],[],
            ["5/1/2023","Name",""],[],[],
            ["6/1/2023","Name","EVE"],[],[],
            ["7/1/2023","Name",""],[],[],
        ]
        const expected: {[key:string]: string[]} = {
            "1/1/2023":["abc","def"],
            "2/1/2023":["abc","ADA"],
            "3/1/2023":["abc","def"],
            "4/1/2023":["abc","def"],
            "5/1/2023":["abc","def"],
            "6/1/2023":["abc","def","EVE"],
            "7/1/2023":["abc","def"],
        };
        const actual: {[key:string]:string[]} = testCommand.testParseRawWeeklyBoatAlloc(amAttendance,pmAttendance)
        expect(expected).toMatchObject(actual);
    });

    test ("Test 2 - completely empty", () =>{
        const amAttendance: string[][] = [
            ["1/1/2023","Name"],[],[],
            ["2/1/2023","Name"],[],[],
            ["3/1/2023","Name"],[],[],
            ["4/1/2023","Name"],[],[],
            ["5/1/2023","Name"],[],[],
            ["6/1/2023","Name"],[],[],
            ["7/1/2023","Name"],[],[],
        ] ;
        const pmAttendance: string[][] = [
            ["1/1/2023","Name"],[],[],
            ["2/1/2023","Name"],[],[],
            ["3/1/2023","Name"],[],[],
            ["4/1/2023","Name"],[],[],
            ["5/1/2023","Name"],[],[],
            ["6/1/2023","Name"],[],[],
            ["7/1/2023","Name"],[],[],
        ]
        const expected: {[key:string]: string[]} = {
            "1/1/2023":[],
            "2/1/2023":[],
            "3/1/2023":[],
            "4/1/2023":[],
            "5/1/2023":[],
            "6/1/2023":[],
            "7/1/2023":[],
        };
        const actual: {[key:string]:string[]} = testCommand.testParseRawWeeklyBoatAlloc(amAttendance,pmAttendance)
        expect(expected).toMatchObject(actual);
    });
})

describe( "Method - testParseNicknameTableMap()", () => {
    test ("Test 1 - normal case scenario", () =>{
        const nicknames: string[][] = [
            ["J","R","JQ"],
            ["Jane","Ryan","Jia Qi"]
        ] ;

        const expected: {[key:string]: string} = {
            "J":"Jane",
            "R":"Ryan",
            "JQ":"Jia Qi"
        };
        const actual: {[key:string]:string} = testCommand.testParseNicknameTableMap(nicknames)
        expect(expected).toMatchObject(actual);
    });

})

describe( "Method - testParseData()", () => {
    test ("Test 1 - normal case scenario", () =>{
        const rawData: {[key:string]: string[]} = {
            "1/1/2023":["J","R"],
            "2/1/2023":["JQ","ADA"],
            "3/1/2023":[""],
            "4/1/2023":["R","JQ","J"],
            "5/1/2023":["JQ","R"],
            "6/1/2023":["EVE"],
            "7/1/2023":["JQ","J"],
        };

        const nicknameTable: {[key:string]: string} = {
            "J":"Jane",
            "R":"Ryan",
            "JQ":"Jia Qi"
        };

        const expected: {[key:string]: string[]} = {
            "1/1/2023":["Jane","Ryan"],
            "2/1/2023":["Jia Qi"],
            "3/1/2023":[],
            "4/1/2023":["Ryan","Jia Qi","Jane"],
            "5/1/2023":["Jia Qi","Ryan"],
            "6/1/2023":[],
            "7/1/2023":["Jia Qi","Jane"],
        };

        const actual: {[key:string]: string[]} = testCommand.testParseData(rawData, nicknameTable)
        expect(expected).toMatchObject(actual);
    });

})