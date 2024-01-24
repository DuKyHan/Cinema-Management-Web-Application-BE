import { Module } from '@nestjs/common';
import { CommonModule } from 'src/common/common.module';
import { CinemaFilmController } from './controllers/cinema-film.controller';
import { CinemaFilmService } from './services/cinema-film.service';

@Module({
  imports: [CommonModule],
  controllers: [CinemaFilmController],
  providers: [CinemaFilmService],
})
export class CinemaFilmModule {}
