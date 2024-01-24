import { Transform } from 'class-transformer';
import { IsDate, IsEnum, IsInt, IsOptional, IsString } from 'class-validator';
import { PaginationQueryDto } from 'src/common/dtos';

export enum TicketSort {
  PremiereDateAsc = 'premiereDate',
  PremiereDateDesc = '-premiereDate',
  CreatedAtAsc = 'createdAt',
  CreatedAtDesc = '-createdAt',
}

export class TicketQueryDto extends PaginationQueryDto {
  @IsOptional()
  @IsString()
  search?: string;

  @IsOptional()
  @IsInt()
  accountId?: number;

  @IsOptional()
  @IsDate()
  @Transform(({ value }) => new Date(value))
  startPremiereDate?: Date;

  @IsOptional()
  @IsDate()
  @Transform(({ value }) => new Date(value))
  endPremiereDate?: Date;

  @IsOptional()
  @IsEnum(TicketSort)
  sort?: TicketSort;
}
