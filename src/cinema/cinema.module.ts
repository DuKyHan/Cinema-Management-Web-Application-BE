import { Module } from '@nestjs/common';
import { CommonModule } from 'src/common/common.module';
import { NotificationModule } from 'src/notification/notification.module';
import { CinemaController } from './controllers/cinema.controller';
import { AdminCinemaService, CinemaService } from './services';

@Module({
  imports: [CommonModule, NotificationModule],
  controllers: [CinemaController],
  providers: [CinemaService, AdminCinemaService],
  exports: [],
})
export class CinemaModule {}
