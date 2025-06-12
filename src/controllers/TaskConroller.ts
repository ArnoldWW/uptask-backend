import express, { Request, Response } from "express";
import Task from "../models/Task";

export class TaskController {
  static createTask = async (req: Request, res: Response) => {
    try {
      const { project } = req;
      const task = new Task(req.body);
      task.project = project.id;
      project.tasks.push(task.id);
      await Promise.allSettled([task.save(), project.save()]);
      res.send("Tarea creada correctamente");
    } catch (error) {
      res.status(500).json({ error: "Hubo un error" });
    }
  };

  static getProjectTasks = async (req: Request, res: Response) => {
    try {
      const tasks = await Task.find({ project: req.project.id }).populate(
        "project"
      );

      res.json(tasks);
    } catch (error) {
      res.status(500).json({ error: "Hubo un error" });
    }
  };

  static getTaskById = async (req: Request, res: Response) => {
    try {
      const task = await Task.findById(req.task.id)
        .populate({
          path: "completedBy.user",
          select: "id name email"
        })
        .populate({
          path: "notes",
          populate: {
            path: "createdBy",
            select: "id name email"
          }
        });

      if (task.project.toString() !== req.project.id) {
        const error = new Error("Acción no válida");
        return res.status(400).json({ error: error.message });
      }

      res.json(task);
    } catch (error) {
      res.status(500).json({ error: "Hubo un error" });
    }
  };

  static updateTask = async (req: Request, res: Response) => {
    try {
      const { task } = req;

      task.name = req.body.name;
      task.description = req.body.description;
      await task.save();
      res.send("Tarea actualizada");
    } catch (error) {
      res.status(500).json({ error: "Hubo un error" });
    }
  };

  static deleteTask = async (req: Request, res: Response) => {
    try {
      const { task } = req;

      req.project.tasks = req.project.tasks.filter((currentTask) => {
        return currentTask.toString() !== task.id.toString();
      });

      await Promise.allSettled([task.deleteOne(), req.project.save()]);

      res.send("Tarea eliminada");
    } catch (error) {
      res.status(500).json({ error: "Hubo un error" });
    }
  };

  static updateStatus = async (req: Request, res: Response) => {
    try {
      const { task, user } = req;
      const { status } = req.body;

      console.log(user);

      // Add the user to the completedBy field
      task.completedBy.push({
        user: user.id,
        status: status
      });

      // Update the status field of the task
      task.status = status;

      // Save the task
      await task.save();
      res.send("Tarea actualizada");
    } catch (error) {
      console.log(error);
    }
  };
}
