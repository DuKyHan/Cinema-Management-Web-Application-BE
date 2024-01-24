import { Transform } from 'class-transformer';
import {
  ArrayMaxSize,
  ArrayMinSize,
  IsArray,
  IsInt,
  IsOptional,
  IsString,
  MaxLength,
} from 'class-validator';
import { stringToIntArrayTransform } from 'src/common/transformers';
import { PaginationQueryDto } from '../../common/dtos';

export class RoomQueryDto extends PaginationQueryDto {
  @IsOptional()
  @IsArray()
  @ArrayMinSize(1)
  @ArrayMaxSize(64)
  @IsInt({ each: true })
  @Transform(stringToIntArrayTransform)
  ids?: number[];

  @IsOptional()
  @IsArray()
  @ArrayMinSize(1)
  @ArrayMaxSize(128)
  @IsInt({ each: true })
  @Transform(stringToIntArrayTransform)
  excludeIds?: number[];

  @IsOptional()
  @IsInt()
  cinemaId?: number;

  @IsOptional()
  @IsString()
  @MaxLength(256)
  name?: string;
}
