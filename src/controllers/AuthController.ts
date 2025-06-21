import { Request, Response } from "express";
import { Types } from "mongoose";
import User from "../models/User";
import Token from "../models/Token";

import { hashPassword, comparePassword } from "../utils/auth";
import { generateToken } from "../utils/token";
import { AuthEmail } from "../emails/AuthEmail";
import { generateJWT } from "../utils/jwt";

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
          error: "Usuario o contraseña incorrecta",
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
        return res
          .status(401)
          .json({ error: "Usuario o contraseña incorrecta" });
      }

      //generate a JWT token
      const jwt = generateJWT({ id: user._id });

      res.send(jwt);
    } catch (error) {
      console.error("Error logging in:", error);
      return res.status(500).json({ error: "Error al iniciar sesión" });
    }
  }

  // Method to request a new token
  static async requestNewConfirmationToken(req: Request, res: Response) {
    try {
      const { email } = req.body;

      const user = await User.findOne({ email });

      //check if the user exists
      if (!user) {
        return res.status(404).json({
          error: "Usuario no encontrado",
        });
      }

      //check if the user is confirmed
      if (user.confirmed) {
        return res.status(403).json({
          error: "La cuenta ya ha sido confirmada",
        });
      }

      //generate a new token
      const token = new Token();
      token.token = generateToken();
      token.user = user._id as Types.ObjectId;

      //send email
      AuthEmail.sendConfirmationEmail({
        email: user.email,
        name: user.name,
        token: token.token,
      });

      //save the token and user in the database
      await Promise.allSettled([token.save(), user.save()]);

      return res.send("Se ha enviado un nuevo token a tu correo electronico");
    } catch (error) {
      console.error("Error requesting new token:", error);
      return res
        .status(500)
        .json({ error: "Error al solicitar un nuevo token" });
    }
  }

  // Method to reset password
  static async forgotPassword(req: Request, res: Response) {
    try {
      const { email } = req.body;

      const user = await User.findOne({ email });

      //check if the user exists
      if (!user) {
        return res.status(404).json({
          error: "Usuario no encontrado",
        });
      }

      //check if the user is confirmed
      if (!user.confirmed) {
        return res.status(403).json({
          error: "La cuenta no ha sido confirmada",
        });
      }

      //validate if there is a token in the database
      const tokenExists = await Token.findOne({ user: user._id });

      if (tokenExists) {
        return res.status(400).json({
          error: "Ya tienes activo un token para restablecer la contraseña",
        });
      }

      //generate a new token
      const token = new Token();
      token.token = generateToken();
      token.user = user._id as Types.ObjectId;

      //save the token in the database
      await token.save();

      //send email
      AuthEmail.sendResetPasswordEmail({
        email: user.email,
        name: user.name,
        token: token.token,
      });

      return res.send(
        "Revisa tu correo electronico para restablecer la contraseña",
      );
    } catch (error) {
      console.error("Error requesting new token:", error);
      return res
        .status(500)
        .json({ error: "Error al solicitar un nuevo token" });
    }
  }

  // Method to validate token for new password
  static async validateToken(req: Request, res: Response) {
    try {
      const { token } = req.body;

      //check if the token exists
      const tokenExists = await Token.findOne({ token });
      console.log("Token: ", tokenExists);

      if (!tokenExists) {
        return res
          .status(401)
          .json({ error: "El token no existe o ha caducado" });
      }

      res.send("Token valido");
    } catch (error) {
      console.error("Error validating token:", error);
      return res.status(500).json({ error: "Error al validar el token" });
    }
  }

  // Method to update password
  static async updatePasswordWithToken(req: Request, res: Response) {
    try {
      const { password } = req.body;
      const { token } = req.params;

      // check if the token exists
      const tokenExists = await Token.findOne({ token });

      if (!tokenExists) {
        return res
          .status(401)
          .json({ error: "El token no existe o ha caducado" });
      }

      // search for the user with the token
      const user = await User.findById(tokenExists.user);

      // check if the user exists
      if (!user) {
        return res.status(401).json({ error: "El usuario no existe" });
      }

      // update the password
      user.password = await hashPassword(password);

      //save the user with new pasword and delete the token
      await Promise.allSettled([user.save(), tokenExists.deleteOne()]);

      res.send("Contraseña actualizada correctamente");
    } catch (error) {
      console.error("Error updating password:", error);
      return res
        .status(500)
        .json({ error: "Error al actualizar la contraseña" });
    }
  }

  // Method to get authenticated user
  static async getAuthenticatedUser(req: Request, res: Response) {
    return res.json(req.user);
  }

  // Method to update user profile
  static async updateUserProfile(req: Request, res: Response) {
    try {
      const { name, email } = req.body;

      // Check if the user email is already in use
      const userExists = await User.findOne({ email });

      if (userExists && userExists._id.toString() !== req.user._id.toString()) {
        return res
          .status(400)
          .json({ error: "El correo electrónico ya está en uso" });
      }

      // Update the user profile
      req.user.name = name;
      req.user.email = email;

      // Save the user with new profile
      await req.user.save();

      res.send("Perfil actualizado correctamente");
    } catch (error) {
      console.error("Error updating user profile:", error);
      return res.status(500).json({ error: "Error al actualizar el perfil" });
    }
  }

  // Method to update password of authenticated user
  static async updatePasswordOfAuthenticatedUser(req: Request, res: Response) {
    try {
      const { current_password, password } = req.body;

      // Get current user
      const user = await User.findById(req.user._id);
      if (!user) {
        return res.status(404).json({ error: "Usuario no encontrado" });
      }

      // Check if the new password is the same as the current password
      const isPasswordCorrect = await comparePassword(
        current_password,
        user.password,
      );

      if (!isPasswordCorrect) {
        console.error("Contraseña actual incorrecta");
        return res.status(400).json({ error: "Contraseña actual incorrecta" });
      }

      // Hash the new password and save the user with the new password
      user.password = await hashPassword(password);
      await user.save();

      res.send("Contraseña actualizada correctamente");
    } catch (error) {
      console.error("Error updating password:", error);
      return res
        .status(500)
        .json({ error: "Error al actualizar la contraseña" });
    }
  }

  // Method to check password of authenticated user
  static async checkPassword(req: Request, res: Response) {
    try {
      const { password } = req.body;

      // Get user from id
      const user = await User.findById(req.user._id);
      if (!user) {
        return res.status(404).json({ error: "Usuario no encontrado" });
      }

      // Check if the password is correct
      const isPasswordCorrect = await comparePassword(password, user.password);
      if (!isPasswordCorrect) {
        console.error("Contraseña incorrecta");
        return res.status(400).json({ error: "Contraseña incorrecta" });
      }

      res.send("Contraseña correcta");
    } catch (error) {
      console.error("Error checking password:", error);
      return res
        .status(500)
        .json({ error: "Error al verificar la contraseña" });
    }
  }
}
