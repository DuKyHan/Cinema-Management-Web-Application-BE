import {
  Body,
  Controller,
  Get,
  HttpStatus,
  Param,
  Put,
  Query,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';

import { SwaggerBaseApiResponse } from 'src/common/dtos';
import { AppLogger } from 'src/common/logger';
import { ReqContext, RequestContext } from 'src/common/request-context';
import {
  GetProfileQueryDto,
  GetProfilesQueryDto,
  ProfileOutputDto,
  UpdateProfileInputDto,
} from '../dtos';
import { ProfileService } from '../services';

@ApiTags('profiles')
@Controller('profiles')
export class ProfileController {
  constructor(
    private readonly profileService: ProfileService,
    private readonly logger: AppLogger,
  ) {
    this.logger.setContext(ProfileController.name);
  }

  @Get()
  async getProfiles(
    @ReqContext() ctx: RequestContext,
    @Query() dto: GetProfilesQueryDto,
  ): Promise<ProfileOutputDto[]> {
    return this.profileService.getProfiles(ctx, dto);
  }

  @Get('me')
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Get account profile',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    type: SwaggerBaseApiResponse(ProfileOutputDto),
  })
  async getMyProfile(
    @ReqContext() ctx: RequestContext,
    @Query() query: GetProfileQueryDto,
  ): Promise<ProfileOutputDto | null> {
    return this.profileService.getProfile(ctx, ctx.account.id, query);
  }

  @Get(':id')
  async getProfile(
    @ReqContext() ctx: RequestContext,
    @Param('id') id: number,
    @Query() query: GetProfileQueryDto,
  ): Promise<ProfileOutputDto | null> {
    return this.profileService.getProfile(ctx, id, query);
  }

  @Put('me')
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Update account profile',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    type: ProfileOutputDto,
  })
  async updateProfile(
    @ReqContext() ctx: RequestContext,
    @Body() input: UpdateProfileInputDto,
  ): Promise<ProfileOutputDto> {
    return this.profileService.updateProfile(ctx, input);
  }
}
