import mongoose, { Schema, Document, Types } from "mongoose";
import Note from "./Note";

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
  completedBy: {
    user: Types.ObjectId;
    status: TaskStatus;
  }[];
  notes: Types.ObjectId[];
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
    },
    completedBy: [
      {
        user: {
          type: Types.ObjectId,
          ref: "User"
        },
        status: {
          type: String,
          enum: Object.values(taksStatus),
          default: taksStatus.PENDING
        }
      }
    ],
    notes: [
      {
        type: Types.ObjectId,
        ref: "Note"
      }
    ]
  },
  { timestamps: true }
);

// Middleware to delete all notes associated with a task when the task is deleted

// 1st approach: Using deleteOne with a query
/* TaskSchema.pre("deleteOne", async function (next) {
  try {
    const taskId = this.getQuery()["_id"] as Types.ObjectId;
    const notes = await mongoose.model("Note").find({ task: taskId });

    for (const note of notes) {
      console.log(`Deleting note with ID: ${note._id}`);
      await mongoose.model("Note").deleteOne({ _id: note._id });
    }

    next();
  } catch (error) {
    next(error);
  }
}); */

// 2nd approach: Using deleteOne with document middleware
TaskSchema.pre("deleteOne", { document: true }, async function (next) {
  const taskId = this._id as Types.ObjectId;

  if (!taskId) return next();

  try {
    await Note.deleteMany({ task: taskId });
    console.log(`Deleted all notes associated with task ID: ${taskId}`);
    next();
  } catch (error) {
    next(error);
  }
});

const Task = mongoose.model<ITask>("Task", TaskSchema);
export default Task;
