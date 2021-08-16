import logger from 'node-color-log';

export { logger };

export const stringify = (message: any, formatted: boolean = false) =>
  typeof message === 'string'
    ? message
    : JSON.stringify(message, null, formatted ? 4 : undefined);

export function fatalExit(message: any, errorCode = -1) {
  logger.color('white').bgColor('red').log(stringify(message));
  process.exit(errorCode);
}

export function debug(...args: any[]) {
  logger.debug.apply(logger, args);
}

export function error(...args: any[]) {
  logger.error.apply(logger, args);
}

export function info(...args: any[]) {
  logger.info.apply(logger, args);
}

export function warn(...args: any[]) {
  logger.warn.apply(logger, args);
}
