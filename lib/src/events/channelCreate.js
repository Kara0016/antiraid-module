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
class default_1 {
    constructor(anti) {
        this.anti = anti;
        this.filename = __filename.slice(__dirname.length + 1, -3);
    }
    run(channel) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!channel || !channel.guild || !channel.guild.hasOwnProperty("fetchAuditLogs"))
                return;
            channel.guild.fetchAuditLogs({
                type: "CHANNEL_CREATE"
            }).then(audit => audit.entries.first()).then((entry) => __awaiter(this, void 0, void 0, function* () {
                if (channel.id !== entry.target.id)
                    return;
                let member = yield channel.guild.members.fetch(entry.executor.id).catch(() => null);
                if (!member || this.anti.isIgnored(member, this.filename))
                    return;
                if (this.anti.checkCase(member, this.filename))
                    this.anti.punish(member, this.filename);
                else
                    this.anti.addCase(member, this.filename);
            })).catch(() => null);
        });
    }
}
exports.default = default_1;
;
