import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { InvalidInputException } from 'src/common/exceptions';
import { AppLogger } from 'src/common/logger';
import { RequestContext } from 'src/common/request-context';
import { AbstractService } from 'src/common/services';
import { FirebaseService } from 'src/firebase/firebase.service';
import { PrismaService } from 'src/prisma';
import { NotificationType, accountNotificationPrefix } from '../constants';
import {
  CreateNotificationInputDto,
  CreateNotificationsInputDto,
  DeleteNotificationsInputDto,
  GetNotificationByIdQueryDto,
  GetNotificationInclude,
  GetNotificationSort,
  GetNotificationsQueryDto,
  MarkNotificationsAsReadInputDto,
  TestCreateNotificationInputDto,
} from '../dtos';
import { NotificationOutputDto } from '../dtos/notification.output.dto';

@Injectable()
export class NotificationService extends AbstractService {
  constructor(
    logger: AppLogger,
    private readonly prisma: PrismaService,
    private readonly firebaseService: FirebaseService,
  ) {
    super(logger);
  }

  async getNotifications(
    context: RequestContext,
    query: GetNotificationsQueryDto,
  ) {
    this.logCaller(context, this.getNotifications);
    const where = this.getNotificationWhere(context, query);
    const sort = this.getNotificationSort(query);
    const res = await this.prisma.notification.findMany({
      where: where,
      take: query.limit,
      skip: query.offset,
      orderBy: sort,
      include: this.getNotificationInclude(query),
    });
    return res.map((n) => this.mapToDto(n));
  }

  async countNotifications(
    context: RequestContext,
    query: GetNotificationsQueryDto,
  ) {
    this.logCaller(context, this.getNotifications);
    const where = this.getNotificationWhere(context, query);
    const count = await this.prisma.notification.count({
      where: where,
    });
    return this.output(NotificationOutputDto, {
      _count: count,
    });
  }

  getNotificationWhere(
    context: RequestContext,
    query: GetNotificationsQueryDto,
  ) {
    const where: Prisma.NotificationWhereInput = {
      accountId: context.account.id,
      pushOnly: false,
    };
    if (query.id) {
      where.id = {
        in: query.id,
      };
    }
    if (query.name) {
      where.title = {
        contains: query.name,
        mode: 'insensitive',
      };
    }
    if (query.read != null) {
      where.read = query.read;
    }
    if (query.type) {
      where.type = {
        in: query.type,
      };
    }
    return where;
  }

  getNotificationInclude(query?: GetNotificationByIdQueryDto) {
    const include: Prisma.NotificationInclude | undefined =
      query?.include == GetNotificationInclude.Data
        ? {
            // activity: true,
            // shift: true,
            // organization: true,
            // report: true,
          }
        : undefined;
    return include;
  }

  getNotificationSort(query: GetNotificationsQueryDto) {
    const sort: Prisma.NotificationOrderByWithAggregationInput = {};
    if (query.sort) {
      if (query.sort.includes(GetNotificationSort.CreatedAtAsc)) {
        sort.createdAt = 'asc';
      } else if (query.sort.includes(GetNotificationSort.CreatedAtDesc)) {
        sort.createdAt = 'desc';
      }
    }
    if (Object.keys(sort).length === 0) {
      return undefined;
    }
    return sort;
  }

  async getNotificationById(
    context: RequestContext,
    id: number,
    query: GetNotificationByIdQueryDto,
  ) {
    this.logCaller(context, this.getNotifications);
    const res = await this.prisma.notification.findUnique({
      where: {
        id: id,
        accountId: context.account.id,
        pushOnly: false,
      },
      include: this.getNotificationInclude(query),
    });
    if (res == null) {
      return null;
    }
    return this.mapToDto(res);
  }

  async markNotificationsAsRead(
    context: RequestContext,
    dto: MarkNotificationsAsReadInputDto,
  ) {
    this.logCaller(context, this.markNotificationsAsRead);
    await this.prisma.notification.updateMany({
      where: {
        id: {
          in: dto.id,
        },
        accountId: context.account.id,
        pushOnly: false,
      },
      data: {
        read: true,
      },
    });
    const notifications = await this.prisma.notification.findMany({
      where: {
        id: {
          in: dto.id,
        },
        accountId: context.account.id,
      },
    });
    return this.outputArray(NotificationOutputDto, notifications);
  }

  async deleteNotifications(
    context: RequestContext,
    dto: DeleteNotificationsInputDto,
  ) {
    this.logCaller(context, this.deleteNotifications);
    const notifications = await this.prisma.notification.findMany({
      where: {
        id: {
          in: dto.id,
        },
        accountId: context.account.id,
        pushOnly: false,
      },
    });
    const notificationIds = notifications.map((n) => n.id);
    await this.prisma.notification.deleteMany({
      where: {
        id: {
          in: notificationIds,
        },
      },
    });
    return this.outputArray(NotificationOutputDto, notifications);
  }

  async sendNotification(
    context: RequestContext,
    accountId: number,
    dto: CreateNotificationInputDto,
  ) {
    this.logCaller(context, this.sendNotification);
    if (dto.type === NotificationType.Cinema && dto.cinemaId == null) {
      throw new InvalidInputException('cinemaId');
    } else if (dto.type === NotificationType.News && dto.newsId == null) {
      throw new InvalidInputException('newsId');
    } else if (dto.type == NotificationType.Ticket && dto.ticketId == null) {
      throw new InvalidInputException('ticketId');
    } else if (dto.type == NotificationType.Report && dto.reportId == null) {
      throw new InvalidInputException('reportId');
    }
    const notification = await this.prisma.notification.create({
      data: {
        accountId: accountId,
        title: dto.title,
        description: dto.description,
        shortDescription: dto.shortDescription,
        type: dto.type,
        // activityId: dto.activityId,
        // shiftId: dto.shiftId,
        // organizationId: dto.organizationId,
        // reportId: dto.reportId,
      },
    });
    const output = this.mapToDto(notification);
    const topic = `${accountNotificationPrefix}-${context.account.id}`;
    this.firebaseService.firebaseMessaging
      .sendToTopic(topic, {
        notification: {
          title: dto.title,
          body: dto.shortDescription ?? dto.description,
        },
        data: {
          notification: JSON.stringify(output),
        },
      })
      .then((mts) => {
        this.logger.log(
          context,
          `Sent notification to topic ${topic}: ${JSON.stringify(mts)}`,
        );
      })
      .catch((err) => {
        this.logger.error(context, err);
      });
    return output;
  }

  async sendNotifications(
    context: RequestContext,
    dto: CreateNotificationsInputDto,
  ) {
    this.logCaller(context, this.sendNotification);
    if (dto.type === NotificationType.Cinema && dto.cinemaId == null) {
      throw new InvalidInputException('cinemaId');
    } else if (dto.type === NotificationType.News && dto.newsId == null) {
      throw new InvalidInputException('newsId');
    } else if (dto.type == NotificationType.Ticket && dto.ticketId == null) {
      throw new InvalidInputException('ticketId');
    } else if (dto.type == NotificationType.Report && dto.reportId == null) {
      throw new InvalidInputException('reportId');
    }
    const inputs = dto.accountIds.map((accountId) => ({
      accountId: accountId,
      title: dto.title,
      description: dto.description,
      shortDescription: dto.shortDescription,
      pushOnly: dto.pushOnly,
      type: dto.type,
      cinemaId: dto.cinemaId,
      newsId: dto.newsId,
      ticketId: dto.ticketId,
      reportId: dto.reportId,
    }));
    await this.prisma.notification.createMany({
      data: inputs,
    });
    const outputs = inputs.map((n) => this.mapToDto(n));
    for (const output of outputs) {
      const topic = `${accountNotificationPrefix}-${output.accountId}`;
      this.firebaseService.firebaseMessaging
        .sendToTopic(topic, {
          notification: {
            title: dto.title,
            body: dto.shortDescription ?? dto.description,
          },
          data: {
            notification: JSON.stringify(output),
          },
        })
        .catch((err) => {
          this.logger.error(context, err);
        });
    }
    return outputs;
  }

  async testSendNotification(
    context: RequestContext,
    dto: TestCreateNotificationInputDto,
  ) {
    this.logCaller(context, this.testSendNotification);
    const res = {};
    if (dto.registrationTokens) {
      const mid =
        await this.firebaseService.firebaseMessaging.sendEachForMulticast({
          tokens: dto.registrationTokens,
          notification: {
            title: dto.title,
            body: dto.shortDescription ?? dto.description,
          },
          data: dto.data,
        });
      res['multicast'] = mid;
    }
    if (dto.topic) {
      const mid = await this.firebaseService.firebaseMessaging.sendToTopic(
        dto.topic,
        {
          notification: {
            title: dto.title,
            body: dto.shortDescription ?? dto.description,
          },
          data: dto.data,
        },
      );
      res['topic'] = mid;
    }
    return res;
  }

  mapToDto(raw: any) {
    return this.output(NotificationOutputDto, raw);
  }
}
