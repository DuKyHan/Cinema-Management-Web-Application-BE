import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Post,
  Put,
  Query,
} from '@nestjs/common';
import { Role } from 'src/auth/constants';
import { RequireRoles } from 'src/auth/decorators';
import { ReqContext, RequestContext } from 'src/common/request-context';
import {
  ChangeCinemaStatusDto,
  CinemaQueryDto,
  CreateCinemaDto,
  UpdateCinemaDto,
} from '../dtos';
import { AdminCinemaService, CinemaService } from '../services';

@Controller('cinemas')
export class CinemaController {
  constructor(
    private readonly cinemaService: CinemaService,
    private readonly adminCinemaService: AdminCinemaService,
  ) {}

  @Get()
  async getCinemas(
    @ReqContext() context: RequestContext,
    @Query() query: CinemaQueryDto,
  ) {
    return this.cinemaService.getCinemas(context, query);
  }

  @Get('count')
  async countCinemas(
    @ReqContext() context: RequestContext,
    @Query() query: CinemaQueryDto,
  ) {
    return this.cinemaService.countCinema(context, query);
  }

  @Get(':id')
  async getCinema(
    @ReqContext() context: RequestContext,
    @Param('id', ParseIntPipe) id: number,
  ) {
    return this.cinemaService.getCinema(context, id);
  }

  @Post()
  async createCinema(
    @ReqContext() context: RequestContext,
    @Body() dto: CreateCinemaDto,
  ) {
    return this.cinemaService.createCinema(context, dto);
  }

  @Put(':id')
  async updateCinema(
    @ReqContext() context: RequestContext,
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateCinemaDto,
  ) {
    return this.cinemaService.updateCinema(context, id, dto);
  }

  @Delete(':id')
  async deleteCinema(
    @ReqContext() context: RequestContext,
    @Param('id', ParseIntPipe) id: number,
  ) {
    return this.cinemaService.deleteCinema(context, id);
  }

  @Post(':id/cancel')
  async cancelCinema(
    @ReqContext() context: RequestContext,
    @Param('id', ParseIntPipe) id: number,
  ) {
    return this.cinemaService.cancelCinema(context, id);
  }

  @RequireRoles(Role.Admin)
  @Post(':id/verify')
  async verifyCinema(
    @ReqContext() context: RequestContext,
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: ChangeCinemaStatusDto,
  ) {
    return this.adminCinemaService.verifyCinema(context, id, dto);
  }

  @RequireRoles(Role.Admin)
  @Post(':id/reject')
  async rejectCinema(
    @ReqContext() context: RequestContext,
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: ChangeCinemaStatusDto,
  ) {
    return this.adminCinemaService.rejectCinema(context, id, dto);
  }

  @RequireRoles(Role.Admin)
  @Post(':id/disable')
  async disableCinema(
    @ReqContext() context: RequestContext,
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: ChangeCinemaStatusDto,
  ) {
    return this.adminCinemaService.disableCinema(context, id, dto);
  }

  @RequireRoles(Role.Admin)
  @Post(':id/enable')
  async enableCinema(
    @ReqContext() context: RequestContext,
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: ChangeCinemaStatusDto,
  ) {
    return this.adminCinemaService.enableCinema(context, id, dto);
  }
}
