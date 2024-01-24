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
import { Public, RequireRoles } from 'src/auth/decorators';
import { ReqContext, RequestContext } from 'src/common/request-context';
import {
  CreateNewsInputDto,
  ManyNewsQueryDto,
  NewsQueryDto,
  UpdateNewsInputDto,
  UpdateNewsStatusInputDto,
} from '../dtos';
import {
  NewsAuthorizationService,
  NewsService,
  NewsTaskService,
} from '../services';

@Controller('news')
export class NewsController {
  constructor(
    private readonly newsService: NewsService,
    private readonly newsAuthorizationService: NewsAuthorizationService,
    private readonly newsTaskService: NewsTaskService,
  ) {}

  @Public()
  @Get()
  async getNews(
    @ReqContext() context: RequestContext,
    @Query() query: ManyNewsQueryDto,
  ) {
    return this.newsService.getNews(
      context,
      query,
      this.newsAuthorizationService.getAuthorizeWhereQuery(context),
    );
  }

  @Get('count')
  async countNews(
    @ReqContext() context: RequestContext,
    @Query() query: ManyNewsQueryDto,
  ) {
    return this.newsService.countNews(context, query);
  }

  @Get(':id')
  async getNewsById(
    @ReqContext() context: RequestContext,
    @Param('id', ParseIntPipe) id: number,
    @Query() query: NewsQueryDto,
  ) {
    return this.newsService.getNewsById(
      context,
      id,
      query,
      //this.newsAuthorizationService.getAuthorizeWhereQuery(context),
    );
  }

  @Post(':id/read')
  async readNews(
    @ReqContext() context: RequestContext,
    @Param('id', ParseIntPipe) id: number,
  ) {
    return this.newsService.readNews(context, id);
  }

  @Post()
  async createNews(
    @ReqContext() context: RequestContext,
    @Body() dto: CreateNewsInputDto,
  ) {
    // await this.newsAuthorizationService.validateCanCreateNews(
    //   context,
    //   dto.organizationId,
    //   {
    //     activityId: dto.type === NewsType.Activity ? dto.activityId : undefined,
    //   },
    // );
    return this.newsService.createNews(context, dto);
  }

  @Put(':id')
  async updateNews(
    @ReqContext() context: RequestContext,
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateNewsInputDto,
  ) {
    await this.newsAuthorizationService.validateCanUpdateNews(context, id);
    return this.newsService.updateNews(context, id, dto);
  }

  @Delete(':id')
  async deleteNews(
    @ReqContext() context: RequestContext,
    @Param('id', ParseIntPipe) id: number,
  ) {
    await this.newsAuthorizationService.validateCanDeleteNews(context, id);
    return this.newsService.deleteNews(context, id);
  }

  @RequireRoles(Role.Operator)
  @Post('refresh')
  async refreshNews(@ReqContext() context: RequestContext) {
    return this.newsTaskService.updateNewsPopularity();
  }

  // @Post(':id/cancel')
  // async cancelNews(context: RequestContext, id: number) {
  //   return this.newsService.cancelNews(context, id);
  // }

  @RequireRoles(Role.Admin)
  @Post(':id/approve')
  async approveNews(
    @ReqContext() context: RequestContext,
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateNewsStatusInputDto,
  ) {
    return this.newsService.approveNews(context, id, dto);
  }

  @RequireRoles(Role.Admin)
  @Post(':id/reject')
  async rejectNews(
    @ReqContext() context: RequestContext,
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateNewsStatusInputDto,
  ) {
    return this.newsService.rejectNews(context, id, dto);
  }
}
