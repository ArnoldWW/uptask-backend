import type { Request, Response } from "express";
import Project from "../models/Project";

export class ProjectController {
  static createProject = async (req: Request, res: Response) => {
    const project = new Project(req.body);

    // Assign the creator of the project
    project.manager = req.user?.id;

    try {
      await project.save();
      return res.send("Proyecto creado");
    } catch (error) {
      console.log(error);
    }
  };

  static getAllProjects = async (req: Request, res: Response) => {
    try {
      // Fetch all projects from the database by user ID
      const projects = await Project.find({
        $or: [{ manager: req.user?.id }]
      });

      //const projects = await Project.find({ manager: req.user?.id });

      return res.json(projects);
    } catch (error) {
      console.log(error);
    }
  };

  static getProjectByID = async (req: Request, res: Response) => {
    const { id } = req.params;

    try {
      const project = await Project.findById(id).populate("tasks");

      if (!project) {
        const error = new Error("Proyecto no encontrado");
        return res.status(404).json({ error: error.message });
      }

      // Check if the project belongs to the user
      if (project.manager.toString() !== req.user?.id.toString()) {
        const error = new Error("Accion no valida");
        return res.status(403).json({ error: error.message });
      }

      res.json(project);
    } catch (error) {
      console.log(error);
    }
  };

  static updateProject = async (req: Request, res: Response) => {
    const { id } = req.params;

    try {
      const project = await Project.findById(id);

      if (!project) {
        const error = new Error("Proyecto no encontrado");
        return res.status(404).json({ error: error.message });
      }

      // Check if the project belongs to the user
      if (project.manager.toString() !== req.user?.id.toString()) {
        const error = new Error("Solo el creador puede editar el proyecto");
        return res.status(403).json({ error: error.message });
      }

      project.clientName = req.body.clientName;
      project.projectName = req.body.projectName;
      project.description = req.body.description;

      await project.save();
      res.send("Proyecto actualizado");
    } catch (error) {
      console.log(error);
    }
  };

  static deleteProject = async (req: Request, res: Response) => {
    const { id } = req.params;

    try {
      const project = await Project.findById(id);

      if (!project) {
        const error = new Error("Proyecto no encontrado");
        return res.status(404).json({ error: error.message });
      }

      // Check if the project belongs to the user
      if (project.manager.toString() !== req.user?.id.toString()) {
        const error = new Error("Solo el creador puede eliminar el proyecto");
        return res.status(403).json({ error: error.message });
      }

      await project.deleteOne();
      res.send("Proyecto eliminado");
    } catch (error) {
      console.log(error);
    }
  };
}
