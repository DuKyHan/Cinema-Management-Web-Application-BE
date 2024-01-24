
import { registerAs } from '@nestjs/config';
import { requireNonNull } from 'src/common/utils';

export default registerAs('email', () => ({
  service: process.env.EMAIL_SERVICE,
  host: process.env.EMAIL_HOST,
  port: parseInt(process.env.EMAIL_PORT || '465'),
  user: process.env.EMAIL_USER,
  password: process.env.EMAIL_PASSWORD,
  default: {
    from: process.env.EMAIL_DEFAULT_FROM,
  },
  mailgun: {
    apiKey: requireNonNull(process.env.MAILGUN_API_KEY),
  },
}));
