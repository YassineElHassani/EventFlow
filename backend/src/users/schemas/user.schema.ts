import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import * as bcrypt from 'bcryptjs';

export enum UserRole {
    ADMIN = 'admin',
    PARTICIPANT = 'participant',
}

export type UserDocument = User & Document;

@Schema({ timestamps: true })
export class User {
    @Prop({ required: true })
    fullName: string;

    @Prop({ required: true, unique: true }) // Email unique required
    email: string;

    @Prop({ required: true })
    password: string;

    @Prop({
        required: true,
        enum: UserRole,
        default: UserRole.PARTICIPANT // By default, everyone is a Participant
    })
    role: UserRole;
}

export const UserSchema = SchemaFactory.createForClass(User);

UserSchema.pre('save', async function (next: Function) {
    
    if (!this.isModified('password')) {
        return next();
    }

    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
});