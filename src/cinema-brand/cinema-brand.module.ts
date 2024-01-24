import { Module } from '@nestjs/common';
import { CommonModule } from 'src/common/common.module';
import { CinemaBrandController } from './controllers';
import { CinemaBrandService } from './services';

@Module({
  imports: [CommonModule],
  controllers: [CinemaBrandController],
  providers: [CinemaBrandService],
})
export class CinemaBrandModule {}
