import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { compare, hash, hashSync } from 'bcrypt';
import { plainToInstance } from 'class-transformer';

import { Role } from 'src/auth/constants';
import {
  AccountNotFoundException,
  EmailAlreadyInUseException,
  WrongPasswordException,
} from 'src/auth/exceptions';
import { AbstractService } from 'src/common/services';
import { AppLogger } from '../../common/logger/logger.service';
import { RequestContext } from '../../common/request-context/request-context.dto';
import { PrismaService } from '../../prisma/prisma.service';
import { UpdateAccountRolesInputDto } from '../dtos';
import { CreateAccountInput } from '../dtos/account-create-input.dto';
import { AccountOutputDto } from '../dtos/account-output.dto';
import { UpdateAccountInput } from '../dtos/account-update-input.dto';
import { Account } from '../entities/account.entity';

@Injectable()
export class AccountService extends AbstractService {
  constructor(
    private prisma: PrismaService,
    logger: AppLogger,
  ) {
    super(logger);
  }

  async createAccount(
    ctx: RequestContext,
    input: CreateAccountInput,
  ): Promise<AccountOutputDto> {
    this.logger.log(ctx, `${this.createAccount.name} was called`);

    const account = plainToInstance(Account, input);

    const exist = await this.prisma.account.findUnique({
      where: { email: account.email },
    });
    if (exist) {
      throw new EmailAlreadyInUseException();
    }

    account.password = await hash(input.password, 10);
    delete account['roles'];

    const userRoleId = await this.prisma.role.findMany({
      where: { name: { in: [Role.User, Role.Moderator] } },
    });
    if (userRoleId.length != 2) {
      throw new InternalServerErrorException('Cannot register account');
    }
    const res = await this.prisma.account.create({
      data: {
        ...account,
        accountRoles: {
          createMany: {
            data: [{ roleId: userRoleId[0].id }],
          },
        },
      },
    });

    const output: AccountOutputDto = {
      ...res,
      roles: [Role.User],
      createdAt: res.createdAt ?? undefined,
      updatedAt: res.updatedAt ?? undefined,
    };

    return plainToInstance(AccountOutputDto, output, {
      excludeExtraneousValues: true,
    });
  }

  async validateEmailPassword(
    ctx: RequestContext,
    email: string,
    pass: string,
  ): Promise<AccountOutputDto> {
    const account = await this.prisma.account.findUnique({
      where: { email: email },
      include: this.getAccountInclude(),
    });
    if (!account) throw new AccountNotFoundException();

    const match = await compare(pass, account.password);
    if (!match) throw new AccountNotFoundException();

    return this.mapToDto(account);
  }

  async findById(ctx: RequestContext, id: number): Promise<AccountOutputDto> {
    const account = await this.prisma.account.findUnique({
      where: { id: id },
      include: this.getAccountInclude(),
    });

    return this.mapToDto(account);
  }

  async findByEmail(
    ctx: RequestContext,
    email: string,
  ): Promise<AccountOutputDto> {
    const account = await this.prisma.account.findUnique({
      where: { email: email },
      include: this.getAccountInclude(),
    });

    return this.mapToDto(account);
  }

  async updateAccount(
    ctx: RequestContext,
    id: number,
    input: UpdateAccountInput,
  ): Promise<AccountOutputDto> {
    const account = await this.prisma.account.findUnique({
      where: { id: id },
    });

    // Hash the password if it exists in the input payload.
    if (input.password) {
      input.password = await hash(input.password, 10);
    }

    // merges the input (2nd line) to the found user (1st line)
    const updatedUser: Account = {
      ...account,
      ...plainToInstance(Account, input),
    };

    const updated = await this.prisma.account.update({
      where: { id: updatedUser.id },
      data: updatedUser,
      include: this.getAccountInclude(),
    });

    return this.mapToDto(updated);
  }

  async updateAccountPassword(
    ctx: RequestContext,
    id: number,
    password: string,
  ): Promise<AccountOutputDto> {
    const account = await this.prisma.account.findUnique({
      where: { id: id },
    });
    if (!account) {
      throw new AccountNotFoundException();
    }

    const hashedPassword = hashSync(password, 10);
    const updated = await this.prisma.account.update({
      where: { id: id },
      data: {
        password: hashedPassword,
      },
      include: this.getAccountInclude(),
    });

    return this.mapToDto(updated);
  }

  async markAccountAsVerified(ctx: RequestContext, id: number) {
    const account = await this.prisma.account.findUnique({
      where: { id: id },
    });
    if (!account) {
      throw new AccountNotFoundException();
    }

    const updated = await this.prisma.account.update({
      where: { id: id },
      data: {
        isEmailVerified: true,
      },
      include: this.getAccountInclude(),
    });

    return this.mapToDto(updated);
  }

  async updateAccountRoles(
    ctx: RequestContext,
    id: number,
    dto: UpdateAccountRolesInputDto,
  ): Promise<AccountOutputDto> {
    await this.prisma.$transaction(async (tx) => {
      const roles = await tx.role.findMany({
        where: { name: { in: dto.roles } },
      });

      await tx.accountInRole.deleteMany({
        where: { accountId: id },
      });

      await tx.accountInRole.createMany({
        data: roles.map((role) => ({
          accountId: id,
          roleId: role.id,
        })),
      });
    });
    return this.findById(ctx, id);
  }

  async getAccounts(
    ctx: RequestContext,
    ids: number[],
  ): Promise<AccountOutputDto[]> {
    const accounts = await this.prisma.account.findMany({
      where: { id: { in: ids } },
      include: this.getAccountInclude(),
    });

    return accounts.map((account) => {
      return this.mapToDto(account);
    });
  }

  async validateAccountPassword(accountId: number, password: string) {
    const account = await this.prisma.account.findUnique({
      where: { id: accountId },
    });
    if (!account) throw new AccountNotFoundException();

    const match = await compare(password, account.password);
    if (!match) throw new WrongPasswordException();

    return true;
  }

  private getAccountInclude() {
    return {
      accountRoles: {
        include: {
          role: true,
        },
      },
    };
  }

  mapToDto(account: any): AccountOutputDto {
    return this.output(
      AccountOutputDto,
      { ...account, roles: account.accountRoles.map((r) => r.role.name) },
      {
        excludeExtraneousValues: true,
      },
    );
  }
}
