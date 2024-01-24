import { Injectable, LoggerService } from '@nestjs/common';
import { AppLogger } from 'src/common/logger';
import { RequestContext } from 'src/common/request-context';
import { AbstractService } from 'src/common/services';
import { PrismaService } from 'src/prisma';
import { CreateRoleInputDto, CreateRoleOutputDto, RoleOutputDto } from '../dto';
import { Role } from 'src/auth/constants';
import { RoleNotFountException } from '../exceptions';

@Injectable()
export class RoleService extends AbstractService {
  constructor(
    logger: AppLogger,
    private readonly prisma: PrismaService,
  ) {
    super(logger);
  }
  async createRole(
    context: RequestContext,
    dto: CreateRoleInputDto,
  ): Promise<CreateRoleOutputDto> {
    this.logCaller(context, this.createRole);

    const role = await this.prisma.role.create({
      data: {
        name: dto.name,
        description: dto.description,
      },
    });

    return this.output(CreateRoleOutputDto, role);
  }

  async createDefaultRoles(
    context: RequestContext,
  ): Promise<CreateRoleOutputDto[]> {
    this.logCaller(context, this.createDefaultRoles);

    await this.prisma.role.createMany({
      data: [
        { name: Role.User, description: 'User' },
        { name: Role.Moderator, description: 'Moderator' },
        { name: Role.Admin, description: 'Admin' },
        { name: Role.Operator, description: 'Operator' },
      ],
      skipDuplicates: true,
    });
    const roles = await this.prisma.role.findMany({
      where: { name: { in: Object.values(Role) } },
    });

    return this.outputArray(CreateRoleOutputDto, roles);
  }
  
  async createDefaultRole(
  ) {
    await this.prisma.role.createMany({
      data: [
        { name: Role.User, description: 'User' },
        { name: Role.Moderator, description: "anc" },
        { name: Role.Admin, description: 'Admin' },
        { name: Role.Operator, description: 'Operator' },
      ]
    });
  }
  async getRoleByName(name: string) {
    const res = await this.prisma.role.findUnique({ where: { name } });
    if (res == null) {
      return null;
    }
    return this.output(RoleOutputDto, res);
  }
  async getRoleByNamesOrThrow(names: string[]) {
    const res = await this.prisma.role.findMany({
      where: { name: { in: names } },
    });
    if (res.length !== names.length) {
      throw new RoleNotFountException();
    }
    return this.outputArray(RoleOutputDto, res);
  }
  async getRoleByNameOrThrow(name: string) {
    const res = await this.prisma.role.findUnique({ where: { name } });
    if (res == null) {
      throw new RoleNotFountException();
    }
    return this.output(RoleOutputDto, res);
  }
}

