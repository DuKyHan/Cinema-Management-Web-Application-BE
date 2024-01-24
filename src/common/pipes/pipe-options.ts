import { ValidationPipeOptions } from '@nestjs/common';

import { PIPE_EXCEPTION_FACTORY } from './exception-factory';

export const VALIDATION_PIPE_OPTIONS: ValidationPipeOptions = {
  transform: true,
  whitelist: true,
  exceptionFactory: PIPE_EXCEPTION_FACTORY,
};
