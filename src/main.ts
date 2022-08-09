import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  const options = new DocumentBuilder()
    .setTitle('User Athentication')
    .setDescription('User Authentication Backend with NestJS and Prisma')
    .setVersion('1.0')
    .build();
  const document = SwaggerModule.createDocument(app, options);
  SwaggerModule.setup('docs', app, document);

  // CORS
  app.enableCors();

  await app.listen(process.env.PORT || 3000, '0.0.0.0');
}

bootstrap();