import { Module } from '@nestjs/common';
import { AccountModule } from 'src/account/account.module';
import { CommonModule } from 'src/common/common.module';
import { NotificationModule } from 'src/notification/notification.module';
import { ProfileModule } from 'src/profile/profile.module';
import { ReportController } from './controllers';
import { ReportService } from './services';

@Module({
  imports: [CommonModule, AccountModule, ProfileModule, NotificationModule],
  controllers: [ReportController],
  providers: [ReportService],
  exports: [ReportService],
})
export class ReportModule {}
