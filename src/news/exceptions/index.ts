
import { HttpStatus } from '@nestjs/common';
import { BaseApiException } from 'src/common/exceptions';

export class NewsNotFoundException extends BaseApiException {
  constructor() {
    super({
      message: 'News not found',
      status: HttpStatus.NOT_FOUND,
    });
  }
}
