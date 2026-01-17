import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type UserDocument = UserSchema &
  Document & {
    createdAt: Date;
    updatedAt: Date;
  };

@Schema({ collection: 'users', timestamps: true })
export class UserSchema {
  @Prop({ required: true, unique: true, lowercase: true, trim: true })
  email!: string;

  @Prop({ required: true })
  passwordHash!: string;

  @Prop({ required: true, minlength: 2, maxlength: 100 })
  name!: string;

  @Prop({ required: true, default: 'BRL', minlength: 3, maxlength: 3 })
  currency!: string;

  @Prop({ required: true, default: 'pt', minlength: 2, maxlength: 2 })
  language!: string;
}

export const UserMongooseSchema = SchemaFactory.createForClass(UserSchema);

UserMongooseSchema.index({ email: 1 });
