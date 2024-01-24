import { Injectable, OnModuleInit } from '@nestjs/common';
import { AppPrismaClient } from './app-prisma-client';

@Injectable()
export class PrismaService extends AppPrismaClient implements OnModuleInit {
  constructor() {
    super();
  }

  async onModuleInit() {
    this.connect();
  }

  // async enableShutdownHooks(app: INestApplication) {
  //   this.$on('beforeExit', async () => {
  //     await app.close();
  //   });
  // }
}
