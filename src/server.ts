import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import { corsConfig } from "./config/cors";
import { connectDB } from "./config/db";
import projectRoutes from "./routes/ProjectRoutes";

dotenv.config();
connectDB();

const app = express();

app.use(cors(corsConfig));
app.use(express.json());

//rutas
app.use("/api/projects", projectRoutes);

export default app;
