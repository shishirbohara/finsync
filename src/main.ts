import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { GlobalValidationPipe } from './common/pipes/validation.pipe';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.useGlobalPipes(GlobalValidationPipe);
  app.enableCors({
    origin: '*',
    credentials: true,
  });
  await app.listen(process.env.PORT ?? 8000);
}
bootstrap();
