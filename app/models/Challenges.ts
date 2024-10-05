import { Schema, Document, model, models } from "mongoose";

interface IChallenge extends Document {
  courseId: string;
  challengeId: string;
  defaultCode: string;
  correctCode: string;
  explanation: string;
  task: string;
  name: string;
}

const challengeSchema = new Schema<IChallenge>({
  courseId: {
    type: String,
    required: true,
  },
  challengeId: {
    type: String,
    required: true,
  },
  defaultCode: {
    type: String,
    required: true,
  },
  correctCode: {
    type: String,
    required: true,
  },
  explanation: {
    type: String,
    required: true,
  },
  task: {
    type: String,
    required: true,
  },
  name: {
    type: String,
    required: true,
  },
});

export const Challenge =
  models.Challenge || model<IChallenge>("Challenge", challengeSchema);
