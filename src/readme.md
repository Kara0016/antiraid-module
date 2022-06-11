# Antiraid-Module
it's a package to protect your discord server from any kind of "raid attacks"

Installation:
```
npm i antiraid-module
```

Example Anti Raid (with Typescript):
```ts
import { Client } from 'discord.js';
import { AntiRaid } = from 'antiraid-module'; 

const client = new Client({ intents: 32767 });

const antiRaid = new AntiRaid(client, {
    rateLimit: 3, // Rate limit of actions.
    time: 30000, // Amount of time (in milliseconds)
    punishType: "removeRole", // ban, kick, editRole, removeRole
    verbose: true, // Extended Logs from module.
    ignoredUsers: [], // Array of User IDs that get ignored.
    ignoredRoles: [], // Array of Role IDs that get ignored.
    ignoredEvents: [] 
});



antiRaid.on("trying", (member, event, punishType) => {
    console.log(`I will trying do ${punishType} to stop ${member.user.tag} for ${event}`);
});

antiRaid.on("action", (member, type) => {
    console.log(`${member.user.tag} has been ${type}`);
});



client.on("ready", () => {
    console.log("Ready!");
});

client.login("YOUR_TOKEN_HERE");
```

Example Anti Invites (with Typescript):
```ts
import { Client } from 'discord.js';
import { AntiInvites } from 'antiraid-module'
const client = new Client({ intents: 32767 });

const antiInvites = new AntiInvites(client, {
    maxInterval: 60000 * 60 * 2, // Amount of time (in milliseconds)
    warnThreshold: 1,
    kickThreshold: 5,
    banThreshold: 8,
    muteThreshold: 3,
    warnMessage: "{@user}, Please don't advertising",
    kickMessage: "**{user_tag}** has been kicked for advertising.", // Message that will be sent in chat upon kicking a user.
    banMessage: "**{user_tag}** has been banned for advertising.", // Message that will be sent in chat upon banning a user.
    muteMessage: "**{user_tag}** has been muted for advertising.",
    verbose: true, // Extended Logs from module.
    ignoredPermissions: ["MANAGE_MESSAGES"], // Bypass users with any of these permissions.
    ignoredBots: true, // Ignore bot messages.
    ignoredUsers: [], // Array of User IDs that get ignored.
    ignoredRoles: [] // Array of Role IDs that get ignored.
});

antiInvites.on("warnAdd", member => console.log(`${member.user.tag} has been warned for advertising.`));
antiInvites.on("muteAdd", member => console.log(`${member.user.tag} has been muted for advertising.`));
antiInvites.on("kickAdd", member => console.log(`${member.user.tag} has been kicked for advertising.`));
antiInvites.on("banAdd", member => console.log(`${member.user.tag} has been banned for advertising.`));


client.on("ready", () => {
    console.log("Ready!");
});

client.on("message", (msg) => antiInvites.message(msg));

client.login("YOUR_TOKEN_HERE");
```
---
# Informations
## Author: Kara
## Support: [Discord server](https://discord.gg/6qzkefEvRB)



