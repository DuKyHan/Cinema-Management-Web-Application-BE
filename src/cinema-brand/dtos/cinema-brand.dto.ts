import { IsInt, IsOptional, IsString } from 'class-validator';

export class CreateCinemaBrandDto {
  @IsString()
  name: string;

  @IsInt()
  logo: number;
}

export class UpdateCinemaBrandDto {
  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsInt()
  logo?: number;
}
