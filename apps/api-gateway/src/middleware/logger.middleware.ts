import { Injectable, NestMiddleware, Logger } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';

@Injectable()
export class LoggerMiddleware implements NestMiddleware {
  private logger = new Logger('HTTP');

  use(req: Request, res: Response, next: NextFunction): void {
    const { method, originalUrl, ip } = req;
    const userAgent = req.get('User-Agent') || '';
    const startTime = Date.now();

    // Log incoming request
    this.logger.log(
      `Incoming Request: ${method} ${originalUrl} - ${ip} - ${userAgent}`,
    );

    // Log response when request completes
    res.on('close', () => {
      const { statusCode } = res;
      const contentLength = res.get('content-length') || '0';
      const responseTime = Date.now() - startTime;

      this.logger.log(
        `Completed Request: ${method} ${originalUrl} ${statusCode} ${contentLength}b - ${responseTime}ms`,
      );
    });

    next();
  }
}
