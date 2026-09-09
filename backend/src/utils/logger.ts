export type LogLevel = 'debug' | 'info' | 'warn' | 'error';

class Logger {
  private format(level: LogLevel, message: string, meta?: unknown) {
    const timestamp = new Date().toISOString();
    const prefix = `[${timestamp}] [${level.toUpperCase()}]`;
    if (meta !== undefined) {
      return `${prefix} ${message} ${typeof meta === 'object' ? JSON.stringify(meta) : meta}`;
    }
    return `${prefix} ${message}`;
  }

  debug(message: string, meta?: unknown) {
    if (process.env.NODE_ENV !== 'production' || process.env.LOG_LEVEL === 'debug') {
      console.debug(this.format('debug', message, meta));
    }
  }

  info(message: string, meta?: unknown) {
    console.info(this.format('info', message, meta));
  }

  warn(message: string, meta?: unknown) {
    console.warn(this.format('warn', message, meta));
  }

  error(message: string, meta?: unknown) {
    console.error(this.format('error', message, meta));
  }
}

export const logger = new Logger();
