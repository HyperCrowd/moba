import { Any } from "../types"

type LogLevel = 'error' | 'warn' | 'info' | 'debug' | 'silly'

const LOG_LEVEL = {
  error: 0,
  warn: 1,
  info: 2,
  debug: 3,
  silly: 4
}

const currentLogLevel: number = LOG_LEVEL[import.meta.env.LOG_LEVEL as LogLevel || 'info']
const isProd: boolean = import.meta.env.PROD === true

const messages: [number, string][] = []

/**
 * 
 */
const log = (level: LogLevel, message: Any, data?: Any): void => {
  const timestamp = new Date().toISOString()
  const text = `[${timestamp}] [${level.toUpperCase()}] ${message}`

  const shouldLogMessage =
    !isProd ||
    LOG_LEVEL[level] <= LOG_LEVEL.silly;

  if (shouldLogMessage) {
    messages.push([LOG_LEVEL[level], text]);
  }

  // Also log to console based on current log level
  if (LOG_LEVEL[level] <= currentLogLevel) {
    console.log(text, data);
  }
}

/**
 * 
 */
export const logError = (message: Any, data?: Any): void => log('error', message, data)

/**
 * 
 */
export const logWarn = (message: Any, data?: Any): void => log('warn', message, data)

/**
 * 
 */
export const logInfo = (message: Any, data?: Any): void => log('info', message, data)

/**
 * 
 */
export const logDebug = (message: Any, data?: Any): void => log('debug', message, data)

/**
 * 
 */
export const logSilly = (message: Any, data?: Any): void => log('silly', message, data)

/**
 * 
 */
export const filterLog = (level: LogLevel, withoutTime: boolean = false): string[] => {
  return messages.filter(message => message[0] === LOG_LEVEL[level])
    .map(message => withoutTime === true
      ? message[1].substring(27)
      : message[1]
    )
}

window.addEventListener('error', (event) => {
  logError(`Uncaught Exception: ${event.message}`);
});

window.addEventListener('unhandledrejection', (event) => {
  logError(`Unhandled Rejection: ${event.reason}`);
});
