"use strict";

const Discord = require("discord.js");
const fs = require("fs");
const inquirer = require("inquirer");
const reload = require("require-reload")(require);
const Sequelize = require("sequelize");

const logger = require("./util/logger");

class Application {
  constructor() {
    logger.info("Application started");

    this._setup();
  }

  get permissions() {
    return Object.freeze({
      USER: 0,
      MOD: 1,
      ADMIN: 2,
      OWNER: 3,
      GLOBAL_ADMIN: 4,
    });
  }

  embed(options) {
    return Object.assign({
      title: `${this.client.user.username}`,
      color: 0x0086FF,
      // TODO: url: `https://`,
    }, options || {});
  }

  async _configSetup(resolve, reject) {
    logger.print("\nWelcome! Let's get set up.\n");

    let hidden = [];
    let arrays = [];
    let prompt = [];

    const templateConfig = require("./config.template.json");

    for(const token in templateConfig) {
      const value = templateConfig[token];
      const label = Array.isArray(value) ? value[0] : value;

      if(label.startsWith("*"))
        hidden.push(token);

      if(Array.isArray(value))
        arrays.push(token);

      prompt.push({
        type: hidden.includes(token) ? "password" : "input",
        name: token,
        message: hidden.includes(token) ? label.slice(1) : label,
      });
    }

    const promptResponse = await inquirer.prompt(prompt);

    // Make array if config template value was array
    for(const token in promptResponse)
      for(const arrayItem of arrays)
        if(token === arrayItem)
          promptResponse[token] = [promptResponse[token]];

    logger.log("");

    try {
      await fs.writeFileSync("./config.json", JSON.stringify(promptResponse, null, 2), "utf8");
      logger.success("autoconfig", "Config saved.");
      return resolve(reload("./config.json"));
    } catch(err) {
      logger.error("autoconfig", `Error saving configuration: ${err.message}`);
      process.exit(1);
      return reject("Config not saved");
    }
  }

  loadModules() {
    this._listeners = this._listeners || {};
    this.modules = [];

    this._deregisterListeners();

    for(const filename of fs.readdirSync("./modules/")) {
      if(!filename.endsWith(".js") || filename.endsWith(".disabled.js"))
        continue;

      const mod = reload("./modules/" + filename);
      this.modules.push(mod);

      for(const listener of mod.listeners) {
        const event = listener[0];
        const run = listener[1];

        if(this._listeners[event] === undefined)
          this._listeners[event] = [];

        this._listeners[event].push(
          (...args) => {
            try {
              run(...args, this);
            } catch(err) {
              logger.error("cmd", `Execution failed: ${err.message}`);
            }
          });
      }

      this._registerListeners();
    }
  }

  _registerListeners() {
    for(const event in this._listeners)
      for(const listener of this._listeners[event])
        this.client.on(event, listener);
  }

  _deregisterListeners() {
    for(const event in this._listeners)
      for(const listener of this._listeners[event])
        this.client.removeListener(event, listener);

    this._listeners = {};
  }

  _setupDatabase() {
    this.Guild = this.database.define("guild", {
      id: {
        type: Sequelize.BIGINT(64).UNSIGNED,
        allowNull: false,
        primaryKey: true,
      },
      name: {
        type: Sequelize.STRING(100),
        allowNull: true,
        defaultValue: null,
      },
      members: {
        type: Sequelize.INTEGER(11).UNSIGNED,
        allowNull: true,
        defaultValue: null,
      },
      prefix: {
        type: Sequelize.STRING(10),
        allowNull: true,
        defaultValue: null,
      },
      mod_role: {
        type: Sequelize.BIGINT(64).UNSIGNED,
        allowNull: true,
        defaultValue: null,
      },
      admin_role: {
        type: Sequelize.BIGINT(64).UNSIGNED,
        allowNull: true,
        defaultValue: null,
      },
    }, { timestamps: false, });

    this.User = this.database.define("user", {
      id: {
        type: Sequelize.BIGINT(64).UNSIGNED,
        allowNull: false,
        primaryKey: true,
      },
      username: {
        type: Sequelize.STRING(32),
        allowNull: false,
      },
      discriminator: {
        type: Sequelize.INTEGER(4).UNSIGNED.ZEROFILL,
        defaultValue: 0,
      },
    }, { timestamps: false, });

    this.Strike = this.database.define("strike", {
      id: {
        type: Sequelize.INTEGER(11).UNSIGNED,
        allowNull: false,
        primaryKey: true,
        autoIncrement: true,
      },
      guild: {
        type: Sequelize.BIGINT(64).UNSIGNED,
        allowNull: false,
      },
      user: {
        type: Sequelize.BIGINT(64).UNSIGNED,
        allowNull: false,
      },
      reason: {
        type: Sequelize.STRING(1024),
        allowNull: true,
      },
    }, { timestamps: false, });

    this.CustomCommand = this.database.define("custom_command", {
      name: {
        type: Sequelize.STRING(32),
        allowNull: false,
      },
      guild: {
        type: Sequelize.BIGINT(64).UNSIGNED,
        allowNull: false,
      },
      content: {
        type: Sequelize.STRING(1024),
        allowNull: true,
      },
    }, { timestamps: false, });

    this.Guild.sync();
    this.User.sync();
    this.Strike.sync();
    this.CustomCommand.sync();
  }

  async _setup() {
    try {
      this.config = reload("./config.json");
    } catch(err) {
      this.config = await new Promise(
        this._configSetup);
    }

    this.client = new Discord.Client({
      disabledEvents: [
        "TYPING_START", "PRESENCE_UPDATE"
      ]
    });

    this.database = new Sequelize({
      dialect: "mysql",
      host: this.config.db_host,
      username: this.config.db_user,
      password: this.config.db_pass,
      database: this.config.db_name,
      logging: null,
    });

    try {
      await this.database.authenticate();
      logger.success("db", "Authenticated into database.");
    } catch(err) {
      logger.error("db",
        `Error logging into database: ${err.message}`);
      return process.exit(1);
    }

    await this._setupDatabase();

    this.client.on("ready", async () => {
      logger.info(`Logged into gateway as ${this.client.user.tag}`);
      logger.print("guilds", this.client.guilds.size);
      for(const guild of this.client.guilds.array())
        logger.print("guilds", "list", guild.name);
      if(this.client.guilds.size === 0) {
        logger.print(`No guilds detected. Invite: ${await this.client.generateInvite([
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
        ])}`);
      }
    });

    this.client.on("disconnect", (err) => {
      logger.error(`Disconnected from gateway: ${err.reason}`);
    });

    this.loadModules();

    try {
      await this.client.login(
        this.config.token);
    } catch(err) {
      logger.error("auth",
        `Error logging into gateway: ${err.message}`);
      return process.exit(1);
    }
  }
}

module.exports = Application;

new Application();

process.on("unhandledRejection", async (reason, promise) => {
  promise = require("util").inspect(promise, false, 2);
  logger.error("promise", `${promise}`);
});
