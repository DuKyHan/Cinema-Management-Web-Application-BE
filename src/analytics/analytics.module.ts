import { Module } from '@nestjs/common';
import { CommonModule } from 'src/common/common.module';
import { AnalyticsController } from './controllers';
import { AnalyticsService } from './services';

@Module({
  imports: [CommonModule],
  controllers: [AnalyticsController],
  providers: [AnalyticsService],
})
export class AnalyticsModule {}
