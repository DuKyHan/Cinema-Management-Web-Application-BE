import {
  ArrayMinSize,
  IsArray,
  IsInt,
  IsOptional,
  IsString,
  MaxLength,
} from 'class-validator';
import { CHAT_GROUP_NAME_MAX_LENGTH } from '../constants';

export class CreateChatGroupInputDto {
  @IsOptional()
  @IsString()
  @MaxLength(CHAT_GROUP_NAME_MAX_LENGTH)
  name?: string;

  @IsInt({ each: true })
  to: number[];

  @IsOptional()
  @IsString()
  @MaxLength(1000)
  initialMessage?: string;

  @IsOptional()
  @IsInt()
  avatar?: number;
}

export class UpdateChatGroupInputDto {
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

export class DeleteChatGroupInputDto {
  @IsInt()
  chatId: number;
}

export class LeaveChatGroupInputDto {
  @IsInt()
  chatId: number;
}

export class CreateChatGroupParticipantInputDto {
  @IsInt()
  chatId: number;

  @IsArray()
  @IsInt({ each: true })
  @ArrayMinSize(1)
  accountIds: number[];
}

export class DeleteChatParticipantGroupInputDto {
  @IsInt()
  chatId: number;

  @IsInt()
  accountId: number;
}

export class MakeParticipantChatGroupOwnerInputDto {
  @IsInt()
  chatId: number;

  @IsInt()
  accountId: number;
}
