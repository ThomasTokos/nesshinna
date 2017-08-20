"use strict";

const chalk = require("chalk");

class Logger {
  /* eslint no-console: "off" */
  static _message(...params) {
    return [...params].join(":");
  }

  static log(...params) {
    return console.log(
      this._message(
        ...params));
  }

  static print(...params) {
    return this.log(
      ...params);
  }

  static error(...params) {
    return console.error(
      this._message(
        chalk.red("err"), ...params));
  }

  static info(...params) {
    return console.info(
      this._message(
        chalk.cyan("info"), ...params));
  }
}

module.exports = Logger;