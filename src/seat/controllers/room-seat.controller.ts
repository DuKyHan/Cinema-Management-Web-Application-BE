import { Controller, Get, Param, ParseIntPipe } from '@nestjs/common';
import { ReqContext, RequestContext } from 'src/common/request-context';
import { SeatService } from '../services';

@Controller('rooms/:roomId/seats')
export class RoomSeatController {
  constructor(private readonly seatService: SeatService) {}

  @Get()
  async getSeatsByRoomId(
    @ReqContext() context: RequestContext,
    @Param('roomId', ParseIntPipe) roomId: number,
  ) {
    return this.seatService.getByRoomId(context, roomId);
  }
}
