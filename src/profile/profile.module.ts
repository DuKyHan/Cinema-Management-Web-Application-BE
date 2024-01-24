
import { CommonModule } from 'src/common/common.module';
import { ProfileListener, ProfileService } from './services';
import { ProfileController } from './controllers';
import { Module } from '@nestjs/common';
import { LocationModule } from 'src/location/location.module';

@Module({
  imports: [CommonModule,LocationModule],
  controllers: [ProfileController],
  providers: [ProfileService, ProfileListener],
  exports: [ProfileService],
})
export class ProfileModule {}
