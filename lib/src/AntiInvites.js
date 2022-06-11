"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AntiInvites = void 0;
const events_1 = require("events");
const Constants_1 = require("./util/Constants");
const log = console.log;
class AntiInvites extends events_1.EventEmitter {
    /**
     *
     * @param  {Discord.Client}
     * @param  {object?} AntiInvites options
     *
     */
    constructor(client, options = {}) {
        if (!client)
            throw new Error("Invalid Discord client");
        super();
        /**
         * The Discord Client
         * @type {Discord.Client}
         */
        this.client = client;
        /**
         * Invite regex
         * @type {RegExp}
         */
        this.regex = Constants_1.inviteRegex;
        /**
         * An a collection of cases
         * @type {Array}
         */
        this._cache = [];
        /**
         * djs-antiraid options
         * @type {object}
         */
        this.options = Constants_1.DefaultAntiInvitesOptions;
        for (const prop in options)
            this.options[prop] = options[prop];
    }
    /**
     * It adds a case to the cache.
     * @param {Discord.Message} message - The message object.
     * @param code - The code that the user is trying to redeem.
     */
    addCase(message, code) {
        const key = `${message.author.id}-${message.guild.id}-${Date.now()}`;
        this._cache.push({
            key,
            ID: message.author.id,
            guild: message.guild.id,
            date: Date.now(),
            code,
        });
        setTimeout(() => {
            this._cache = this._cache.filter((c) => c.key !== key);
        }, typeof this.options.maxInterval === "number"
            ? this.options.maxInterval
            : 60000 * 30);
    }
    /**
     * It replaces {@user} with the user's mention, {user_tag} with the user's tag, and {server_name} with
     * the server's name.
     * @param {string} string - The string to format.
     * @param {Discord.Message} message - The message object.
     * @returns The string is being returned.
     */
    format(string, message) {
        return string
            .replace(/{@user}/g, message.author.toString())
            .replace(/{user_tag}/g, message.author.tag)
            .replace(/{server_name}/g, message.guild.name);
    }
    /**
     * It sends a message to a channel, then deletes it after 7 seconds.
     * @param {Discord.Message} message - The message object
     * @param type - The type of message to send. This can be either "missingPerm" or "sendMessage".
     */
    sendMessage(message, type) {
        if (this.options[type]) {
            message.channel
                .send(this.format(this.options[type], message))
                .then((msg) => {
                msg
                    .delete({
                    timeout: 7000,
                })
                    .catch(() => null);
            })
                .catch((e) => {
                if (this.options.verbose)
                    console.error(`AntiRaid (sendMessage#sendMissingPermMessage): ${e.message}`);
            });
        }
    }
    /**
     * It checks if the user has been warned, muted, kicked, or banned, and if they haven't, it will warn,
     * mute, kick, or ban them
     * @param {Discord.Message} message - The message object.
     */
    punish(message) {
        return __awaiter(this, void 0, void 0, function* () {
            const member = message.member;
            let level;
            const cases = this._cache.filter((_case) => _case.ID === message.author.id && _case.guild === message.guild.id);
            if (cases.length === this.options.warnThreshold)
                level = 0;
            else if (cases.length === this.options.muteThreshold)
                level = 1;
            else if (cases.length === this.options.kickThreshold)
                level = 2;
            else if (cases.length === this.options.banThreshold)
                level = 3;
            else
                level = 0;
            switch (level) {
                case 0: // warn.
                    this.emit("warnAdd", member);
                    this.sendMessage(message, "warnMessage");
                    break;
                case 1: // mute
                    if (!member.manageable) {
                        if (this.options.verbose)
                            log(`AntiRaid (punish#userNotManageable): ${member.user.tag} (ID: ${member.user.id}) could not be manageable, insufficient permissions`);
                    }
                    else {
                        const muteRole = message.guild.roles.cache.find((r) => r.name.toLowerCase() === this.options.muteRoleName.toLowerCase());
                        if (!muteRole) {
                            if (this.options.verbose)
                                log("AntiRaid (punish#muteRoleNotFound) could not found muted role named " +
                                    this.options.muteRoleName);
                        }
                        else {
                            member.roles
                                .add(muteRole)
                                .then(() => {
                                this.emit("muteAdd", member);
                                this.sendMessage(message, "muteMessage");
                            })
                                .catch((e) => this.emit("error", e));
                        }
                    }
                    break;
                case 2: // kick
                    if (!member.kickable) {
                        if (this.options.verbose)
                            log(`AntiRaid (punish#userNotKickable): ${member.user.tag} (ID: ${member.user.id}) could not be kicked, insufficient permissions`);
                    }
                    else {
                        member
                            .kick("Anti-Invites")
                            .then(() => {
                            this.emit("kickAdd", member);
                            this.sendMessage(message, "kickMessage");
                        })
                            .catch((e) => this.emit("error", e));
                    }
                    break;
                case 3: // ban
                    if (!member.bannable) {
                        if (this.options.verbose)
                            log(`AntiRaid (punish#userNotBannable): ${member.user.tag} (ID: ${member.user.id}) could not be banned, insufficient permissions`);
                    }
                    else {
                        member
                            .ban({
                            reason: "Anti-Invites",
                        })
                            .then(() => {
                            this.emit("banAdd", member);
                            this.sendMessage(message, "banMessage");
                        })
                            .catch((e) => this.emit("error", e));
                    }
                    break;
            }
        });
    }
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
    message(message) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!message.guild)
                return false;
            if (message.author.bot && this.options.ignoredBots)
                return false;
            if (message.guild.ownerID === message.author.id)
                return false;
            if (this.options.ignoredUsers.includes(message.author.id))
                return false;
            if (this.options.ignoredRoles.some((r) => message.member.roles.cache.has(r)))
                return false;
            if (this.options.ignoredPermissions.some((permission) => message.member.hasPermission(permission)))
                return false;
            if (!this.regex.test(message.content))
                return false;
            const [, code] = message.content.match(this.regex);
            let invite, deleteIt;
            invite = yield this.client.fetchInvite(code).catch(() => null);
            if (invite) {
                if (invite.guild.id !== message.guild.id)
                    deleteIt = true;
            }
            else
                deleteIt = true;
            if (deleteIt) {
                yield message.delete().catch(() => null);
                this.addCase(message, code);
                this.punish(message);
                return true;
            }
            return false;
        });
    }
    /**
     * "Get all the cases that match the given function."
     *
     * The function takes a single parameter, `func`, which is a function that takes a single parameter,
     * `case`, and returns a boolean
     * @param {Function} func - A function that returns a boolean. If the function returns true, the case will be
     * added to the array.
     * @returns {Array} An array of objects.
     */
    getCases(func = () => true) {
        return this._cache.filter(func);
    }
}
exports.AntiInvites = AntiInvites;
