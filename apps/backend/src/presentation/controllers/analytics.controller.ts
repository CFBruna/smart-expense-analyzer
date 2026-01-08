import { Controller, Get, Query, UseGuards, Request } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { GetAnalyticsUseCase } from '../../application/use-cases/expenses/get-analytics.use-case';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';

enum TimePeriod {
  WEEK = 'week',
  MONTH = 'month',
  YEAR = 'year',
}

@ApiTags('Analytics')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('analytics')
export class AnalyticsController {
  constructor(private readonly getAnalyticsUseCase: GetAnalyticsUseCase) {}

  @Get('summary')
  @ApiOperation({ summary: 'Get expense analytics summary' })
  @ApiQuery({ name: 'period', enum: TimePeriod, required: false })
  @ApiQuery({ name: 'startDate', required: false, type: String })
  @ApiQuery({ name: 'endDate', required: false, type: String })
  @ApiResponse({ status: 200, description: 'Analytics data' })
  async getSummary(
    @Request() req: any,
    @Query('period') period?: TimePeriod,
    @Query('startDate') startDateStr?: string,
    @Query('endDate') endDateStr?: string,
  ) {
    let startDate: Date | undefined;
    let endDate: Date | undefined;

    if (startDateStr || endDateStr) {
      startDate = startDateStr ? new Date(startDateStr) : undefined;
      endDate = endDateStr ? new Date(endDateStr) : undefined;
    } else if (period) {
      const range = this.calculateDateRange(period);
      startDate = range.startDate;
      endDate = range.endDate;
    }

    return this.getAnalyticsUseCase.execute({
      userId: req.user.id,
      startDate,
      endDate,
    });
  }

  private calculateDateRange(period: TimePeriod): { startDate?: Date; endDate?: Date } {
    const now = new Date();
    const endDate = now;
    let startDate: Date;

    switch (period) {
      case TimePeriod.WEEK:
        startDate = new Date(now);
        startDate.setDate(now.getDate() - 7);
        break;
      case TimePeriod.MONTH:
        startDate = new Date(now);
        startDate.setMonth(now.getMonth() - 1);
        break;
      case TimePeriod.YEAR:
        startDate = new Date(now);
        startDate.setFullYear(now.getFullYear() - 1);
        break;
    }

    return { startDate, endDate };
  }
}
