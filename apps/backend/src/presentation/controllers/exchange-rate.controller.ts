import { Controller, Get, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiQuery, ApiResponse } from '@nestjs/swagger';
import { ExchangeRateService } from '../../infrastructure/services/exchange-rate.service';

@ApiTags('Exchange Rates')
@Controller('exchange-rates')
export class ExchangeRateController {
  constructor(private readonly exchangeRateService: ExchangeRateService) {}

  @Get()
  @ApiOperation({ summary: 'Get exchange rate between two currencies' })
  @ApiQuery({ name: 'from', required: true, example: 'BRL' })
  @ApiQuery({ name: 'to', required: true, example: 'USD' })
  @ApiQuery({ name: 'amount', required: false, type: Number, example: 100 })
  @ApiResponse({ status: 200, description: 'Exchange rate' })
  async getRate(
    @Query('from') from: string,
    @Query('to') to: string,
    @Query('amount') amount?: number,
  ) {
    const rate = await this.exchangeRateService.getExchangeRate(from, to);

    if (amount) {
      return {
        rate,
        convertedAmount: Number(amount) * rate,
      };
    }

    return { rate };
  }
}
