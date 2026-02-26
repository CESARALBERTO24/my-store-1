import { Injectable } from '@nestjs/common';
import { CacheService } from '../../cache/cache.service';
import { AmazonService } from '../../integrations/amazon/amazon.service';

@Injectable()
export class ProductsService {
  constructor(
    private cacheService: CacheService,
    private amazonService: AmazonService,
  ) {}

  async searchProducts(query: string) {
    const cacheKey = `products:search:${query.toLowerCase().trim()}`;

    return this.cacheService.getOrSet(
      cacheKey,
      async () => {
        const amazon = await this.amazonService.search(query).catch(() => []);
        return { amazon };
      },
      60 * 15, // 15 minutos
    );
  }

  async getProductById(source: string, productId: string) {
    const cacheKey = `products:detail:${source}:${productId}`;

    return this.cacheService.getOrSet(
      cacheKey,
      async () => {
        switch (source) {
          case 'amazon':
            return this.amazonService.getById(productId);
          default:
            throw new Error('Fuente no válida');
        }
      },
      60 * 30, // 30 minutos
    );
  }
}
