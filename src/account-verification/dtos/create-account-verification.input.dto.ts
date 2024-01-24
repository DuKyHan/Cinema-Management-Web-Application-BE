
import { IsArray, IsOptional, IsString, MaxLength } from 'class-validator';
import { IsFileId } from 'src/file/validators';

export class CreateAccountVerificationInputDto {
  @IsOptional()
  @IsString()
  @MaxLength(2000)
  content?: string;

  @IsOptional()
  @IsArray()
  @IsFileId({ each: true })
  files?: number[];
}
