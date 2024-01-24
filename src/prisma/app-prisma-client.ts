import { PrismaClient } from '@prisma/client';

export class AppPrismaClient extends PrismaClient {
  private retries = 0;
  private connected = false;

  constructor(private readonly config?: AppPrismaClientConfig) {
    super();
  }

  async connect() {
    while (!this.connected) {
      try {
        await this.$connect();
        this.connected = true;
      } catch (err) {
        if (this.retries >= (this.config?.maxRetries ?? 5)) {
          throw err;
        }
        // Wait for 2 seconds before retrying
        await new Promise((r) => setTimeout(r, 2000));
        this.retries++;
        console.warn(`Connection failed. Retrying... Attempt ${this.retries}`);
      }
    }
  }

  async deleteAllData() {
    const tablenames = await this.$queryRaw<
      Array<{ tablename: string }>
    >`SELECT tablename FROM pg_tables WHERE schemaname='public'`;

    const tables = tablenames
      .map(({ tablename }) => tablename)
      .filter((name) => name !== '_prisma_migrations')
      .map((name) => `"public"."${name}"`)
      .join(', ');

    try {
      await this.$executeRawUnsafe(`TRUNCATE TABLE ${tables} CASCADE;`);
    } catch (error) {
      console.error({ error });
    }
  }
}

export type AppPrismaClientConfig = {
  maxRetries?: number;
};
