import { ForbiddenException, Injectable } from '@nestjs/common';

import { CinemaNotFoundException } from 'src/cinema/exceptions';
import { AppLogger } from 'src/common/logger';
import { RequestContext } from 'src/common/request-context';
import { AbstractService } from 'src/common/services';
import { PrismaService } from 'src/prisma';
import {
  RoomHasSameNameException,
  RoomNotFoundException,
} from 'src/room/exceptions';
import {
  CreateRoomInputDto,
  RoomOutputDto,
  RoomQueryDto,
  UpdateRoomInputDto,
} from '../dtos';

@Injectable()
export class RoomService extends AbstractService {
  constructor(
    logger: AppLogger,
    private readonly prisma: PrismaService,
  ) {
    super(logger);
  }

  async getRooms(
    context: RequestContext,
    query: RoomQueryDto,
  ): Promise<RoomOutputDto[]> {
    this.logCaller(context, this.getRooms);
    const res = await this.prisma.room.findMany({
      where: this.getWhere(context, query),
      take: query.limit,
      skip: query.offset,
    });
    return this.outputArray(RoomOutputDto, res);
  }

  async getByRoomId(context: RequestContext, roomId: number) {
    this.logCaller(context, this.getByRoomId);
    const res = await this.prisma.room.findUnique({
      where: {
        roomId: roomId,
        Cinema: {
          cinemaBrand: {
            ownerId: context.account.id,
          },
        },
      },
      include: {
        seat: true,
      },
    });
    if (res == null) {
      return null;
    }
    return this.output(RoomOutputDto, { ...res, seats: res.seat });
  }

  async getRoomByCinemaId(
    context: RequestContext,
    cinemaId: number,
  ): Promise<RoomOutputDto[] | null> {
    this.logCaller(context, this.getRoomByCinemaId);
    const res = await this.prisma.room.findMany({
      where: {
        cinemaId: cinemaId,
        // Cinema: {
        //   cinemaBrand: {
        //     ownerId: context.account.id,
        //   },
        // },
      },
      include: {
        seat: true,
      },
    });
    if (res == null) {
      return null;
    }
    return this.outputArray(
      RoomOutputDto,
      res.map((room) => {
        return {
          ...room,
          seats: room.seat,
        };
      }),
    );
  }

  private getWhere(context: RequestContext, query: RoomQueryDto) {
    const where: any = {
      Cinema: {
        cinemaBrand: {
          ownerId: context.account.id,
        },
      },
    };
    if (query.cinemaId != null) {
      where.cinemaId = query.cinemaId;
    }
    if (query.name != null) {
      where.name = {
        mode: 'insensitive',
        contains: query.name,
      };
    }
    return where;
  }

  async createRoom(
    context: RequestContext,
    dto: CreateRoomInputDto,
  ): Promise<RoomOutputDto> {
    this.logCaller(context, this.createRoom);

    return this.prisma.$transaction(
      async (tx) => {
        const cinema = await tx.cinema.findUnique({
          where: {
            id: dto.cinemaId,
          },
          include: {
            cinemaBrand: true,
          },
        });
        if (cinema == null) {
          throw new CinemaNotFoundException();
        }
        if (cinema.cinemaBrand.ownerId !== context.account.id) {
          throw new ForbiddenException();
        }
        const roomsInCinemaCount = await tx.room.count({
          where: {
            cinemaId: dto.cinemaId,
            name: dto.name,
          },
        });
        if (roomsInCinemaCount > 0) {
          throw new RoomHasSameNameException();
        }
        const res = await tx.room.create({
          data: { ...{ ...dto, seats: undefined } },
        });
        if (dto.seats) {
          const seats = dto.seats.map((seat) => {
            return {
              ...seat,
              roomId: res.roomId,
            };
          });
          await tx.seat.createMany({
            data: seats,
          });
        }
        return this.mapToOutput(context, res);
      },
      {
        timeout: 15000,
      },
    );
  }

  async updateRoom(
    context: RequestContext,
    id: number,
    dto: UpdateRoomInputDto,
  ): Promise<RoomOutputDto> {
    this.logCaller(context, this.updateRoom);
    const room = await this.prisma.room.findUnique({
      where: {
        roomId: id,
      },
      include: {
        Cinema: {
          include: {
            cinemaBrand: true,
          },
        },
      },
    });
    if (room == null) {
      throw new RoomNotFoundException();
    }
    if (room.Cinema.cinemaBrand.ownerId !== context.account.id) {
      throw new ForbiddenException();
    }
    const roomsInCinema = await this.prisma.room.findMany({
      where: {
        cinemaId: room.cinemaId,
        name: dto.name,
      },
    });
    if (roomsInCinema.length > 0) {
      throw new RoomHasSameNameException();
    }
    const updatedRoom = await this.prisma.$transaction(
      async (tx) => {
        if (dto.seats) {
          const seats = dto.seats.map((seat) => {
            return {
              ...seat,
              roomId: id,
            };
          });
          await tx.seat.deleteMany({
            where: {
              roomId: id,
            },
          });
          await tx.seat.createMany({
            data: seats,
          });
        }
        const updatedRoom = await tx.room.update({
          data: {
            name: dto.name,
          },
          where: {
            roomId: id,
          },
        });
        return updatedRoom;
      },
      {
        timeout: 15000,
      },
    );

    return this.mapToOutput(context, updatedRoom);
  }

  async deleteRoom(
    context: RequestContext,
    id: number,
  ): Promise<RoomOutputDto | null> {
    this.logCaller(context, this.deleteRoom);

    const res = await this.prisma.$transaction(
      async (tx) => {
        const room = await tx.room.findUnique({
          where: {
            roomId: id,
          },
          include: {
            Cinema: {
              include: {
                cinemaBrand: true,
              },
            },
          },
        });
        if (room == null) {
          throw new RoomNotFoundException();
        }
        if (room.Cinema.cinemaBrand.ownerId !== context.account.id) {
          throw new ForbiddenException();
        }
        const res = await tx.room.delete({
          where: {
            roomId: id,
          },
        });
        return res;
      },
      {
        timeout: 15000,
      },
    );
    return this.mapToOutput(context, res);
  }

  async mapToOutput(context: RequestContext, raw: any): Promise<RoomOutputDto> {
    const output: RoomOutputDto = {
      ...raw,
    };

    return this.output(RoomOutputDto, output);
  }
}
