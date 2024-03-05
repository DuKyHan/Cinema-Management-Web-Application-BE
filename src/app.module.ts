import {
  MiddlewareConsumer,
  Module,
  NestModule,
  ValidationPipe,
} from '@nestjs/common';
import { APP_FILTER, APP_GUARD, APP_INTERCEPTOR, APP_PIPE } from '@nestjs/core';
import { AccountVerificationModule } from './account-verification/account-verification.module';
import { AccountModule } from './account/account.module';
import { AnalyticsModule } from './analytics/analytics.module';
import { AuthModule } from './auth/auth.module';
import { JwtAuthGuard, RolesGuard } from './auth/guards';
import { ChatModule } from './chat/chat.module';
import { CinemaBrandModule } from './cinema-brand/cinema-brand.module';
import { CinemaFilmModule } from './cinema-film/cinema-film.module';
import { CinemaModule } from './cinema/cinema.module';
import { CommonModule } from './common/common.module';
import { AllExceptionsFilter } from './common/filters';
import {
  InjectRequestContextInterceptor,
  LoggingInterceptor,
  ResponseInterceptor,
} from './common/interceptors';
import { RequestIdMiddleware } from './common/middlewares';
import { VALIDATION_PIPE_OPTIONS } from './common/pipes';
import { EmailModule } from './email/email.module';
import { FileModule } from './file/file.module';
import { FilmModule } from './film/film.module';
import { FoodModule } from './foods/foods.module';
import { GenreModule } from './genres/genre.module';
import { NewsModule } from './news/news.module';
import { NotificationModule } from './notification/notification.module';
import { ProfileModule } from './profile/profile.module';
import { ReportModule } from './report/report.module';
import { RoleModule } from './role/role.module';
import { RoomModule } from './room/room.module';
import { SeatModule } from './seat/seat.module';
import { TicketService } from './ticket/services/ticket.service';
import { TicketModule } from './ticket/ticket.module';
import { TokenModule } from './token/token.module';
@Module({
  imports: [
    CommonModule,
    AccountModule,
    AuthModule,
    TokenModule,
    EmailModule,
    ProfileModule,
    AccountVerificationModule,
    RoleModule,
    //RedisModule,
    SeatModule,
    FileModule,
    FoodModule,
    RoomModule,
    ChatModule,
    NewsModule,
    CinemaModule,
    CinemaFilmModule,
    TicketModule,
    FilmModule,
    GenreModule,
    CinemaBrandModule,
    ReportModule,
    NotificationModule,
    AnalyticsModule,
  ],
  controllers: [],
  providers: [
    {
      provide: APP_GUARD,
      useClass: JwtAuthGuard,
    },
    {
      provide: APP_GUARD,
      useClass: RolesGuard,
    },
    {
      provide: APP_INTERCEPTOR,
      useClass: ResponseInterceptor,
    },
    {
      provide: APP_INTERCEPTOR,
      useClass: InjectRequestContextInterceptor,
    },
    {
      provide: APP_PIPE,
      useFactory: () => new ValidationPipe(VALIDATION_PIPE_OPTIONS),
    },
    { provide: APP_INTERCEPTOR, useClass: LoggingInterceptor },
    {
      provide: APP_FILTER,
      useClass: AllExceptionsFilter,
    },
    TicketService,
  ],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(RequestIdMiddleware).forRoutes('*');
  }
}
