import type { Request, Response, NextFunction } from "express";
import Task, { ITask } from "../models/Task";

//Add property to Req param
declare global {
  namespace Express {
    interface Request {
      task: ITask;
    }
  }
}

export async function taskExists(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const { taskId } = req.params;
    const task = await Task.findById(taskId);

    if (!task) {
      const error = new Error("Tarea no encontrada");
      return res.status(404).json({ error: error.message });
    }

    //pass task data to controller
    req.task = task;
    next();
  } catch (error) {
    res.status(500).json({ error: "Hubo error" });
  }
}

export async function taskBelongToProject(
  req: Request,
  res: Response,
  next: NextFunction
) {
  if (req.task.project.toString() !== req.project.id.toString()) {
    const error = new Error("Acción no válida");
    return res.status(400).json({ error: error.message });
  }

  next();
}
