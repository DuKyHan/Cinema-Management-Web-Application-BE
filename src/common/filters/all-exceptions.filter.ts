import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpStatus,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Request, Response } from 'express';

import { Socket } from 'socket.io';
import { Environment, REQUEST_ID_TOKEN_HEADER } from '../constants';
import { AppLogger } from '../logger/logger.service';
import { RequestContext } from '../request-context';
import {
  createRequestContext,
  createRequestContextFromWs,
} from '../request-context/util';
import { toErrorObject } from './utils';

@Catch()
export class AllExceptionsFilter<T> implements ExceptionFilter {
  /** set logger context */
  constructor(
    private config: ConfigService,
    private readonly logger: AppLogger,
  ) {
    this.logger.setContext(AllExceptionsFilter.name);
  }

  catch(exception: T, host: ArgumentsHost): any {
    const contextType = host.getType();
    let path: string;
    const timestamp = new Date().toISOString();
    let requestId: any;
    let requestContext: RequestContext;

    if (contextType === 'http') {
      const ctx = host.switchToHttp();
      const req: Request = ctx.getRequest<Request>();
      path = req.url;
      requestId = req.headers[REQUEST_ID_TOKEN_HEADER];
      requestContext = createRequestContext(req);
    } else if (contextType === 'ws') {
      const ctx = host.switchToWs();
      const client = ctx.getClient() as Socket;
      const req = client.handshake;
      path = req.url;
      requestId = req.headers[REQUEST_ID_TOKEN_HEADER];
      requestContext = createRequestContextFromWs(client);
    } else {
      throw new Error('Unsupported context type');
    }

    // NOTE: For reference, please check https://cloud.google.com/apis/design/errors
    const errorObject = toErrorObject(exception, {
      hideInternalDetailError: false,
    });
    const error = {
      statusCode: errorObject.statusCode,
      message: errorObject.message,
      localizedMessage: errorObject.localizedMessage,
      errorName: errorObject.errorName,
      errorCode: errorObject.errorCode,
      details: errorObject.details,
      // Additional meta added by us.
      path,
      requestId,
      timestamp,
    };
    this.logger.warn(requestContext, error.message, {
      error,
      stack: errorObject.stack,
    });

    // Suppress original internal server error details in prod mode
    const isProMood =
      this.config.get<string>('app.env') !== Environment.Development;
    if (isProMood && error.statusCode === HttpStatus.INTERNAL_SERVER_ERROR) {
      error.message = 'Internal server error';
    }

    if (contextType === 'http') {
      const ctx = host.switchToHttp();
      const res: Response = ctx.getResponse<Response>();
      res.status(error.statusCode).json({ error });
    } else {
      const ctx = host.switchToWs();
      const client = ctx.getClient() as Socket;
      client.emit('error', { error: error });

      // ACK response
      const callback = host.getArgByIndex(2);
      if (callback && typeof callback === 'function') {
        callback({ error: error });
      }
    }
  }
}
