const Discord = require("discord.js");
const Sequelize = require("sequelize");
const reload = require("require-reload")(require);

class Application {
  constructor() {
    this.client = new Discord.Client({
      disabledEvents: [
        "TYPING_START", "PRESENCE_UPDATE"
      ]
    });

    this.config = require("./config.json");

    this.database = new Sequelize({
      dialect: "mysql",
      host: this.config.db.host,
      username: this.config.db.user,
      password: this.config.db.pass,
      database: this.config.db.database,
      // TODO: logging: [function Function],
    });
  }

  embed(options) {
    return Object.assign({
      title: `${this.client.user.username}`,
      color: 0x0086FF,
      // TODO: url: `https://`,
    }, options);
  }
}

module.exports = Application;
