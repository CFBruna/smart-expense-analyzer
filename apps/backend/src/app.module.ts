import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ScheduleModule } from '@nestjs/schedule';
import { ApplicationModule } from './application/application.module';
import { InfrastructureModule } from './infrastructure/infrastructure.module';
import { AuthController } from './presentation/controllers/auth.controller';
import { ExpensesController } from './presentation/controllers/expenses.controller';
import { AnalyticsController } from './presentation/controllers/analytics.controller';
import { CategoriesController } from './presentation/controllers/categories.controller';
import { ExchangeRateController } from './presentation/controllers/exchange-rate.controller';
import { UserController } from './presentation/controllers/user.controller';
import { DevController } from './presentation/controllers/dev.controller';
import { JwtAuthGuard } from './presentation/guards/jwt-auth.guard';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    ScheduleModule.forRoot(),
    InfrastructureModule,
    ApplicationModule,
  ],
  controllers: [
    AuthController,
    ExpensesController,
    AnalyticsController,
    CategoriesController,
    ExchangeRateController,
    UserController,
    DevController,
  ],
  providers: [JwtAuthGuard],
})
export class AppModule {}
