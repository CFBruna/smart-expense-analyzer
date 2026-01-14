import { Controller, Get } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { ExchangeRateScheduler } from '../../infrastructure/schedulers/exchange-rate.scheduler';

@ApiTags('dev')
@Controller('dev')
export class DevController {
  constructor(private readonly scheduler: ExchangeRateScheduler) {}

  @Get('prefetch-rates')
  @ApiOperation({ summary: 'Manually trigger exchange rate prefetch' })
  async prefetchRates() {
    await this.scheduler.runManually();
    return { message: 'Exchange rates prefetch completed successfully' };
  }
}
