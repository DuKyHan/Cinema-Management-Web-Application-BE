
import { Transform } from 'class-transformer';
import { IsArray, IsBoolean, IsEnum, IsInt, IsOptional } from 'class-validator';
import { AccountVerificationStatus } from '../constants';
import { PaginationQueryDto } from 'src/common/dtos';
import { CountQueryDto } from 'src/common/dtos/count.dto';
import { stringToBooleanTransform } from 'src/common/transformers';

export enum GetAccountVerificationInclude {
  File = 'file',
  History = 'history',
}

export class GetAccountVerificationQueryDto extends PaginationQueryDto {
  @IsOptional()
  @IsEnum(GetAccountVerificationInclude, { each: true })
  @Transform(({ value }) => value.split(','))
  include?: GetAccountVerificationInclude[];
}

export class GetAccountVerificationsQueryDto extends GetAccountVerificationQueryDto {
  @IsOptional()
  @IsArray()
  @IsInt({ each: true })
  @Transform(({ value }) => value.split(',').map(parseInt))
  id?: number[];

  @IsOptional()
  @IsInt()
  @Transform(({ value }) => parseInt(value))
  accountId?: number;

  @IsOptional()
  @IsBoolean()
  @Transform(stringToBooleanTransform)
  isVerified?: boolean;

  @IsOptional()
  @IsEnum(AccountVerificationStatus, { each: true })
  @Transform(({ value }) => value.split(','))
  status?: AccountVerificationStatus[];
}

export class CountAccountVerificationRequestQueryDto extends CountQueryDto {
  @IsOptional()
  @IsBoolean()
  @Transform(stringToBooleanTransform)
  isVerified?: boolean;

  @IsOptional()
  @IsEnum(AccountVerificationStatus, { each: true })
  @Transform(({ value }) => value.split(','))
  status?: AccountVerificationStatus[];
}
