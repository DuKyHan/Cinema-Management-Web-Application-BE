import {
  Body,
  ClassSerializerInterceptor,
  Controller,
  Get,
  HttpStatus,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Query,
  UseInterceptors,
} from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { Role } from 'src/auth/constants';
import { RequireRoles } from 'src/auth/decorators';
import { BaseApiErrorResponse, SwaggerBaseApiResponse } from 'src/common/dtos';
import { AppLogger } from 'src/common/logger';
import { ReqContext, RequestContext } from 'src/common/request-context';
import {
  AccountOutputDto,
  UpdateAccountInput,
  UpdateAccountRolesInputDto,
} from '../dtos';
import {
  CountAccountQueryDto,
  GetAccountQueryDto,
} from '../dtos/get-account.query.dto';
import { AdminAccountService } from '../services';
import { AccountService } from '../services/account.service';

@ApiTags('accounts')
@Controller('accounts')
export class AccountController {
  constructor(
    private readonly accountService: AccountService,
    private readonly adminAccountService: AdminAccountService,
    private readonly logger: AppLogger,
  ) {}

  @Get('me')
  @ApiOperation({
    summary: 'Get user me API',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    type: SwaggerBaseApiResponse(AccountOutputDto),
  })
  @ApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    type: BaseApiErrorResponse,
  })
  async getMyAccount(
    @ReqContext() ctx: RequestContext,
  ): Promise<AccountOutputDto> {
    this.logger.log(ctx, `${this.getMyAccount.name} was called`);

    const account = await this.accountService.findById(ctx, ctx.account.id);
    return account;
  }

  @Get('/')
  async getAccounts(
    @ReqContext() ctx: RequestContext,
    @Query() query: GetAccountQueryDto,
  ) {
    return this.adminAccountService.getAccounts(ctx, query);
  }

  @RequireRoles(Role.Admin)
  @Get('count')
  async countAccounts(
    @ReqContext() ctx: RequestContext,
    @Query() query: CountAccountQueryDto,
  ) {
    return this.adminAccountService.countAccounts(ctx, query);
  }

  //Get user by id API
  @Get(':id')
  @ApiOperation({
    summary: 'Get user by id API',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    type: SwaggerBaseApiResponse(AccountOutputDto),
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    type: BaseApiErrorResponse,
  })
  async getAccount(
    @ReqContext() ctx: RequestContext,
    @Param('id', ParseIntPipe) id: number,
  ): Promise<AccountOutputDto> {
    const account = await this.accountService.findById(ctx, id);
    return account;
  }

  //Update user API
  @Patch(':id')
  @ApiOperation({
    summary: 'Update user API',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    type: SwaggerBaseApiResponse(AccountOutputDto),
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    type: BaseApiErrorResponse,
  })
  @UseInterceptors(ClassSerializerInterceptor)
  async updateAccount(
    @ReqContext() ctx: RequestContext,
    @Param('id') userId: number,
    @Body() input: UpdateAccountInput,
  ): Promise<AccountOutputDto> {
    this.logger.log(ctx, `${this.updateAccount.name} was called`);
    const account = await this.accountService.updateAccount(ctx, userId, input);
    return account;
  }

  @Post(':id/roles')
  async updateAccountRoles(
    @ReqContext() ctx: RequestContext,
    @Param('id') userId: number,
    @Body() dto: UpdateAccountRolesInputDto,
  ) {
    return this.accountService.updateAccountRoles(ctx, +userId, dto);
  }
}
