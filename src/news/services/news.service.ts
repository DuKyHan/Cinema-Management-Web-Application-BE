// import { activityMinimalSelect } from 'src/activity/constants';
// import { organizationMinimalSelect } from 'src/organization/constants';
import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { AppLogger } from 'src/common/logger';
import { RequestContext } from 'src/common/request-context';
import { AbstractService } from 'src/common/services';
import {
  newsApprovedNotification,
  newsRejectedNotification,
} from 'src/notification/constants/notifications';
import { NotificationService } from 'src/notification/services';
import { PrismaService } from 'src/prisma';
import { getProfileBasicSelect } from 'src/profile/dtos';
import { ProfileService } from 'src/profile/services';
import { NewsStatus } from '../constants';
import {
  CreateNewsInputDto,
  ManyNewsQueryDto,
  NewsInclude,
  NewsOutputDto,
  NewsQueryDto,
  NewsSort,
  UpdateNewsInputDto,
  UpdateNewsStatusInputDto,
} from '../dtos';
import { CreateAuthorizedNewsWhereQuery } from '../types';

@Injectable()
export class NewsService extends AbstractService {
  constructor(
    logger: AppLogger,
    private readonly prisma: PrismaService,
    private readonly profileService: ProfileService,
    private readonly notificationService: NotificationService,
  ) {
    super(logger);
  }

  async getNews(
    context: RequestContext,
    query: ManyNewsQueryDto,
    createAuthorizedNewsWhereQuery: CreateAuthorizedNewsWhereQuery,
  ) {
    const where = this.getWhere(query, createAuthorizedNewsWhereQuery);
    const news = await this.prisma.news.findMany({
      where: where,
      include: this.getInclude(query.includes),
      take: query.limit,
      skip: query.offset,
      orderBy: this.getOrderBy(query),
    });

    const res = news.map((raw) => this.mapToDto(raw));
    const total = await this.prisma.news.count({
      where: where,
    });

    // if (
    //   query.sort == NewsSort.PopularityAsc ||
    //   query.sort == NewsSort.PopularityDesc
    // ) {
    //   res.sort((a, b) => {
    //     if (query.sort == NewsSort.PopularityAsc) {
    //       return a.views - b.views;
    //     } else {
    //       return b.views - a.views;
    //     }
    //   });
    // }

    return this.extendedOutputArray(NewsOutputDto, res, {
      total,
      count: res.length,
    });
  }

  async countNews(context: RequestContext, query: ManyNewsQueryDto) {
    const where = this.getWhere(query);

    const count = await this.prisma.news.count({
      where: where,
    });
    const total = await this.prisma.news.count();

    return {
      total,
      count,
    };
  }

  async getNewsById(
    context: RequestContext,
    id: number,
    query?: NewsQueryDto,
    createAuthorizedNewsWhereQuery?: CreateAuthorizedNewsWhereQuery,
  ) {
    const where: Prisma.NewsWhereUniqueInput =
      createAuthorizedNewsWhereQuery == null
        ? { id: id }
        : {
            ...createAuthorizedNewsWhereQuery({}),
            id: id,
          };
    const res = await this.prisma.news.findUnique({
      where: where,
      include: this.getInclude(query?.includes),
    });
    if (res == null) {
      return null;
    }
    return this.mapToDto(res);
  }

  getWhere(
    query: ManyNewsQueryDto,
    createAuthorizedWhereQuery?: CreateAuthorizedNewsWhereQuery,
  ) {
    // Everyone can see published news and news from organizations they are members of
    // const where: Prisma.NewsWhereInput = createAuthorizedWhereQuery
    //   ? createAuthorizedWhereQuery({})
    //   : {};
    const where: Prisma.NewsWhereInput = {};

    if (query.id || query.excludeIds) {
      where.id = {
        in: query.id,
        notIn: query.excludeIds,
      };
    }

    if (query.type) {
      where.type = {
        in: query.type,
      };
    }

    if (query.status) {
      where.status = query.status;
    }

    if (query.authorId) {
      where.authorId = query.authorId;
    }

    // if (query.isPublished != null) {
    //   where.isPublished = query.isPublished;
    // }

    if (query.search) {
      where.title = {
        contains: query.search,
        mode: 'insensitive',
      };
    }

    return where;
  }

  getInclude(includes?: NewsInclude[]) {
    const include: Prisma.NewsInclude = {};

    if (includes?.includes(NewsInclude.Author)) {
      include.author = {
        include: {
          profile: {
            select: this.profileService.parseProfileSelect(
              getProfileBasicSelect,
            ),
          },
        },
      };
    }
    if (includes?.includes(NewsInclude.Organization)) {
      // include.organization = {
      //   select: organizationMinimalSelect,
      // };
    }
    if (includes?.includes(NewsInclude.Reference)) {
      // include.Activity = {
      //   select: activityMinimalSelect,
      // };
    }

    if (Object.keys(include).length == 0) {
      return undefined;
    }

    return include;
  }

  getOrderBy(query: ManyNewsQueryDto) {
    const orderBy:
      | Prisma.NewsOrderByWithRelationAndSearchRelevanceInput
      | Prisma.NewsOrderByWithRelationAndSearchRelevanceInput[] = {};
    if (query.sort == NewsSort.PopularityDesc) {
      orderBy.popularity = 'desc';
    } else if (query.sort == NewsSort.PopularityAsc) {
      orderBy.popularity = 'asc';
    } else if (
      (query.sort == NewsSort.RelevanceAsc ||
        query.sort == NewsSort.RelevanceDesc) &&
      query.search
    ) {
      orderBy._relevance = {
        fields: ['title'],
        search: query.search,
        sort: query.sort == NewsSort.RelevanceAsc ? 'asc' : 'desc',
      };
    } else if (query.sort == NewsSort.DateAsc) {
      orderBy.createdAt = 'asc';
    } else if (query.sort == NewsSort.DateDesc) {
      orderBy.createdAt = 'desc';
    } else if (query.sort == NewsSort.ViewsAsc) {
      orderBy.views = 'asc';
    } else if (query.sort == NewsSort.ViewsDesc) {
      orderBy.views = 'desc';
    }
    return orderBy;
  }

  async readNews(context: RequestContext, id: number) {
    const viewer = await this.prisma.newsViewer.findUnique({
      where: {
        newsId_accountId: {
          newsId: id,
          accountId: context.account.id,
        },
      },
    });
    if (viewer != null) {
      return;
    }
    await this.prisma.newsViewer.create({
      data: {
        newsId: id,
        accountId: context.account.id,
      },
    });
    const res = await this.prisma.news.update({
      where: { id: id },
      data: {
        views: {
          increment: 1,
        },
      },
    });

    return this.mapToDto(res);
  }

  async createNews(context: RequestContext, dto: CreateNewsInputDto) {
    const res = await this.prisma.news.create({
      data: {
        type: dto.type,
        title: dto.title,
        content: dto.content,
        contentFormat: dto.contentFormat,
        thumbnail: dto.thumbnail,
        // organizationId: dto.organizationId,
        authorId: context.account.id,
        //isPublished: dto.isPublished,
        // activityId: dto.activityId,
        filmId: dto.filmId,
        cinemaId: dto.cinemaId,
      },
    });
    return this.mapToDto(res);
  }

  async updateNews(
    context: RequestContext,
    id: number,
    dto: UpdateNewsInputDto,
  ) {
    const res = await this.prisma.news.update({
      where: { id: id },
      data: {
        type: dto.type,
        title: dto.title,
        content: dto.content,
        contentFormat: dto.contentFormat,
        thumbnail: dto.thumbnail,
        //isPublished: dto.isPublished,
        // activityId: dto.type == NewsType.Activity ? dto.activityId : null,
      },
    });
    return this.mapToDto(res);
  }

  async deleteNews(context: RequestContext, id: number) {
    const res = await this.prisma.news.delete({
      where: { id: id },
    });
    return this.mapToDto(res);
  }

  // async cancelNews(context: RequestContext, id: number) {
  //   const res = await this.prisma.news.findUnique({
  //     where: { id: id },
  //   });
  //   if (res?.authorId !== context.account.id) {
  //     throw new ForbiddenException();
  //   }
  //   const res2 = await this.prisma.news.update({
  //     where: { id: id },
  //     data: {
  //       status: NewsStatus.Canceled,
  //     },
  //   });
  //   return this.mapToDto(res);
  // }

  async approveNews(
    context: RequestContext,
    id: number,
    dto: UpdateNewsStatusInputDto,
  ) {
    const res = await this.prisma.news.update({
      where: { id: id },
      data: {
        status: NewsStatus.Published,
        rejectionReason: dto.rejectionReason ?? null,
      },
    });
    this.notificationService.sendNotification(context, res.authorId, {
      ...newsApprovedNotification({
        newsTitle: res.title,
        newsId: res.id,
      }),
    });
    return this.mapToDto(res);
  }

  async rejectNews(
    context: RequestContext,
    id: number,
    dto: UpdateNewsStatusInputDto,
  ) {
    const res = await this.prisma.news.update({
      where: { id: id },
      data: {
        status: NewsStatus.Rejected,
        rejectionReason: dto.rejectionReason ?? null,
      },
    });
    this.notificationService.sendNotification(context, res.authorId, {
      ...newsRejectedNotification({
        newsTitle: res.title,
        newsId: res.id,
      }),
    });
    return this.mapToDto(res);
  }

  mapToDto(raw: any) {
    return this.output(NewsOutputDto, {
      ...raw,
      author: raw.author?.profile,
    });
  }
}
