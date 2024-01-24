import { IsInt, IsOptional, IsString, MaxLength } from 'class-validator';

export class CreateChatInputDto {
  @IsInt()
  to: number;

  @IsOptional()
  @IsString()
  @MaxLength(1000)
  initialMessage?: string;

  @IsOptional()
  @IsInt()
  avatar?: number;
}
