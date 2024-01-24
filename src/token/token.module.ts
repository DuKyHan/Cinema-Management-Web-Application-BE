
import { Module } from '@nestjs/common';

import { TokenService } from './services/token.service';
import { CommonModule } from 'src/common/common.module';

@Module({
  imports: [CommonModule],
  providers: [TokenService],
  exports: [TokenService],
})
export class TokenModule {}
