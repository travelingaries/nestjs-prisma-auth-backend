import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // CORS
  app.enableCors();
  await app.listen(process.env.PORT || 3000, '0.0.0.0');
}

bootstrap();