import { Expose, Type } from 'class-transformer';
import { SeatOutputDto } from 'src/seat/dtos';

export class RoomOutputDto {
  @Expose()
  roomId: number;

  @Expose()
  name: string;

  @Expose()
  numberSeat: number;

  @Expose()
  availableSlots: number;

  @Expose()
  joinedParticipants: number;

  @Expose()
  static: string;

  @Expose()
  cinemaId: number;

  @Expose()
  @Type(() => SeatOutputDto)
  seats: SeatOutputDto[];
}
