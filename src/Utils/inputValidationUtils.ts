import { Context } from 'telegraf';
/**
 * Checks if the given string can be converted into an integer.
 *
 * @export
 * @param {str} the string to check
 * @return {boolean} true if the string can be converted into an integer, false otherwise
 */
export function stringIsInteger(str: string): boolean {
    return Number.isInteger(Number(str))
}

/**
 * Checks if the given string, when converted into a number, is negative.
 *
 * @export
 * @param {str} the string to check
 * @return {boolean} true if the string represents a negative number, false otherwise
 */
export function stringIsNegative(str: string): boolean {
    return Number(str) < 0;
}

/**
 * Checks if the given string is in a valid HH:MM format.
 *
 * @export
 * @param {str} the string to check
 * @return {boolean} true if str is in valid HH:MM format, false otherwise
 */
export function stringIsValidHhMm(str: string): boolean {
    return /^([0-1]?[0-9]|2[0-3]):([0-5][0-9])(:[0-5][0-9])?$/.test(str)
}

/**
 * Checks if the given string is a valid contact number (i.e. 8 digits).
 *
 * @export
 * @param {str} the string to check
 * @return {boolean} true if str is a valid contact number, false otherwise
 */
export function stringIsValidContactNumber(str: string): boolean {
    return str.length == 8 && stringIsInteger(str);
}

export function invalidInputWarning(ctx: Context, input: string) {
        ctx.reply('"' + input + '" is invalid for this field, please try again.');
    }

