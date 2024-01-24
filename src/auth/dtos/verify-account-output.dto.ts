import { Expose } from 'class-transformer';

export class VerifyAccountOutputDto {
  @Expose()
  successful: boolean;
}
