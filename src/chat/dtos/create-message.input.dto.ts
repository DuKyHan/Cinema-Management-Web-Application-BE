import { IsInt, IsString, MaxLength } from 'class-validator';

export class CreateMessageInputDto {
  @IsInt()
  chatId: number;

  @IsString()
  @MaxLength(1000)
  message: string;
}
