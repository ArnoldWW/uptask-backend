import mongoose, { Schema, Document, Types } from "mongoose";

const taksStatus = {
  PENDING: "pending",
  ON_HOLD: "onHold",
  IN_PROGRESS: "inProgress",
  UNDER_REVIEW: "underReview",
  COMPLETED: "completed"
} as const;

export type TaskStatus = (typeof taksStatus)[keyof typeof taksStatus];

export interface ITask extends Document {
  name: string;
  description: string;
  project: Types.ObjectId;
  status: TaskStatus;
}

export const TaskSchema: Schema = new Schema(
  {
    name: {
      type: String,
      trim: true,
      require: true
    },
    description: {
      type: String,
      trim: true,
      require: true
    },
    project: {
      type: Types.ObjectId,
      ref: "Project"
    },
    status: {
      type: String,
      enum: Object.values(taksStatus),
      default: taksStatus.PENDING
    }
  },
  { timestamps: true }
);

const Task = mongoose.model<ITask>("Task", TaskSchema);
export default Task;
