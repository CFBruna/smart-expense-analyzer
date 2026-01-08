import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import * as bcrypt from 'bcryptjs';
import { UserDocument, UserSchema } from './mongodb/schemas/user.schema';
import { CategoryDocument, CategorySchema } from './mongodb/schemas/category.schema';

@Injectable()
export class SeedService implements OnModuleInit {
  private readonly logger = new Logger(SeedService.name);

  constructor(
    @InjectModel(UserSchema.name)
    private readonly userModel: Model<UserDocument>,
    @InjectModel(CategorySchema.name)
    private readonly categoryModel: Model<CategoryDocument>,
  ) {}

  async onModuleInit() {
    await this.seedDemoUser();
    await this.seedTestUser();
    await this.seedDefaultCategories();
  }

  private async seedDemoUser() {
    const demoEmail = 'demo@expense.com';
    const demoPassword = 'ExpenseDemo2026!';
    const demoName = 'Demo User';

    try {
      const existingUser = await this.userModel.findOne({ email: demoEmail }).exec();

      if (existingUser) {
        this.logger.log('SEED: Demo user already exists');
        return;
      }

      const passwordHash = await bcrypt.hash(demoPassword, 10);

      await this.userModel.create({
        email: demoEmail,
        passwordHash,
        name: demoName,
      });

      this.logger.log('SEED: Demo user created successfully');
    } catch (error) {
      this.logger.error('SEED: Failed to create demo user', error);
    }
  }

  private async seedTestUser() {
    const testEmail = 'test@expense.com';
    const testPassword = 'TestUser2026!';
    const testName = 'Test User';

    try {
      const existingUser = await this.userModel.findOne({ email: testEmail }).exec();

      if (existingUser) {
        this.logger.log('SEED: Test user already exists');
        return;
      }

      const passwordHash = await bcrypt.hash(testPassword, 10);

      await this.userModel.create({
        email: testEmail,
        passwordHash,
        name: testName,
      });

      this.logger.log('SEED: Test user created successfully');
    } catch (error) {
      this.logger.error('SEED: Failed to create test user', error);
    }
  }

  private async seedDefaultCategories() {
    const defaultCategories = [
      { name: 'Food', color: '#10B981', icon: '🍔', isDefault: true },
      { name: 'Transportation', color: '#3B82F6', icon: '🚗', isDefault: true },
      { name: 'Healthcare', color: '#EF4444', icon: '💊', isDefault: true },
      { name: 'Entertainment', color: '#8B5CF6', icon: '🎬', isDefault: true },
      { name: 'Shopping', color: '#F59E0B', icon: '🛍️', isDefault: true },
      { name: 'Bills', color: '#6366F1', icon: '📄', isDefault: true },
      { name: 'Education', color: '#14B8A6', icon: '📚', isDefault: true },
      { name: 'Other', color: '#6B7280', icon: '📌', isDefault: true },
    ];

    try {
      const existingCount = await this.categoryModel.countDocuments({ isDefault: true }).exec();

      if (existingCount > 0) {
        this.logger.log('SEED: Default categories already exist');
        return;
      }

      await this.categoryModel.insertMany(defaultCategories);
      this.logger.log('SEED: Default categories created successfully');
    } catch (error) {
      this.logger.error('SEED: Failed to create default categories', error);
    }
  }
}
