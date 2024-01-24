import { Module } from '@nestjs/common';
import { CommonModule } from 'src/common/common.module';
import { CinemaRoomController, RoomController } from './controllers';
import { RoomService } from './services';

@Module({
  imports: [CommonModule],
  controllers: [RoomController, CinemaRoomController],
  providers: [RoomService],
  exports: [RoomService],
})
export class RoomModule {}
