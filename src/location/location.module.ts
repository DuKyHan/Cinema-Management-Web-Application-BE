
import { Module } from '@nestjs/common';

import { LocationController } from './controllers';
import { LocationService } from './services';
import { CommonModule } from 'src/common/common.module';

@Module({
  imports: [CommonModule],
  controllers: [LocationController],
  providers: [LocationService],
  exports: [LocationService],
})
export class LocationModule {}
