import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { RedisCacheModule } from './cache/cache.module';
import { ProductsModule } from './modules/products/products.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    RedisCacheModule,
    ProductsModule,
  ],
})
export class AppModule {}
