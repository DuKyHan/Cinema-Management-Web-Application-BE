import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';

import { Socket } from 'socket.io';
import { AppLogger } from '../logger/logger.service';
import {
  createRequestContext,
  createRequestContextFromWs,
} from '../request-context/util';

@Injectable()
export class LoggingInterceptor implements NestInterceptor {
  constructor(private appLogger: AppLogger) {
    this.appLogger.setContext(LoggingInterceptor.name);
  }

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    switch (context.getType()) {
      case 'http':
        return this.handleHttpRequest(context, next);
      case 'ws':
        return this.handleWsRequest(context, next);
      default:
        throw new Error('Unsupported context type');
    }
  }

  handleHttpRequest(
    context: ExecutionContext,
    next: CallHandler,
  ): Observable<any> {
    const request = context.switchToHttp().getRequest();
    const method = request.method;
    const ctx = createRequestContext(request);

    const now = Date.now();
    return next.handle().pipe(
      tap(() => {
        const response = context.switchToHttp().getResponse();
        const statusCode = response.statusCode;

        const responseTime = Date.now() - now;

        const resData = { method, statusCode, responseTime };

        this.appLogger.log(ctx, 'Request completed', { resData });
      }),
    );
  }

  handleWsRequest(
    context: ExecutionContext,
    next: CallHandler,
  ): Observable<any> {
    const client: Socket = context.switchToWs().getClient();
    const ctx = createRequestContextFromWs(client);
    const now = Date.now();
    return next.handle().pipe(
      tap(() => {
        const responseTime = Date.now() - now;

        const resData = { responseTime };

        this.appLogger.log(ctx, 'Request completed', { resData });
      }),
    );
  }
}
