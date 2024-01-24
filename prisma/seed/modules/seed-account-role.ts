import { faker } from '@faker-js/faker/locale/en';
import {
  Account,
  AccountBan,
  AccountInRole,
  AccountVerification,
  PrismaClient,
  Role,
} from '@prisma/client';
import { hashSync } from 'bcrypt';
import { AccountVerificationStatus } from 'src/account-verification/constants';
import { Role as RoleEnum } from '../../../src/auth/constants';
import {
  getNextAccountBanId,
  getNextAccountId,
  getNextAccountVerificationId,
  getNextRoleId,
} from '../utils';

export class SeedAccountsAndRolesOptions {
  defaultAccountOptions?: {
    include?: boolean;
    roles?: RoleEnum[];
  };
  numberOfOpAccounts?: number;
  numberOfModAccounts?: number;
  numberOfAdminAccounts?: number;
  numberOfUserAccounts?: number;
  runWithoutDb?: boolean;
}

export const seedAccountsAndRoles = async (
  prisma: PrismaClient,
  options?: SeedAccountsAndRolesOptions,
) => {
  const roles: Role[] = [
    {
      id: getNextRoleId(),
      name: RoleEnum.User,
      description: 'User',
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      id: getNextRoleId(),
      name: RoleEnum.Moderator,
      description: 'Moderator',
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      id: getNextRoleId(),
      name: RoleEnum.Admin,
      description: 'Admin',
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      id: getNextRoleId(),
      name: RoleEnum.SuperAdmin,
      description: 'Super Admin',
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      id: getNextRoleId(),
      name: RoleEnum.Operator,
      description: 'Operator',
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  ];

  const getRoleByName = (name: RoleEnum) => {
    const role = roles.find((role) => role.name === name);
    if (!role) {
      throw new Error('Role not found');
    }
    return role;
  };

  const hashedPassword = hashSync('123456', 10);

  const defaultAccounts: Account[] = [];
  if (options?.defaultAccountOptions?.include === true) {
    const acc1: Account = {
      id: getNextAccountId(),
      email: '01692310670khang@gmail.com',
      password: hashedPassword,
      isAccountVerified: false,
      isEmailVerified: false,
      isAccountDisabled: false,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    defaultAccounts.push(acc1);
  }

  const opAccounts = Array.from({
    length: options?.numberOfOpAccounts ?? 10,
  }).map((_, index) => ({
    id: getNextAccountId(),
    email: `op${index}@webcinema.example.com`,
    password: hashedPassword,
    isAccountVerified: false,
    isEmailVerified: false,
    isAccountDisabled: false,
    createdAt: new Date(),
    updatedAt: new Date(),
  }));

  const modAccounts = Array.from({
    length: options?.numberOfModAccounts ?? 10,
  }).map((_, index) => ({
    id: getNextAccountId(),
    email: `mod${index}@webcinema.example.com`,
    password: hashedPassword,
    isAccountVerified: false,
    isEmailVerified: true,
    isAccountDisabled: false,
    createdAt: new Date(),
    updatedAt: new Date(),
  }));

  const adminAccounts = Array.from({
    length: options?.numberOfAdminAccounts ?? 10,
  }).map((_, index) => ({
    id: getNextAccountId(),
    email: `admin${index}@webcinema.example.com`,
    password: hashedPassword,
    isAccountVerified: false,
    isEmailVerified: true,
    isAccountDisabled: false,
    createdAt: new Date(),
    updatedAt: new Date(),
  }));

  const verificationList: AccountVerification[] = [];
  const banList: AccountBan[] = [];

  const noteTemplatesOk = [
    'Account verified',
    'Information verified',
    'Profile verified',
  ];
  const noteTemplatesNotOk = [
    'Wrong information',
    'Please check your email again',
    'Profile contains inappropriate content',
    'Profile contains inappropriate image',
  ];
  const banNoteTemplates = [
    'Banned for inappropriate content',
    'Banned for inappropriate image',
    'Banned for inappropriate behavior',
    'Banned for inappropriate language',
    'Harassment',
    'Spam',
    'Scam',
  ];

  const userAccounts = Array.from({
    length: options?.numberOfUserAccounts ?? 100,
  }).map((_, index) => {
    const accountId = getNextAccountId();

    const createdAt = faker.date.between({
      from: '2018-01-01',
      to: new Date(),
    });
    const updatedAt = faker.date.between({ from: createdAt, to: new Date() });

    const isAccountVerified = faker.datatype.boolean();
    const isAccountDisabled = faker.helpers.weightedArrayElement([
      {
        value: true,
        weight: 1,
      },
      {
        value: false,
        weight: 10,
      },
    ]);

    let ca: Date;
    // Has no pending verification
    if (isAccountVerified && faker.datatype.boolean()) {
      // Random number of verification
      for (let i = 0; i < faker.number.int({ min: 0, max: 3 }); i++) {
        const ca = faker.date.soon({ days: 14, refDate: createdAt });
        const isVerified = faker.datatype.boolean();

        const note = isVerified
          ? faker.helpers.arrayElement(noteTemplatesOk)
          : faker.helpers.arrayElement(noteTemplatesNotOk);
        verificationList.push({
          id: getNextAccountVerificationId(),
          accountId: accountId,
          performedBy: faker.helpers.arrayElement(adminAccounts).id,
          note: note,
          isVerified: isVerified,
          status: AccountVerificationStatus.Completed,
          content: 'I want to verify my account',
          createdAt: ca,
          updatedAt: ca,
        });
      }

      // The last verification must match the account verification status
      ca = faker.date.soon({ days: 14, refDate: createdAt });
      const note = isAccountVerified
        ? faker.helpers.arrayElement(noteTemplatesOk)
        : faker.helpers.arrayElement(noteTemplatesNotOk);
      verificationList.push({
        id: getNextAccountVerificationId(),
        accountId: accountId,
        performedBy: faker.helpers.arrayElement(adminAccounts).id,
        note: note,
        isVerified: isAccountVerified,
        status: AccountVerificationStatus.Completed,
        content: 'I want to verify my account',
        createdAt: ca,
        updatedAt: ca,
      });
    } else {
      // Has pending verification
      ca = faker.date.soon({ days: 14, refDate: createdAt });
      verificationList.push({
        id: getNextAccountVerificationId(),
        accountId: accountId,
        performedBy: faker.helpers.arrayElement(adminAccounts).id,
        note: null,
        isVerified: false,
        status: AccountVerificationStatus.Pending,
        content: 'I want to verify my account',
        createdAt: ca,
        updatedAt: ca,
      });
    }

    // Random number of ban
    if (isAccountDisabled) {
      for (let i = 0; i < faker.number.int({ min: 0, max: 3 }); i++) {
        const ca = faker.date.soon({ days: 14, refDate: createdAt });
        banList.push({
          id: getNextAccountBanId(),
          accountId: accountId,
          performedBy: faker.helpers.arrayElement(adminAccounts).id,
          note: faker.helpers.arrayElement(banNoteTemplates),
          isBanned: faker.datatype.boolean(),
          createdAt: ca,
          updatedAt: ca,
        });
      }

      ca = faker.date.soon({ days: 14, refDate: createdAt });
      banList.push({
        id: getNextAccountBanId(),
        accountId: accountId,
        performedBy: faker.helpers.arrayElement(adminAccounts).id,
        note: faker.helpers.arrayElement(banNoteTemplates),
        isBanned: isAccountDisabled,
        createdAt: ca,
        updatedAt: ca,
      });
    }

    return {
      id: accountId,
      email: `user${index}@webcinema.example.com`,
      password: hashedPassword,
      isEmailVerified: faker.datatype.boolean(),
      isAccountVerified: faker.datatype.boolean(),
      isAccountDisabled: faker.datatype.boolean(),
      createdAt: createdAt,
      updatedAt: updatedAt,
    };
  });

  const accounts: Account[] = [
    ...opAccounts,
    ...modAccounts,
    ...adminAccounts,
    ...userAccounts,
    ...defaultAccounts,
  ];

  const defaultAccountRoles: AccountInRole[] = defaultAccounts.flatMap(
    (account) =>
      (options?.defaultAccountOptions?.roles ?? [RoleEnum.Admin]).map(
        (role) => ({
          accountId: account.id,
          roleId: getRoleByName(role).id,
          createdAt: new Date(),
          updatedAt: new Date(),
        }),
      ),
  );

  const accountRoles: AccountInRole[] = [
    ...defaultAccountRoles,
    ...opAccounts.map((account) => ({
      accountId: account.id,
      roleId: getRoleByName(RoleEnum.Operator).id,
      createdAt: new Date(),
      updatedAt: new Date(),
    })),
    ...modAccounts.map((account) => ({
      accountId: account.id,
      roleId: getRoleByName(RoleEnum.Moderator).id,
      createdAt: new Date(),
      updatedAt: new Date(),
    })),
    ...adminAccounts.map((account) => ({
      accountId: account.id,
      roleId: getRoleByName(RoleEnum.Admin).id,
      createdAt: new Date(),
      updatedAt: new Date(),
    })),
    ...userAccounts.map((account) => ({
      accountId: account.id,
      roleId: getRoleByName(RoleEnum.User).id,
      createdAt: new Date(),
      updatedAt: new Date(),
    })),
  ];
  // accounts.forEach((account) => {
  //   accountRoles.push({
  //     accountId: account.id,
  //     roleId: getRoleByName(RoleEnum.User).id,
  //     createdAt: account.createdAt,
  //     updatedAt: account.updatedAt,
  //   });
  // });

  const nonDisabledAccounts = accounts.filter(
    (account) => !account.isAccountDisabled,
  );
  const nonDisabledModAccounts = modAccounts.filter(
    (account) => !account.isAccountDisabled,
  );
  const nonDisabledVolunteerAccounts = userAccounts.filter(
    (account) => !account.isAccountDisabled,
  );

  if (options?.runWithoutDb) {
    return {
      roles,
      accountRoles,
      adminAccounts,
      modAccounts,
      userAccounts,
      defaultAccounts,
      accounts,
    };
  }

  await prisma.role.createMany({
    data: [...roles],
  });

  await prisma.account.createMany({
    data: accounts,
  });

  await prisma.accountInRole.createMany({
    data: accountRoles,
  });

  await prisma.accountVerification.createMany({
    data: verificationList,
  });

  await prisma.accountBan.createMany({
    data: banList,
  });

  return {
    roles,
    accountRoles,
    adminAccounts,
    modAccounts,
    userAccounts,
    nonDisabledAccounts,
    nonDisabledModAccounts,
    nonDisabledVolunteerAccounts,
    defaultAccounts,
    accounts,
  };
};
