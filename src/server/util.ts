const chalk = require("chalk");

const stringify = (message: any) =>
  typeof message === "string" ? message : JSON.stringify(message);

export function fatalExit(message: any, errorCode = -1) {
  console.log(chalk.redBright(stringify(message)));
  process.exit(errorCode);
}

export function info(message: any) {
  console.log(chalk.green(stringify(message)));
}

export function log(message: any) {
  console.log(chalk.white(stringify(message)));
}

export function sys(message: any) {
  console.log(chalk.magenta(stringify(message)));
}

export function warn(message: any) {
  console.log(chalk.yellow(stringify(message)));
}

export function error(message: any) {
  console.log(chalk.red(stringify(message)));
}
