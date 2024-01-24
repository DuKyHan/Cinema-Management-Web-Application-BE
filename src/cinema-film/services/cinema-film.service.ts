import { ForbiddenException, Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { AppLogger } from 'src/common/logger';
import { RequestContext } from 'src/common/request-context';
import { AbstractService } from 'src/common/services';
import { PrismaService } from 'src/prisma';
import { RoomNotFoundException } from 'src/room/exceptions';
import { CinemaFilmOutputDto } from '../dto';
import {
  CreateCinemaFilmDto,
  UpdateCinemaFilmDto,
} from '../dto/cinema-film.dto';
import {
  CinemaFilmInclude,
  GetCinemaFilmsQueryDto,
} from '../dto/cinema.query.dto';
import { CinemaFilmNotFoundException } from '../exceptions';

@Injectable()
export class CinemaFilmService extends AbstractService {
  constructor(
    logger: AppLogger,
    private readonly prisma: PrismaService,
  ) {
    super(logger);
  }

  async findAll(context: RequestContext, query: GetCinemaFilmsQueryDto) {
    const res = await this.prisma.cinemaFilm.findMany({
      where: this.getWhere(context, query),
      take: query.limit,
      skip: query.offset,
      include: this.getInclude(query),
      orderBy: {
        createdAt: 'desc',
      },
    });
    const total = await this.prisma.cinemaFilm.count({
      where: this.getWhere(context, query),
    });
    const mapped = res.map((r) => this.mapToDto(r));

    return this.extendedOutputArray(CinemaFilmOutputDto, mapped, {
      total: total,
      count: mapped.length,
    });
  }

  private getWhere(context: RequestContext, dto: GetCinemaFilmsQueryDto) {
    const query: Prisma.CinemaFilmWhereInput = {
      Cinema: {
        cinemaBrand: {
          ownerId: context.account.id,
        },
      },
    };
    if (dto.search) {
      query.OR = [
        {
          Film: {
            name: {
              contains: dto.search,
              mode: 'insensitive',
            },
          },
        },
        {
          Cinema: {
            name: {
              contains: dto.search,
              mode: 'insensitive',
            },
          },
        },
      ];
    }
    return query;
  }

  private getInclude(dto: GetCinemaFilmsQueryDto) {
    const query: Prisma.CinemaFilmInclude = {
      CinemaFilmPremiere: true,
    };
    if (dto.includes?.includes(CinemaFilmInclude.Film)) {
      query.Film = true;
    }
    if (dto.includes?.includes(CinemaFilmInclude.Cinema)) {
      query.Cinema = {
        include: {
          location: true,
        },
      };
    }
    if (dto.includes?.includes(CinemaFilmInclude.Room)) {
      query.Room = true;
    }
    if (dto.includes?.includes(CinemaFilmInclude.RoomSeats)) {
      query.Room = {
        include: {
          seat: true,
        },
      };
    }
    if (dto.includes?.includes(CinemaFilmInclude.CinemaFilmSeats)) {
      query.CinemaFilmSeat = true;
    }
    return query;
  }

  async getCinemaFilmById(
    context: RequestContext,
    id: number,
    query?: GetCinemaFilmsQueryDto,
  ) {
    const res = await this.prisma.cinemaFilm.findUnique({
      where: {
        id,
        Cinema: context.isModerator
          ? {
              cinemaBrand: {
                ownerId: context.account.id,
              },
            }
          : undefined,
      },
      include: query == null ? undefined : this.getInclude(query),
    });
    if (res == null) {
      return null;
    }

    let purchasedSeats: number[] | undefined = undefined;
    if (query?.includes?.includes(CinemaFilmInclude.PurchasedSeats)) {
      const tickets = await this.prisma.ticket.findMany({
        where: {
          CinemaFilmPremiere: {
            cinemaFilmId: id,
          },
        },
      });
      purchasedSeats = tickets.map((t) => t.seatId);
    }
    return this.mapToDto({ ...res, purchasedSeats });
  }

  async create(context: RequestContext, dto: CreateCinemaFilmDto) {
    const res = await this.prisma.$transaction(
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
        const cinemaFilm = await tx.cinemaFilm.create({
          data: {
            ...{
              ...dto,
              cinemaId: room.cinemaId,
              seats: undefined,
              premieres: undefined,
            },
          },
        });
        await tx.cinemaFilmPremiere.createMany({
          data: dto.premieres.map((premiere) => ({
            cinemaFilmId: cinemaFilm.id,
            premiere,
          })),
        });
        if (dto.seats != null) {
          await tx.cinemaFilmSeat.createMany({
            data: dto.seats.map((seat) => ({
              cinemaFilmId: cinemaFilm.id,
              seatId: seat.seatId,
              price: seat.price,
            })),
          });
        }
        return cinemaFilm;
      },
      {
        timeout: 15000,
      },
    );
    return this.mapToDto(res);
  }

  async update(
    context: RequestContext,
    id: number,
    updateCinemaFilmDto: UpdateCinemaFilmDto,
  ) {
    this.prisma.$transaction(async (tx) => {
      const cinemaFilm = await tx.cinemaFilm.findUnique({
        where: {
          id,
        },
        include: {
          Cinema: {
            include: {
              cinemaBrand: true,
            },
          },
        },
      });
      if (cinemaFilm == null) {
        throw new CinemaFilmNotFoundException();
      }
      if (cinemaFilm.Cinema.cinemaBrand.ownerId !== context.account.id) {
        throw new ForbiddenException();
      }
      if (updateCinemaFilmDto.premieres) {
        await tx.cinemaFilmPremiere.deleteMany({
          where: {
            cinemaFilmId: id,
          },
        });
        await tx.cinemaFilmPremiere.createMany({
          data: updateCinemaFilmDto.premieres.map((premiere) => ({
            cinemaFilmId: id,
            premiere,
          })),
        });
      }
      if (updateCinemaFilmDto.seats) {
        await tx.cinemaFilmSeat.deleteMany({
          where: {
            cinemaFilmId: id,
          },
        });
        await tx.cinemaFilmSeat.createMany({
          data: updateCinemaFilmDto.seats.map((seat) => ({
            cinemaFilmId: id,
            seatId: seat.seatId,
            price: seat.price,
          })),
        });
      }
    });
    return this.getCinemaFilmById(context, id);
  }

  async delete(context: RequestContext, id: number) {
    const cinemaFilm = await this.prisma.cinemaFilm.findUnique({
      where: {
        id,
      },
      include: {
        Cinema: {
          include: {
            cinemaBrand: true,
          },
        },
      },
    });
    if (cinemaFilm == null) {
      throw new CinemaFilmNotFoundException();
    }
    if (cinemaFilm.Cinema.cinemaBrand.ownerId !== context.account.id) {
      throw new ForbiddenException();
    }
    return this.prisma.cinemaFilm.delete({
      where: {
        id,
      },
    });
  }

  private mapToDto(res: any): CinemaFilmOutputDto {
    return {
      ...res,
      film: res.Film,
      cinema: res.Cinema,
      room: { ...res.Room, seats: res.Room?.seat },
      premieres: res.CinemaFilmPremiere,
      cinemaFilmSeats: res.CinemaFilmSeat,
      purchasedSeats: res.purchasedSeats,
    };
  }
}
