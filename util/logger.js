const chalk = require("chalk");

class Logger {
  /* eslint no-console: "off" */
  static _message(context, mod, message) {
    if(!mod)
      return `${context}`;

    if(!message)
      return `${context}:${mod}`;

    return `${context}:${mod}:${message}`;
  }

  static log(mod, message) {
    return console.log(
      this._message(
        mod, message));
  }

  static error(mod, message) {
    return console.error(
      this._message(
        chalk.red("err"), mod, message));
  }

  static info(mod, message) {
    return console.info(
      this._message(
        chalk.cyan("info"), mod, message));
  }
}

module.exports = Logger;