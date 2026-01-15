import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { randomUUID } from 'crypto';
import { LoggerService } from '../../infrastructure/logger/logger.service';

@Injectable()
export class RequestLoggerMiddleware implements NestMiddleware {
  constructor(private readonly logger: LoggerService) { }

  use(req: any, res: Response, next: NextFunction) {
    const correlationId = (req.headers['x-correlation-id'] as string) || randomUUID();
    req.correlationId = correlationId;

    res.setHeader('X-Correlation-ID', correlationId);

    const startTime = Date.now();

    this.logger.logWithCorrelationId('info', `Incoming request`, correlationId, 'HTTP', {
      method: req.method,
      url: req.url,
      userAgent: req.headers['user-agent'],
      ip: req.ip,
    });

    res.on('finish', () => {
      const duration = Date.now() - startTime;
      const level = res.statusCode >= 400 ? 'error' : 'info';

      this.logger.logWithCorrelationId(level, `Request completed`, correlationId, 'HTTP', {
        method: req.method,
        url: req.url,
        statusCode: res.statusCode,
        duration,
      });
    });

    next();
  }
}
