import { Transform } from 'class-transformer';
import {
  IsArray,
  IsEnum,
  IsInt,
  IsOptional,
  IsString,
  MaxLength,
} from 'class-validator';
import { PaginationQueryDto } from 'src/common/dtos';
import { stringToIntArrayTransform } from 'src/common/transformers';

export enum GetProfileInclude {
  INTERESTED_GENRES = 'interested-genres',
  VIEWED_GENRE_TIMES = 'viewed-genre-times',
  SKILLS = 'skills',
}

export enum GetProfileSelect {
  Id = 'id',
  Email = 'email',
  Username = 'username',
  FullName = 'full-name',
  PhoneNumber = 'phone-number',
  DateOfBirth = 'date-of-birth',
  Gender = 'gender',
  Bio = 'bio',
  Avatar = 'avatar',
  Location = 'location',
}

export const getProfileBasicSelect = [
  GetProfileSelect.Id,
  GetProfileSelect.Email,
  GetProfileSelect.Username,
  GetProfileSelect.FullName,
  GetProfileSelect.Avatar,
];

export class GetProfileQueryDto extends PaginationQueryDto {
  @IsOptional()
  @IsArray()
  @IsEnum(GetProfileInclude, { each: true })
  @Transform(({ value }) => value.split(',').filter((v) => v))
  includes?: GetProfileInclude[];

  @IsOptional()
  @IsArray()
  @IsEnum(GetProfileSelect, { each: true })
  @Transform(({ value }) => value.split(',').filter((v) => v))
  select?: GetProfileSelect[];
}

export class GetProfilesQueryDto extends GetProfileQueryDto {
  @IsOptional()
  @IsArray()
  @IsInt({ each: true })
  @Transform(stringToIntArrayTransform)
  ids?: number[];

  @IsOptional()
  @IsArray()
  @IsInt({ each: true })
  @Transform(stringToIntArrayTransform)
  excludeId?: number[];

  @IsOptional()
  @IsString()
  @MaxLength(255)
  search?: string;
}
