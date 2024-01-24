
import { ExecutionContext, Inject } from '@nestjs/common';
import { ConfigType } from '@nestjs/config';
import { AuthGuard } from '@nestjs/passport';
import { Observable } from 'rxjs';
import { STRATEGY_JWT_AUTH_WEBSOCKET } from '../constants';
import authConfig from 'src/common/configs/subconfigs/auth.config';

export class WsAuthGuard extends AuthGuard(STRATEGY_JWT_AUTH_WEBSOCKET) {
  constructor(
    @Inject(authConfig.KEY)
    private readonly authConfigApi: ConfigType<typeof authConfig>,
  ) {
    super();
  }

  override canActivate(
    context: ExecutionContext,
  ): boolean | Promise<boolean> | Observable<boolean> {
    if (this.authConfigApi.disabled) {
      return true;
    }
    return super.canActivate(context);
  }

  override getRequest(context: ExecutionContext) {
    return context.switchToWs().getClient().handshake;
  }
}
