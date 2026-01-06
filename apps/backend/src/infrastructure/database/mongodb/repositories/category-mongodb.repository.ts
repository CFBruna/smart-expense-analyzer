import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Category } from '../../../../domain/entities/category.entity';
import { ICategoryRepository } from '../../../../domain/repositories/category.repository.interface';
import { CategorySchema, CategoryDocument } from '../schemas/category.schema';

@Injectable()
export class CategoryMongodbRepository implements ICategoryRepository {
  constructor(
    @InjectModel(CategorySchema.name)
    private readonly categoryModel: Model<CategoryDocument>,
  ) {}

  async create(category: Category): Promise<Category> {
    const created = new this.categoryModel({
      userId: category.userId,
      name: category.name,
      color: category.color,
      icon: category.icon,
      isDefault: category.isDefault,
    });

    const saved = await created.save();
    return this.toDomain(saved);
  }

  async findById(id: string): Promise<Category | null> {
    if (!Types.ObjectId.isValid(id)) {
      return null;
    }

    const category = await this.categoryModel.findById(id).exec();
    return category ? this.toDomain(category) : null;
  }

  async findByUserId(userId: string): Promise<Category[]> {
    const categories = await this.categoryModel
      .find({ userId })
      .sort({ isDefault: -1, name: 1 })
      .exec();

    return categories.map((cat) => this.toDomain(cat));
  }

  async update(category: Category): Promise<Category> {
    const updated = await this.categoryModel
      .findByIdAndUpdate(
        category.id,
        {
          name: category.name,
          color: category.color,
          icon: category.icon,
        },
        { new: true },
      )
      .exec();

    if (!updated) {
      throw new Error('Category not found');
    }

    return this.toDomain(updated);
  }

  async delete(id: string): Promise<void> {
    await this.categoryModel.findByIdAndDelete(id).exec();
  }

  private toDomain(categoryDoc: any): Category {
    return new Category(
      categoryDoc._id.toString(),
      categoryDoc.userId,
      categoryDoc.name,
      categoryDoc.color,
      categoryDoc.icon,
      categoryDoc.isDefault,
      categoryDoc.createdAt ? new Date(categoryDoc.createdAt) : new Date(),
      categoryDoc.updatedAt ? new Date(categoryDoc.updatedAt) : new Date(),
    );
  }
}
