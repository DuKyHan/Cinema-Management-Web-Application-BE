import {
  Body,
  ClassSerializerInterceptor,
  Controller,
  HttpCode,
  HttpStatus,
  Post,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';

import { AccountOutputDto } from 'src/account/dtos';
import {
  BaseApiErrorResponse,
  SwaggerBaseApiResponse,
} from '../../common/dtos/base-api-response.dto';
import { AppLogger } from '../../common/logger/logger.service';
import { ReqContext } from '../../common/request-context/req-context.decorator';
import { RequestContext } from '../../common/request-context/request-context.dto';
import { Public } from '../decorators';
import {
  ResetPasswordInputDto,
  ResetPasswordRequestInputDto,
  VerifyAccountDto,
  VerifyAccountTokenInputDto,
  VerifyResetPasswordTokenInputDto,
} from '../dtos';
import { LoginInput } from '../dtos/auth-login-input.dto';
import { RefreshTokenInput } from '../dtos/auth-refresh-token-input.dto';
import { RegisterInput } from '../dtos/auth-register-input.dto';
import { RegisterOutput } from '../dtos/auth-register-output.dto';
import { AccountTokenOutputDto } from '../dtos/auth-token-output.dto';
import { JwtRefreshGuard } from '../guards/jwt-refresh.guard';
import { LocalAuthGuard } from '../guards/local-auth.guard';
import { AuthService } from '../services/auth.service';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly logger: AppLogger,
  ) {
    this.logger.setContext(AuthController.name);
  }

  @Public()
  @Post('login')
  @ApiOperation({
    summary: 'User login API',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    type: SwaggerBaseApiResponse(AccountTokenOutputDto),
  })
  @ApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    type: BaseApiErrorResponse,
  })
  @HttpCode(HttpStatus.OK)
  @UseGuards(LocalAuthGuard)
  async login(
    @ReqContext() ctx: RequestContext,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    @Body() credential: LoginInput,
  ): Promise<AccountTokenOutputDto> {
    this.logger.log(ctx, `${this.login.name} was called`);

    const authToken = this.authService.login(ctx);
    return authToken;
  }

  @Public()
  @Post('register')
  @ApiOperation({
    summary: 'User registration API',
  })
  @ApiResponse({
    status: HttpStatus.CREATED,
    type: SwaggerBaseApiResponse(RegisterOutput),
  })
  async register(
    @ReqContext() ctx: RequestContext,
    @Body() input: RegisterInput,
  ) {
    const registeredAccount = await this.authService.register(ctx, input);
    return registeredAccount;
  }

  @Public()
  @Post('refresh-token')
  @ApiOperation({
    summary: 'Refresh access token API',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    type: SwaggerBaseApiResponse(AccountTokenOutputDto),
  })
  @ApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    type: BaseApiErrorResponse,
  })
  @HttpCode(HttpStatus.OK)
  @UseGuards(JwtRefreshGuard)
  @UseInterceptors(ClassSerializerInterceptor)
  async refreshToken(
    @ReqContext() ctx: RequestContext,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    @Body() credential: RefreshTokenInput,
  ): Promise<AccountTokenOutputDto> {
    this.logger.log(ctx, `${this.refreshToken.name} was called`);

    const authToken = await this.authService.refreshToken(ctx);
    return authToken;
  }

  @Public()
  @Post('verify-account')
  @UseInterceptors(ClassSerializerInterceptor)
  async verifyAccount(
    @ReqContext() ctx: RequestContext,
    @Body() dto: VerifyAccountDto,
  ): Promise<AccountOutputDto> {
    return this.authService.verifyAccount(ctx, dto);
  }

  @Public()
  @Post('send-verification-account-token')
  @UseInterceptors(ClassSerializerInterceptor)
  async createVerifyAccountToken(
    @ReqContext() ctx: RequestContext,
    @Body() dto: VerifyAccountTokenInputDto,
  ): Promise<{ successful: boolean }> {
    return this.authService.sendVerifyAccountToken(ctx, dto);
  }

  @Public()
  @Post('request-reset-password')
  async requestResetPassword(
    @ReqContext() ctx: RequestContext,
    @Body() dto: ResetPasswordRequestInputDto,
  ) {
    return this.authService.sendResetPasswordToken(ctx, dto);
  }

  @Public()
  @Post('verify-reset-password-token')
  async verifyResetPasswordToken(
    @ReqContext() ctx: RequestContext,
    @Body() dto: VerifyResetPasswordTokenInputDto,
  ) {
    return this.authService.verifyResetPasswordToken(ctx, dto);
  }

  @Public()
  @Post('reset-password')
  async resetPassword(
    @ReqContext() ctx: RequestContext,
    @Body() dto: ResetPasswordInputDto,
  ) {
    return this.authService.resetPassword(ctx, dto);
  }
}
