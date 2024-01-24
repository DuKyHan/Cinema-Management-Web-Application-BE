import { createParamDecorator, ExecutionContext } from '@nestjs/common';

import { RequestContext } from './request-context.dto';
import { createRequestContext, createRequestContextFromWs } from './util';

export const ReqContext = createParamDecorator(
  (data: unknown, ctx: ExecutionContext): RequestContext => {
    switch (ctx.getType()) {
      case 'http':
        const request = ctx.switchToHttp().getRequest();
        return createRequestContext(request);
      case 'ws':
        const client = ctx.switchToWs().getClient();
        return createRequestContextFromWs(client);
      default:
        throw new Error('Unsupported context type');
    }
  },
);
