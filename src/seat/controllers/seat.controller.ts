import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { ReqContext, RequestContext } from 'src/common/request-context';
import { CreateSeatInputDto, SeatOutputDto, UpdateSeatInputDto } from '../dtos';
import { SeatService } from '../services/seat.service';

@ApiTags('seats')
@Controller('seats')
export class SeatController {
  constructor(private readonly seatService: SeatService) {}

  @Post()
  async create(
    @ReqContext() context: RequestContext,
    @Body() createSeatDto: CreateSeatInputDto,
  ): Promise<SeatOutputDto> {
    return this.seatService.createSeat(context, createSeatDto);
  }

  @Get(':id')
  async getById(
    @ReqContext() context: RequestContext,
    @Param('id') id: number,
  ) {
    return this.seatService.getSeatById(context, +id);
  }

  @Put(':id')
  async update(
    @ReqContext() context: RequestContext,
    @Param('id') id: number,
    @Body() updateSeatDto: UpdateSeatInputDto,
  ) {
    return this.seatService.updateSeat(context, id, updateSeatDto);
  }

  @Delete(':id')
  async delete(@ReqContext() context: RequestContext, @Param('id') id: number) {
    return this.seatService.deleteSeat(context, id);
  }
}
