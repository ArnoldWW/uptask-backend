import { Router } from "express";
import { body, param } from "express-validator";
import { AuthController } from "../controllers/AuthController";
import { handleInputErrors } from "../middleware/validation";
import { authenticate } from "../middleware/auth";

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
  AuthController.createAccount,
);

// Route to confirm account
router.post(
  "/confirm-account",
  body("token").trim().notEmpty().withMessage("El token es obligatorio"),
  handleInputErrors,
  AuthController.confirmAccount,
);

// Route to login
router.post(
  "/login",
  body("email").trim().isEmail().withMessage("Correo electronico no válido"),
  body("password").notEmpty().withMessage("La contraseña es obligatoria"),
  handleInputErrors,
  AuthController.login,
);

// Route to request a new token
router.post(
  "/request-new-token",
  body("email").trim().isEmail().withMessage("Correo electronico no válido"),
  handleInputErrors,
  AuthController.requestNewConfirmationToken,
);

// Route to send email with reset password token
router.post(
  "/forgot-password",
  body("email").trim().isEmail().withMessage("Correo electronico no válido"),
  handleInputErrors,
  AuthController.forgotPassword,
);

// validate token for new password
router.post(
  "/validate-token",
  body("token").trim().notEmpty().withMessage("El token es obligatorio"),
  AuthController.validateToken,
);

// Route to update password
router.post(
  "/update-password/:token",
  param("token").trim().notEmpty().withMessage("El token es obligatorio"),
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
  handleInputErrors,
  AuthController.updatePasswordWithToken,
);

// Route to get authenticated user
router.get("/user", authenticate, AuthController.getAuthenticatedUser);

// Route to update user profile
router.put(
  "/profile",
  authenticate,
  body("name").trim().notEmpty().withMessage("El nombre es obligatorio"),
  body("email").isEmail().withMessage("Correo electronico no válido"),
  handleInputErrors,
  AuthController.updateUserProfile,
);

// Route to update user password when is authenticated
router.post(
  "/update-password",
  authenticate,
  body("current_password")
    .trim()
    .notEmpty()
    .withMessage("La contraseña actual es obligatoria"),
  body("password")
    .trim()
    .isLength({ min: 8 })
    .withMessage("La contraseña debe tener al menos 8 caracteres"),
  body("password_confirmation")
    .trim()
    .custom((value, { req }) => {
      if (value !== req.body.password) {
        throw new Error("Las contraseñas no coinciden");
      }
      return true;
    })
    .withMessage("Las contraseñas no coinciden"),
  handleInputErrors,
  AuthController.updatePasswordOfAuthenticatedUser,
);

export default router;
