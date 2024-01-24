import { registerAs } from '@nestjs/config';

export default registerAs('auth', () => ({
  secret: process.env.AUTH_SECRET,
  disabled: process.env.AUTH_DISABLED === 'true',
  accessTokenLifeSec: parseInt(
    process.env.AUTH_ACCESS_TOKEN_LIFE_SEC || '3600',
  ),
  refreshTokenLifeSec: parseInt(
    process.env.AUTH_REFRESH_TOKEN_LIFE_SEC || '432000',
  ),
}));
