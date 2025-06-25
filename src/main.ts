import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { Logger } from '@nestjs/common';
import * as dotenv from 'dotenv';

async function bootstrap() {
  dotenv.config({ path: process.env.ENV_FILE || '.env.local' });

  const app = await NestFactory.create(AppModule);

  const logger = new Logger();

  const swaggerConfig = new DocumentBuilder()
    .setTitle('URL Shortener API')
    .setDescription('API para encurtamento de URLs')
    .setVersion('1.0')
    .build();

  const document = SwaggerModule.createDocument(app, swaggerConfig);
  SwaggerModule.setup('api/docs', app, document);

  logger.log('Swagger configurado');
  logger.log('Iniciando aplicação...');

  const port = process.env.PORT ?? 3000;
  await app.listen(port, '0.0.0.0');
  logger.log(`Aplicação rodando na porta ${port}`);
  logger.log(`Swagger em /api/docs`);
}
bootstrap();
