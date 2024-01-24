import { Transform } from 'class-transformer';
import {
  ArrayMaxSize,
  ArrayMinSize,
  IsArray,
  IsBoolean,
  IsEnum,
  IsInt,
  IsOptional,
  IsString,
  MaxLength,
} from 'class-validator';
import { PaginationQueryDto } from 'src/common/dtos';
import { stringToBooleanTransform } from 'src/common/transformers';
import { NotificationType } from '../constants';

export enum GetNotificationSort {
  CreatedAtAsc = 'createdAt',
  CreatedAtDesc = '-createdAt',
}

export enum GetNotificationInclude {
  Data = 'data',
}

export class GetNotificationByIdQueryDto extends PaginationQueryDto {
  @IsOptional()
  @IsEnum(GetNotificationInclude)
  include?: GetNotificationInclude;
}

export class GetNotificationsQueryDto extends GetNotificationByIdQueryDto {
  @IsOptional()
  @IsArray()
  @ArrayMinSize(1)
  @ArrayMaxSize(256)
  @IsInt({ each: true })
  @Transform(({ value }) => value.split(',').map((v) => parseInt(v)))
  id?: number[];

  @IsOptional()
  @IsString()
  @MaxLength(256)
  name?: string;

  @IsOptional()
  @IsBoolean()
  @Transform(stringToBooleanTransform)
  read?: boolean;

  @IsOptional()
  @IsArray()
  @IsEnum(NotificationType, { each: true })
  @ArrayMinSize(1)
  @ArrayMaxSize(Object.values(NotificationType).length)
  @Transform(({ value }) => value.split(','))
  type?: NotificationType[];

  @IsOptional()
  @IsArray()
  @IsEnum(GetNotificationSort, { each: true })
  @ArrayMinSize(1)
  @ArrayMaxSize(Object.values(GetNotificationSort).length / 2)
  @Transform(({ value }) => value.split(','))
  sort?: GetNotificationSort[];

  @IsOptional()
  @IsArray()
  @ArrayMinSize(1)
  @ArrayMaxSize(256)
  @IsInt({ each: true })
  @Transform(({ value }) => value.map((v) => parseInt(v)))
  accountId?: number[];
}
