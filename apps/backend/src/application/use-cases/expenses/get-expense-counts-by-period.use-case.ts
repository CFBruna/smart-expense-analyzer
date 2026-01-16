import { Injectable, Inject } from '@nestjs/common';
import {
  IExpenseRepository,
  EXPENSE_REPOSITORY,
} from '../../../domain/repositories/expense.repository.interface';

export interface PeriodCounts {
  today: number;
  thisWeek: number;
  thisMonth: number;
  thisYear: number;
  allTime: number;
}

@Injectable()
export class GetExpenseCountsByPeriodUseCase {
  constructor(
    @Inject(EXPENSE_REPOSITORY)
    private readonly expenseRepository: IExpenseRepository,
  ) {}

  async execute(userId: string): Promise<PeriodCounts> {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

    const todayStart = today;
    const todayEnd = new Date(today.getTime() + 86400000 - 1);

    const weekStart = new Date(today);
    weekStart.setDate(today.getDate() - today.getDay());

    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);

    const yearStart = new Date(now.getFullYear(), 0, 1);

    const [todayCount, weekCount, monthCount, yearCount, allCount] = await Promise.all([
      this.expenseRepository.count(userId, { startDate: todayStart, endDate: todayEnd }),
      this.expenseRepository.count(userId, { startDate: weekStart, endDate: now }),
      this.expenseRepository.count(userId, { startDate: monthStart, endDate: now }),
      this.expenseRepository.count(userId, { startDate: yearStart, endDate: now }),
      this.expenseRepository.count(userId, {}),
    ]);

    return {
      today: todayCount,
      thisWeek: weekCount,
      thisMonth: monthCount,
      thisYear: yearCount,
      allTime: allCount,
    };
  }
}
