import { IsInt, IsOptional, IsString, MaxLength } from 'class-validator';
import { CHAT_GROUP_NAME_MAX_LENGTH } from '../constants';

export class UpdateChatInputDto {
  @IsInt()
  chatId: number;

  @IsOptional()
  @IsString()
  @MaxLength(CHAT_GROUP_NAME_MAX_LENGTH)
  name?: string;

  @IsOptional()
  @IsInt()
  avatar?: number;
}
