import { Injectable } from '@nestjs/common';

import { Prisma } from '@prisma/client';
import { CinemaNotFoundException } from 'src/cinema/exceptions';
import { AppLogger } from 'src/common/logger';
import { RequestContext } from 'src/common/request-context';
import { AbstractService } from 'src/common/services';
import { foodDeletedNotification } from 'src/notification/constants/notifications';
import { NotificationService } from 'src/notification/services';
import { PrismaService } from 'src/prisma';
import { CreateFoodInputDto, FoodOutputDto, UpdateFoodInputDto } from '../dtos';
import { FoodQueryDto, FoodQueryInclude } from '../dtos/food.query.dto';
import { FoodNotFoundException } from '../exceptions';

@Injectable()
export class FoodService extends AbstractService {
  constructor(
    logger: AppLogger,
    private readonly prisma: PrismaService,
    private readonly notificationService: NotificationService,
  ) {
    super(logger);
  }

  // async getByRoomId(
  //   context: RequestContext,
  //   roomId: number,
  // ): Promise<SeatOutputDto[]> {
  //   this.logCaller(context, this.getByRoomId);
  //   const res = await this.prisma.seat.findMany({
  //     where: {
  //       roomId: roomId,
  //     },
  //   });
  //   return this.outputArray(SeatOutputDto, res);
  // }

  async getFoodById(
    context: RequestContext,
    id: number,
  ): Promise<FoodOutputDto | null> {
    this.logCaller(context, this.getFoodById);
    const res = await this.prisma.foodAndBeverage.findUnique({
      where: {
        id: id,
      },
    });
    if (res == null) {
      return null;
    }
    return this.mapToOutput(res);
  }

  async createFood(
    context: RequestContext,
    dto: CreateFoodInputDto,
  ): Promise<FoodOutputDto> {
    this.logCaller(context, this.createFood);
    return this.prisma.$transaction(
      async (tx) => {
        const cinema = await tx.cinema.findUnique({
          where: {
            id: dto.cinemaId,
          },
        });
        if (cinema == null) {
          throw new CinemaNotFoundException();
        }
        const res = await this.prisma.foodAndBeverage.create({
          data: {
            name: dto.name,
            description: dto.description,
            quantity: dto.quantity,
            price: dto.price,
            cinemaId: dto.cinemaId,
          },
        });

        return this.mapToOutput(res);
      },
      {
        timeout: 15000,
      },
    );
  }

  async updateFood(
    context: RequestContext,
    id: number,
    dto: UpdateFoodInputDto,
  ): Promise<FoodOutputDto> {
    this.logCaller(context, this.updateFood);
    const food = await this.prisma.foodAndBeverage.findUnique({
      where: {
        id: id,
      },
    });
    if (food == null) {
      throw new FoodNotFoundException();
    }
    const updateFood = await this.prisma.foodAndBeverage.update({
      data: {
        name: dto.name,
        description: dto.description,
        quantity: dto.quantity,
        price: dto.price,
        //isPublished: dto.isPublished,
      },
      where: {
        id: id,
      },
    });

    return this.mapToOutput(updateFood);
  }

  async deleteFood(
    context: RequestContext,
    id: number,
  ): Promise<FoodOutputDto | null> {
    this.logCaller(context, this.deleteFood);

    const res = await this.prisma.foodAndBeverage.delete({
      where: {
        id: id,
      },
      include: {
        Cinema: {
          include: {
            cinemaBrand: true,
          },
        },
      },
    });

    if (context.isAdmin) {
      this.notificationService.sendNotification(
        context,
        res.Cinema.cinemaBrand.ownerId,
        foodDeletedNotification({
          foodName: res.name,
          foodId: res.id,
        }),
      );
    }

    return this.mapToOutput(res);
  }

  async getAll(context: RequestContext, query: FoodQueryDto) {
    this.logCaller(context, this.getAll);
    const where = this.getFoodWhere(context, query);
    const res = await this.prisma.foodAndBeverage.findMany({
      where: where,
      include: this.getFoodInclude(query),
      take: query.limit,
      skip: query.offset,
      orderBy: {
        updatedAt: 'desc',
      },
    });
    const total = await this.prisma.foodAndBeverage.count({
      where: where,
    });
    return this.extendedOutputArray(
      FoodOutputDto,
      res.map((r) => this.mapToOutput(r)),
      {
        total: total,
        count: res.length,
      },
    );
  }

  getFoodWhere(context: RequestContext, query: FoodQueryDto) {
    const where: Prisma.FoodAndBeverageWhereInput =
      context.isAdmin || context.isUser
        ? {}
        : {
            Cinema: {
              cinemaBrand: {
                ownerId: context.account.id,
              },
            },
          };
    if (query.ids || query.excludeId) {
      where.id = {
        in: query.ids,
        notIn: query.excludeId,
      };
    }
    if (query.search) {
      where.OR = [
        {
          name: {
            contains: query.search,
            mode: 'insensitive',
          },
        },
        {
          Cinema: {
            name: {
              contains: query.search,
              mode: 'insensitive',
            },
          },
        },
      ];
    }
    if (query.cinemaId) {
      where.cinemaId = query.cinemaId;
    }
    if (Object.keys(where).length === 0) {
      return undefined;
    }
    return where;
  }

  getFoodInclude(query: FoodQueryDto) {
    const include: Prisma.FoodAndBeverageInclude = {};
    if (query.includes) {
      if (query.includes.includes(FoodQueryInclude.Cinema)) {
        include.Cinema = true;
      }
    }
    if (Object.keys(include).length === 0) {
      return undefined;
    }
    return include;
  }

  mapToOutput(raw: any): FoodOutputDto {
    const output: FoodOutputDto = {
      ...raw,
      cinema: raw.Cinema,
    };

    return this.output(FoodOutputDto, output);
  }
}
