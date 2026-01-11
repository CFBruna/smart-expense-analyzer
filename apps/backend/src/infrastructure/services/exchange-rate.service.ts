import { Injectable, Logger } from '@nestjs/common';
import axios from 'axios';
import { RedisCacheService } from '../cache/redis-cache.service';

@Injectable()
export class ExchangeRateService {
    private readonly logger = new Logger(ExchangeRateService.name);
    private readonly CACHE_TTL = 3600; // 1 hour

    constructor(private readonly cacheService: RedisCacheService) { }

    async convertAmount(amount: number, from: string, to: string, date?: Date): Promise<number> {
        if (from === to) {
            return amount;
        }

        const rate = await this.getExchangeRate(from, to, date);
        return Number((amount * rate).toFixed(2));
    }

    async getExchangeRate(fromCode: string, toCode: string, date?: Date): Promise<number> {
        if (fromCode === toCode) {
            return 1;
        }

        const dateStr = date ? date.toISOString().split('T')[0] : 'latest';
        const fromLower = fromCode.toLowerCase();
        const toLower = toCode.toLowerCase();

        const cacheKey = `exchange_rate:${fromLower}:${toLower}:${dateStr}`;
        const cachedRate = await this.cacheService.get<number>(cacheKey);

        if (cachedRate) {
            return cachedRate;
        }

        try {
            this.logger.log(`Fetching exchange rate from ${fromLower} to ${toLower} for date ${dateStr}`);
            // Using fawazahmed0/currency-api which supports PYG and historical rates via CDN
            // Format: https://cdn.jsdelivr.net/npm/@fawazahmed0/currency-api@{date}/v1/currencies/{from}.json
            const url = `https://cdn.jsdelivr.net/npm/@fawazahmed0/currency-api@${dateStr}/v1/currencies/${fromLower}.json`;
            const response = await axios.get(url);

            const rates = response.data[fromLower];
            const rate = rates[toLower];

            if (rate === undefined) {
                throw new Error(`Rate not found for ${toLower}`);
            }


            await this.cacheService.set(cacheKey, rate, this.CACHE_TTL);

            return rate;
        } catch (error: any) {
            this.logger.warn(`Failed to fetch exchange rate for date ${dateStr}: ${error.message}`);

            if (dateStr !== 'latest') {
                try {
                    this.logger.log(`Attempting fallback to 'latest' exchange rate from ${fromLower} to ${toLower}`);
                    const latestUrl = `https://cdn.jsdelivr.net/npm/@fawazahmed0/currency-api@latest/v1/currencies/${fromLower}.json`;
                    const response = await axios.get(latestUrl);
                    const rates = response.data[fromLower];
                    const rate = rates[toLower];

                    if (rate !== undefined) {
                        await this.cacheService.set(cacheKey, rate, this.CACHE_TTL);
                        return rate;
                    }
                } catch (fallbackError: any) {
                    this.logger.error(`Fallback to latest also failed: ${fallbackError.message}`);
                }
            }

            this.logger.error(`Failed to fetch exchange rate from ${fromCode} to ${toCode}`, error);
            return 1;
        }
    }
}
