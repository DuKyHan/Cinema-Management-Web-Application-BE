import { Module } from '@nestjs/common';
import { CommonModule } from 'src/common/common.module';
import { NotificationModule } from 'src/notification/notification.module';
import { FoodsController } from './controllers';
import { FoodService } from './services';

@Module({
  imports: [CommonModule, NotificationModule],
  controllers: [FoodsController],
  providers: [FoodService],
  exports: [FoodService],
})
export class FoodModule {}
