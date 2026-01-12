import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Expense } from '../../../../domain/entities/expense.entity';
import { IExpenseRepository } from '../../../../domain/repositories/expense.repository.interface';
import { ExpenseSchema, ExpenseDocument } from '../schemas/expense.schema';
import { Category } from '../../../../domain/value-objects/category.vo';

@Injectable()
export class ExpenseMongodbRepository implements IExpenseRepository {
  constructor(
    @InjectModel(ExpenseSchema.name)
    private readonly expenseModel: Model<ExpenseDocument>,
  ) {}

  async create(expense: Expense): Promise<Expense> {
    const expenseDoc = new this.expenseModel({
      userId: new Types.ObjectId(expense.userId),
      description: expense.description,
      amount: expense.amount,
      originalAmount: expense.originalAmount,
      originalCurrency: expense.originalCurrency,
      date: expense.date,
      category: expense.category
        ? {
            primary: expense.category.primary,
            secondary: expense.category.secondary,
            tags: expense.category.tags,
            confidence: expense.category.confidence,
            rationale: expense.category.rationale,
          }
        : null,
    });

    const saved = await expenseDoc.save();
    return this.toDomain(saved);
  }

  async findById(id: string): Promise<Expense | null> {
    if (!Types.ObjectId.isValid(id)) {
      return null;
    }

    const expense = await this.expenseModel.findOne({ _id: new Types.ObjectId(id) }).exec();

    return expense ? this.toDomain(expense) : null;
  }

  async findByUserId(
    userId: string,
    page?: number,
    limit?: number,
    sortOrder?: 'asc' | 'desc',
  ): Promise<{ data: Expense[]; total: number }> {
    if (!Types.ObjectId.isValid(userId)) {
      return { data: [], total: 0 };
    }

    const query: any = { userId: new Types.ObjectId(userId) };
    const pageNum = page || 1;
    const limitNum = limit || 20;
    const skip = (pageNum - 1) * limitNum;
    const sortVal = sortOrder === 'asc' ? 1 : -1;

    const [expenses, total] = await Promise.all([
      this.expenseModel.find(query).sort({ date: sortVal }).skip(skip).limit(limitNum).exec(),
      this.expenseModel.countDocuments(query).exec(),
    ]);

    return {
      data: expenses.map((e) => this.toDomain(e)),
      total,
    };
  }

  async update(expense: Expense): Promise<Expense> {
    if (!expense.id || !Types.ObjectId.isValid(expense.id)) {
      throw new Error('Invalid ID');
    }

    const updateData: any = {
      description: expense.description,
      amount: expense.amount,
      originalAmount: expense.originalAmount,
      originalCurrency: expense.originalCurrency,
      date: expense.date,
      updatedAt: expense.updatedAt,
    };

    if (expense.category) {
      updateData.category = {
        primary: expense.category.primary,
        secondary: expense.category.secondary,
        tags: expense.category.tags,
        confidence: expense.category.confidence,
        rationale: expense.category.rationale,
      };
    }

    const updated = await this.expenseModel
      .findByIdAndUpdate(new Types.ObjectId(expense.id), { $set: updateData }, { new: true })
      .exec();

    if (!updated) {
      throw new Error('Expense not found');
    }

    return this.toDomain(updated);
  }

  async delete(id: string): Promise<void> {
    if (!Types.ObjectId.isValid(id)) {
      throw new Error('Invalid ID');
    }

    const result = await this.expenseModel.deleteOne({ _id: new Types.ObjectId(id) }).exec();

    if (result.deletedCount === 0) {
      throw new Error('Expense not found');
    }
  }

  async getMonthlyTotal(userId: string, month: number, year: number): Promise<number> {
    if (!Types.ObjectId.isValid(userId)) {
      return 0;
    }

    const startDate = new Date(year, month - 1, 1);
    const endDate = new Date(year, month, 0, 23, 59, 59);

    const result = await this.expenseModel
      .aggregate([
        {
          $match: {
            userId: new Types.ObjectId(userId),
            date: { $gte: startDate, $lte: endDate },
          },
        },
        {
          $group: {
            _id: null,
            total: { $sum: '$amount' },
          },
        },
      ])
      .exec();

    return result.length > 0 ? result[0].total : 0;
  }

  async findByUserIdAndDateRange(
    userId: string,
    startDate?: Date,
    endDate?: Date,
    sortOrder: 'asc' | 'desc' = 'desc',
    page: number = 1,
    limit: number = 20,
  ): Promise<{ data: Expense[]; total: number }> {
    if (!Types.ObjectId.isValid(userId)) {
      return { data: [], total: 0 };
    }

    const query: any = { userId: new Types.ObjectId(userId) };

    if (startDate || endDate) {
      query.date = {};
      if (startDate) query.date.$gte = startDate;
      if (endDate) query.date.$lte = endDate;
    }

    const [expenses, total] = await Promise.all([
      this.expenseModel
        .find(query)
        .sort({ date: sortOrder === 'asc' ? 1 : -1 })
        .skip((page - 1) * limit)
        .limit(limit)
        .exec(),
      this.expenseModel.countDocuments(query),
    ]);

    return {
      data: expenses.map((e) => this.toDomain(e)),
      total,
    };
  }

  async getDistinctCurrencies(userId: string): Promise<string[]> {
    if (!Types.ObjectId.isValid(userId)) {
      return [];
    }

    const currencies = await this.expenseModel.distinct('originalCurrency', {
      userId: new Types.ObjectId(userId),
    });

    return currencies.filter((c) => c != null);
  }

  async getAnalyticsSummary(
    userId: string,
    startDate?: Date,
    endDate?: Date,
  ): Promise<{
    totalSpent: number;
    categoryBreakdown: {
      category: string;
      total: number;
      count: number;
      percentage: number;
    }[];
  }> {
    if (!Types.ObjectId.isValid(userId)) {
      return { totalSpent: 0, categoryBreakdown: [] };
    }

    const match: any = { userId: new Types.ObjectId(userId) };
    if (startDate || endDate) {
      match.date = {};
      if (startDate) match.date.$gte = startDate;
      if (endDate) match.date.$lte = endDate;
    }

    const [totalResult, breakdownResult] = await Promise.all([
      this.expenseModel
        .aggregate([{ $match: match }, { $group: { _id: null, total: { $sum: '$amount' } } }])
        .exec(),
      this.expenseModel
        .aggregate([
          { $match: match },
          {
            $group: {
              _id: '$category.primary',
              total: { $sum: '$amount' },
              count: { $sum: 1 },
            },
          },
          {
            $project: {
              _id: 0,
              category: '$_id',
              total: 1,
              count: 1,
            },
          },
          { $sort: { total: -1 } },
        ])
        .exec(),
    ]);

    const totalSpent = totalResult.length > 0 ? totalResult[0].total : 0;
    const categoryBreakdown = breakdownResult.map((item) => ({
      ...item,
      percentage: totalSpent > 0 ? (item.total / totalSpent) * 100 : 0,
    }));

    return { totalSpent, categoryBreakdown };
  }

  private toDomain(expenseDoc: ExpenseDocument): Expense {
    const category = expenseDoc.category
      ? new Category(
          expenseDoc.category.primary,
          expenseDoc.category.secondary,
          expenseDoc.category.tags,
          expenseDoc.category.confidence,
          expenseDoc.category.rationale,
        )
      : null;

    return new Expense(
      expenseDoc._id.toString(),
      expenseDoc.userId.toString(),
      expenseDoc.description,
      expenseDoc.amount,
      expenseDoc.date,
      category,
      expenseDoc.originalAmount || expenseDoc.amount,
      expenseDoc.originalCurrency || 'BRL',
      expenseDoc.createdAt || new Date(),
      expenseDoc.updatedAt || new Date(),
    );
  }
}
