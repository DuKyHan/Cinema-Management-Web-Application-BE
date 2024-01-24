import { Expose, Transform } from 'class-transformer';
import _ from 'lodash';
import { ProfileOutputDto } from 'src/profile/dtos';

export class AccountRankingOutputDto extends ProfileOutputDto {
  @Expose()
  @Transform(({ value }) => _.round(value, 1))
  hoursContributed: number;
}
