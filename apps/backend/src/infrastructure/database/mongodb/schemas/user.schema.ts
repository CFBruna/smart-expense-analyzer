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
}

export const UserMongooseSchema = SchemaFactory.createForClass(UserSchema);

// Create index for email lookup
UserMongooseSchema.index({ email: 1 });
