;
import { Module } from '@nestjs/common';
import { CommonModule } from 'src/common/common.module';
import { RoleService } from './services';
import { RoleController } from './controllers/role.controller';

@Module({
  imports: [CommonModule],
  controllers: [RoleController],
  providers: [RoleService],
  exports: [RoleService],
})
export class RoleModule {}
