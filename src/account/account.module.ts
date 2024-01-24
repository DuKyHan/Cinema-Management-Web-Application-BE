import { Module } from '@nestjs/common';
import { AccountController } from './controllers/account.controller';
import { AccountService } from './services/account.service';
import { CommonModule } from 'src/common/common.module';
import { AdminAccountService } from './services';
import { AdminAccountController } from './controllers/admin-account.controller';

@Module({
  imports: [CommonModule],
  providers: [AccountService, AdminAccountService],
  controllers: [AccountController, AdminAccountController],
  exports: [AccountService, AdminAccountService],
})
export class AccountModule {}
