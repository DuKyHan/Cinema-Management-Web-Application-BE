import { ForbiddenException, Injectable } from '@nestjs/common';

import { AppLogger } from 'src/common/logger';
import { RequestContext } from 'src/common/request-context';
import { AbstractService } from 'src/common/services';
import { PrismaService } from 'src/prisma';
import { RoomNotFoundException } from 'src/room/exceptions';
import { CreateSeatInputDto, SeatOutputDto, UpdateSeatInputDto } from '../dtos';
import {
  SeatAtPositionAlreadyExistsException,
  SeatNotFoundException,
} from '../exceptions';

@Injectable()
export class SeatService extends AbstractService {
  constructor(
    logger: AppLogger,
    private readonly prisma: PrismaService,
  ) {
    super(logger);
  }

  async getByRoomId(
    context: RequestContext,
    roomId: number,
  ): Promise<SeatOutputDto[]> {
    this.logCaller(context, this.getByRoomId);
    const res = await this.prisma.seat.findMany({
      where: {
        roomId: roomId,
        room: {
          Cinema: {
            cinemaBrand: {
              ownerId: context.account.id,
            },
          },
        },
      },
    });
    return this.outputArray(SeatOutputDto, res);
  }

  async getSeatById(
    context: RequestContext,
    id: number,
  ): Promise<SeatOutputDto | null> {
    this.logCaller(context, this.getSeatById);
    const res = await this.prisma.seat.findUnique({
      where: {
        seatId: id,
        room: {
          Cinema: {
            cinemaBrand: {
              ownerId: context.account.id,
            },
          },
        },
      },
    });
    if (res == null) {
      return null;
    }
    return this.mapToOutput(context, res);
  }

  async createSeat(
    context: RequestContext,
    dto: CreateSeatInputDto,
  ): Promise<SeatOutputDto> {
    this.logCaller(context, this.createSeat);

    return this.prisma.$transaction(
      async (tx) => {
        const room = await tx.room.findUnique({
          where: {
            roomId: dto.roomId,
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
        const seat = await tx.seat.findFirst({
          where: {
            roomId: dto.roomId,
            row: dto.row,
            column: dto.column,
          },
        });
        if (seat) {
          throw new SeatAtPositionAlreadyExistsException();
        }
        const res = await this.prisma.seat.create({
          data: {
            roomId: dto.roomId,
            name: dto.name,
            row: dto.row,
            column: dto.column,
            status: dto.status,
          },
        });
        return this.mapToOutput(context, res);
      },
      {
        timeout: 15000,
      },
    );
  }

  async updateSeat(
    context: RequestContext,
    id: number,
    dto: UpdateSeatInputDto,
  ): Promise<SeatOutputDto> {
    this.logCaller(context, this.updateSeat);

    const seat = await this.prisma.seat.findUnique({
      where: {
        seatId: id,
      },
      include: {
        room: {
          include: {
            Cinema: {
              include: {
                cinemaBrand: true,
              },
            },
          },
        },
      },
    });

    if (seat == null) {
      throw new SeatNotFoundException();
    }

    if (seat.room.Cinema.cinemaBrand.ownerId !== context.account.id) {
      throw new ForbiddenException();
    }

    const existingSeat = await this.prisma.seat.findFirst({
      where: {
        roomId: seat.roomId,
        name: dto.name,
      },
    });
    if (existingSeat != null) {
      throw new SeatAtPositionAlreadyExistsException();
    }
    const newSeat = await this.prisma.seat.update({
      data: {
        status: dto.status,
      },
      where: {
        seatId: id,
      },
    });

    return this.mapToOutput(context, newSeat);
  }

  async deleteSeat(
    context: RequestContext,
    id: number,
  ): Promise<SeatOutputDto | null> {
    this.logCaller(context, this.deleteSeat);

    const res = await this.prisma.$transaction(async (tx) => {
      const seat = await tx.seat.findUnique({
        where: {
          seatId: id,
        },
        include: {
          room: {
            include: {
              Cinema: {
                include: {
                  cinemaBrand: true,
                },
              },
            },
          },
        },
      });

      if (seat == null) {
        throw new SeatNotFoundException();
      }

      if (seat.room.Cinema.cinemaBrand.ownerId !== context.account.id) {
        throw new ForbiddenException();
      }

      const res = await tx.seat.delete({
        where: {
          seatId: id,
        },
      });
      return res;
    });
    return this.mapToOutput(context, res);
  }

  async mapToOutput(context: RequestContext, raw: any): Promise<SeatOutputDto> {
    const output: SeatOutputDto = {
      ...raw,
    };

    return this.output(SeatOutputDto, output);
  }
}
