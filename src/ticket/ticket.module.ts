import { Module } from '@nestjs/common';
import { CommonModule } from 'src/common/common.module';
import { EmailModule } from 'src/email/email.module';
import { TicketController } from './controllers';
import { TicketService } from './services';
import { NotificationModule } from 'src/notification/notification.module';


@Module({
  imports: [CommonModule, EmailModule,NotificationModule],
  controllers: [TicketController],
  providers: [TicketService],
})
export class TicketModule {}
