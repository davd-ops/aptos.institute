import mongoose, { Schema, model, models, Document } from "mongoose";

interface IUser extends Document {
  address: string;
  userName: string;
  createdAt: Date;
}

const userSchema = new Schema<IUser>({
  address: {
    type: String,
    required: true,
    unique: true,
  },
  userName: {
    type: String,
    required: true,
    unique: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

export const User = models.User || model<IUser>("User", userSchema);
