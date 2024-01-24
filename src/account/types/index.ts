import {
  Account,
  AccountBan,
  AccountInRole,
  AccountVerification,
  Role,
} from '@prisma/client';

export type RawExtendedAccount = Account & {
  accountVerification?: AccountVerification[];
  accountBan?: AccountBan[];
  accountRoles: (AccountInRole & { role: Role })[];
};
