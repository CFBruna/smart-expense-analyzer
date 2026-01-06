import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ApplicationModule } from './application/application.module';
import { InfrastructureModule } from './infrastructure/infrastructure.module';
import { AuthController } from './presentation/controllers/auth.controller';
import { ExpensesController } from './presentation/controllers/expenses.controller';
import { AnalyticsController } from './presentation/controllers/analytics.controller';
import { CategoriesController } from './presentation/controllers/categories.controller';
import { JwtAuthGuard } from './presentation/guards/jwt-auth.guard';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    InfrastructureModule,
    ApplicationModule,
  ],
  controllers: [AuthController, ExpensesController, AnalyticsController, CategoriesController],
  providers: [JwtAuthGuard],
})
export class AppModule {}
