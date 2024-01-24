import { Expose } from 'class-transformer';

export class SeatOutputDto {
  @Expose()
  seatId: number;

  @Expose()
  name: string;

  @Expose()
  row: number;

  @Expose()
  column: number;

  @Expose()
  price: number;

  @Expose()
  status: string;
}
