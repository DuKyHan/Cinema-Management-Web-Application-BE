import { Expose, Type } from 'class-transformer';
import { CinemaOutputDto } from 'src/cinema/dtos';

export class FoodOutputDto {
  @Expose()
  id: number;

  @Expose()
  name: string;

  @Expose()
  description: string;

  @Expose()
  quantity: number;

  @Expose()
  price: number;

  @Expose()
  cinemaId: number;

  @Expose()
  @Type(() => CinemaOutputDto)
  cinema?: CinemaOutputDto;
}
