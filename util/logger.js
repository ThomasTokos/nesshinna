const chalk = require("chalk");

class Logger {
  /* eslint no-console: "off" */
  static _message(context, mod, message) {
    if(message)
      return `${context}:${mod}:${message}`;
    else if(mod)
      return `${context}:${mod}`;
    throw new Error("Log message required message and/or context name.");
  }

  static log(mod, message) {
    return console.log(
      this._message(
        chalk.reset("log"), mod, message));
  }

  static error(mod, message) {
    return console.log(
      this._message(
        chalk.red("err"), mod, message));
  }

  static info(mod, message) {
    return console.log(
      this._message(
        chalk.cyan("inf"), mod, message));
  }
}

module.exports = Logger;