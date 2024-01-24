import { registerAs } from '@nestjs/config';

export default registerAs('googleMaps', () => ({
  apiKey: process.env.GOOGLE_MAPS_API_KEY || '',
}));
