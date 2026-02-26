import { Module } from '@nestjs/common';
import { ProductsService } from './products.service';
import { ProductsController } from './products.controller';
import { AmazonModule } from '../../integrations/amazon/amazon.module';
import { RedisCacheModule } from '../../cache/cache.module';

@Module({
  imports: [AmazonModule, RedisCacheModule],
  providers: [ProductsService],
  controllers: [ProductsController],
})
export class ProductsModule {}
