import {
  CallHandler,
  ExecutionContext,
  NestInterceptor,
  StreamableFile,
} from '@nestjs/common';
import { Observable, map } from 'rxjs';

import { BaseApiResponse } from '../dtos';

export class ResponseInterceptor implements NestInterceptor {
  intercept(
    context: ExecutionContext,
    next: CallHandler<BaseApiResponse<any> | any>,
  ): Observable<any> | Promise<Observable<any>> {
    const contextType = context.getType();
    if (contextType === 'http') {
      return next.handle().pipe(
        map((res) => {
          if (res instanceof BaseApiResponse || res instanceof StreamableFile) {
            return res;
          }
          const size = Array.isArray(res) ? res.length : undefined;
          const mapped = new BaseApiResponse();
          mapped.data = res;
          mapped.meta = {
            size,
          };
          return mapped;
        }),
      );
    } else if (contextType == 'ws') {
      return next.handle().pipe(
        map((res) => {
          if (res instanceof BaseApiResponse) {
            return res;
          }
          const size = Array.isArray(res) ? res.length : undefined;
          const mapped = new BaseApiResponse();
          mapped.data = res;
          mapped.meta = {
            size,
          };
          return mapped;
        }),
      );
    } else {
      throw new Error('Unsupported context type');
    }
  }
}
