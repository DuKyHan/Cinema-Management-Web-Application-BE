import { Expose, Type } from 'class-transformer';
import { CinemaOutputDto } from 'src/cinema/dtos';
import { FilmOutputDto } from 'src/film/dtos';
import { RoomOutputDto } from 'src/room/dtos';
import { SeatOutputDto } from 'src/seat/dtos';

export class TicketOutputDto {
  @Expose()
  id: number;

  @Expose()
  seatId: number;

  @Expose()
  premiereId: number;

  @Expose()
  premiere: Date;

  @Expose()
  price: number;

  @Expose()
  accountId: number;

  @Expose()
  createdAt: Date;

  @Expose()
  updatedAt: Date;

  @Expose()
  @Type(() => CinemaOutputDto)
  cinema?: CinemaOutputDto;

  @Expose()
  @Type(() => FilmOutputDto)
  film?: FilmOutputDto;

  @Expose()
  @Type(() => SeatOutputDto)
  seat?: SeatOutputDto;

  @Expose()
  @Type(() => RoomOutputDto)
  room?: RoomOutputDto;
}
