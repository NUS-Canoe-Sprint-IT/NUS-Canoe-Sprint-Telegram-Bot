import { Telegraf, Scenes, session } from 'telegraf';
import {botRequest} from 'telegraf/typings/button';
import {Update} from 'typegram';
import {google, sheets_v4, Auth, Common, drive_v3} from "googleapis";
import * as dotenv from "dotenv";

import {greet} from './Commands/greetings';
import {HELP_MESSAGE} from './Commands/CommandConstants';
import {DispBoatAllocCommand} from './Commands/dispBoatAllocCommand'
import { GenMonthlyAttendanceCommand } from './Commands/GenMonthlyAttendanceCommand';
import { FillForm } from './Commands/TestForm';

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
const APIToken: string = (environment == 'prod' ? process.env.PROD_BOT_TOKEN : process.env.TEST_BOT_TOKEN) as string;

/* Initialise scene for form */
const { enter, leave } = Scenes.Stage;
const formScene = new Scenes.BaseScene<Scenes.SceneContext>('fillform');

const fillFormInstance: FillForm = new FillForm();

formScene.enter((ctx) => {
    ctx.reply('Enter details (Use /help to see what is required)');
})

formScene.on("text", (ctx) => {
    const userInput = ctx.message.text;
    const values = userInput.split('\n').map(value => value.trim());
    if (values.length >= 6) {
        const [name, hp, onestar, zerostar, startTime, endTime] = values;
        fillFormInstance.submitForm(name, hp, onestar, zerostar, startTime, endTime);
        ctx.reply('Form Submitted!');
        ctx.scene.leave();
    } else {
        ctx.reply('Please check your input! Use /form to try again.');
        ctx.scene.leave();
    }
})

/* Initializing stage + bot */
const bot = new Telegraf<Scenes.SceneContext>(APIToken);
const stage = new Scenes.Stage<Scenes.SceneContext>([formScene], {
    ttl: 30,
});
bot.use(session());
bot.use(stage.middleware());

/* Initializing all the commands */
bot.start((ctx) => {ctx.reply(greet(ctx.from.first_name));});
bot.help((ctx) => {ctx.reply(HELP_MESSAGE)})
bot.command("getBoatAlloc", (ctx) => {dispBoatAllocCommand.getBoatAllocation()
    .then((res) => ctx.reply(res, {parse_mode:"MarkdownV2"}))
    .catch((e) => {console.error(e)})
});
bot.command("genAttendance", (ctx) => {genMonthlyAttendanceCommand.generateAttendance()
    .then((res) => ctx.reply(res + " Training attendance created"))
    .catch((e) => {console.error(e)})
});
bot.command("form", (ctx) => { 
    ctx.scene.enter("fillform");
});

console.log("Launching Telegram bot");
bot.launch();
console.log("Telegram Bot successfully launched");

/* graceful termination */
process.once('SIGINT', () => bot.stop('SIGINT'));
process.once('SIGTERM', () => bot.stop('SIGTERM'));
