import { Injectable } from '@nestjs/common';
import { Interval } from '@nestjs/schedule';
import { AppLogger } from 'src/common/logger';
import { AbstractService } from 'src/common/services';
import { PrismaService } from 'src/prisma';
import { calculateNewsPopularity } from '../utils';

@Injectable()
export class NewsTaskService extends AbstractService {
  constructor(
    logger: AppLogger,
    private readonly prisma: PrismaService,
  ) {
    super(logger);
  }

  // Update news popularity everyday
  @Interval(1000 * 60 * 60 * 24)
  async updateNewsPopularity() {
    this.logCaller(undefined, this.updateNewsPopularity);

    this.internalUpdateNewsPopularity();

    return true;
  }

  async internalUpdateNewsPopularity() {
    let res = await this.prisma.news.findMany({
      take: 100,
    });
    while (res.length > 0) {
      for (const news of res) {
        const popularity = calculateNewsPopularity(news);
        this.prisma.news
          .update({
            where: {
              id: news.id,
            },
            data: {
              popularity: popularity,
            },
          })
          .catch((err) => {
            this.logger.warn(
              undefined,
              `Failed to update news ${news.id} popularity`,
              err,
            );
          });
      }
      res = await this.prisma.news.findMany({
        cursor: { id: res[res.length - 1].id },
        take: 100,
        skip: 1,
      });
    }
  }
}
