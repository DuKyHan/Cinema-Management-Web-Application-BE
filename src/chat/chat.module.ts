import { Module } from '@nestjs/common';
import { AccountModule } from 'src/account/account.module';
import { AuthModule } from 'src/auth/auth.module';
import { CommonModule } from 'src/common/common.module';
import { NotificationModule } from 'src/notification/notification.module';
import { ProfileModule } from 'src/profile/profile.module';
import { ChatAuthService } from './auth';
import { ChatController, ChatGroupController } from './controllers';
import { ChatGateway } from './gateways';
import { ChatGroupService, ChatService } from './services';

@Module({
  imports: [
    CommonModule,
    AuthModule,
    AccountModule,
    ProfileModule,
    NotificationModule,
  ],
  controllers: [ChatGroupController, ChatController],
  providers: [ChatGateway, ChatGroupService, ChatService, ChatAuthService],
})
export class ChatModule {}
