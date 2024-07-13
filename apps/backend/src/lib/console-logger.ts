import { Logger } from "./logger";

export class ConsoleLogger implements Logger {
  debug = console.debug;
  info = console.info;
  warn = console.warn;
  error = console.error;
}
