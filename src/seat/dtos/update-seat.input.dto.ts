import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class UpdateSeatInputDto {
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsOptional()
  @IsString()
  @IsNotEmpty()
  status: string;
}
