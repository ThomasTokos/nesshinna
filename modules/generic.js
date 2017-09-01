"use strict";

const fs = require("fs");
const reload = require("require-reload")(require);

const logger = require("../util/logger");
const Application = require("..");

module.exports = {
  meta: {
    name: "Command Handler",
  },
  listeners: [
    ["message", (message, app) => {
      // TODO
    }],
  ],
  commands: {
    ping: {
      run: async (label, message, args, permission, app) => {
        await message.reply("ping (test)");
      },
      aliases: ["pingu"],
      dm: true,
    },
    invite: {
      run: async (label, message, args, permission, app) => {
        await message.reply(`here u go <${await app.client.generateInvite([
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
        ])}>`);
      },
      aliases: [],
      dm: true,
    },
  },
};