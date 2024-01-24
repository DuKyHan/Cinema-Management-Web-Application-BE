import { Role, RolePriority } from '../constants';

export const getHighestPriorityRole = (roles: Role[]): Role => {
  if (roles.length === 0) throw new Error('Roles array cannot be empty');
  let highestRole = roles[0];
  for (const role of roles) {
    if (RolePriority[role] > RolePriority[highestRole]) {
      highestRole = role;
    }
  }
  return highestRole;
};
