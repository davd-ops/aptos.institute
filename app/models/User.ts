import mongoose, { Schema, model, models, Document } from "mongoose";

interface IUser extends Document {
  address: string;
  userName: string;
  coursesCompleted: string[];
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
  coursesCompleted: {
    type: [String],
    default: [],
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

export const User = models.User || model<IUser>("User", userSchema);
