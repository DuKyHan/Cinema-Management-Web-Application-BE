
import {
  Body,
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Post,
  Put,
  Query,
} from '@nestjs/common';
import {
  CountAccountVerificationRequestQueryDto,
  CreateAccountVerificationInputDto,
  GetAccountVerificationQueryDto,
  GetAccountVerificationsQueryDto,
} from '../dtos';
import { AccountVerificationService } from '../services';
import { ReqContext, RequestContext } from 'src/common/request-context';

@Controller('account-verifications')
export class AccountVerificationController {
  constructor(
    private readonly accountVerificationService: AccountVerificationService,
  ) {}

  @Get()
  async getVerificationRequest(
    @ReqContext() context: RequestContext,
    @Query() query: GetAccountVerificationsQueryDto,
  ) {
    return this.accountVerificationService.getVerificationRequests(
      context,
      query,
    );
  }

  @Get('count')
  async countVerificationRequest(
    @ReqContext() context: RequestContext,
    @Query() query: CountAccountVerificationRequestQueryDto,
  ) {
    return this.accountVerificationService.countVerificationRequests(
      context,
      query,
    );
  }

  @Get(':id')
  async getVerificationRequestById(
    @ReqContext() context: RequestContext,
    @Param('id', ParseIntPipe) id: number,
    @Query() query: GetAccountVerificationQueryDto,
  ) {
    return this.accountVerificationService.getVerificationRequestById(
      context,
      id,
      query,
    );
  }

  @Post()
  async createVerificationRequest(
    @ReqContext() context: RequestContext,
    @Body() dto: CreateAccountVerificationInputDto,
    @Query() query: GetAccountVerificationsQueryDto,
  ) {
    return this.accountVerificationService.createVerificationRequest(
      context,
      dto,
      query,
    );
  }

  @Put(':id/block')
  async blockVerificationRequest(
    @ReqContext() context: RequestContext,
    @Param('id', ParseIntPipe) id: number,
  ) {
    return this.accountVerificationService.blockVerificationRequest(
      context,
      id,
    );
  }

  @Put(':id/unblock')
  async unblockVerificationRequest(
    @ReqContext() context: RequestContext,
    @Param('id', ParseIntPipe) id: number,
  ) {
    return this.accountVerificationService.unblockVerificationRequest(
      context,
      id,
    );
  }
}
