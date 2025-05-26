import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import User, { IUser } from "../models/User";

// Add the user type to the Request interface
declare global {
  namespace Express {
    interface Request {
      user?: IUser;
    }
  }
}

export async function authenticate(
  req: Request,
  res: Response,
  next: NextFunction
) {
  const bearer = req.headers.authorization;

  if (!bearer) {
    return res.status(401).json({ error: "No token provided" });
  }

  const token = bearer.split(" ")[1];

  try {
    // Verify the token
    const decoded = jwt.verify(token, process.env.JWT_SECRET as string);
    console.log("decoded", decoded);

    // Check if the decoded token is an object and has an id property
    if (typeof decoded === "object" && decoded.id) {
      const user = await User.findById(decoded.id).select("_id name email");

      // Check if the user exists
      if (!user) {
        return res.status(401).json({ error: "Usuario no encontrado" });
      }

      // Set the user in the EXPRESS request object
      req.user = user;
    }

    next();
  } catch (error) {
    res.status(500).json({ error: "Error al validar el token" });
  }
}
