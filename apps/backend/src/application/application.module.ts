import { Module } from '@nestjs/common';
import { InfrastructureModule } from '../infrastructure/infrastructure.module';
import { RegisterUserUseCase } from './use-cases/auth/register-user.use-case';
import { AuthenticateUserUseCase } from './use-cases/auth/authenticate-user.use-case';
import { CreateExpenseUseCase } from './use-cases/expenses/create-expense.use-case';
import { ListExpensesUseCase } from './use-cases/expenses/list-expenses.use-case';
import { GetAnalyticsUseCase } from './use-cases/expenses/get-analytics.use-case';
import { GetExpenseByIdUseCase } from './use-cases/expenses/get-expense-by-id.use-case';
import { DeleteExpenseUseCase } from './use-cases/expenses/delete-expense.use-case';

@Module({
  imports: [InfrastructureModule],
  providers: [
    RegisterUserUseCase,
    AuthenticateUserUseCase,
    CreateExpenseUseCase,
    ListExpensesUseCase,
    GetAnalyticsUseCase,
    GetExpenseByIdUseCase,
    DeleteExpenseUseCase,
  ],
  exports: [
    RegisterUserUseCase,
    AuthenticateUserUseCase,
    CreateExpenseUseCase,
    ListExpensesUseCase,
    GetAnalyticsUseCase,
    GetExpenseByIdUseCase,
    DeleteExpenseUseCase,
  ],
})
export class ApplicationModule {}
