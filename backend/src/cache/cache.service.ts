import { Injectable, Inject } from '@nestjs/common';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Cache } from 'cache-manager';

@Injectable()
export class CacheService {
  constructor(@Inject(CACHE_MANAGER) private cacheManager: Cache) {}

  async set(key: string, value: any, ttl?: number): Promise<void> {
    await this.cacheManager.set(key, value, ttl);
  }

  async get<T>(key: string): Promise<T | null> {
    return await this.cacheManager.get<T>(key);
  }

  async del(key: string): Promise<void> {
    await this.cacheManager.del(key);
  }

  // Obtener de caché o ejecutar función si no existe
  async getOrSet<T>(
    key: string,
    fetchFn: () => Promise<T>,
    ttl?: number,
  ): Promise<T> {
    const cached = await this.get<T>(key);
    if (cached) {
      console.log(`✅ Cache HIT: ${key}`);
      return cached;
    }
    console.log(`❌ Cache MISS: ${key} — consultando API...`);
    const data = await fetchFn();
    await this.set(key, data, ttl);
    return data;
  }
}
