import { Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

import { STRATEGY_LOCAL } from '../constants/strategy.constant';

/**
 * This guard will use local strategy provided to authenticate account
 * @see LocalStrategy
 */
@Injectable()
export class LocalAuthGuard extends AuthGuard(STRATEGY_LOCAL) {}
