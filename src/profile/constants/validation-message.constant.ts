import { USERNAME_MAX_LENGTH, USERNAME_MIN_LENGTH } from './rule.constant';

export const USERNAME_INVALID_MESSAGE = `Username must have length between ${USERNAME_MIN_LENGTH} and ${USERNAME_MAX_LENGTH}, accepting letters, numbers, _ and -`;
