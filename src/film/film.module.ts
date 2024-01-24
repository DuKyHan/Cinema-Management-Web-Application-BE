import { Module } from '@nestjs/common';
import { CommonModule } from 'src/common/common.module';
import { FilmController } from './controllers';
import { FilmService } from './services';

@Module({
  imports: [CommonModule],
  controllers: [FilmController],
  providers: [FilmService],
})
export class FilmModule {}
