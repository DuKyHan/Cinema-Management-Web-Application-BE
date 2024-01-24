import { Transform } from 'class-transformer';
import { IsEnum, IsInt, IsOptional, IsString } from 'class-validator';
import { PaginationQueryDto } from 'src/common/dtos';
import { stringToIntTransform } from 'src/common/transformers';
import { CinemaStatus } from '../constants';

export class CinemaQueryDto extends PaginationQueryDto {
  @IsOptional()
  @IsString()
  search?: string;

  @IsOptional()
  @IsEnum(CinemaStatus)
  status?: CinemaStatus;

  @IsOptional()
  @IsInt()
  @Transform(stringToIntTransform)
  ownerId?: number;
}
