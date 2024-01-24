export enum Role {
  User = 'user',
  Moderator = 'moderator',
  Admin = 'admin',
  SuperAdmin = 'superadmin',
  // Permit all requests
  Operator = 'operator',
}

export const RolePriority = {
  [Role.User]: 100,
  [Role.Moderator]: 1000,
  [Role.Admin]: 10000,
  [Role.SuperAdmin]: 100000,
  [Role.Operator]: 99999999,
};
