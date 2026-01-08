import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type CategoryDocument = CategorySchema & Document;

@Schema({ collection: 'categories', timestamps: true })
export class CategorySchema {
  @Prop({ type: Types.ObjectId, ref: 'User', required: false })
  userId?: Types.ObjectId;

  @Prop({ required: true, minlength: 2, maxlength: 50 })
  name!: string;

  @Prop({ required: true, match: /^#[0-9A-Fa-f]{6}$/ })
  color!: string;

  @Prop({ required: true })
  icon!: string;

  @Prop({ default: false })
  isDefault!: boolean;
}

export const CategorySchemaFactory = SchemaFactory.createForClass(CategorySchema);

CategorySchemaFactory.index({ userId: 1, name: 1 }, { unique: true });
CategorySchemaFactory.index({ userId: 1, isDefault: 1 });
