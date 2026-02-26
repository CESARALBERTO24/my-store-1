import { Module } from '@nestjs/common';
import { CacheModule } from '@nestjs/cache-manager';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { redisStore } from 'cache-manager-ioredis-yet';
import { CacheService } from './cache.service';

@Module({
  imports: [
    CacheModule.registerAsync({
      isGlobal: true,
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: async (configService: ConfigService) => ({
        store: redisStore,
        host: configService.get('REDIS_HOST', 'localhost'),
        port: configService.get<number>('REDIS_PORT', 6379),
        ttl: 60 * 10, // 10 minutos por defecto
      }),
    }),
  ],
  providers: [CacheService],
  exports: [CacheService],
})
export class RedisCacheModule {}
