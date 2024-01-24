import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { AccountHaveNotHadCinemaBrandException } from 'src/cinema-brand/exceptions';
import { AppLogger } from 'src/common/logger';
import { RequestContext } from 'src/common/request-context';
import { AbstractService } from 'src/common/services';
import { PrismaService } from 'src/prisma';
import { CinemaStatus } from '../constants';
import {
  CinemaOutputDto,
  CinemaQueryDto,
  CreateCinemaDto,
  UpdateCinemaDto,
} from '../dtos';
import {
  CinemaNotFoundException,
  InvalidCinemaStatusException,
} from '../exceptions';

@Injectable()
export class CinemaService extends AbstractService {
  constructor(
    logger: AppLogger,
    private readonly prisma: PrismaService,
  ) {
    super(logger);
  }

  async getCinemas(context: RequestContext, query: CinemaQueryDto) {
    const cinemas = await this.prisma.cinema.findMany({
      where: this.getWhereClause(context, query),
      take: query.limit,
      skip: query.offset,
      include: {
        location: true,
        cinemaBrand: true,
      },
    });
    const total = await this.prisma.cinema.count({
      where: this.getWhereClause(context, query),
    });

    return this.extendedOutputArray(CinemaOutputDto, cinemas, {
      total,
      count: cinemas.length,
    });
  }

  async countCinema(context: RequestContext, query: CinemaQueryDto) {
    const count = await this.prisma.cinema.count({
      where: this.getWhereClause(context, query),
    });
    const total = await this.prisma.cinema.count();

    return {
      total,
      count,
    };
  }

  async getCinema(context: RequestContext, id: number) {
    const cinema = await this.prisma.cinema.findUnique({
      where: {
        id,
        // cinemaBrand: context.isAdmin
        //   ? undefined
        //   : {
        //       ownerId: context.account.id,
        //     },
      },
      include: {
        location: true,
        cinemaBrand: true,
      },
    });

    return cinema;
  }

  private getWhereClause(context: RequestContext, query?: CinemaQueryDto) {
    // const where: Prisma.CinemaWhereInput = {
    //   cinemaBrand: context.isAdmin
    //     ? undefined
    //     : {
    //         ownerId: context.account.id,
    //       },
    // };
    const where: Prisma.CinemaWhereInput = {};
    if (query?.search) {
      where.name = {
        contains: query.search,
        mode: 'insensitive',
      };
    }
    if (query?.status) {
      where.status = query.status;
    }
    if (query?.ownerId) {
      where.cinemaBrand = {
        ownerId: query.ownerId,
      };
    }
    return where;
  }

  async createCinema(context: RequestContext, input: CreateCinemaDto) {
    const cinemaBrand = await this.prisma.cinemaBrand.findFirst({
      where: {
        ownerId: context.account.id,
      },
    });

    if (!cinemaBrand) {
      throw new AccountHaveNotHadCinemaBrandException();
    }

    const cinema = await this.prisma.cinema.create({
      data: {
        name: input.name,
        description: input.description,
        cinemaBrand: {
          connect: {
            id: cinemaBrand.id,
          },
        },
        location: input.location
          ? {
              create: {
                ...input.location,
              },
            }
          : undefined,
      },
    });

    return cinema;
  }

  async updateCinema(
    context: RequestContext,
    id: number,
    input: UpdateCinemaDto,
  ) {
    return this.prisma.cinema.update({
      where: {
        id,
        cinemaBrand: {
          ownerId: context.account.id,
        },
      },
      data: {
        name: input.name,
        description: input.description,
        location: {
          update: {
            ...input.location,
          },
        },
      },
    });
  }

  async deleteCinema(context: RequestContext, id: number) {
    const cinema = await this.prisma.cinema.delete({
      where: {
        id,
        cinemaBrand: {
          ownerId: context.account.id,
        },
      },
    });

    return cinema;
  }

  async cancelCinema(context: RequestContext, id: number) {
    const cinema = await this.prisma.cinema.findUnique({
      where: {
        id,
        cinemaBrand: {
          ownerId: context.account.id,
        },
      },
    });

    if (cinema == null) {
      throw new CinemaNotFoundException();
    }

    if (cinema.status !== CinemaStatus.Pending) {
      throw new InvalidCinemaStatusException();
    }

    return this.prisma.cinema.update({
      where: {
        id,
        cinemaBrand: {
          ownerId: context.account.id,
        },
      },
      data: {
        status: CinemaStatus.Cancelled,
      },
    });
  }
}
