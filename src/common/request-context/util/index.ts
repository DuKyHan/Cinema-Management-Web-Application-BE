import { plainToClass } from 'class-transformer';
import { Request } from 'express';

import { Socket } from 'socket.io';
import { AccountAccessTokenClaims } from '../../../auth/dtos/auth-token-output.dto';
import {
  FORWARDED_FOR_TOKEN_HEADER,
  REQUEST_ID_TOKEN_HEADER,
} from '../../constants';
import { RequestContext } from '../request-context.dto';

// Creates a RequestContext object from Request
export function createRequestContext(request: Request): RequestContext {
  const ctx = new RequestContext();
  ctx.requestId = request.header(REQUEST_ID_TOKEN_HEADER) || '';
  ctx.url = request.url;
  const ip = request.header(FORWARDED_FOR_TOKEN_HEADER);
  ctx.ip = ip ? ip : request.ip;

  // If request.user does not exist, we explicitly set it to null.
  ctx.account = request.user
    ? plainToClass(AccountAccessTokenClaims, request.user, {
        excludeExtraneousValues: true,
      })
    : new AccountAccessTokenClaims();

  return ctx;
}

export const createRequestContextFromWs = (client: Socket): RequestContext => {
  const ctx = new RequestContext();
  ctx.requestId =
    (client.handshake.headers[REQUEST_ID_TOKEN_HEADER] as string) || '';
  ctx.url = client.handshake.url;
  ctx.ip = client.handshake.address;

  const user = (client.handshake as any).user;
  // If request.user does not exist, we explicitly set it to null.
  ctx.account = user
    ? plainToClass(AccountAccessTokenClaims, user, {
        excludeExtraneousValues: true,
      })
    : new AccountAccessTokenClaims();

  return ctx;
};
