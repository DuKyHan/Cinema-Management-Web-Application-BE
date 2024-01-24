
import { Inject, Injectable } from '@nestjs/common';
import { ConfigType } from '@nestjs/config';
import { compare, hash } from 'bcrypt';
import dayjs from 'dayjs';
import { gen } from 'n-digit-token';

import { PrismaService } from '../../prisma/prisma.service';
import { TokenType } from '../constants';
import { VerifyTokenDto } from '../dto';
import { TokenOutputDto } from '../dto/token.output.dto';
import {
  EarlyTokenRenewalException,
  InvalidTokenException,
} from '../exceptions';
import tokenConfig from 'src/common/configs/subconfigs/token.config';
import { AppLogger } from 'src/common/logger';
import { RequestContext } from 'src/common/request-context';
import { AbstractService } from 'src/common/services';

@Injectable()
export class TokenService extends AbstractService {
  constructor(
    @Inject(tokenConfig.KEY)
    private readonly tokenConfigApi: ConfigType<typeof tokenConfig>,
    private readonly prisma: PrismaService,
    appLogger: AppLogger,
  ) {
    super(appLogger);
  }

  async getEffectiveToken(
    ctx: RequestContext,
    type: TokenType,
  ): Promise<TokenOutputDto | null> {
    const lifeSec = this.tokenConfigApi.lifeSec;

    const exist = await this.prisma.token.findUnique({
      where: {
        accountId_type: {
          accountId: ctx.account.id,
          type: type,
        },
      },
    });

    if (
      !exist ||
      dayjs(exist.createdAt).add(lifeSec, 'second').isBefore(dayjs())
    ) {
      return null;
    }

    return exist;
  }

  async createToken(
    ctx: RequestContext,
    accountId: number,
    type: TokenType,
    options?: {
      skipEarlyRenewalCheck?: boolean;
    },
  ): Promise<string> {
    this.logCaller(ctx, this.createToken);
    
    const renewSec = this.getRenewSec(type);
    this.logger.log(ctx, `type is ${type}`);

    const exist = await this.prisma.token.findUnique({
      where: {
        accountId_type: {
          accountId: accountId,
          type: type,
        },
      },
    });
    if (
      options?.skipEarlyRenewalCheck != true &&
      exist &&
      dayjs(exist.createdAt).add(renewSec, 'second').isAfter(dayjs())
    ) {
      throw new EarlyTokenRenewalException();
    }

    // Delete the old token
    if (exist) {
      this.logger.log(ctx, 'old token exist, delete it');
      await this.prisma.token.delete({
        where: {
          accountId_type: {
            accountId: accountId,
            type: type,
          },
        },
      });
    }

    // Generate 6-digit TOKEN and hash it
    const token = gen(6);
    const hashed = await hash(token, 10);

    await this.prisma.token.create({
      data: {
        accountId: accountId,
        token: hashed,
        type: type,
      },
    });

    return token;
  }

  async verifyToken(
    ctx: RequestContext,
    accountId: number,
    verifyToken: VerifyTokenDto,
    type: TokenType,
  ): Promise<void> {
    this.logCaller(ctx, this.verifyToken);

    const lifeSec = this.tokenConfigApi.lifeSec;

    const exist = await this.prisma.token.findUnique({
      where: {
        accountId_type: {
          accountId: accountId,
          type: type,
        },
      },
    });
    // Check if token exists and not expires yet
    if (
      !exist ||
      !exist.createdAt ||
      dayjs(exist.createdAt.getTime()).add(lifeSec, 'second').isBefore(dayjs())
    ) {
      throw new InvalidTokenException();
    }

    // Compare with hashed token
    const match = await compare(verifyToken.token, exist.token);
    if (!match) {
      throw new InvalidTokenException();
    }
  }

  async verifyAndExpireToken(
    ctx: RequestContext,
    accountId: number,
    verifyToken: VerifyTokenDto,
    type: TokenType,
  ): Promise<void> {
    this.logCaller(ctx, this.verifyAndExpireToken);

    await this.verifyToken(ctx, accountId, verifyToken, type);

    // Delete the token
    await this.prisma.token.delete({
      where: {
        accountId_type: {
          accountId: accountId,
          type: type,
        },
      },
    });
  }

  private getRenewSec(type: TokenType): number {
    let renewSec;
    switch (type) {
      case TokenType.ResetPassword:
        renewSec = this.tokenConfigApi.passwordResetRenewSec;
        break;
      case TokenType.EmailVerification:
        renewSec = this.tokenConfigApi.emailVerificationResetRenewSec;
        break;
      default:
        renewSec = 0;
        break;
    }
    return renewSec;
  }
}
