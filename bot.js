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

  embed(options) {
    return Object.assign({
      title: `${this.client.user.username || null}`,
      color: 0x0086FF,
      // TODO: url: `https://`,
    }, options || {});
  }

  async _configSetup(resolve, reject) {
    logger.print("\nWelcome! Let's get set up.\n");

    const promptResponse = await inquirer.prompt([
      {
        type: "password",
        name: "token",
        message: "Token:",
      },
      {
        type: "input",
        name: "db_host",
        message: "Database host:"
      },
      {
        type: "input",
        name: "db_user",
        message: "Database username:"
      },
      {
        type: "password",
        name: "db_pass",
        message: "Database password:"
      },
      {
        type: "input",
        name: "db_name",
        message: "Database name:"
      },
    ]);

    logger.log("");

    try {
      await fs.writeFileSync("./config.json", JSON.stringify({
        _comment: "DO NOT EDIT THIS FILE YOURSELF. If you break something in here, it's entirely your fault.",
        token: promptResponse.token,
        database: {
          host: promptResponse.db_host,
          user: promptResponse.db_user,
          pass: promptResponse.db_pass,
          name: promptResponse.db_name,
        },
      }, null, 2), "utf8");
      logger.success("autoconfig", "Config saved.");
      return resolve(reload("./config.json"));
    } catch(err) {
      logger.error("autoconfig", `Error saving configuration: ${err.message}`);
      process.exit(1);
      return reject("Config not saved");
    }
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
      host: this.config.database.host,
      username: this.config.database.user,
      password: this.config.database.pass,
      database: this.config.database.name,
      logging: (message) =>
        logger.log("db", message),
    });

    try {
      await this.database.authenticate();
      logger.success("db", "Authenticated into database.");
    } catch(err) {
      logger.error("db",
        `Error logging into database: ${err.message}`);
      return process.exit(1);
    }

    this.client.on("ready", () => {
      logger.success(`Logged into gateway as ${this.client.user.tag}`);
    });

    this.client.on("disconnect", (err) => {
      logger.error(`Disconnected from gateway: ${err.reason}`);
    });

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
