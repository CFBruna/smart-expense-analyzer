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
    const combined = `${userId}:${description.toLowerCase().trim()}`;
    const hash = createHash('sha256').update(combined).digest('hex').substring(0, 16);
    return `ai:category:${hash}`;
  }

  private getUserCategorySetKey(userId: string): string {
    return `user:${userId}:category-keys`;
  }

  async setCategoryCache(userId: string, description: string, value: any): Promise<void> {
    const key = this.getCategoryKey(userId, description);
    const setKey = this.getUserCategorySetKey(userId);

    await Promise.all([
      this.set(key, value),
      this.client.sadd(setKey, key),
      this.client.expire(setKey, this.DEFAULT_TTL),
    ]);
  }

  async invalidateUserCategoryCache(userId: string): Promise<number> {
    const setKey = this.getUserCategorySetKey(userId);
    const keys = await this.client.smembers(setKey);

    if (keys.length === 0) return 0;

    const deleted = await this.client.del(...keys);
    await this.client.del(setKey);
    return deleted;
  }

  async onModuleDestroy() {
    await this.client.quit();
  }
}
