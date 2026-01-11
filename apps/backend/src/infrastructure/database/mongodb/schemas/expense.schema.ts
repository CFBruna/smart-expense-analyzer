import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type ExpenseDocument = ExpenseSchema &
  Document & {
    createdAt: Date;
    updatedAt: Date;
  };

@Schema({ _id: false })
export class CategorySchema {
  @Prop({ required: true })
  primary!: string;

  @Prop({ default: null, type: String })
  secondary!: string | null;

  @Prop({ type: [String], default: [] })
  tags!: string[];

  @Prop({ required: true, min: 0, max: 1 })
  confidence!: number;

  @Prop()
  rationale?: string;
}

const CategorySchemaFactory = SchemaFactory.createForClass(CategorySchema);

@Schema({ collection: 'expenses', timestamps: true })
export class ExpenseSchema {
  @Prop({ type: Types.ObjectId, ref: 'UserSchema', required: true, index: true })
  userId!: Types.ObjectId;

  @Prop({ required: true, minlength: 1, maxlength: 500 })
  description!: string;

  @Prop({ required: true, min: 0.01 })
  amount!: number;

  @Prop({ required: true, min: 0.01 })
  originalAmount!: number;

  @Prop({ required: true, default: 'BRL' })
  originalCurrency!: string;

  @Prop({ required: true, type: Date, index: true })
  date!: Date;

  @Prop({ type: CategorySchemaFactory, default: null })
  category!: CategorySchema | null;
}

export const ExpenseMongooseSchema = SchemaFactory.createForClass(ExpenseSchema);

ExpenseMongooseSchema.index({ userId: 1, date: -1 });
ExpenseMongooseSchema.index({ userId: 1, 'category.primary': 1 });
