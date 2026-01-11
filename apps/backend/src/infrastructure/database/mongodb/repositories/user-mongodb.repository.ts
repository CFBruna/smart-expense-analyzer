import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { User } from '../../../../domain/entities/user.entity';
import { IUserRepository } from '../../../../domain/repositories/user.repository.interface';
import { UserSchema, UserDocument } from '../schemas/user.schema';

@Injectable()
export class UserMongodbRepository implements IUserRepository {
  constructor(
    @InjectModel(UserSchema.name)
    private readonly userModel: Model<UserDocument>,
  ) {}

  async create(user: User): Promise<User> {
    const userDoc = new this.userModel({
      email: user.email,
      passwordHash: user.passwordHash,
      name: user.name,
      currency: user.currency,
    });

    const saved = await userDoc.save();
    return this.toDomain(saved);
  }

  async findById(id: string): Promise<User | null> {
    if (!Types.ObjectId.isValid(id)) {
      return null;
    }

    const user = await this.userModel.findById(id).exec();
    return user ? this.toDomain(user) : null;
  }

  async findByEmail(email: string): Promise<User | null> {
    const user = await this.userModel.findOne({ email: email.toLowerCase() }).exec();
    return user ? this.toDomain(user) : null;
  }

  async exists(email: string): Promise<boolean> {
    const count = await this.userModel.countDocuments({ email: email.toLowerCase() }).exec();
    return count > 0;
  }

  async update(id: string, updates: Partial<User>): Promise<User> {
    const updatedUserDoc = await this.userModel
      .findByIdAndUpdate(id, { $set: updates }, { new: true })
      .exec();

    if (!updatedUserDoc) {
      throw new Error(`User with id ${id} not found`);
    }

    return this.toDomain(updatedUserDoc);
  }

  private toDomain(userDoc: UserDocument): User {
    return new User(
      userDoc._id.toString(),
      userDoc.email,
      userDoc.passwordHash,
      userDoc.name,
      userDoc.currency || 'BRL',
      userDoc.createdAt || new Date(),
    );
  }
}
