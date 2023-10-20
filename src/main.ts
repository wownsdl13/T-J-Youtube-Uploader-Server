import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import * as Process from 'process';
import * as express from 'express';
import { ExpressAdapter } from '@nestjs/platform-express';
import { ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  const server = express();
  const app = await NestFactory.create(AppModule, new ExpressAdapter(server));
  app.useGlobalPipes(
    new ValidationPipe({
      forbidNonWhitelisted: true,
      whitelist: true,
      transform: true,
    }),
  );
  app.enableCors({
    origin: '*',
    methods: 'GET, PUT, POST, DELETE, PATCH',
    // allowedHeaders: 'Content-Type, Authorization',
  });
  await app.init();
  await app.listen(Process.env.SERVER_PORT); // you should restore this
}
bootstrap().then(() => console.log('server start'));
