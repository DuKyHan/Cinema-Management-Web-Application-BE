import { Module } from '@nestjs/common';
import { CommonModule } from 'src/common/common.module';
import { GenreController } from './controllers';
import { GenreService } from './services';

@Module({
  imports: [CommonModule],
  controllers: [GenreController],
  providers: [GenreService],
})
export class GenreModule {}
