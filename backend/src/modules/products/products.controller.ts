import { Controller, Get, Query, Param } from '@nestjs/common';
import { ProductsService } from './products.service';

@Controller('products')
export class ProductsController {
  constructor(private productsService: ProductsService) {}

  // GET /products/search?q=iphone+15
  @Get('search')
  async search(@Query('q') query: string) {
    if (!query) return { error: 'El parámetro q es requerido' };
    return this.productsService.searchProducts(query);
  }

  // GET /products/amazon/:asin
  @Get('amazon/:asin')
  async getAmazonProduct(@Param('asin') asin: string) {
    return this.productsService.getProductById('amazon', asin);
  }
}
