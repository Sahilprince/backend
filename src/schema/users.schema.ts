import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { now, Document } from 'mongoose';

export type UserDocument = Users & Document;

@Schema({ timestamps: true, collection: 'users' })
export class Users {
    @Prop()
    name: String;

    @Prop()
    email: string;

    @Prop()
    password: String;

    @Prop({ default: '' })
    token: String;
}
export const userSchema = SchemaFactory.createForClass(Users);
