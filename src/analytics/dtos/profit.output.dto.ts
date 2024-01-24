import { Expose } from 'class-transformer';

export class ProfitOutputDto {
  @Expose()
  count: number;

  @Expose()
  profit: number;

  @Expose()
  weekNumber: number;

  @Expose()
  week: Date;
}
