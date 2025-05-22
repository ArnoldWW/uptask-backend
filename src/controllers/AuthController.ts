import { Request, Response } from "express";
import { Types } from "mongoose";
import User from "../models/User";
import Token from "../models/Token";

import { hashPassword, comparePassword } from "../utils/auth";
import { generateToken } from "../utils/token";
import { AuthEmail } from "../emails/AuthEmail";

export class AuthController {
  // Method to confirm account
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
      token.token = generateToken();
      token.user = newUser._id as Types.ObjectId;

      //send email
      AuthEmail.sendConfirmationEmail({
        email: newUser.email,
        name: newUser.name,
        token: token.token,
      });

      // Insert user into the database
      await Promise.allSettled([newUser.save(), token.save()]);

      return res.send(
        "Cuenta creada correctamente, revisa tu correo para confirmar la cuenta",
      );
    } catch (error) {
      console.error("Error creating account:", error);
      return res.status(500).json({ error: "Error al crear la cuenta" });
    }
  }

  // Method to confirm account
  static async confirmAccount(req: Request, res: Response) {
    try {
      const { token } = req.body;
      console.log("Token: ", token);

      //check if the token exists
      const tokenExists = await Token.findOne({ token });

      if (!tokenExists) {
        return res
          .status(401)
          .json({ error: "El token no existe o ha caducado" });
      }

      //Search for the user with the token
      const user = await User.findById(tokenExists.user);

      //check if the user exists
      if (!user) {
        return res
          .status(401)
          .json({ error: "El usuario no existe o ha caducado" });
      }

      user.confirmed = true;

      //save the user and delete the token
      await Promise.all([user.save(), tokenExists.deleteOne()]);
      res.send("Cuenta confirmada correctamente");
    } catch (error) {
      console.error("Error confirming account:", error);
      return res.status(500).json({ error: "Error al confirmar la cuenta" });
    }
  }

  // Method to login
  static async login(req: Request, res: Response) {
    try {
      const { email, password } = req.body;

      //check if the user exists
      const user = await User.findOne({ email });
      if (!user) {
        return res.status(404).json({
          error: "Usuario no encontrado",
        });
      }

      //check if the user is confirmed
      if (!user.confirmed) {
        //create a new token
        const token = new Token();
        token.user = user._id as Types.ObjectId;
        token.token = generateToken();
        await token.save();

        //send email
        AuthEmail.sendConfirmationEmail({
          email: user.email,
          name: user.name,
          token: token.token,
        });

        return res.status(401).json({
          error:
            "La cuenta no ha sido confirmada, te hemos enviado un nuevo correo con el token de confirmación",
        });
      }

      //check if the password is correct
      const isMatch = await comparePassword(password, user.password);
      if (!isMatch) {
        return res.status(401).json({ error: "Contraseña incorrecta" });
      }

      res.send("Autenticación correcta");
    } catch (error) {
      console.error("Error logging in:", error);
      return res.status(500).json({ error: "Error al iniciar sesión" });
    }
  }
}
