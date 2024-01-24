import { Module } from '@nestjs/common';
import { CommonModule } from 'src/common/common.module';
import { RoomSeatController, SeatController } from './controllers';
import { SeatService } from './services';

@Module({
  imports: [CommonModule],
  controllers: [SeatController, RoomSeatController],
  providers: [SeatService],
  exports: [SeatService],
})
export class SeatModule {}
