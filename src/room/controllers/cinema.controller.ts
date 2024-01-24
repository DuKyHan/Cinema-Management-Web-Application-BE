import { Controller, Get, Param, ParseIntPipe } from '@nestjs/common';
import { ReqContext, RequestContext } from 'src/common/request-context';
import { RoomService } from '../services';

@Controller('cinemas/:cinemaId/rooms')
export class CinemaRoomController {
  constructor(private readonly roomService: RoomService) {}

  @Get()
  async getRoomsByCinemaId(
    @ReqContext() context: RequestContext,
    @Param('cinemaId', ParseIntPipe) cinemaId: number,
  ) {
    return this.roomService.getRoomByCinemaId(context, cinemaId);
  }
}
