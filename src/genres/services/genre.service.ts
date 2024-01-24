import { Injectable } from '@nestjs/common';
import { AppLogger } from 'src/common/logger';
import { AbstractService } from 'src/common/services';
import { PrismaService } from 'src/prisma';
import { GenreQueryDto } from '../dtos';

@Injectable()
export class GenreService extends AbstractService {
  constructor(
    logger: AppLogger,
    private readonly prisma: PrismaService,
  ) {
    super(logger);
  }

  async getGenres(query: GenreQueryDto) {
    return this.prisma.genre.findMany({
      take: query.limit,
      skip: query.offset,
    });
  }

  async getGenreById(id: number) {
    return this.prisma.genre.findUnique({
      where: {
        id: id,
      },
    });
  }
}
