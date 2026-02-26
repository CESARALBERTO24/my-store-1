import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AmazonService } from './amazon.service';

@Module({
  imports: [ConfigModule],
  providers: [AmazonService],
  exports: [AmazonService],
})
export class AmazonModule {}
