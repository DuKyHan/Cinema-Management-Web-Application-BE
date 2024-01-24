import { BaseApiException } from './base-api.exception';

export class InvalidInputException extends BaseApiException {
  constructor(property: unknown, details?: string | Record<string, any>) {
    super({
      message: `The ${property} is invalid`,
      errorCode: `invalid-${property}`,
      status: 400,
      details: details,
    });
  }
}

export class InvalidCursorException extends BaseApiException {
  constructor() {
    super({
      message: 'Cannot use cursor and offset at the same time',
      errorCode: 'invalid-cursor',
      status: 400,
    });
  }
}
