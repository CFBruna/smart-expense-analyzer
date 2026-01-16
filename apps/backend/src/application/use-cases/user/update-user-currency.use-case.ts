import { Injectable, Inject, NotFoundException } from '@nestjs/common';
import {
  IUserRepository,
  USER_REPOSITORY,
} from '../../../domain/repositories/user.repository.interface';
import {
  IExpenseRepository,
  EXPENSE_REPOSITORY,
} from '../../../domain/repositories/expense.repository.interface';
import { User } from '../../../domain/entities/user.entity';
import { Expense } from '../../../domain/entities/expense.entity';
import { ExchangeRateService } from '../../../infrastructure/services/exchange-rate.service';

interface UpdateUserCurrencyRequest {
  userId: string;
  newCurrency: string;
}

@Injectable()
export class UpdateUserCurrencyUseCase {
  constructor(
    @Inject(USER_REPOSITORY)
    private readonly userRepository: IUserRepository,
    @Inject(EXPENSE_REPOSITORY)
    private readonly expenseRepository: IExpenseRepository,
    private readonly exchangeRateService: ExchangeRateService,
  ) {}

  async execute(request: UpdateUserCurrencyRequest): Promise<User> {
    const user = await this.userRepository.findById(request.userId);
    if (!user) {
      throw new NotFoundException('User not found');
    }

    const updatedUser = await this.userRepository.update(request.userId, {
      currency: request.newCurrency,
    });

    const result = await this.expenseRepository.findByUserId(request.userId, 1, 10000);
    const expenses = result.data;
    console.log(`[UpdateCurrency] Found ${expenses.length} expenses for user ${request.userId}`);

    for (const expense of expenses) {
      console.log(
        `Processing expense ${expense.id}: origCurr=${expense.originalCurrency}, newCurr=${request.newCurrency}`,
      );

      if (expense.originalCurrency === request.newCurrency) {
        console.log(`Restoring original amount for expense ${expense.id}`);
        const updatedExpense = new Expense(
          expense.id,
          expense.userId,
          expense.description,
          expense.originalAmount,
          expense.date,
          expense.category,
          expense.originalAmount,
          expense.originalCurrency,
          expense.createdAt,
          new Date(),
        );
        await this.expenseRepository.update(updatedExpense);
        continue;
      }

      const newAmount = await this.exchangeRateService.convertAmount(
        expense.originalAmount,
        expense.originalCurrency,
        request.newCurrency,
        expense.date,
      );
      const updatedExpense = new Expense(
        expense.id,
        expense.userId,
        expense.description,
        newAmount,
        expense.date,
        expense.category,
        expense.originalAmount,
        expense.originalCurrency,
        expense.createdAt,
        new Date(),
      );

      await this.expenseRepository.update(updatedExpense);
    }

    return updatedUser!;
  }
}
