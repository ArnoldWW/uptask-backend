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

// Check if the task exists
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

// Check if the task belongs to the project
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

// Check if the user can update/delete the task
export async function hasAuthorizationForManageTask(
  req: Request,
  res: Response,
  next: NextFunction
) {
  if (req.user.id.toString() !== req.project.manager.toString()) {
    const error = new Error("No autorizado");
    return res.status(403).json({ error: error.message });
  }

  next();
}
