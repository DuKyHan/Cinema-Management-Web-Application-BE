import { Module } from '@nestjs/common';
import { CommonModule } from 'src/common/common.module';
import { EmailModule } from 'src/email/email.module';
import { TicketController } from './controllers';
import { TicketService } from './services';

@Module({
  imports: [CommonModule, EmailModule],
  controllers: [TicketController],
  providers: [TicketService],
})
export class TicketModule {}
