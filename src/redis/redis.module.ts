import { Module } from '@nestjs/common';
import { RedisService } from './services';
import { RedisController } from './controllers/redis.controller';

@Module({
  controllers: [RedisController],
  providers: [RedisService],
  exports: [RedisService],
})
export class RedisModule {}
