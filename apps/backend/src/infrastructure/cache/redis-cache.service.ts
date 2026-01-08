import { Injectable, OnModuleDestroy } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Redis from 'ioredis';
import { createHash } from 'crypto';

@Injectable()
export class RedisCacheService implements OnModuleDestroy {
  private readonly client: Redis;
  private readonly DEFAULT_TTL = 30 * 24 * 60 * 60; // 30 days in seconds

  constructor(private readonly configService: ConfigService) {
    const redisUrl = this.configService.get<string>('REDIS_URL') || 'redis://localhost:6379';
    this.client = new Redis(redisUrl);
  }

  async get<T>(key: string): Promise<T | null> {
    const value = await this.client.get(key);
    return value ? JSON.parse(value) : null;
  }

  async set(key: string, value: any, ttl?: number): Promise<void> {
    const serialized = JSON.stringify(value);
    const expireTime = ttl || this.DEFAULT_TTL;
    await this.client.setex(key, expireTime, serialized);
  }

  async delete(key: string): Promise<void> {
    await this.client.del(key);
  }

  async exists(key: string): Promise<boolean> {
    const result = await this.client.exists(key);
    return result === 1;
  }

  getCategoryKey(userId: string, description: string): string {
    // Include userId to isolate cache per user
    const combined = `${userId}:${description.toLowerCase().trim()}`;
    const hash = createHash('sha256').update(combined).digest('hex').substring(0, 16);
    return `ai:category:${hash}`;
  }

  async onModuleDestroy() {
    await this.client.quit();
  }
}
