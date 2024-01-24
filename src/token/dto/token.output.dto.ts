import { Expose } from 'class-transformer';

export class TokenOutputDto {
  @Expose()
  token: string;
}
