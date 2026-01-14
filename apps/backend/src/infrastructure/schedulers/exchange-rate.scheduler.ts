import { Injectable, Logger } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { ExchangeRateService } from '../services/exchange-rate.service';

@Injectable()
export class ExchangeRateScheduler {
  private readonly logger = new Logger(ExchangeRateScheduler.name);

  private readonly BASE_CURRENCIES = ['BRL', 'USD', 'EUR', 'PYG'];
  private readonly TARGET_CURRENCIES = ['BRL', 'USD', 'EUR', 'PYG', 'ARS', 'JPY', 'GBP'];

  constructor(private readonly exchangeRateService: ExchangeRateService) {}

  @Cron('0 6,18 * * *')
  async prefetchAllRates() {
    const startTime = Date.now();
    this.logger.log('Starting scheduled exchange rate prefetch...');

    try {
      let successCount = 0;
      let failureCount = 0;
      let retryCount = 0;
      const failedPairs: string[] = [];
      const slowPairs: Array<{ pair: string; duration: number }> = [];

      for (const from of this.BASE_CURRENCIES) {
        for (const to of this.TARGET_CURRENCIES) {
          if (from === to) continue;

          const pairStartTime = Date.now();
          try {
            this.logger.log(`Attempting to fetch ${from}→${to}...`);
            const rate = await this.exchangeRateService.getExchangeRate(from, to);
            const duration = Date.now() - pairStartTime;

            if (rate !== null) {
              successCount++;
              this.logger.log(`✓ Successfully cached ${from}→${to}: ${rate}`);

              if (duration > 3000) {
                slowPairs.push({ pair: `${from}→${to}`, duration });
              }
            } else {
              failureCount++;
              failedPairs.push(`${from}→${to}`);
              this.logger.error(`✗ Rate is NULL for ${from}→${to}`);
            }
          } catch (error: any) {
            failureCount++;
            failedPairs.push(`${from}→${to}`);
            retryCount++;
            this.logger.error(`✗ Exception fetching ${from}→${to}: ${error.message}`, error.stack);
          }
        }
      }

      const totalDuration = Date.now() - startTime;
      const totalPairs =
        this.BASE_CURRENCIES.length * this.TARGET_CURRENCIES.length - this.BASE_CURRENCIES.length;

      this.logger.log('========================================');
      this.logger.log('EXCHANGE RATE PREFETCH HEALTH METRICS');
      this.logger.log('========================================');
      this.logger.log(`Total Duration: ${(totalDuration / 1000).toFixed(2)}s`);
      this.logger.log(`Total Pairs Attempted: ${totalPairs}`);
      this.logger.log(
        `✓ Successful: ${successCount} (${((successCount / totalPairs) * 100).toFixed(1)}%)`,
      );
      this.logger.log(
        `✗ Failed: ${failureCount} (${((failureCount / totalPairs) * 100).toFixed(1)}%)`,
      );
      this.logger.log(`🔄 Retries Needed: ${retryCount}`);

      if (slowPairs.length > 0) {
        this.logger.warn(`⚠️  Slow Responses (>3s): ${slowPairs.length}`);
        slowPairs.forEach(({ pair, duration }) => {
          this.logger.warn(`   ${pair}: ${(duration / 1000).toFixed(2)}s`);
        });
      }

      if (failedPairs.length > 0) {
        this.logger.error(`❌ Failed Pairs: ${failedPairs.join(', ')}`);
      }
      const successRate = (successCount / totalPairs) * 100;
      if (successRate < 80) {
        this.logger.error(
          `🚨 CRITICAL: Success rate is ${successRate.toFixed(1)}% (< 80%). API may be unstable!`,
        );
      } else if (successRate === 100) {
        this.logger.log(`🎉 PERFECT: 100% success rate!`);
      }

      this.logger.log('========================================');

      if (failureCount > 0 && successCount === 0) {
        this.logger.error('CRITICAL: All exchange rate fetches failed! API may be down.');
      }
    } catch (error: any) {
      this.logger.error(`Exchange rate scheduler failed: ${error.message}`, error.stack);
    }
  }

  async runManually() {
    this.logger.log('Manual exchange rate prefetch triggered');
    await this.prefetchAllRates();
  }
}
