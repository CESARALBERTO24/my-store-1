import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { RedisCacheModule } from './cache/cache.module';
import { ProductsModule } from './modules/products/products.module';
import { HealthController } from './health.controller';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    RedisCacheModule,
    ProductsModule,
  ],
  controllers: [HealthController],
})
export class AppModule {}
