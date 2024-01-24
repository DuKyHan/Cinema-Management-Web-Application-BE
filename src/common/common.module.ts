import { Module, Scope } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';

// import { FirebaseModule } from 'src/firebase/firebase.module';
// import { RedisModule } from 'src/redis/redis.module';
// import { CacheModule } from '@nestjs/cache-manager';
import { REQUEST } from '@nestjs/core';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { ScheduleModule } from '@nestjs/schedule';
// import { redisStore } from 'cache-manager-ioredis-yet';
import { Request } from 'express';
import { PrismaModule } from 'src/prisma';
import { configModuleOptions } from './configs/module-options';
import { AppLoggerModule } from './logger/logger.module';
import { APP_REQUEST_CONTEXT, createRequestContext } from './request-context';

@Module({
  imports: [
    ConfigModule.forRoot(configModuleOptions),
    // CacheModule.registerAsync({
    //   useFactory: (config: ConfigType<typeof cacheConfig>) => ({
    //     store: config.provider == CacheProvider.Redis ? redisStore : undefined,
    //     ttl: config.ttl,
    //     max: config.max,
    //     host: config.host,
    //     port: config.port,
    //     username: config.username,
    //     password: config.password,
    //   }),
    //   inject: [cacheConfig.KEY],
    // }),
    // RedisModule,
    AppLoggerModule,
    ScheduleModule.forRoot(),
    EventEmitterModule.forRoot({
      wildcard: true,
    }),
    PrismaModule,
    // FirebaseModule,
  ],
  providers: [
    {
      provide: APP_REQUEST_CONTEXT,
      scope: Scope.REQUEST,
      useFactory: (request: Request) => {
        console.log('request', request.user);
        return createRequestContext(request);
      },
      inject: [REQUEST],
    },
  ],
  exports: [
    AppLoggerModule,
    ConfigModule,
    // CacheModule,
    // RedisModule,
    // EventEmitterModule,
    PrismaModule,
    ScheduleModule,
    // FirebaseModule,
    APP_REQUEST_CONTEXT,
  ],
})
export class CommonModule {}
