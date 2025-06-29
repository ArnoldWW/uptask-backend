import type { Request, Response } from "express";
import Project from "../models/Project";

export class ProjectController {
  // Method to create a new project
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

  // Method to get all projects
  static getAllProjects = async (req: Request, res: Response) => {
    try {
      // Fetch all projects from the database by user ID
      const projects = await Project.find({
        $or: [{ manager: req.user?.id }, { team: req.user?.id }]
      });

      //const projects = await Project.find({ manager: req.user?.id });

      return res.json(projects);
    } catch (error) {
      console.log(error);
    }
  };

  // Method to get a project by ID
  static getProjectByID = async (req: Request, res: Response) => {
    const { id } = req.params;

    try {
      const project = await Project.findById(id).populate("tasks");

      if (!project) {
        const error = new Error("Proyecto no encontrado");
        return res.status(404).json({ error: error.message });
      }

      // Check if the project belongs to the user
      if (
        project.manager.toString() !== req.user?.id.toString() &&
        !project.team.includes(req.user?.id)
      ) {
        const error = new Error("Accion no valida");
        return res.status(403).json({ error: error.message });
      }

      res.json(project);
    } catch (error) {
      console.log(error);
    }
  };

  // Method to update a project by ID
  static updateProject = async (req: Request, res: Response) => {
    try {
      req.project.clientName = req.body.clientName;
      req.project.projectName = req.body.projectName;
      req.project.description = req.body.description;

      await req.project.save();
      res.send("Proyecto actualizado");
    } catch (error) {
      console.log(error);
    }
  };

  // Method to delete a project by ID
  static deleteProject = async (req: Request, res: Response) => {
    try {
      await req.project.deleteOne();
      res.send("Proyecto eliminado");
    } catch (error) {
      console.log(error);
    }
  };
}
