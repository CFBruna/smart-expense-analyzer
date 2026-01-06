import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type CategoryDocument = CategorySchema & Document;

@Schema({ collection: 'categories', timestamps: true })
export class CategorySchema {
  @Prop({ required: true, index: true })
  userId!: string;

  @Prop({ required: true })
  name!: string;

  @Prop({ required: true })
  color!: string;

  @Prop({ required: true })
  icon!: string;

  @Prop({ default: false })
  isDefault!: boolean;
}

export const CategorySchemaFactory = SchemaFactory.createForClass(CategorySchema);

CategorySchemaFactory.index({ userId: 1, name: 1 }, { unique: true });
CategorySchemaFactory.index({ userId: 1, isDefault: 1 });
