import { Expose } from 'class-transformer';

export class TokenOutputDto {
  @Expose()
  accessToken: string;

  @Expose()
  refreshToken: string;
}
