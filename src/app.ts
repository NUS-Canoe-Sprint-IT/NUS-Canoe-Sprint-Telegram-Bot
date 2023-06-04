import {Context, Telegraf} from 'telegraf';
import {botRequest} from 'telegraf/typings/button';
import {Update} from 'typegram';
import {google, sheets_v4, Auth, Common} from "googleapis";
import * as dotenv from "dotenv";

import {greet} from './Commands/greetings';
import {HELP_MESSAGE} from './Commands/CommandConstants';
import {DispBoatAllocCommand} from './Commands/dispBoatAllocCommand'

/* Load environment variables */
require('dotenv').config();

/* Initialize environment */
const environment: string = process.env.ENVIRONMENT as string;

/* Initialize Googlesheets instance */
const auth: Auth.GoogleAuth = new google.auth.GoogleAuth({
    keyFile: "./credentials.json",
    scopes: "https://www.googleapis.com/auth/spreadsheets", 
});
const googleSheetInstance: sheets_v4.Sheets = google.sheets({ version: "v4", auth: auth});

/* Initialize command objects */
const dispBoatAllocCommand: DispBoatAllocCommand = new DispBoatAllocCommand(googleSheetInstance);

/* Initialize Telegram Bot */
const APIToken: string = (environment == 'prod' ? process.env.PROD_BOT_TOKEN : process.env.TEST_BOT_TOKEN) as string
const bot: Telegraf<Context<Update>> = new Telegraf(APIToken);

bot.start((ctx) => {ctx.reply(greet(ctx.from.first_name));});
bot.help((ctx) => {ctx.reply(HELP_MESSAGE)})
bot.command("getBoatAlloc", (ctx) => {dispBoatAllocCommand.getBoatAllocation().then((res) => ctx.reply(res, {parse_mode:"MarkdownV2"}))})


console.log("Launching Telegram bot")
bot.launch();
console.log("Telegram Bot successfully launched")

/* graceful termination */
process.once('SIGINT', () => bot.stop('SIGINT'));
process.once('SIGTERM', () => bot.stop('SIGTERM'));