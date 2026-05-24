import { NestFactory } from '@nestjs/core';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AppModule } from './app.module';
import { Product } from './products/product.entity';
import { seedProducts } from './database/seeds/product.seed';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.setGlobalPrefix('api');
  app.enableCors();

  await app.listen(process.env.PORT ?? 3001);

  const productRepo = app.get<Repository<Product>>(getRepositoryToken(Product));
  await seedProducts(productRepo);
}

bootstrap();
