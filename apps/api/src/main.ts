/**
 * This is not a production server yet!
 * This is only a minimal backend to get started.
 */

import { Logger, ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';
import { existsSync } from 'fs';
import { join } from 'path';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

import { AppModule } from './app/app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  const config = new DocumentBuilder()
    .setTitle('API Docs')
    .setVersion('1.0')
    .addTag('users')
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('docs', app, document);

  const globalPrefix = 'api';

  app.setGlobalPrefix(globalPrefix);

  app.enableCors();

  // Serve the built front end (dist/apps/web) from the same service.
  const webRoot = join(__dirname, '..', 'web');
  if (existsSync(webRoot)) {
    const express = require('express');
    app.use(express.static(webRoot));
    app.use((req, res, next) => {
      const isPage = req.method === 'GET' && !/^\/(api|docs)(\/|$)/.test(req.path);
      return isPage && !req.path.includes('.')
        ? res.sendFile(join(webRoot, 'index.html'))
        : next();
    });
  }

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
    }),
  );

  const configService = app.get(ConfigService);
  const port = configService.get('api.port');

  await app.listen(port);

  Logger.log(
    `🚀 Application is running on: http://localhost:${port}/${globalPrefix}`,
  );

  Logger.log(`📄 Documentation is running on: http://localhost:${port}/docs`);
}

bootstrap();
