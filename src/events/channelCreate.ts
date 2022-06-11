export default class {
	anti: any;
	filename: any;
	constructor(anti) {
		this.anti = anti;
		this.filename = __filename.slice(__dirname.length + 1, -3);
	}
	async run(channel) {
		if (!channel || !channel.guild || !channel.guild.hasOwnProperty("fetchAuditLogs")) return;
		channel.guild.fetchAuditLogs({
			type: "CHANNEL_CREATE"
		}).then(audit => audit.entries.first()).then(async (entry: any) => {
			if (channel.id !== entry.target.id) return;
			let member = await channel.guild.members.fetch(entry.executor.id).catch(() => null);
			if (!member || this.anti.isIgnored(member, this.filename)) return;
			if (this.anti.checkCase(member, this.filename)) this.anti.punish(member, this.filename);
			else this.anti.addCase(member, this.filename);
		}).catch(() => null);
	}
};