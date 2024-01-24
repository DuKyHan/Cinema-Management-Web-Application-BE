import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { useContainer } from 'class-validator';
import { AppModule } from './app.module';
import { PrismaService } from './prisma';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.setGlobalPrefix('api/v1');
  app.enableCors();
  useContainer(app.select(AppModule), { fallbackOnErrors: true });
  app.get(PrismaService, { strict: false });
  const prismaService = app.get(PrismaService);
  // await prismaService.enableShutdownHooks(app);
  const config = new DocumentBuilder()
    .setTitle('Nestjs API starter')
    .setDescription('The Nest API description')
    .setVersion('1.0')
    .addBearerAuth()
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('swagger', app, document);

  await app.listen(3000);
}
bootstrap();
