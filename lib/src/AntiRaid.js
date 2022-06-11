"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AntiRaid = void 0;
const events_1 = require("events");
const fs_1 = require("fs");
const path_1 = require("path");
const Constants_1 = require("./util/Constants");
const log = console.log;
class AntiRaid extends events_1.EventEmitter {
    /**
     * Main Class
     * @param  {Discord.Client}
     * @param  {object?} AntiRaid options
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
         * djs-antiraid options
         * @type {object}
         */
        this.options = Constants_1.DefaultAntiRaidOptions;
        for (const prop in options)
            this.options[prop] = options[prop];
        /**
         * An a collection of cases
         * @type {Array}
         */
        this._cases = [];
        for (const file of (0, fs_1.readdirSync)((0, path_1.join)(__dirname, "./events"))) {
            try {
                const event = new (require(`./events/${file}`))(this);
                this.client.on(file.split(".")[0], (...args) => event.run(...args));
            }
            catch (error) {
                this.emit("error", error);
            }
        }
    }
    /**
     * If the user is the owner, or has a role that is ignored, or is an ignored user, or the event is
     * ignored, then ignore the user.
     * @param {GuildMember} member - The member that left the server.
     * @param {string} event - The event that triggered the function.
     * @returns {boolean} The return value of the function is a boolean.
     */
    isIgnored(member, event) {
        if (member.guild.ownerID === member.id)
            return true;
        if (this.options.ignoredRoles.some((r) => member.roles.cache.has(r)))
            return true;
        if (this.options.ignoredUsers.includes(member.id))
            return true;
        if (this.options.ignoredEvents.includes(event))
            return true;
        return false;
    }
    /**
     * It adds a case to the array of cases, and then removes it after a certain amount of time.
     * @param {GuildMember} member - The member that the event is being applied to.
     * @param {string} event - The event that triggered the case.
     * @returns {void}
     */
    addCase(member, event) {
        const key = `${member.id}-${member.guild.id}-${Date.now()}`;
        this._cases.push({
            ID: member.id,
            key,
            guild: member.guild.id,
            event: event,
            date: Date.now(),
        });
        setTimeout(() => {
            this._cases = this._cases.filter((c) => c.key !== key);
        }, typeof this.options.time === "number" ? this.options.time : 10000);
    }
    /**
     * If the case ID, guild ID, and event type match, and the length of the array is greater than or equal
     * to the rate limit, return true, otherwise return false.
     * @param {GuildMember} member - The member that triggered the event
     * @param {string} event - The event that triggered the function.
     * @returns {boolean} a boolean value.
     */
    checkCase(member, event) {
        const _case = this._cases.filter((c) => c.ID === member.id && c.guild === member.guild.id && event === c.event);
        if (_case && _case.length - 1 >= this.options.rateLimit)
            return true;
        return false;
    }
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
    punish(member, event, punishType = this.options.punishType) {
        this.emit("trying", member, event, punishType);
        switch (punishType) {
            case "removeRole":
                if (!member.manageable) {
                    if (this.options.verbose)
                        log(`AntiRaid (punish#userNotManageable): ${member.user.tag} (ID: ${member.user.id}) could not be manageable, insufficient permissions`);
                }
                else {
                    const roles = member.roles.cache.filter((r) => r.name !== "@everyone");
                    if (!roles || roles.size <= 0) {
                        this.punish(member, event, "kick"); // if the member don't have roles
                        break;
                    }
                    for (const role of roles.array()) {
                        if (role.permissions
                            .toArray()
                            .find((p) => Constants_1.blacklistedPermissions.includes(p))) {
                            if (!role.editable) {
                                if (this.options.verbose)
                                    log(`AntiRaid (punish#roleNotManageable): ${member.user.tag} (ID: ${member.user.id}) could not be manageable, insufficient permissions`);
                            }
                            else {
                                if (member.user.bot) {
                                    role
                                        .setPermissions(0, "Anti-Raid")
                                        .then(() => this.emit("action", member, "roleEdited"))
                                        .catch((e) => this.emit("error", e));
                                }
                                else {
                                    member.roles
                                        .remove(role)
                                        .then(() => this.emit("action", member, "roleRemoved"))
                                        .catch((e) => this.emit("error", e));
                                }
                            }
                        }
                    }
                }
                break;
            case "editRole":
                if (!member.manageable) {
                    if (this.options.verbose)
                        log(`AntiRaid (punish#userNotManageable): ${member.user.tag} (ID: ${member.user.id}) could not be manageable, insufficient permissions`);
                }
                else {
                    const roles = member.roles.cache.filter((r) => r.name !== "@everyone");
                    if (!roles || roles.size <= 0) {
                        this.punish(member, event, "kick"); // if the member don't have roles
                        break;
                    }
                    for (const role of roles.array()) {
                        if (role.permissions
                            .toArray()
                            .find((p) => Constants_1.blacklistedPermissions.includes(p))) {
                            if (!role.editable) {
                                if (this.options.verbose)
                                    log(`AntiRaid (punish#roleNotManageable): ${member.user.tag} (ID: ${member.user.id}) could not be manageable, insufficient permissions`);
                            }
                            else {
                                role
                                    .setPermissions(0, "Anti-Raid")
                                    .then(() => this.emit("action", member, "roleEdited"))
                                    .catch((e) => this.emit("error", e));
                            }
                        }
                    }
                }
                break;
            case "kick":
                if (!member.kickable) {
                    if (this.options.verbose)
                        log(`AntiRaid (punish#userNotKickable): ${member.user.tag} (ID: ${member.user.id}) could not be kicked, insufficient permissions`);
                }
                else {
                    member
                        .kick("Anti-Raid")
                        .then(() => this.emit("action", member, "kicked"))
                        .catch((e) => this.emit("error", e));
                }
                break;
            case "ban":
                if (!member.bannable) {
                    if (this.options.verbose)
                        log(`AntiRaid (punish#userNotBannable): ${member.user.tag} (ID: ${member.user.id}) could not be banned, insufficient permissions`);
                }
                else {
                    member
                        .ban({
                        reason: "Anti-Raid",
                    })
                        .then(() => this.emit("action", member, "banned"))
                        .catch((e) => this.emit("error", e));
                }
                break;
            default:
                throw new Error("Invalid punishType");
        }
    }
    /**
     *Get current cases
     * @param {Function} func - A function that returns a boolean.
     * @returns {Function} The function is being returned.
     */
    getCases(func = () => true) {
        return this._cases.filter(func);
    }
}
exports.AntiRaid = AntiRaid;
