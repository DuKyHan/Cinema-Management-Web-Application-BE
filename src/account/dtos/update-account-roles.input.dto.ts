import { IsArray, IsEnum } from 'class-validator';
import { Role } from 'src/auth/constants';

export class UpdateAccountRolesInputDto {
  @IsEnum(Role, { each: true })
  @IsArray()
  roles: Role[];
}
