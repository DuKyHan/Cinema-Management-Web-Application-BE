import { HttpException, HttpStatus } from '@nestjs/common';
import { WsException } from '@nestjs/websockets';
import {
  PrismaClientKnownRequestError,
  PrismaClientValidationError,
} from '@prisma/client/runtime/library';
import { BaseApiException } from '../exceptions';

export const toErrorObject = (
  exception: any,
  options?: { hideInternalDetailError?: boolean },
) => {
  let stack: any;
  let statusCode: HttpStatus | null = null;
  let errorName: string | null = null;
  let errorCode: string | null = null;
  let message: string | null = null;
  let details: string | Record<string, any> | null = null;
  // TODO : Based on language value in header, return a localized message.
  const localizedMessage = 'en';

  // TODO : Refactor the below cases into a switch case and tidy up error response creation.
  if (exception instanceof BaseApiException) {
    statusCode = exception.getStatus();
    errorName = exception.constructor.name;
    errorCode = exception.errorCode;
    message = exception.message;
    details = exception.details || exception.getResponse();
  } else if (exception instanceof HttpException) {
    statusCode = exception.getStatus();
    errorName = exception.constructor.name;
    message = exception.message;
    details = exception.getResponse();
    stack = exception.stack;
  } else if (exception instanceof WsException) {
    statusCode = 400;
    errorName = exception.name;
    message = exception.message;
    details = exception.getError();
    stack = exception.stack;
  } else if (exception instanceof PrismaClientKnownRequestError) {
    errorName = 'DatabaseException';
    errorCode = 'database-exception';
    if (exception.code.startsWith('P1')) {
      statusCode = 500;
      message = 'Connection error';
    } else if (exception.code === 'P2015' || exception.code === 'P2025') {
      statusCode = 404;
      message = 'Record not found';
    } else if (exception.code.startsWith('P2')) {
      statusCode = 400;
      message = 'Input constraint/validation failed';
    } else {
      statusCode = 500;
      message = 'Unknown error';
    }
    stack = exception.stack;
  } else if (exception instanceof PrismaClientValidationError) {
    errorName = 'DatabaseException';
    errorCode = 'database-exception';
    statusCode = 400;
    message = 'Input constraint/validation failed';
    stack = exception.stack;
  } else if (exception instanceof Error) {
    errorName = exception.constructor.name;
    message = exception.message;
    stack = exception.stack;
  }

  // Set to internal server error in case it did not match above categories.
  statusCode = statusCode || HttpStatus.INTERNAL_SERVER_ERROR;
  errorName = errorName || 'InternalException';
  message = message || 'Internal server error';

  // NOTE: For reference, please check https://cloud.google.com/apis/design/errors
  const error = {
    statusCode,
    message,
    localizedMessage,
    errorName,
    errorCode,
    details,
    stack,
  };

  // Suppress original internal server error details in prod mode
  const isProMood = options?.hideInternalDetailError !== false;
  if (isProMood && statusCode === HttpStatus.INTERNAL_SERVER_ERROR) {
    error.message = 'Internal server error';
  }

  return error;
};
