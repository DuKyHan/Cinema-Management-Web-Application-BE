import { Prisma } from '@prisma/client';

export type CreateAuthorizedNewsWhereQuery = (
  where: Prisma.NewsWhereInput,
) => Prisma.NewsWhereInput;
