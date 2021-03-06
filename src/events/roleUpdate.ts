export default class {
	anti: any;
	filename: string;
	constructor(anti) {
		this.anti = anti;
		this.filename = __filename.slice(__dirname.length + 1, -3);
	}
	async run(oldRole: any, newRole: any) {
		if (!oldRole || !oldRole.guild || !oldRole.guild.hasOwnProperty("fetchAuditLogs")) return;
		oldRole.guild.fetchAuditLogs({
			type: "ROLE_UPDATE"
		}).then(audit => audit.entries.first()).then(async (entry: any) => {
			if (oldRole.id !== entry.target.id) return;
			let member = await oldRole.guild.members.fetch(entry.executor.id).catch(() => null);
			if (!member || this.anti.isIgnored(member, this.filename)) return;
			if (this.anti.checkCase(member, this.filename)) this.anti.punish(member, this.filename);
			else this.anti.addCase(member, this.filename);
		}).catch(() => null);
	}
};