
import { Module } from '@nestjs/common';

import { IsFileIdValidator } from './validators';
import { CommonModule } from 'src/common/common.module';
import { FileController } from './controllers';
import { FileService } from './services';

@Module({
  imports: [CommonModule],
  controllers: [FileController],
  providers: [FileService, IsFileIdValidator],
  exports: [FileService],
})
export class FileModule {}
