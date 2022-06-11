/// <reference types="node" />
import { EventEmitter } from "events";
export declare class AntiInvites extends EventEmitter {
    client: any;
    regex: RegExp;
    _cache: any[];
    options: any;
    /**
     *
     * @param  {Discord.Client}
     * @param  {object?} AntiInvites options
     *
     */
    constructor(client: any, options?: {});
    /**
     * It adds a case to the cache.
     * @param {Discord.Message} message - The message object.
     * @param code - The code that the user is trying to redeem.
     */
    addCase(message: any, code: any): void;
    /**
     * It replaces {@user} with the user's mention, {user_tag} with the user's tag, and {server_name} with
     * the server's name.
     * @param {string} string - The string to format.
     * @param {Discord.Message} message - The message object.
     * @returns The string is being returned.
     */
    format(string: any, message: any): any;
    /**
     * It sends a message to a channel, then deletes it after 7 seconds.
     * @param {Discord.Message} message - The message object
     * @param type - The type of message to send. This can be either "missingPerm" or "sendMessage".
     */
    sendMessage(message: any, type: any): void;
    /**
     * It checks if the user has been warned, muted, kicked, or banned, and if they haven't, it will warn,
     * mute, kick, or ban them
     * @param {Discord.Message} message - The message object.
     */
    punish(message: any): Promise<void>;
    /**
     * If the message is not a bot, not from the server owner, not from a user with the ignored role, not
     * from a user with the ignored permission, and the message contains an invite code, then delete the
     * message and punish the user
     * @param {Message} message - The message object.
     * @returns {Promise<boolean>} a boolean value.
     *
     * client.on("message", msg => {
     * 		anti.message(msg);
     * });
     */
    message(message: any): Promise<boolean>;
    /**
     * "Get all the cases that match the given function."
     *
     * The function takes a single parameter, `func`, which is a function that takes a single parameter,
     * `case`, and returns a boolean
     * @param {Function} func - A function that returns a boolean. If the function returns true, the case will be
     * added to the array.
     * @returns {Array} An array of objects.
     */
    getCases(func?: () => boolean): any[];
}
