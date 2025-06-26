import mongoose, { Document, PopulatedDoc, Schema, Types } from "mongoose";
import { IUser } from "./User";
import Task, { ITask } from "./Task";
import Note from "./Note";

export interface IProject extends Document {
  projectName: string;
  clientName: string;
  description: string;
  tasks: PopulatedDoc<ITask & Document>[];
  manager: PopulatedDoc<IUser & Document>;
  team: PopulatedDoc<IUser & Document>[];
}

const ProjectSchema: Schema = new Schema(
  {
    projectName: {
      type: String,
      required: true,
      trim: true
    },
    clientName: {
      type: String,
      required: true,
      trim: true
    },
    description: {
      type: String,
      required: true,
      trim: true
    },
    tasks: [
      {
        type: Types.ObjectId,
        ref: "Task"
      }
    ],
    manager: {
      type: Types.ObjectId,
      ref: "User",
      required: true
    },
    team: [
      {
        type: Types.ObjectId,
        ref: "User"
      }
    ]
  },
  { timestamps: true }
);

// Middleware to delele all tasks and notes associated with a project when the project is deleted
ProjectSchema.pre("deleteOne", { document: true }, async function (next) {
  const projectId = this._id as Types.ObjectId;

  if (!projectId) return next();

  try {
    // Delete all notes associated with tasks in the project
    const tasks = await Task.find({ project: projectId });
    for (const task of tasks) {
      await Note.deleteMany({ task: task._id });
      console.log(`Deleted all notes associated with task ID: ${task._id}`);
    }

    // Delete all tasks associated with the project
    await Task.deleteMany({ project: projectId });
    console.log(`Deleted all tasks associated with project ID: ${projectId}`);
    next();
  } catch (error) {
    next(error);
  }
});

const Project = mongoose.model<IProject>("Project", ProjectSchema);
export default Project;
