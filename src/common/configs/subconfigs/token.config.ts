import { registerAs } from '@nestjs/config';

export default registerAs('token', () => ({
  lifeSec: parseInt(process.env.TOKEN_LIFE_SEC || '900'),
  passwordResetRenewSec: parseInt(
    process.env.TOKEN_RESET_PASSWORD_RENEWAL_SEC || '0',
  ),
  emailVerificationResetRenewSec: parseInt(
    process.env.TOKEN_EMAIL_VERIFICATION_RENEWAL_SEC || '0',
  ),
}));
