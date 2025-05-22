import { Router } from "express";
import { body } from "express-validator";
import { AuthController } from "../controllers/AuthController";
import { handleInputErrors } from "../middleware/validation";

const router = Router();

// Route to create a new account
router.post(
  "/create-account",
  body("name").trim().notEmpty().withMessage("El nombre es obligatorio"),
  body("password")
    .isLength({ min: 8 })
    .withMessage("La contraseña debe tener al menos 8 caracteres"),
  body("password_confirmation")
    .custom((value, { req }) => {
      if (value !== req.body.password) {
        throw new Error("Las contraseñas no coinciden");
      }
      return true;
    })
    .withMessage("Las contraseñas no coinciden"),
  body("email").isEmail().withMessage("Correo electronico no válido"),
  handleInputErrors,
  AuthController.createAccount
);

// Route to confirm account
router.post(
  "/confirm-account",
  body("token").trim().notEmpty().withMessage("El token es obligatorio"),
  handleInputErrors,
  AuthController.confirmAccount
);

// Route to login
router.post(
  "/login",
  body("email").trim().isEmail().withMessage("Correo electronico no válido"),
  body("password").notEmpty().withMessage("La contraseña es obligatoria"),
  handleInputErrors,
  AuthController.login
);

export default router;
