import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { JwtModule } from '@nestjs/jwt';
import { UserSchema, UserMongooseSchema } from './database/mongodb/schemas/user.schema';
import { ExpenseSchema, ExpenseMongooseSchema } from './database/mongodb/schemas/expense.schema';
import { CategorySchema, CategorySchemaFactory } from './database/mongodb/schemas/category.schema';
import { UserMongodbRepository } from './database/mongodb/repositories/user-mongodb.repository';
import { ExpenseMongodbRepository } from './database/mongodb/repositories/expense-mongodb.repository';
import { CategoryMongodbRepository } from './database/mongodb/repositories/category-mongodb.repository';
import { USER_REPOSITORY } from '../domain/repositories/user.repository.interface';
import { EXPENSE_REPOSITORY } from '../domain/repositories/expense.repository.interface';
import { CATEGORY_REPOSITORY } from '../domain/repositories/category.repository.interface';
import { RedisCacheService } from './cache/redis-cache.service';
import { BcryptService } from './auth/bcrypt.service';
import { JwtAuthService } from './auth/jwt-auth.service';
import { LangchainCategorizationService } from './ai/langchain-categorization.service';

@Module({
  imports: [
    MongooseModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        uri:
          configService.get<string>('MONGODB_URI') || 'mongodb://localhost:27017/expense_analyzer',
      }),
      inject: [ConfigService],
    }),
    MongooseModule.forFeature([
      { name: UserSchema.name, schema: UserMongooseSchema },
      { name: ExpenseSchema.name, schema: ExpenseMongooseSchema },
      { name: CategorySchema.name, schema: CategorySchemaFactory },
    ]),
    JwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        secret: configService.get<string>('JWT_SECRET') || 'dev-secret-change-in-production',
        signOptions: { expiresIn: '7d' },
      }),
      inject: [ConfigService],
    }),
  ],
  providers: [
    {
      provide: USER_REPOSITORY,
      useClass: UserMongodbRepository,
    },
    {
      provide: EXPENSE_REPOSITORY,
      useClass: ExpenseMongodbRepository,
    },
    {
      provide: CATEGORY_REPOSITORY,
      useClass: CategoryMongodbRepository,
    },
    RedisCacheService,
    BcryptService,
    JwtAuthService,
    LangchainCategorizationService,
  ],
  exports: [
    USER_REPOSITORY,
    EXPENSE_REPOSITORY,
    CATEGORY_REPOSITORY,
    RedisCacheService,
    BcryptService,
    JwtAuthService,
    LangchainCategorizationService,
  ],
})
export class InfrastructureModule { }
