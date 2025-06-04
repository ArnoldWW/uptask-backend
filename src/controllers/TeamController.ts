import { Request, Response } from 'express';
import User from '../models/User';
import Project from '../models/Project';

export class TeamController { 

  // Method to get all team members of a project
  static getProjectTeam = async (req: Request, res: Response) => {
    const project = await Project.findById(req.params.projectId).populate({
      path: "team",
      select: "name email _id"
    })
    res.json(project.team);
  }

  // Method to find a team member by email 
  static findMemberByEmail = async (req: Request, res: Response) => {
    const { email } = req.body; 
    
    //Find user by email
    const user = await User.findOne({ email }).select("name email _id");
    
    if (!user) {
      return res.status(404).json({ message: "Usuario no encontrado" });
    }

    res.json(user);
  };  

  // Method to add a member to the project team
  static addMemberToTeam = async (req: Request, res: Response) => {
    const { id } = req.body;
    console.log(id);

    // Find user by ID
    const user = await User.findById(id).select("name email _id");
    if (!user) {
      return res.status(404).json({ message: "Usuario no encontrado" });
    }
    
    // Check if the user is already part of the team
    if (req.project.team.some(
      member => member.toString() === user._id.toString()
    )) {
      return res.status(400).json({ 
        message: "El usuario ya es parte del equipo"
      });
    }

    // Add user to the project team
    req.project.team.push(user._id);
    await req.project.save();
    
    res.send("Usuario agregado");
  }

  // Method to remove a member from the project team
  static removeMemberFromTeam = async (req: Request, res: Response) => {
    const { id } = req.body;

    // Check if the user exists in the project team
    if (!req.project.team.some(
      member => member.toString() === id.toString()
    )) {
      return res.status(404).json({ 
        message: "Usuario no existe en el proyecto"
      });
    } 

    // Remove user from the project team
    req.project.team = req.project.team.filter(
      member => member.toString() !== id.toString()
    );

    await req.project.save();
    
    res.send("Usuario eliminado");
  }
}