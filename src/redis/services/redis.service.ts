
import { Inject, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { ConfigType } from '@nestjs/config';
import { Redis } from 'ioredis';
import cacheConfig from 'src/common/configs/subconfigs/cache.config';

export class RedisService
  extends Redis
  implements OnModuleInit, OnModuleDestroy
{
  constructor(@Inject(cacheConfig.KEY) config: ConfigType<typeof cacheConfig>) {
    super({
      host: config.host,
      port: config.port,
      username: config.username,
      password: config.password,
      //lazyConnect: true,
    });
  }

  onModuleInit() {
    //return this.connect();
  }

  onModuleDestroy() {
    return this.disconnect();
  }
}
