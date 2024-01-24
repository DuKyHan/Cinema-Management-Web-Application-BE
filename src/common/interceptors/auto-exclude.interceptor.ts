import {
  CallHandler,
  ExecutionContext,
  NestInterceptor,
  StreamableFile,
} from '@nestjs/common';
import { instanceToPlain } from 'class-transformer';
import { map, Observable } from 'rxjs';

import { BaseApiResponse } from '../dtos';

export class AutoExcludeInterceptor implements NestInterceptor {
  intercept(
    context: ExecutionContext,
    next: CallHandler<BaseApiResponse<any> | any>,
  ): Observable<any> | Promise<Observable<any>> {
    return next.handle().pipe(
      map((res) => {
        if (res instanceof StreamableFile) {
          return res;
        }
        if (res instanceof BaseApiResponse) {
          const data = instanceToPlain(res.data, { strategy: 'excludeAll' });

          res.data = data;
          return res;
        }
        const data = res
          ? instanceToPlain(res, { strategy: 'excludeAll' })
          : {};
        return data;
      }),
    );
  }
}
