import { Type } from 'class-transformer';
import {
  IsArray,
  IsDateString,
  IsEnum,
  IsInt,
  IsOptional,
  IsPhoneNumber,
  IsString,
  Matches,
  MaxLength,
  ValidateNested,
} from 'class-validator';

// import { IsFileId } from '../../file/validators';
// import { CreateLocationInputDto } from '../../location/dtos';
import { IsFileId } from 'src/file/validators';
import { CreateLocationInputDto } from 'src/location/dtos';
import { Gender } from '../constants/profile.constant';
import {
  BIO_MAX_LENGTH,
  NAME_REGEX,
  USERNAME_REGEX,
} from '../constants/rule.constant';
import { USERNAME_INVALID_MESSAGE } from '../constants/validation-message.constant';

export class UpdateProfileInputDto {
  @Matches(USERNAME_REGEX, {
    message: USERNAME_INVALID_MESSAGE,
  })
  @IsOptional()
  username?: string;

  @IsPhoneNumber()
  @IsOptional()
  phoneNumber?: string;

  @Matches(NAME_REGEX, { context: { generalMessage: true } })
  @IsOptional()
  firstName?: string;

  @Matches(NAME_REGEX, { context: { generalMessage: true } })
  @IsOptional()
  lastName?: string;

  @IsDateString()
  @IsOptional()
  dateOfBirth?: Date;

  @IsEnum(Gender)
  @IsOptional()
  gender?: Gender;

  @IsString()
  @IsOptional()
  @MaxLength(BIO_MAX_LENGTH)
  bio?: string;

  @Type(() => CreateLocationInputDto)
  @IsOptional()
  @ValidateNested()
  location?: CreateLocationInputDto;

  @IsOptional()
  @IsFileId()
  avatarId?: number;

  @IsOptional()
  @IsArray()
  @IsInt({ each: true })
  interestedGenres?: number[];
}
