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
  const hostName = process.env.HOSTNAME ?? 'localhost';
  await app.listen(port, hostName);
  logger.log(`Aplicação rodando em ${hostName}, porta ${port}`);
  logger.log(`Swagger em ${hostName}/api/docs, porta ${port}`);
}
bootstrap();
