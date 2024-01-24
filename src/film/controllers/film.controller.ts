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
import { Role } from 'src/auth/constants';
import { Public, RequireRoles } from 'src/auth/decorators';
import { ReqContext, RequestContext } from 'src/common/request-context';
import {
  CreateFilmDto,
  FilmPremiereQueryDto,
  FilmQueryDto,
  UpdateFilmDto,
} from '../dtos';
import { FilmService } from '../services';

@Controller('films')
export class FilmController {
  constructor(private readonly filmService: FilmService) {}

  @Get()
  async getFilms(
    @ReqContext() context: RequestContext,
    @Query() query: FilmQueryDto,
  ) {
    return this.filmService.getFilms(query);
  }

  @Public()
  @Get('premieres')
  async getPremieres(
    @ReqContext() context: RequestContext,
    @Query() query: FilmPremiereQueryDto,
  ) {
    return this.filmService.getFilmPremieres(query);
  }

  @Get(':id')
  async getFilmById(
    @ReqContext() context: RequestContext,
    @Param('id', ParseIntPipe) id: number,
  ) {
    return this.filmService.getFilmById(id);
  }

  @Public()
  @Get(':id/premieres')
  async getPremieresById(
    @ReqContext() context: RequestContext,
    @Param('id', ParseIntPipe) id: number,
    @Query() query: FilmPremiereQueryDto,
  ) {
    return this.filmService.getFilmPremieresById(id, query);
  }

  @RequireRoles(Role.Moderator, Role.Admin)
  @Post()
  async createFilm(
    @ReqContext() context: RequestContext,
    @Body() dto: CreateFilmDto,
  ) {
    return this.filmService.createFilm(dto);
  }

  @RequireRoles(Role.Moderator, Role.Admin)
  @Put(':id')
  async updateFilm(
    @ReqContext() context: RequestContext,
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateFilmDto,
  ) {
    return this.filmService.updateFilm(id, dto);
  }

  @RequireRoles(Role.Moderator, Role.Admin)
  @Delete(':id')
  async deleteFilm(
    @ReqContext() context: RequestContext,
    @Param('id', ParseIntPipe) id: number,
  ) {
    return this.filmService.deleteFilm(id);
  }
}
