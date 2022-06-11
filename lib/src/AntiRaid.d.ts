/// <reference types="node" />
import { EventEmitter } from "events";
export declare class AntiRaid extends EventEmitter {
    client: any;
    options: any;
    _cases: any[];
    /**
     * Main Class
     * @param  {Discord.Client}
     * @param  {object?} AntiRaid options
     *
     */
    constructor(client: any, options?: {});
    /**
     * If the user is the owner, or has a role that is ignored, or is an ignored user, or the event is
     * ignored, then ignore the user.
     * @param {GuildMember} member - The member that left the server.
     * @param {string} event - The event that triggered the function.
     * @returns {boolean} The return value of the function is a boolean.
     */
    isIgnored(member: any, event: any): boolean;
    /**
     * It adds a case to the array of cases, and then removes it after a certain amount of time.
     * @param {GuildMember} member - The member that the event is being applied to.
     * @param {string} event - The event that triggered the case.
     * @returns {void}
     */
    addCase(member: any, event: any): void;
    /**
     * If the case ID, guild ID, and event type match, and the length of the array is greater than or equal
     * to the rate limit, return true, otherwise return false.
     * @param {GuildMember} member - The member that triggered the event
     * @param {string} event - The event that triggered the function.
     * @returns {boolean} a boolean value.
     */
    checkCase(member: any, event: any): boolean;
    /**
     * It checks if the user is manageable, if not, it logs it. If it is, it checks if the user has any
     * roles, if not, it kicks them. If they do, it checks if the role is editable, if not, it logs it. If
     * it is, it checks if the role has any blacklisted permissions, if not, it does nothing. If it does,
     * it checks if the user is a bot, if not, it removes the role. If it is, it sets the role permissions
     * to 0.
     * @param {GuildMember} member - The member that is being punished
     * @param {string} event - The event that triggered the anti-raid.
     * @param {string} punishType - The type of punishment to be given to the user.
     */
    punish(member: any, event: any, punishType?: any): void;
    /**
     *Get current cases
     * @param {Function} func - A function that returns a boolean.
     * @returns {Function} The function is being returned.
     */
    getCases(func?: () => boolean): any[];
}
