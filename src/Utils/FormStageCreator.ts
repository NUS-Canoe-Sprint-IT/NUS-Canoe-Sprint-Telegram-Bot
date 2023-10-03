import { Context, Telegraf, Scenes, Markup, session } from 'telegraf';
import { Message } from 'typegram';
import { FormDetails } from './FormDetails';
import { User } from './User';
import { CertifiedPaddlerCounter } from '../Commands/CertifiedPaddlerCounter';
import { FillForm } from '../Commands/TestForm';
import { stringIsInteger, stringIsValidHhMm, stringIsValidContactNumber, stringIsNegative, invalidInputWarning } from './inputValidationUtils'; 

export class FormStageCreator {
    public stage: Scenes.Stage<Scenes.SceneContext>;
    private currentFormDetails: FormDetails;
    private CertifiedPaddlerCounter: CertifiedPaddlerCounter;
    
    private async autoPopulateCurrentForm() {
        await this.CertifiedPaddlerCounter.getOneStarZeroStarCount().then((res) => {
            const oneStar = res[0];
            const zeroStar = res[1];
            this.populateCurrentForm(oneStar, zeroStar, '07:00', '09:00');
        })
    }

    private populateCurrentForm(certifiedPaddlers: number, nonCertifiedPaddlers: number, startTime: string, endTime: string) {
        if (this.currentFormDetails.certifiedPaddlers == '') {
            this.currentFormDetails.certifiedPaddlers = String(certifiedPaddlers);
        }
        if (this.currentFormDetails.nonCertifiedPaddlers == '') {
            this.currentFormDetails.nonCertifiedPaddlers = String(nonCertifiedPaddlers);
        }
        if (this.currentFormDetails.startTime == '') {
            this.currentFormDetails.startTime = startTime;
        }
        if (this.currentFormDetails.endTime == '') {
            this.currentFormDetails.endTime = endTime;
        }
    }

    public constructor(userIdToUser: Map<number, User>, currentFormDetails: FormDetails, CertifiedPaddlerCounter: CertifiedPaddlerCounter) {
        this.currentFormDetails = currentFormDetails;
        this.CertifiedPaddlerCounter = CertifiedPaddlerCounter;

        const formInitialScene = new Scenes.BaseScene<Scenes.SceneContext>('formInit');
        const userInfoScene = new Scenes.BaseScene<Scenes.SceneContext>('userInfo');
        const formConfirmationScene = new Scenes.BaseScene<Scenes.SceneContext>('formConfirmation');
        const editCertifiedPaddlersScene = new Scenes.BaseScene<Scenes.SceneContext>('editCertifiedPaddlers');
        const editNonCertifiedPaddlersScene = new Scenes.BaseScene<Scenes.SceneContext>('editNonCertifiedPaddlers');
        const editStartTimeScene = new Scenes.BaseScene<Scenes.SceneContext>('editStartTime');
        const editEndTimeScene = new Scenes.BaseScene<Scenes.SceneContext>('editEndTime');
        const submitFormScene = new Scenes.BaseScene<Scenes.SceneContext>('submitForm');

        this.stage = new Scenes.Stage<Scenes.SceneContext>([formInitialScene,
                                                            userInfoScene,
                                                            formConfirmationScene,
                                                            editCertifiedPaddlersScene,
                                                            editNonCertifiedPaddlersScene,
                                                            editStartTimeScene,
                                                            editEndTimeScene,
                                                            submitFormScene],{ 
                                                                ttl: 60
                                                            });

        // formInitialScene
        formInitialScene.enter((ctx) => {
            const userId = (ctx.message as Message.TextMessage).chat.id;
            if (userIdToUser.has(userId)) {
                // already know user details, so go to form confirmation
                currentFormDetails.user = userIdToUser.get(userId)!;
                // TODO: continue chaining
                this.autoPopulateCurrentForm().then((res) => {
                    ctx.scene.enter('formConfirmation');
                })
            } else {
                // ask for user details and store it
                return ctx.scene.enter('userInfo');
            }
        })

        // userInfoScene
        userInfoScene.enter((ctx) => {
            ctx.reply('Please enter your name and phone number in the following format: Rouvin Erh 98765432');
        })

        userInfoScene.on('text', (ctx) => {
            const userInput: string = ctx.message.text;
            let values: string[] = userInput.split(' ').map(value => value.trim());
            const hp = values.pop();
            const name = values.join(' ');

            if (!hp || !name|| !stringIsValidContactNumber(hp!)) {
                // either number or name is not valid
                return ctx.scene.enter('formInit');
            }

            const newUser = new User(name, hp);
            userIdToUser.set(ctx.message.chat.id, newUser);
            return ctx.scene.enter('formInit');
        })

        // formConfirmationScene
        const actionNameToSceneName = new Map([
            ['edit user', 'userInfo'],
            ['edit certifiedPaddlers', 'editCertifiedPaddlers'],
            ['edit nonCertifiedPaddlers', 'editNonCertifiedPaddlers'],
            ['edit startTime', 'editStartTime'],
            ['edit endTime', 'editEndTime'],
        ]);

        formConfirmationScene.enter((ctx) => {
            const confirmationKeyboard = Markup.inlineKeyboard([
                [Markup.button.callback('Confirm', 'confirm')],
                [Markup.button.callback('Edit name/number', 'edit user')],
                [Markup.button.callback('Edit certified paddlers', 'edit certifiedPaddlers')],
                [Markup.button.callback('Edit non-certified paddlers', 'edit nonCertifiedPaddlers')],
                [Markup.button.callback('Edit start time', 'edit startTime')],
                [Markup.button.callback('Edit end time', 'edit endTime')],
            ])

            ctx.reply('Please check and confirm the following details\n\n' + currentFormDetails.toString(), confirmationKeyboard)
        })

        formConfirmationScene.action('confirm', (ctx) => {
            ctx.reply('Submitting form...');
            // TODO: logic for submitting form here
            // TODO: handle failed form submission
            ctx.scene.enter('submitForm')
            // empty out the currentFormDetails
            currentFormDetails = new FormDetails();
            

            return ctx.scene.leave();
        })

        formConfirmationScene.action('edit user', (ctx) => {
            return ctx.scene.enter('userInfo');
        })

        formConfirmationScene.action('edit certifiedPaddlers', (ctx) => {
            return ctx.scene.enter('editCertifiedPaddlers');
        })

        formConfirmationScene.action('edit nonCertifiedPaddlers', (ctx) => {
            return ctx.scene.enter('editNonCertifiedPaddlers');
        })

        formConfirmationScene.action('edit startTime', (ctx) => {
            return ctx.scene.enter('editStartTime');
        })

        formConfirmationScene.action('edit endTime', (ctx) => {
            return ctx.scene.enter('editEndTime');
        })

        // editCertifiedPaddlersScene
        editCertifiedPaddlersScene.enter((ctx) => {
            ctx.reply('Please enter the number of Certified Paddler(s)');
        })

        editCertifiedPaddlersScene.on('text', (ctx) => {
            const message = ctx.message.text;
            if (!stringIsInteger(message) || stringIsNegative(message)) {
                invalidInputWarning(ctx, message);
                return
            }
            currentFormDetails.certifiedPaddlers = message;
            return ctx.scene.enter('formInit');
        })

        // editNonCertifiedPaddlersScene
        editNonCertifiedPaddlersScene.enter((ctx) => {
            ctx.reply('Please enter the number of Non-Certified Paddler(s)');
        })

        editNonCertifiedPaddlersScene.on('text', (ctx) => {
            const message = ctx.message.text;
            if (!stringIsInteger(message) || stringIsNegative(message)) {
                invalidInputWarning(ctx, message);
                return
            }
            currentFormDetails.nonCertifiedPaddlers = message;
            return ctx.scene.enter('formInit');
        })

        // editStartTimeScene
        editStartTimeScene.enter((ctx) => {
            ctx.reply('Please enter the start time in the following format:\nHH:MM');
        })

        editStartTimeScene.on('text', (ctx) => {
            const message = ctx.message.text;
            if (!stringIsValidHhMm(message)) {
                invalidInputWarning(ctx, message);
                return
            }
            currentFormDetails.startTime = message;
            return ctx.scene.enter('formInit');
        })

        // editEndTimeScene
        editEndTimeScene.enter((ctx) => {
            ctx.reply('Please enter the end time in the following format:\nHH:MM');
        })

        editEndTimeScene.on('text', (ctx) => {
            const message = ctx.message.text;
            if (!stringIsValidHhMm(message)) {
                invalidInputWarning(ctx, message);
                return
            }
            currentFormDetails.endTime = message
            return ctx.scene.enter('formInit');
        })

        //submitFormScene
        submitFormScene.enter((ctx) => {
            const FillFormInstance: FillForm = new FillForm();
            console.log(currentFormDetails.user.name);
            console.log(currentFormDetails.user.hp);
            console.log(currentFormDetails.certifiedPaddlers);
            console.log(currentFormDetails.nonCertifiedPaddlers);
            console.log(currentFormDetails.startTime);
            console.log(currentFormDetails.endTime);

            FillFormInstance.submitForm (
                currentFormDetails.user.name, 
                currentFormDetails.user.hp, 
                String(currentFormDetails.certifiedPaddlers), 
                String(currentFormDetails.nonCertifiedPaddlers),
                currentFormDetails.startTime,
                currentFormDetails.endTime);
            
            ctx.reply('Form submitted!');
        })
    } 
}
