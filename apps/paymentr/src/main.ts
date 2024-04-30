import { NestFactory } from '@nestjs/core';
import { PaymentrModule } from './paymentr.module';
import { ConfigService } from '@nestjs/config';

async function bootstrap() {
  const app = await NestFactory.create(PaymentrModule);
  const configService = app.get(ConfigService);
  await app.listen(configService.get('HTTP_PORT'));
}
bootstrap();
