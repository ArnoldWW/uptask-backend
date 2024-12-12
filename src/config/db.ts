import mongoose from "mongoose";
import colors from "colors";
import { exit } from "process";

export const connectDB = async () => {
  try {
    const connection = await mongoose.connect(process.env.DATABASE_URL);
    const url = `${connection.connection.host}:${connection.connection.port}`;
    console.log(colors.bgGreen.bold(`Conectado en: ${url}`));
  } catch (error) {
    console.log(colors.bgRed.bold("Error al conectar a mongoDB "));
    exit(1);
  }
};
