import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Post,
  Put,
  Query,
} from '@nestjs/common';
import { ReqContext, RequestContext } from 'src/common/request-context';
import { CinemaFilmSeatQueryDto } from '../dto';
import { CreateCinemaFilmSeatDto } from '../dto/cinema-film-seat.dto';
import { CinemaFilmSeatService } from '../services';

@Controller('cinema-films/:cinemaFilmId/seats')
export class CinemaFilmSeatController {
  constructor(private readonly cinemaFilmSeatService: CinemaFilmSeatService) {}

  @Get()
  async getByCinemaFilmId(
    @ReqContext() context: RequestContext,
    @Param('cinemaFilmId', ParseIntPipe) cinemaFilmId: number,
    @Query() query: CinemaFilmSeatQueryDto,
  ) {
    return this.cinemaFilmSeatService.getByCinemaFilmId(
      context,
      cinemaFilmId,
      query,
    );
  }

  @Post()
  async createCinemaFilmSeat(
    @ReqContext() context: RequestContext,
    @Body() dto: CreateCinemaFilmSeatDto,
  ) {
    return this.cinemaFilmSeatService.createCinemaFilmSeat(context, dto);
  }

  @Put(':seatId')
  async updateCinemaFilmSeat(
    @ReqContext() context: RequestContext,
    @Param('cinemaFilmId', ParseIntPipe) cinemaFilmId: number,
    @Param('seatId', ParseIntPipe) seatId: number,
    @Body() dto: CreateCinemaFilmSeatDto,
  ) {
    return this.cinemaFilmSeatService.updateCinemaFilmSeat(
      context,
      cinemaFilmId,
      seatId,
      dto,
    );
  }

  @Delete(':seatId')
  async deleteCinemaFilmSeat(
    @ReqContext() context: RequestContext,
    @Param('cinemaFilmId', ParseIntPipe) cinemaFilmId: number,
    @Param('seatId', ParseIntPipe) seatId: number,
  ) {
    return this.cinemaFilmSeatService.deleteCinemaFilmSeat(
      context,
      cinemaFilmId,
      seatId,
    );
  }
}
