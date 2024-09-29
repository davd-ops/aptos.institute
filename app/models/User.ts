import mongoose, { Schema, model, models, Document } from "mongoose";

interface IUser extends Document {
  address: string;
  userName: string;
  coursesUnlocked: string[];
  coursesCompleted: string[];
  balance: number;
  twitter: string;
  github: string;
  website: string;
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
  coursesUnlocked: {
    type: [String],
    default: ["course_1"],
  },
  coursesCompleted: {
    type: [String],
    default: [],
  },
  balance: {
    type: Number,
    default: 0,
  },
  twitter: {
    type: String,
    default: "",
  },
  github: {
    type: String,
    default: "",
  },
  website: {
    type: String,
    default: "",
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

export const User = models.User || model<IUser>("User", userSchema);
