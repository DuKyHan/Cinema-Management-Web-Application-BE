// import { ActivityModule } from 'src/activity/activity.module';

// import { OrganizationModule } from 'src/organization/organization.module';

import { Module } from '@nestjs/common';
import { CommonModule } from 'src/common/common.module';
import { NotificationModule } from 'src/notification/notification.module';
import { ProfileModule } from 'src/profile/profile.module';
import { NewsController } from './controllers';
import {
  NewsAuthorizationService,
  NewsService,
  NewsTaskService,
} from './services';

@Module({
  imports: [CommonModule, ProfileModule, NotificationModule],
  controllers: [NewsController],
  providers: [NewsService, NewsAuthorizationService, NewsTaskService],
  exports: [NewsService, NewsAuthorizationService],
})
export class NewsModule {}
