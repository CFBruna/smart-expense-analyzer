import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Expense } from '../../../../domain/entities/expense.entity';
import { Category } from '../../../../domain/value-objects/category.vo';
import {
  IExpenseRepository,
  ExpenseFilters,
  PaginationOptions,
} from '../../../../domain/repositories/expense.repository.interface';
import { ExpenseSchema, ExpenseDocument } from '../schemas/expense.schema';

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

  async findById(id: string, userId: string): Promise<Expense | null> {
    if (!Types.ObjectId.isValid(id) || !Types.ObjectId.isValid(userId)) {
      return null;
    }

    const expense = await this.expenseModel
      .findOne({
        _id: new Types.ObjectId(id),
        userId: new Types.ObjectId(userId),
      })
      .exec();

    return expense ? this.toDomain(expense) : null;
  }

  async findByUserId(
    userId: string,
    filters?: ExpenseFilters,
    pagination?: PaginationOptions,
  ): Promise<{ expenses: Expense[]; total: number }> {
    if (!Types.ObjectId.isValid(userId)) {
      return { expenses: [], total: 0 };
    }

    const query: any = { userId: new Types.ObjectId(userId) };

    if (filters?.startDate || filters?.endDate) {
      query.date = {};
      if (filters.startDate) query.date.$gte = filters.startDate;
      if (filters.endDate) query.date.$lte = filters.endDate;
    }

    if (filters?.category) {
      query['category.primary'] = filters.category;
    }

    if (filters?.minAmount !== undefined || filters?.maxAmount !== undefined) {
      query.amount = {};
      if (filters.minAmount !== undefined) query.amount.$gte = filters.minAmount;
      if (filters.maxAmount !== undefined) query.amount.$lte = filters.maxAmount;
    }

    const page = pagination?.page || 1;
    const limit = pagination?.limit || 20;
    const skip = (page - 1) * limit;

    const [expenses, total] = await Promise.all([
      this.expenseModel.find(query).sort({ date: -1 }).skip(skip).limit(limit).exec(),
      this.expenseModel.countDocuments(query).exec(),
    ]);

    return {
      expenses: expenses.map((e) => this.toDomain(e)),
      total,
    };
  }

  async update(id: string, userId: string, expense: Partial<Expense>): Promise<Expense> {
    if (!Types.ObjectId.isValid(id) || !Types.ObjectId.isValid(userId)) {
      throw new Error('Invalid ID');
    }

    const updateData: any = {};
    if (expense.description) updateData.description = expense.description;
    if (expense.amount) updateData.amount = expense.amount;
    if (expense.date) updateData.date = expense.date;
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
      .findOneAndUpdate(
        { _id: new Types.ObjectId(id), userId: new Types.ObjectId(userId) },
        { $set: updateData },
        { new: true },
      )
      .exec();

    if (!updated) {
      throw new Error('Expense not found');
    }

    return this.toDomain(updated);
  }

  async delete(id: string, userId: string): Promise<boolean> {
    if (!Types.ObjectId.isValid(id) || !Types.ObjectId.isValid(userId)) {
      return false;
    }

    const result = await this.expenseModel
      .deleteOne({
        _id: new Types.ObjectId(id),
        userId: new Types.ObjectId(userId),
      })
      .exec();

    return result.deletedCount > 0;
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

  async getCategoryBreakdown(
    userId: string,
    startDate?: Date,
    endDate?: Date,
  ): Promise<{ category: string; total: number; count: number }[]> {
    if (!Types.ObjectId.isValid(userId)) {
      return [];
    }

    const match: any = { userId: new Types.ObjectId(userId) };
    if (startDate || endDate) {
      match.date = {};
      if (startDate) match.date.$gte = startDate;
      if (endDate) match.date.$lte = endDate;
    }

    const result = await this.expenseModel
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
      .exec();

    return result;
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
      expenseDoc.createdAt || new Date(),
      expenseDoc.updatedAt || new Date(),
    );
  }
}
