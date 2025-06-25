import type { Request, Response, NextFunction } from "express";
import Project, { IProject } from "../models/Project";

//Add property to Req param
declare global {
  namespace Express {
    interface Request {
      project: IProject;
    }
  }
}

export async function validateProjectExists(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const { projectId } = req.params;
    const project = await Project.findById(projectId);

    if (!project) {
      const error = new Error("Proyecto no encontrado");
      return res.status(404).json({ error: error.message });
    }

    //pass Project data to controller
    req.project = project;
    next();
  } catch (error) {
    res.status(500).json({ error: "Hubo error" });
  }
}

// Middleware to check if the user is authorized to perform actions on the project
export async function hasAuthorization(
  req: Request,
  res: Response,
  next: NextFunction
) {
  if (req.user.id.toString() !== req.project.manager.toString()) {
    const error = new Error(
      "No autorizado, no eres el administrador del proyecto"
    );
    return res.status(403).json({ error: error.message });
  }

  next();
}
