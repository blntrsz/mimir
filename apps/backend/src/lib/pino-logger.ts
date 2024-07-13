import pino from "pino";

import { Logger } from "./logger";
import { useRequestContext } from "./request.context";

export class PinoLogger implements Logger {
  static #instance: PinoLogger;
  private logger: pino.Logger<never>;

  private constructor() {
    this.logger = pino({
      level: process.env.PINO_LOG_LEVEL || "info",
    });
  }

  public static get instance(): PinoLogger {
    if (!PinoLogger.#instance) {
      PinoLogger.#instance = new PinoLogger();
    }

    return PinoLogger.#instance;
  }

  private enrichMetaData(meta: object) {
    if ("error" in meta && meta.error instanceof Error) {
      meta.error = {
        name: meta.error.name,
        message: meta.error.message,
        stack: meta.error.stack,
      };
    }

    return {
      ...meta,
      ...useRequestContext(),
    };
  }

  debug(message: string, meta: object) {
    this.logger.debug(this.enrichMetaData(meta), message);
  }
  info(message: string, meta: object) {
    this.logger.info(this.enrichMetaData(meta), message);
  }
  warn(message: string, meta: object) {
    this.logger.warn(this.enrichMetaData(meta), message);
  }
  error(message: string, meta: object) {
    this.logger.error(this.enrichMetaData(meta), message);
  }
}
