import { Injectable } from '@nestjs/common';
import { AppLogger } from 'src/common/logger';
import { RequestContext } from 'src/common/request-context';
import { AbstractService } from 'src/common/services';
import { PrismaService } from 'src/prisma';
import { SeatOutputDto } from 'src/seat/dtos';
import { SeatNotFoundException } from 'src/seat/exceptions';
import { CinemaFilmSeatQueryDto } from '../dto';
import {
  CreateCinemaFilmSeatDto,
  UpdateCinemaFilmSeatDto,
} from '../dto/cinema-film-seat.dto';
import { CinemaFilmNotFoundException } from '../exceptions';

@Injectable()
export class CinemaFilmSeatService extends AbstractService {
  constructor(
    logger: AppLogger,
    private readonly prisma: PrismaService,
  ) {
    super(logger);
  }

  async getByCinemaFilmId(
    context: RequestContext,
    cinemaFilmId: number,
    query: CinemaFilmSeatQueryDto,
  ): Promise<SeatOutputDto[]> {
    this.logCaller(context, this.getByCinemaFilmId);
    const res = await this.prisma.cinemaFilmSeat.findMany({
      where: {
        cinemaFilmId: cinemaFilmId,
      },
      take: query.limit,
      skip: query.offset,
    });
    return this.outputArray(SeatOutputDto, res);
  }

  async createCinemaFilmSeat(
    context: RequestContext,
    dto: CreateCinemaFilmSeatDto,
  ) {
    this.logCaller(context, this.createCinemaFilmSeat);

    return this.prisma.$transaction(async (tx) => {
      const cinemaFilm = await tx.cinemaFilm.findUnique({
        where: {
          id: dto.cinemaFilmId,
        },
      });
      if (cinemaFilm == null) {
        throw new CinemaFilmNotFoundException();
      }

      const seat = await tx.seat.findUnique({
        where: {
          seatId: dto.seatId,
        },
      });
      if (seat == null) {
        throw new SeatNotFoundException();
      }

      const res = await tx.cinemaFilmSeat.create({
        data: dto,
      });

      return res;
    });
  }

  async updateCinemaFilmSeat(
    context: RequestContext,
    cinemaFilmId: number,
    seatId: number,
    dto: UpdateCinemaFilmSeatDto,
  ) {
    this.logCaller(context, this.updateCinemaFilmSeat);

    return this.prisma.$transaction(async (tx) => {
      const cinemaFilm = await tx.cinemaFilm.findUnique({
        where: {
          id: cinemaFilmId,
        },
      });
      if (cinemaFilm == null) {
        throw new CinemaFilmNotFoundException();
      }

      const seat = await tx.seat.findUnique({
        where: {
          seatId: seatId,
        },
      });
      if (seat == null) {
        throw new SeatNotFoundException();
      }

      const res = await tx.cinemaFilmSeat.update({
        where: {
          cinemaFilmId_seatId: {
            cinemaFilmId: cinemaFilmId,
            seatId: seatId,
          },
        },
        data: dto,
      });

      return res;
    });
  }

  async deleteCinemaFilmSeat(
    context: RequestContext,
    cinemaFilmId: number,
    seatId: number,
  ) {
    this.logCaller(context, this.deleteCinemaFilmSeat);

    return this.prisma.$transaction(async (tx) => {
      const cinemaFilm = await tx.cinemaFilm.findUnique({
        where: {
          id: cinemaFilmId,
        },
      });
      if (cinemaFilm == null) {
        throw new CinemaFilmNotFoundException();
      }

      const seat = await tx.seat.findUnique({
        where: {
          seatId: seatId,
        },
      });
      if (seat == null) {
        throw new SeatNotFoundException();
      }

      const res = await tx.cinemaFilmSeat.delete({
        where: {
          cinemaFilmId_seatId: {
            cinemaFilmId: cinemaFilmId,
            seatId: seatId,
          },
        },
      });

      return res;
    });
  }
}
