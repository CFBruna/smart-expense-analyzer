import { Injectable, Logger } from '@nestjs/common';
import axios from 'axios';
import { RedisCacheService } from '../cache/redis-cache.service';

@Injectable()
export class ExchangeRateService {
  private readonly logger = new Logger(ExchangeRateService.name);
  private readonly CACHE_TTL = 3600;
  private readonly FRESH_TTL = 3600 * 1000;
  private readonly MAX_TTL = 7 * 24 * 3600;

  constructor(private readonly cacheService: RedisCacheService) {}

  async convertAmount(amount: number, from: string, to: string, date?: Date): Promise<number> {
    if (from === to) {
      return amount;
    }

    const rate = await this.getExchangeRate(from, to, date);

    if (rate === null) {
      this.logger.warn(`Conversion failed from ${from} to ${to}: Rate not found`);
      return amount;
    }

    return Number((amount * rate).toFixed(2));
  }

  async getExchangeRate(fromCode: string, toCode: string, date?: Date): Promise<number | null> {
    if (fromCode === toCode) {
      return 1;
    }

    const dateStr = date ? date.toISOString().split('T')[0] : 'latest';
    const fromLower = fromCode.toLowerCase();
    const toLower = toCode.toLowerCase();

    const cacheKey = `exchange_rate:${fromLower}:${toLower}:${dateStr}`;
    const cachedValue = await this.cacheService.get<any>(cacheKey);

    let cachedRate: number | null = null;
    let cachedTimestamp: number = 0;

    if (cachedValue !== null) {
      if (typeof cachedValue === 'number') {
        cachedRate = cachedValue;
        cachedTimestamp = Date.now();
      } else {
        cachedRate = cachedValue.rate;
        cachedTimestamp = cachedValue.timestamp;
      }
    }

    const isFresh = Date.now() - cachedTimestamp < this.FRESH_TTL;
    if (cachedRate !== null && isFresh) {
      return cachedRate;
    }

    try {
      this.logger.log(`Fetching exchange rate from ${fromLower} to ${toLower} for date ${dateStr}`);
      const rate = await this.fetchFromApi(fromLower, toLower, dateStr);

      await this.cacheService.set(cacheKey, { rate, timestamp: Date.now() }, this.MAX_TTL);

      return rate;
    } catch (error: any) {
      this.logger.warn(`Failed to fetch fresh rate: ${error.message}`);

      if (cachedRate !== null) {
        this.logger.warn(
          `Using STALE exchange rate (${fromLower}->${toLower}) from ${new Date(cachedTimestamp).toISOString()}`,
        );
        return cachedRate;
      }
      this.logger.error(`No rate available (fresh or stale) for ${fromLower}->${toLower}`);
      return null;
    }
  }

  private async fetchFromApi(from: string, to: string, dateStr: string): Promise<number> {
    const maxRetries = 5;
    let lastError: any;

    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        const url = `https://cdn.jsdelivr.net/npm/@fawazahmed0/currency-api@${dateStr}/v1/currencies/${from}.json`;

        const response = await axios.get(url, { timeout: 10000 });
        const rates = response.data[from];

        if (rates && rates[to] !== undefined) {
          if (attempt > 1) {
            this.logger.log(
              `✓ Successfully fetched ${from}→${to} on attempt ${attempt}/${maxRetries}`,
            );
          }
          return rates[to];
        }
        throw new Error(`Rate not found for ${to} in response`);
      } catch (error: any) {
        lastError = error;

        if (attempt === 1 && dateStr !== 'latest') {
          this.logger.log(`Attempting fallback to 'latest' for ${from}→${to}`);
          try {
            const latestUrl = `https://cdn.jsdelivr.net/npm/@fawazahmed0/currency-api@latest/v1/currencies/${from}.json`;
            const response = await axios.get(latestUrl, { timeout: 10000 });
            if (response.data[from] && response.data[from][to] !== undefined) {
              return response.data[from][to];
            }
          } catch (fallbackError: any) {
            this.logger.warn(`Fallback to 'latest' also failed: ${fallbackError.message}`);
          }
        }

        if (attempt < maxRetries) {
          const delay = Math.min(1000 * Math.pow(2, attempt - 1), 10000);
          this.logger.warn(
            `Attempt ${attempt}/${maxRetries} failed for ${from}→${to}: ${error.message}. Retrying in ${delay}ms...`,
          );
          await new Promise((resolve) => setTimeout(resolve, delay));
        }
      }
    }

    this.logger.error(
      `All ${maxRetries} attempts failed for ${from}→${to}. Last error: ${lastError?.message}`,
    );
    throw lastError;
  }

  async getBatchRates(
    fromCurrencies: string[],
    toCurrency: string,
    date?: Date,
  ): Promise<Record<string, number>> {
    const rates: Record<string, number> = {};
    const uniqueCurrencies = [...new Set(fromCurrencies)];

    await Promise.all(
      uniqueCurrencies.map(async (fromCurrency) => {
        const rate = await this.getExchangeRate(fromCurrency, toCurrency, date);
        if (rate !== null) {
          rates[fromCurrency] = rate;
        } else {
          this.logger.error(
            `CRITICAL: Failed to get rate for ${fromCurrency}->${toCurrency}, skipping conversion!`,
          );
        }
      }),
    );

    this.logger.log(`Batch rates result: ${JSON.stringify(rates)}`);
    return rates;
  }
}
