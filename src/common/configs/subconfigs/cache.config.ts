
import { registerAs } from '@nestjs/config';
import { CacheProvider } from 'src/common/constants';

export default registerAs('cache', () => ({
  provider: process.env.CACHE_PROVIDER as CacheProvider | undefined,
  url: process.env.CACHE_URL,
  host: process.env.CACHE_HOST,
  port: process.env.CACHE_PORT ? parseInt(process.env.CACHE_PORT) : undefined,
  username: process.env.CACHE_USERNAME,
  password: process.env.CACHE_PASSWORD,
  ttl: process.env.CACHE_TTL ? parseInt(process.env.CACHE_TTL) : undefined,
  max: process.env.CACHE_MAX ? parseInt(process.env.CACHE_MAX) : undefined,
}));
