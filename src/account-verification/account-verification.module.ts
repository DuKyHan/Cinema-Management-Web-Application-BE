
import { Module } from '@nestjs/common';
import { AccountVerificationController } from './controllers';
import { AccountVerificationService } from './services';
import { CommonModule } from 'src/common/common.module';

@Module({
  imports: [CommonModule],
  controllers: [AccountVerificationController],
  providers: [AccountVerificationService],
  exports: [AccountVerificationService],
})
export class AccountVerificationModule {}
