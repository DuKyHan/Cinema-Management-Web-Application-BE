
import { Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';

import { CaslModule } from 'nest-casl';
import { AccountModule } from '../account/account.module';
import { CommonModule } from '../common/common.module';
import { Role } from './constants';
import { STRATEGY_JWT_AUTH } from './constants/strategy.constant';
import { AuthController } from './controllers/auth.controller';
import { AccountAccessTokenClaims } from './dtos';
import { AuthService } from './services/auth.service';
import { WsJwtStrategy } from './strategies/jwt-auth-ws.strategy';
import { JwtAuthStrategy } from './strategies/jwt-auth.strategy';
import { JwtRefreshStrategy } from './strategies/jwt-refresh.strategy';
import { LocalStrategy } from './strategies/local.strategy';
import { EmailModule } from 'src/email/email.module';
import { TokenModule } from 'src/token/token.module';

@Module({
  imports: [
    CommonModule,
    PassportModule.register({ defaultStrategy: STRATEGY_JWT_AUTH }),
    JwtModule.registerAsync({
      imports: [CommonModule],
      useFactory: async (configService: ConfigService) => ({
        secret: configService.get<string>('auth.secret'),
      }),
      inject: [ConfigService],
    }),
    CaslModule.forRoot<Role, AccountAccessTokenClaims>({
      superuserRole: Role.Operator,
      getUserFromRequest: (request) => request.user,
    }),
    AccountModule,
    TokenModule,
    EmailModule,
  ],
  controllers: [AuthController],
  providers: [
    AuthService,
    LocalStrategy,
    JwtAuthStrategy,
    JwtRefreshStrategy,
    WsJwtStrategy,
  ],
  exports: [AuthService, CaslModule, JwtModule],
})
export class AuthModule {}
