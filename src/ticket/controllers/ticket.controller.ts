import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Post,
  Query,
} from '@nestjs/common';
import { ReqContext, RequestContext } from 'src/common/request-context';
import { CreateTicketDto, TicketQueryDto } from '../dtos';
import { TicketService } from '../services';

@Controller('tickets')
export class TicketController {
  constructor(private readonly ticketService: TicketService) {}

  @Get()
  async getTickets(
    @ReqContext() context: RequestContext,
    @Query() query: TicketQueryDto,
  ) {
    return this.ticketService.getTickets(context, query);
  }

  @Get(':id')
  async getTicketById(
    @ReqContext() context: RequestContext,
    @Param('id', ParseIntPipe) id: number,
  ) {
    return this.ticketService.getTicketById(context, id);
  }

  @Post()
  async createTicket(
    @ReqContext() context: RequestContext,
    @Body() dto: CreateTicketDto,
  ) {
    return this.ticketService.createTicket(context, dto);
  }

  @Delete(':id')
  async deleteTicket(
    @ReqContext() context: RequestContext,
    @Param('id', ParseIntPipe) id: number,
  ) {
    return this.ticketService.deleteTicket(context, id);
  }
}
