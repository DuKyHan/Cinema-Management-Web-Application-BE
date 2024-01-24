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
import {
  CreateCinemaFilmDto,
  UpdateCinemaFilmDto,
} from '../dto/cinema-film.dto';
import { GetCinemaFilmsQueryDto } from '../dto/cinema.query.dto';
import { CinemaFilmService } from '../services/cinema-film.service';

@Controller('cinema-films')
export class CinemaFilmController {
  constructor(private readonly cinemaFilmService: CinemaFilmService) {}

  @Get()
  async findAll(
    @ReqContext() context: RequestContext,
    @Query() query: GetCinemaFilmsQueryDto,
  ) {
    return this.cinemaFilmService.findAll(context, query);
  }

  @Get(':id')
  async getCinemaFilmById(
    @ReqContext() context: RequestContext,
    @Param('id', ParseIntPipe) id: number,
    @Query() query: GetCinemaFilmsQueryDto,
  ) {
    return this.cinemaFilmService.getCinemaFilmById(context, id, query);
  }

  @Post()
  async create(
    @ReqContext() context: RequestContext,
    @Body() createCinemaFilmDto: CreateCinemaFilmDto,
  ) {
    return this.cinemaFilmService.create(context, createCinemaFilmDto);
  }

  @Put(':id')
  async update(
    @ReqContext() context: RequestContext,
    @Param('id', ParseIntPipe) id: number,
    @Body() updateCinemaFilmDto: UpdateCinemaFilmDto,
  ) {
    return this.cinemaFilmService.update(context, id, updateCinemaFilmDto);
  }

  @Delete(':id')
  async delete(
    @ReqContext() context: RequestContext,
    @Param('id', ParseIntPipe) id: number,
  ) {
    return this.cinemaFilmService.delete(context, id);
  }
}
