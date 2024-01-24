import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { Socket } from 'socket.io';
import { v4, validate } from 'uuid';
import { REQUEST_ID_TOKEN_HEADER } from '../constants';

@Injectable()
export class RequestIdInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const client: Socket = context.switchToWs().getClient();
    const req = client.handshake;
    if (
      !req.headers[REQUEST_ID_TOKEN_HEADER] ||
      !validate(req.headers[REQUEST_ID_TOKEN_HEADER] as string)
    ) {
      req.headers[REQUEST_ID_TOKEN_HEADER] = v4();
    }

    return next.handle();
  }
}
