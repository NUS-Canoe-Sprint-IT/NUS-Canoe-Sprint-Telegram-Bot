import {Context, Telegraf} from 'telegraf';
import {botRequest} from 'telegraf/typings/button';
import {Update} from 'typegram';
import {google, sheets_v4, Auth, Common, drive_v3} from "googleapis";
import * as dotenv from "dotenv";

import {greet} from './Commands/greetings';
import {HELP_MESSAGE} from './Commands/CommandConstants';
import {DispBoatAllocCommand} from './Commands/dispBoatAllocCommand'
import { GenMonthlyAttendanceCommand } from './Commands/GenMonthlyAttendanceCommand';
import { TestForm } from './Commands/TestForm'; 

/* Load environment variables */
require('dotenv').config();

/* Initialize environment */
const environment: string = process.env.ENVIRONMENT as string;

/* Initialize Googlesheets instance */
const auth: Auth.GoogleAuth = new google.auth.GoogleAuth({
    keyFile: "./credentials.json",
    scopes: ["https://www.googleapis.com/auth/spreadsheets", "https://www.googleapis.com/auth/drive"], 
});
const googleSheetInstance: sheets_v4.Sheets = google.sheets({ version: "v4", auth: auth});
const googleDriveInstance: drive_v3.Drive = google.drive({version:"v3", auth: auth});

/* Initialize command objects */
const dispBoatAllocCommand: DispBoatAllocCommand = new DispBoatAllocCommand(googleSheetInstance);
const genMonthlyAttendanceCommand: GenMonthlyAttendanceCommand = new GenMonthlyAttendanceCommand(googleSheetInstance, googleDriveInstance);

/* Initialize Telegram Bot */
const APIToken: string = (environment == 'prod' ? process.env.PROD_BOT_TOKEN : process.env.TEST_BOT_TOKEN) as string
const bot: Telegraf<Context<Update>> = new Telegraf(APIToken);

/* Initializing all the commands */
bot.start((ctx) => {ctx.reply(greet(ctx.from.first_name));});
bot.help((ctx) => {ctx.reply(HELP_MESSAGE)})
bot.command("getBoatAlloc", (ctx) => {dispBoatAllocCommand.getBoatAllocation()
    .then((res) => ctx.reply(res, {parse_mode:"MarkdownV2"}))
    .catch((e) => {console.error(e)})
})
bot.command("genAttendance", (ctx) => {genMonthlyAttendanceCommand.generateAttendance()
    .then((res) => ctx.reply(res + " Training attendance created"))
    .catch((e) => {console.error(e)})
})
// unsure if this is the correct text handling format
bot.command("form", async (ctx: Context) => {
    await ctx.reply("Send your name, contact number, number of 1 star paddlers and non-certified paddlers, start time and end time in 24h format (14:00 for afternoon) like this: \n Rouvin\n 81234567\n 15\n 4\n 07:30\n 09:30\n ONLY NAMES CAN HAVE SPACES"
    const textListener = (textCtx: Context) => {
        const userInput = textCtx.message.text;
        const values = userInput.split('\n').map (value => value.trim());

        if (values.length >= 6){
            const [name, hp, onestar, zerostar, startTime, endTime] = values;
            await TestForm.submitForm(name, hp, onestar, zerostar, startTime, endTime).then(() => {
                textCtx.reply('Form Submitted.');
            })
            .catch (error => {
                textCtx.reply(`Error submitting form ${error.message}`);
            });
        }
        else{
            textCtx.reply('Please provide all required values.');
        }
    };
    bot.on('text', textListener);
})

console.log("Launching Telegram bot")
bot.launch();
console.log("Telegram Bot successfully launched")

/* graceful termination */
process.once('SIGINT', () => bot.stop('SIGINT'));
process.once('SIGTERM', () => bot.stop('SIGTERM'));
