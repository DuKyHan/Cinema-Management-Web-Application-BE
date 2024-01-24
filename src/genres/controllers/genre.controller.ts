import { Controller, Get, Param, ParseIntPipe, Query } from '@nestjs/common';
import { GenreQueryDto } from '../dtos';
import { GenreService } from '../services';

@Controller('genres')
export class GenreController {
  constructor(private readonly genreService: GenreService) {}

  @Get()
  async getGenres(@Query() query: GenreQueryDto) {
    return await this.genreService.getGenres(query);
  }

  @Get(':id')
  async getGenreById(@Param('id', ParseIntPipe) id: number) {
    return this.genreService.getGenreById(id);
  }
}
