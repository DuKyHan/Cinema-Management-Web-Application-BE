import { Injectable } from '@nestjs/common';
import { AppLogger } from 'src/common/logger';
import { RequestContext } from 'src/common/request-context';
import { AbstractService } from 'src/common/services';
import { PrismaService } from 'src/prisma';
import {
  CinemaBrandQueryDto,
  CreateCinemaBrandDto,
  UpdateCinemaBrandDto,
} from '../dtos';
import {
  AccountAlreadyHasACinemaBrandException,
  CinemaBrandNotFoundException,
} from '../exceptions';

@Injectable()
export class CinemaBrandService extends AbstractService {
  constructor(
    logger: AppLogger,
    private readonly prisma: PrismaService,
  ) {
    super(logger);
  }

  async getCinemaBrands(query: CinemaBrandQueryDto) {
    return this.prisma.cinemaBrand.findMany({
      take: query.limit,
      skip: query.offset,
    });
  }

  async getMyCinemaBrand(context: RequestContext) {
    return this.prisma.cinemaBrand.findFirst({
      where: { ownerId: context.account.id },
    });
  }

  async getCinemaBrandById(context: RequestContext, id: number) {
    return this.prisma.cinemaBrand.findUnique({
      where: { id, ownerId: context.account.id },
    });
  }

  async createCinemaBrand(context: RequestContext, data: CreateCinemaBrandDto) {
    const exist = await this.prisma.cinemaBrand.count({
      where: { ownerId: context.account.id },
    });

    if (exist) {
      throw new AccountAlreadyHasACinemaBrandException();
    }

    return this.prisma.cinemaBrand.create({
      data: { ...data, ownerId: context.account.id },
    });
  }

  async updateCinemaBrand(
    context: RequestContext,
    id: number,
    data: UpdateCinemaBrandDto,
  ) {
    const cinemaBrand = await this.prisma.cinemaBrand.findUnique({
      where: { id, ownerId: context.account.id },
    });

    if (!cinemaBrand) {
      throw new CinemaBrandNotFoundException();
    }

    return this.prisma.cinemaBrand.update({
      where: { id },
      data: { ...data },
    });
  }
}
