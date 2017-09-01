"use strict";

const fs = require("fs");
const reload = require("require-reload")(require);

const logger = require("../util/logger");
const Application = require("..");

module.exports = {
  meta: {
    name: "Utilities",
  },
  listeners: [
    ["message", (message, app) => {
      // TODO
    }],
  ],
  commands: {
    ping: {
      run: async (label, message, args, permission, app) => {
        const date1 = Date.now();

        const pingMessage = await message.channel.send("🏓 Pong!");

        const date2 = Date.now();

        pingMessage.edit({
          embed: app.embed({
            title: pingMessage.content,
            description: `That took **${date2 - date1}ms**. Average heartbeat ping: **${app.client.ping}ms**.`,
          }),
        });
      },
      aliases: ["pingu"],
      dm: true,
    },
    invite: {
      run: async (label, message, args, permission, app) => {
        await message.channel.send({
          embed: app.embed({
            title: `Invite ${app.client.user.username}`,
            description: `Add me to your server: <${await app.client.generateInvite([
              "KICK_MEMBERS",
              "BAN_MEMBERS",
              "ADD_REACTIONS",
              "VIEW_AUDIT_LOG",
              "READ_MESSAGES",
              "SEND_MESSAGES",
              "MANAGE_MESSAGES",
              "EMBED_LINKS",
              "MANAGE_NICKNAMES",
              "CHANGE_NICKNAME",
              "MANAGE_ROLES",
            ])}>`
          })
        });
      },
      aliases: [],
      dm: true,
    },
    reload: {
      run: (label, message, args, permission, app) => {
        if(permission < app.permissions.GLOBAL_ADMIN)
          return;

        app.loadModules();

        message.channel.send({
          embed: app.embed({
            title: "☑ Reloaded",
            description: "All modules were successfully reloaded.",
            color: 0x00FF00,
          }),
        });
      },
      aliases: ["rl"],
      dm: true,
    },
  },
};