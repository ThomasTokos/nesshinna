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
      run: (label, message, args, permission, app) => {
        message.reply("ping (test)");
      },
      aliases: ["pingu"],
      dm: true,
    },
  },
};