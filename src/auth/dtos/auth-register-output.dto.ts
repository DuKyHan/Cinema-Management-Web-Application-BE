import { ApiProperty } from '@nestjs/swagger';
import { Expose } from 'class-transformer';

import { Role } from '../constants/role.constant';

export class RegisterOutput {
  @Expose()
  @ApiProperty()
  id: number;

  // @Expose()
  // @ApiProperty()
  // name: string;

  // @Expose()
  // @ApiProperty()
  // username: string;

  @Expose()
  @ApiProperty({ example: [Role.User] })
  roles: Role[];

  @Expose()
  @ApiProperty()
  email: string;

  @Expose()
  @ApiProperty()
  isAccountDisabled: boolean;

  @Expose()
  isAccountVerified: boolean;

  @Expose()
  isEmailVerified: boolean;

  @Expose()
  @ApiProperty()
  createdAt: string;

  @Expose()
  @ApiProperty()
  updatedAt: string;
}
