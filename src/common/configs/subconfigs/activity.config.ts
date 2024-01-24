import { registerAs } from '@nestjs/config';

export default registerAs('activity', () => ({
  activityRefreshIntervalSec: process.env.ACTIVITY_REFRESH_INTERVAL_SEC,
}));
