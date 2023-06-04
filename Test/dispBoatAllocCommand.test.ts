import {DispBoatAllocCommand} from '../src/Commands/dispBoatAllocCommand';
import {google, sheets_v4, Auth, Common} from "googleapis";

const auth: Auth.GoogleAuth = new google.auth.GoogleAuth({
    keyFile: "./credentials.json",
    scopes: "https://www.googleapis.com/auth/spreadsheets", 
});
const googleSheetInstance: sheets_v4.Sheets = google.sheets({ version: "v4", auth: auth});
const dispBoatAllocCommand: DispBoatAllocCommand = new DispBoatAllocCommand(googleSheetInstance);

// describe( "Method - getLastDateOfWeek()", () => {
//     test ("Test 1 - request status code 200", async () =>{
//         expect(200).toEqual(await dispBoatAllocCommand.getTodayMorn());
//     });

// });