import { Context, Telegraf, Scenes, Markup, session } from 'telegraf';
import { InlineKeyboardButton } from 'telegraf/typings/core/types/typegram';
import { message } from 'telegraf/filters';
import { Message } from 'typegram';
import { FormDetails } from './FormDetails';
import { User } from './User';
import { CertifiedPaddlerCounter } from '../Commands/CertifiedPaddlerCounter';
import { FillForm } from '../Commands/RealForm';
import { stringIsInteger, stringIsValidHhMm, stringIsValidContactNumber, stringIsNegative, invalidInputWarning } from './inputValidationUtils'; 
import { defaultAMTrainingEndTime, defaultAMTrainingStartTime, defaultPMTrainingStartTime, defaultPMTrainingEndTime } from './UtilsConstants';

// Declaring all action names and their corresponding scene names
const actionNameToSceneName = new Map([
    ['edit user', 'userInfo'],
    ['edit certifiedPaddlers', 'editCertifiedPaddlers'],
    ['edit nonCertifiedPaddlers', 'editNonCertifiedPaddlers'],
    ['edit startTime', 'editStartTime'],
    ['edit endTime', 'editEndTime'],
]);

// Declaring all button names and their corresponding action names
const buttonNameToActionName = new Map([
    ['Confirm', 'confirm'],
    ['Edit name/number', 'edit user'],
    ['Edit certified paddlers', 'edit certifiedPaddlers'],
    ['Edit non-certified paddlers', 'edit nonCertifiedPaddlers'],
    ['Edit start time', 'edit startTime'],
    ['Edit end time', 'edit endTime'],
]);

export class FormStageCreator {
    public stage: Scenes.Stage<Scenes.SceneContext>;
    private currentFormDetails: FormDetails;
    private certifiedPaddlerCounter: CertifiedPaddlerCounter;
    private userIdToUser: Map<number, User>;

    public constructor(userIdToUser: Map<number, User>, currentFormDetails: FormDetails, certifiedPaddlerCounter: CertifiedPaddlerCounter) {
        this.currentFormDetails = currentFormDetails;
        this.certifiedPaddlerCounter = certifiedPaddlerCounter;
        this.userIdToUser = userIdToUser;

        const formInitialScene = this.createFormInitialScene();
        const userInfoScene = this.createUserInfoScene();
        const formConfirmationScene = this.createFormConfirmationScene();
        const editCertifiedPaddlersScene = this.createEditCertifiedPaddlersScene();
        const editNonCertifiedPaddlersScene = this.createEditNonCertifiedPaddlersScene();
        const editStartTimeScene = this.createEditStartTimeScene();
        const editEndTimeScene = this.createEditEndTimeScene();

        this.stage = new Scenes.Stage<Scenes.SceneContext>([formInitialScene,
                                                            userInfoScene,
                                                            formConfirmationScene,
                                                            editCertifiedPaddlersScene,
                                                            editNonCertifiedPaddlersScene,
                                                            editStartTimeScene,
                                                            editEndTimeScene, ],
                                                            { 
                                                                ttl: 60
                                                            });
    } 

    /**
     * Gets data from the certifiedPaddlerCounter and populates the current form with it.
     */
    private async autoPopulateCurrentForm() {
        await this.certifiedPaddlerCounter.getOneStarZeroStarCount().then((res) => {
            const oneStar = res[0];
            const zeroStar = res[1];

            // Find default training start and end time
            const today: Date = new Date();
            const isAM: Boolean = (today.getHours() <= 12);
            const trainingStartTime: string = isAM ? defaultAMTrainingStartTime : defaultPMTrainingStartTime;
            const trainingEndTime: string = isAM ? defaultAMTrainingEndTime : defaultPMTrainingEndTime;

            this.populateCurrentForm(oneStar, zeroStar, trainingStartTime, trainingEndTime);
        })
    }

    /**
     * Populates the current form with the given details, if the current form is empty. 
     */
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

    /**
     * This scene is the first scene that the user will see when they type /form.
     */
    private createFormInitialScene() {
        const formInitialScene = new Scenes.BaseScene<Scenes.SceneContext>('formInit');

        formInitialScene.enter((ctx) => {
            const userId = (ctx.message as Message.TextMessage).chat.id;
            if (this.userIdToUser.has(userId)) {
                // already know user details, so go to form confirmation
                this.currentFormDetails.user = this.userIdToUser.get(userId)!;
                this.autoPopulateCurrentForm().then((res) => {
                    ctx.scene.enter('formConfirmation');
                })
            } else {
                // ask for user details and store it
                return ctx.scene.enter('userInfo');
            }
        })

        return formInitialScene;
    }

    /**
     * This scene is for the user to enter their name and phone number.
     */
    private createUserInfoScene() {
        const userInfoScene = new Scenes.BaseScene<Scenes.SceneContext>('userInfo');

        userInfoScene.enter((ctx) => {
            ctx.reply('Please enter your name and phone number in the following format: Rouvin Erh 98765432');
        })

        userInfoScene.on(message('text'), (ctx) => {
            const userInput: string = ctx.message.text;
            let values: string[] = userInput.split(' ').map(value => value.trim());
            const hp = values.pop();
            const name = values.join(' ');

            if (!hp || !name|| !stringIsValidContactNumber(hp!)) {
                // either number or name is not valid
                return ctx.scene.enter('formInit');
            }

            const newUser = new User(name, hp);
            this.userIdToUser.set(ctx.message.chat.id, newUser);
            return ctx.scene.enter('formInit');
        })

        return userInfoScene;
    }

    /**
     * This scene is for the user to confirm any autofilled details and to submit the form.
     */
    private createFormConfirmationScene() {
        const formConfirmationScene = new Scenes.BaseScene<Scenes.SceneContext>('formConfirmation');

        formConfirmationScene.enter((ctx) => {
            // Create inline keyboard
            const inlineKeyboardButtons: InlineKeyboardButton[][] = [];
            buttonNameToActionName.forEach((actionName: string, buttonName: string) => {
                inlineKeyboardButtons.push([Markup.button.callback(buttonName, actionName)])
            });
            const confirmationKeyboard = Markup.inlineKeyboard(inlineKeyboardButtons);

            ctx.reply('Please check and confirm the following details\n\n' + this.currentFormDetails.toString(), confirmationKeyboard)
        })

        formConfirmationScene.action('confirm', async (ctx) => {
            ctx.reply('Submitting form...');
            const FillFormInstance: FillForm = new FillForm();

            // submit form, check for errors
            try {
                const result = await FillFormInstance.submitForm ( 
                this.currentFormDetails.user.name, 
                this.currentFormDetails.user.hp, 
                this.currentFormDetails.certifiedPaddlers, 
                this.currentFormDetails.nonCertifiedPaddlers,
                this.currentFormDetails.startTime,
                this.currentFormDetails.endTime
                );
                ctx.reply('Form submitted!');
            } catch (error) {
                ctx.reply('Form submssion failed. Please try again.');
            }

            // empty out the currentFormDetails
            this.currentFormDetails = new FormDetails();
            
            return ctx.scene.leave();
        })

        // Binding all action names to their corresponding scenes
        actionNameToSceneName.forEach((sceneName: string, actionName: string) => {
            formConfirmationScene.action(actionName, (ctx) => {
                return ctx.scene.enter(sceneName);
            })
        });

        return formConfirmationScene;
    }

    /**
     * This form is for the user to edit the number of certified paddlers.
     */
    private createEditCertifiedPaddlersScene() {
        const editCertifiedPaddlersScene = new Scenes.BaseScene<Scenes.SceneContext>('editCertifiedPaddlers');

        editCertifiedPaddlersScene.enter((ctx) => {
            ctx.reply('Please enter the number of Certified Paddler(s)');
        })

        editCertifiedPaddlersScene.on(message('text'), (ctx) => {
            const message = ctx.message.text;
            if (!stringIsInteger(message) || stringIsNegative(message)) {
                invalidInputWarning(ctx, message);
                return
            }
            this.currentFormDetails.certifiedPaddlers = message;
            return ctx.scene.enter('formInit');
        })

        return editCertifiedPaddlersScene;
    };

    /**
     * This form is for the user to edit the number of non-certified paddlers.
     */
    private createEditNonCertifiedPaddlersScene() {
        const editNonCertifiedPaddlersScene = new Scenes.BaseScene<Scenes.SceneContext>('editNonCertifiedPaddlers');

        editNonCertifiedPaddlersScene.enter((ctx) => {
            ctx.reply('Please enter the number of Non-Certified Paddler(s)');
        })

        editNonCertifiedPaddlersScene.on(message('text'), (ctx) => {
            const message = ctx.message.text;
            if (!stringIsInteger(message) || stringIsNegative(message)) {
                invalidInputWarning(ctx, message);
                return
            }
            this.currentFormDetails.nonCertifiedPaddlers = message;
            return ctx.scene.enter('formInit');
        })

        return editNonCertifiedPaddlersScene;
    };

    /**
     * This form is for the user to edit the start time of the training session.
     */
    private createEditStartTimeScene() {
        const editStartTimeScene = new Scenes.BaseScene<Scenes.SceneContext>('editStartTime');

        editStartTimeScene.enter((ctx) => {
            ctx.reply('Please enter the start time in the following format:\nHH:MM');
        })

        editStartTimeScene.on(message('text'), (ctx) => {
            const message = ctx.message.text;
            if (!stringIsValidHhMm(message)) {
                invalidInputWarning(ctx, message);
                return
            }
            this.currentFormDetails.startTime = message;
            return ctx.scene.enter('formInit');
        })

        return editStartTimeScene;
    };

    /**
     * This form is for the user to edit the end time of the training session.
     */
    private createEditEndTimeScene() {
        const editEndTimeScene = new Scenes.BaseScene<Scenes.SceneContext>('editEndTime');

        editEndTimeScene.enter((ctx) => {
            ctx.reply('Please enter the end time in the following format:\nHH:MM');
        })

        editEndTimeScene.on(message('text'), (ctx) => {
            const message = ctx.message.text;
            if (!stringIsValidHhMm(message)) {
                invalidInputWarning(ctx, message);
                return
            }
            this.currentFormDetails.endTime = message
            return ctx.scene.enter('formInit');
        })

        return editEndTimeScene;
    };
}