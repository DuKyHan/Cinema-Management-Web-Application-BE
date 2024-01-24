import { Expose, Transform, Type } from 'class-transformer';
import { IsDate, IsOptional } from 'class-validator';

export class CountQueryDto {
  @IsOptional()
  @IsDate()
  @Transform(({ value }) => new Date(Number(value)))
  startTime?: Date;

  @IsOptional()
  @IsDate()
  @Transform(({ value }) => new Date(Number(value)))
  endTime?: Date;
}

export class WeeklyCountOutputDto {
  @Expose()
  week: number;

  @Expose()
  month: number;

  @Expose()
  year: number;

  @Expose()
  count: number;
}

export class MonthlyCountOutputDto {
  @Expose()
  month: number;

  @Expose()
  year: number;

  @Expose()
  count: number;
}

export class YearlyCountOutputDto {
  @Expose()
  year: number;

  @Expose()
  count: number;
}

export class CountOutputDto {
  @Expose()
  total: number;

  @Expose()
  @Type(() => MonthlyCountOutputDto)
  weekly?: MonthlyCountOutputDto[];

  @Expose()
  @Type(() => YearlyCountOutputDto)
  yearly?: YearlyCountOutputDto[];

  @Expose()
  @Type(() => MonthlyCountOutputDto)
  monthly?: MonthlyCountOutputDto[];
}
