import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import dayjs from 'dayjs';
import { AppLogger } from 'src/common/logger';
import { AbstractService } from 'src/common/services';
import { PrismaService } from 'src/prisma';
import { AnalyticsQueryDto } from '../dtos';
import { ProfitOutputDto } from '../dtos/profit.output.dto';

@Injectable()
export class AnalyticsService extends AbstractService {
  constructor(
    logger: AppLogger,
    private readonly prisma: PrismaService,
  ) {
    super(logger);
  }

  async getProfit(query: AnalyticsQueryDto) {
    const conditions: Prisma.Sql[] = [];

    if (query.startTime != null) {
      conditions.push(Prisma.sql`"createdAt" >= ${query.startTime}`);
    }
    if (query.endTime != null) {
      conditions.push(Prisma.sql`"createdAt" <= ${query.endTime}`);
    }

    const sqlWhere =
      conditions.length > 0
        ? Prisma.sql`WHERE ${Prisma.join(conditions, ' AND ')}`
        : Prisma.empty;

    const res: any[] = await this.prisma.$queryRaw`
      SELECT count, profit, week, DATE_PART('week', "week") as "weekNumber"
      FROM (
        SELECT
        DATE_TRUNC('week', "createdAt")
          AS week,
        COUNT(*)::int AS count,
        SUM("price")::int AS profit
        FROM "Ticket"
        ${sqlWhere}
        GROUP BY DATE_TRUNC('week', "createdAt")
        ORDER BY week
      ) AS profit
    `;
    return this.outputArray(ProfitOutputDto, res);
  }

  async getProfitThisMonthPrevMonth() {
    const thisMonthTickets = await this.prisma.ticket.findMany({
      where: {
        createdAt: {
          gte: dayjs().startOf('month').toDate(),
        },
      },
      select: {
        price: true,
      },
    });
    const totalThisMonth = thisMonthTickets.reduce(
      (acc, cur) => acc + cur.price,
      0,
    );
    const prevMonthTickets = await this.prisma.ticket.findMany({
      where: {
        createdAt: {
          gte: dayjs().subtract(1, 'month').startOf('month').toDate(),
          lt: dayjs().startOf('month').toDate(),
        },
      },
      select: {
        price: true,
      },
    });
    const totalPreviousMonth = prevMonthTickets.reduce(
      (acc, cur) => acc + cur.price,
      0,
    );
    const totalTickets = await this.prisma.ticket.findMany({
      select: {
        price: true,
      },
    });
    const total = totalTickets.reduce((acc, cur) => acc + cur.price, 0);

    return {
      total: total,
      totalThisMonth: totalThisMonth,
      totalPreviousMonth: totalPreviousMonth,
    };
  }

  async getTicket() {
    const res = await this.prisma.ticket.count();
    const thisMonth = await this.prisma.ticket.count({
      where: {
        createdAt: {
          gte: dayjs().startOf('month').toDate(),
        },
      },
    });
    const prevMonth = await this.prisma.ticket.count({
      where: {
        createdAt: {
          gte: dayjs().subtract(1, 'month').startOf('month').toDate(),
          lt: dayjs().startOf('month').toDate(),
        },
      },
    });

    return {
      total: res,
      totalThisMonth: thisMonth,
      totalPreviousMonth: prevMonth,
    };
  }

  async getUser() {
    const res = await this.prisma.account.count();
    const thisMonth = await this.prisma.account.count({
      where: {
        createdAt: {
          gte: dayjs().startOf('month').toDate(),
        },
      },
    });
    const prevMonth = await this.prisma.account.count({
      where: {
        createdAt: {
          gte: dayjs().subtract(1, 'month').startOf('month').toDate(),
          lt: dayjs().startOf('month').toDate(),
        },
      },
    });

    return {
      total: res,
      totalThisMonth: thisMonth,
      totalPreviousMonth: prevMonth,
    };
  }

  async getCinemaFilm() {
    const res = await this.prisma.cinemaFilm.count();
    const thisMonth = await this.prisma.cinemaFilm.count({
      where: {
        createdAt: {
          gte: dayjs().startOf('month').toDate(),
        },
      },
    });
    const prevMonth = await this.prisma.cinemaFilm.count({
      where: {
        createdAt: {
          gte: dayjs().subtract(1, 'month').startOf('month').toDate(),
          lt: dayjs().startOf('month').toDate(),
        },
      },
    });

    return {
      total: res,
      totalThisMonth: thisMonth,
      totalPreviousMonth: prevMonth,
    };
  }
}
