import { Request, Response } from "express";
import { Types } from "mongoose";
import User from "../models/User";
import Token from "../models/Token";

import { hashPassword } from "../utils/auth";
import { generateToken } from "../utils/token";
import { transport } from "../config/nodemailer";

export class AuthController {
  static async createAccount(req: Request, res: Response) {
    try {
      const { password, email } = req.body;

      //check if the email is already in the database
      const userExists = await User.findOne({ email });

      if (userExists) {
        return res
          .status(400)
          .json({ error: "Ya existe una cuenta con ese correo electronico" });
      }

      const newUser = new User(req.body);

      //hash the password
      newUser.password = await hashPassword(password);

      //generate a token
      const token = new Token();
      token.token = generateToken(32);
      token.user = newUser._id as Types.ObjectId;

      //send email
      await transport.sendMail({
        from: "uptask@correo.com",
        to: newUser.email.toString(),
        subject: "Confirmación de cuenta",
        html: `
          <h1>Bienvenido a Uptask</h1>
          <p>Hola ${newUser.name}, Para confirmar tu cuenta, haz click en el siguiente enlace:</p>
          <p><a href="#">Confirmar cuenta</a></p>
          <p>¡Gracias por usar Uptask!</p>
          <p>El equipo de Uptask</p>
        `
      });

      // Insert user into the database
      await Promise.all([newUser.save(), token.save()]);

      return res.status(201).json({ message: "Cuenta creada correctamente" });
    } catch (error) {
      console.error("Error creating account:", error);
      return res.status(500).json({ error: "Error al crear la cuenta" });
    }
  }
}
