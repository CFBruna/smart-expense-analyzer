import { Injectable, LoggerService as NestLoggerService } from '@nestjs/common';
import * as winston from 'winston';
import * as DailyRotateFile from 'winston-daily-rotate-file';

@Injectable()
export class LoggerService implements NestLoggerService {
  private logger: winston.Logger;

  constructor() {
    const isProduction = process.env.NODE_ENV === 'production';

    const format = isProduction
      ? winston.format.combine(
          winston.format.timestamp(),
          winston.format.errors({ stack: true }),
          winston.format.json(),
        )
      : winston.format.combine(
          winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
          winston.format.errors({ stack: true }),
          winston.format.colorize(),
          winston.format.printf(
            ({ timestamp, level, message, context, correlationId, ...meta }) => {
              const metaStr = Object.keys(meta).length ? JSON.stringify(meta) : '';
              const corrId = correlationId ? `[${correlationId}]` : '';
              const ctx = context ? `[${context}]` : '';
              return `${timestamp} ${level} ${ctx}${corrId}: ${message} ${metaStr}`;
            },
          ),
        );

    const transports: winston.transport[] = [
      new winston.transports.Console({
        level: isProduction ? 'info' : 'debug',
      }),
    ];

    if (isProduction) {
      transports.push(
        new DailyRotateFile({
          filename: 'logs/error-%DATE%.log',
          datePattern: 'YYYY-MM-DD',
          level: 'error',
          maxSize: '20m',
          maxFiles: '14d',
        }),
        new DailyRotateFile({
          filename: 'logs/combined-%DATE%.log',
          datePattern: 'YYYY-MM-DD',
          maxSize: '20m',
          maxFiles: '14d',
        }),
      );
    }

    this.logger = winston.createLogger({
      format,
      transports,
      defaultMeta: {
        service: 'smart-expense-analyzer',
        environment: process.env.NODE_ENV || 'development',
      },
    });
  }

  log(message: string, context?: string, meta?: Record<string, any>) {
    this.logger.info(message, { context, ...meta });
  }

  error(message: string, trace?: string, context?: string, meta?: Record<string, any>) {
    this.logger.error(message, { context, trace, ...meta });
  }

  warn(message: string, context?: string, meta?: Record<string, any>) {
    this.logger.warn(message, { context, ...meta });
  }

  debug(message: string, context?: string, meta?: Record<string, any>) {
    this.logger.debug(message, { context, ...meta });
  }

  verbose(message: string, context?: string, meta?: Record<string, any>) {
    this.logger.verbose(message, { context, ...meta });
  }

  logWithCorrelationId(
    level: string,
    message: string,
    correlationId: string,
    context?: string,
    meta?: Record<string, any>,
  ) {
    this.logger.log(level, message, { correlationId, context, ...meta });
  }
}
