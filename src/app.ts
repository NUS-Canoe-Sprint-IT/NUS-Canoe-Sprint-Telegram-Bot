import {Context, Telegraf} from 'telegraf';
import {botRequest} from 'telegraf/typings/button';
import {Update} from 'typegram';
import * as dotenv from "dotenv";

import {greet} from './Commands/greetings'

require('dotenv').config();

/*Comment out the respective line when switching to production or testing mode*/

// Test
const bot: Telegraf<Context<Update>> = new Telegraf(process.env.TEST_BOT_TOKEN as string);

// Prod
// const bot: Telegraf<Context<Update>> = new Telegraf(process.env.PROD_BOT_TOKEN as string);

bot.start((ctx) => {ctx.reply(greet(ctx.from.first_name));});

bot.launch();
