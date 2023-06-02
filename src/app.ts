import {Context, Telegraf} from 'telegraf';
import {botRequest} from 'telegraf/typings/button';
import {Update} from 'typegram';
import * as dotenv from "dotenv";

import {greet} from './Commands/greetings';
import {HELP_MESSAGE} from './Commands/CommandConstants';

require('dotenv').config();

const environment: string = process.env.ENVIRONMENT as string;
const APIToken: string = (environment == 'prod' ? process.env.PROD_BOT_TOKEN : process.env.TEST_BOT_TOKEN) as string
const bot: Telegraf<Context<Update>> = new Telegraf(APIToken);

bot.start((ctx) => {ctx.reply(greet(ctx.from.first_name));});
bot.help((ctx) => {ctx.reply(HELP_MESSAGE)})

bot.launch();
