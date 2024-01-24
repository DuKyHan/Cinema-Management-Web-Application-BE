import { Module } from '@nestjs/common';
import { CommonModule } from 'src/common/common.module';
import { FirebaseModule } from 'src/firebase/firebase.module';
import { NotificationController } from './controllers';
import { NotificationService } from './services';

@Module({
  imports: [CommonModule, FirebaseModule],
  controllers: [NotificationController],
  providers: [NotificationService],
  exports: [NotificationService],
})
export class NotificationModule {}
