import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Post,
  Put,
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { ReqContext, RequestContext } from 'src/common/request-context';
import { CreateRoomInputDto, RoomOutputDto, UpdateRoomInputDto } from '../dtos';
import { RoomService } from '../services';

@ApiTags('rooms')
@Controller('rooms')
export class RoomController {
  constructor(private readonly roomService: RoomService) {}

  @Post()
  async create(
    @ReqContext() context: RequestContext,
    @Body() createRoomDto: CreateRoomInputDto,
  ): Promise<RoomOutputDto> {
    return this.roomService.createRoom(context, createRoomDto);
  }

  // @Get()
  // async getByCinemaId(
  //   @ReqContext() context: RequestContext,
  //   @Query() query: RoomQueryDto,
  // ) {
  //   return this.roomService.g(context, query);
  // }

  @Get(':id')
  async getById(
    @ReqContext() context: RequestContext,
    @Param('id', ParseIntPipe) id: number,
  ) {
    return this.roomService.getByRoomId(context, +id);
  }

  @Put(':id')
  async update(
    @ReqContext() context: RequestContext,
    @Param('id') id: number,
    @Body() updateSeatDto: UpdateRoomInputDto,
  ) {
    return this.roomService.updateRoom(context, id, updateSeatDto);
  }

  @Delete(':id')
  async delete(@ReqContext() context: RequestContext, @Param('id') id: number) {
    return this.roomService.deleteRoom(context, id);
  }
}
