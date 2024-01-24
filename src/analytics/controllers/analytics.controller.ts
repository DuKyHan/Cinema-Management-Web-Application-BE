import { Controller, Get, Query } from '@nestjs/common';
import { Role } from 'src/auth/constants';
import { RequireRoles } from 'src/auth/decorators';
import { ReqContext, RequestContext } from 'src/common/request-context';
import { AnalyticsQueryDto } from '../dtos';
import { AnalyticsService } from '../services';

@Controller('analytics')
export class AnalyticsController {
  constructor(private readonly analyticsService: AnalyticsService) {}

  @RequireRoles(Role.Admin)
  @Get('profit')
  async getProfit(
    @ReqContext() context: RequestContext,
    @Query() query: AnalyticsQueryDto,
  ) {
    return this.analyticsService.getProfit(query);
  }

  @RequireRoles(Role.Admin)
  @Get('profit/summary')
  async getProfitSummary(@ReqContext() context: RequestContext) {
    return this.analyticsService.getProfitThisMonthPrevMonth();
  }

  @RequireRoles(Role.Admin)
  @Get('cinema-films/summary')
  async getCinemaFilmSummary(@ReqContext() context: RequestContext) {
    return this.analyticsService.getCinemaFilm();
  }

  @RequireRoles(Role.Admin)
  @Get('accounts/summary')
  async getUserSummary(@ReqContext() context: RequestContext) {
    return this.analyticsService.getUser();
  }

  @RequireRoles(Role.Admin)
  @Get('tickets/summary')
  async getTicketSummary(@ReqContext() context: RequestContext) {
    return this.analyticsService.getTicket();
  }
}
