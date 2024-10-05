import { Schema, Document, model, models } from "mongoose";

interface ICourse extends Document {
  courseId: string;
  title: string;
  description: string;
  tags: string[];
  imageUrl: string;
  price: number;
  rewards: number;
  createdAt: Date;
}

const courseSchema = new Schema<ICourse>({
  courseId: {
    type: String,
    required: true,
    unique: true,
  },
  title: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
  tags: {
    type: [String],
    required: true,
  },
  imageUrl: {
    type: String,
    required: true,
  },
  price: {
    type: Number,
    required: true,
  },
  rewards: {
    type: Number,
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

export const Course = models.Course || model<ICourse>("Course", courseSchema);
