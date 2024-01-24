import {
  Body,
  Controller,
  Get,
  HttpStatus,
  Param,
  Post,
  Put,
  Query,
} from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { BaseApiErrorResponse, SwaggerBaseApiResponse } from 'src/common/dtos';
import { ReqContext, RequestContext } from 'src/common/request-context';
import {
  AccountOutputDto,
  AdminAccountBanInputDto,
  AdminAccountVerifyInputDto,
  BaseAccountQueryDto,
  GetAccountQueryDto,
} from '../dtos';
import { AdminAccountService } from '../services';

@ApiTags('admins')
@Controller('admin/accounts')
export class AdminAccountController {
  constructor(private readonly adminAccountService: AdminAccountService) {}

  @Get()
  @ApiOperation({
    summary: 'Get users as a list API',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    type: SwaggerBaseApiResponse([AccountOutputDto]),
  })
  @ApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    type: BaseApiErrorResponse,
  })
  //   @UseGuards(JwtAuthGuard, RolesGuard)
  //   @RequireRoles(Role.Admin, Role.Volunteer)
  async getAccounts(
    @ReqContext() ctx: RequestContext,
    @Query() query: GetAccountQueryDto,
  ) {
    return this.adminAccountService.getAccounts(ctx, query);
  }

  @Put(':id/verify')
  async verifyAccount(
    @ReqContext() context: RequestContext,
    @Param('id') id: number,
    @Body() dto: AdminAccountVerifyInputDto,
    @Query() query: BaseAccountQueryDto,
  ) {
    return this.adminAccountService.verifyAccount(context, id, dto, query);
  }

  @Put(':id/ban')
  async banAccount(
    @ReqContext() context: RequestContext,
    @Param('id') id: number,
    @Body() dto: AdminAccountBanInputDto,
    @Query() query: BaseAccountQueryDto,
  ) {
    return this.adminAccountService.banAccount(context, id, dto, query);
  }

  //   @RequireRoles(Role.SuperAdmin)
  @Post(':id/grant-admin')
  async grantAdmin(
    @ReqContext() context: RequestContext,
    @Param('id') id: number,
  ) {
    return this.adminAccountService.grantAdminRole(context, id);
  }

  //   @RequireRoles(Role.SuperAdmin)
  @Post(':id/revoke-admin')
  async revokeAdmin(
    @ReqContext() context: RequestContext,
    @Param('id') id: number,
  ) {
    return this.adminAccountService.revokeAdminRole(context, id);
  }
}
