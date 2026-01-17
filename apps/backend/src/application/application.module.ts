import { Module } from '@nestjs/common';
import { InfrastructureModule } from '../infrastructure/infrastructure.module';
import { RegisterUserUseCase } from './use-cases/auth/register-user.use-case';
import { AuthenticateUserUseCase } from './use-cases/auth/authenticate-user.use-case';
import { CreateExpenseUseCase } from './use-cases/expenses/create-expense.use-case';
import { UpdateExpenseUseCase } from './use-cases/expenses/update-expense.use-case';
import { ListExpensesUseCase } from './use-cases/expenses/list-expenses.use-case';
import { GetAnalyticsUseCase } from './use-cases/expenses/get-analytics.use-case';
import { GetExpenseByIdUseCase } from './use-cases/expenses/get-expense-by-id.use-case';
import { DeleteExpenseUseCase } from './use-cases/expenses/delete-expense.use-case';
import { GetExpenseCountsByPeriodUseCase } from './use-cases/expenses/get-expense-counts-by-period.use-case';
import { CreateCategoryUseCase } from './use-cases/categories/create-category.use-case';
import { ListCategoriesUseCase } from './use-cases/categories/list-categories.use-case';
import { UpdateCategoryUseCase } from './use-cases/categories/update-category.use-case';
import { DeleteCategoryUseCase } from './use-cases/categories/delete-category.use-case';
import { UpdateUserCurrencyUseCase } from './use-cases/user/update-user-currency.use-case';
import { UpdateUserProfileUseCase } from './use-cases/user/update-user-profile.use-case';
import { GetUserProfileUseCase } from './use-cases/user/get-user-profile.use-case';

@Module({
  imports: [InfrastructureModule],
  providers: [
    RegisterUserUseCase,
    AuthenticateUserUseCase,
    CreateExpenseUseCase,
    UpdateExpenseUseCase,
    ListExpensesUseCase,
    GetAnalyticsUseCase,
    GetExpenseByIdUseCase,
    DeleteExpenseUseCase,
    GetExpenseCountsByPeriodUseCase,
    CreateCategoryUseCase,
    ListCategoriesUseCase,
    UpdateCategoryUseCase,
    DeleteCategoryUseCase,
    UpdateUserCurrencyUseCase,
    UpdateUserProfileUseCase,
    GetUserProfileUseCase,
    GetExpenseCountsByPeriodUseCase,
  ],
  exports: [
    RegisterUserUseCase,
    AuthenticateUserUseCase,
    CreateExpenseUseCase,
    UpdateExpenseUseCase,
    ListExpensesUseCase,
    GetAnalyticsUseCase,
    GetExpenseByIdUseCase,
    DeleteExpenseUseCase,
    CreateCategoryUseCase,
    ListCategoriesUseCase,
    UpdateCategoryUseCase,
    DeleteCategoryUseCase,
    UpdateUserCurrencyUseCase,
    UpdateUserProfileUseCase,
    GetUserProfileUseCase,
    GetExpenseCountsByPeriodUseCase,
  ],
})
export class ApplicationModule {}
