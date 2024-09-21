import mongoose, { Schema, Document, model, models } from "mongoose";

interface IProgress extends Document {
  address: string;
  courseId: string;
  challengeId: string;
  attempts: number;
  completed: boolean;
  hintsUsed: number;
}

const progressSchema = new Schema<IProgress>({
  address: {
    type: String,
    required: true,
  },
  courseId: {
    type: String,
    required: true,
  },
  challengeId: {
    type: String,
    required: true,
  },
  attempts: {
    type: Number,
    default: 0,
  },
  completed: {
    type: Boolean,
    default: false,
  },
  hintsUsed: {
    type: Number,
    default: 0,
  },
});

export const Progress =
  models.Progress || model<IProgress>("Progress", progressSchema);
