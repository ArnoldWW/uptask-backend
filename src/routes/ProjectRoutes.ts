import { Router } from "express";
import { ProjectController } from "../controllers/ProjectController";
import { body, param } from "express-validator";
import { handleInputErrors } from "../middleware/validation";
import { authenticate } from "../middleware/auth";
import { TaskController } from "../controllers/TaskConroller";
import { validateProjectExists } from "../middleware/project";
import { taskBelongToProject, taskExists } from "../middleware/task";
import { TeamController } from "../controllers/TeamController";

const router = Router();

// Protect all routes in this router
router.use(authenticate);

// ---------------- ROUTES FOR PROJECT MANAGEMENT -------------------

// Route to create a new project
router.post(
  "/",
  body("projectName").notEmpty().withMessage("El nombre es obligatorio"),
  body("clientName")
    .notEmpty()
    .withMessage("El nombre del cliente es obligatorio"),
  body("description").notEmpty().withMessage("La descripcion es obligatoria"),
  handleInputErrors,
  ProjectController.createProject
);

// Route to get all projects
router.get("/", ProjectController.getAllProjects);

// Route to get a project by ID
router.get(
  "/:id",
  param("id").isMongoId().withMessage("ID no valido"),
  handleInputErrors,
  ProjectController.getProjectByID
);

// Route to update a project
router.put(
  "/:id",
  param("id").isMongoId().withMessage("ID no valido"),
  body("projectName").notEmpty().withMessage("El nombre es obligatorio"),
  body("clientName")
    .notEmpty()
    .withMessage("El nombre del cliente es obligatorio"),
  body("description").notEmpty().withMessage("La descripcion es obligatoria"),
  handleInputErrors,
  ProjectController.updateProject
);

// Route to delete a project
router.delete(
  "/:id",
  param("id").isMongoId().withMessage("ID no valido"),
  handleInputErrors,
  ProjectController.deleteProject
);

/* Routes for task */
router.param("projectId", validateProjectExists);
router.param("taskId", taskExists);
router.param("taskId", taskBelongToProject);

// Route to create a new task
router.post(
  "/:projectId/tasks",
  body("name").notEmpty().withMessage("El nombre de la tarea es obligatorio"),
  body("description")
    .notEmpty()
    .withMessage("La descripcion de la tarea es obligatoria"),
  handleInputErrors,
  TaskController.createTask
);

// Route to get all tasks of a project
router.get("/:projectId/tasks", TaskController.getProjectTasks);

// Route to get a task by ID
router.get(
  "/:projectId/tasks/:taskId",
  param("taskId").isMongoId().withMessage("ID no valido"),
  handleInputErrors,
  TaskController.getTaskById
);

// Route to update a task
router.put(
  "/:projectId/tasks/:taskId",
  param("taskId").isMongoId().withMessage("ID no valido"),
  body("name").notEmpty().withMessage("El nombre es obligatorio"),
  body("description").notEmpty().withMessage("La descripcion es obligatoria"),
  handleInputErrors,
  handleInputErrors,
  TaskController.updateTask
);

// Route to delete a task
router.delete(
  "/:projectId/tasks/:taskId",
  param("taskId").isMongoId().withMessage("ID no valido"),
  handleInputErrors,
  TaskController.deleteTask
);

// Route to update the status of a task
router.post(
  "/:projectId/tasks/:taskId/status",
  param("taskId").isMongoId().withMessage("ID no valido"),
  body("status").notEmpty().withMessage("El estado es obligatorio"),
  handleInputErrors,
  TaskController.updateStatus
);

// ---------------- ROUTES FOR TEAM MANAGEMENT -------------------

// Get all team members of a project
router.get(
  "/:projectId/team",
  validateProjectExists,
  TeamController.getProjectTeam
);

// Find team members of a project
router.post(
  "/:projectId/team/find",
  body("email").isEmail().toLowerCase().withMessage("El email es obligatorio"),
  handleInputErrors,
  TeamController.findMemberByEmail
);

// Add a member to the project team
router.post(
  "/:projectId/team",
  body("id").isMongoId().withMessage("ID no valido"),
  handleInputErrors,
  TeamController.addMemberToTeam
);

// Remove a member from the project team
router.delete(
  "/:projectId/team/:userId",
  param("userId").isMongoId().withMessage("ID no valido"),
  handleInputErrors,
  TeamController.removeMemberFromTeam
);

export default router;
