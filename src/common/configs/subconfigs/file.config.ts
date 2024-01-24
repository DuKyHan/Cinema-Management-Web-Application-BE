import { registerAs } from '@nestjs/config';

export default registerAs('file', () => ({
  endpoint: process.env.FILE_ENDPOINT || '',
  region: process.env.FILE_REGION || '',
  accessKey: process.env.FILE_ACCESS_KEY || '',
  secretKey: process.env.FILE_SECRET_KEY || '',
  bucket: process.env.FILE_BUCKET || '',
}));
