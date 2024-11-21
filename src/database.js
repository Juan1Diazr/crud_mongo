import mongoose from "mongoose";
import { MONGODB_URI } from "./config.js";

(async () => {
  try {
    const db = await mongoose.connect(MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      serverSelectionTimeoutMS: 10000, // Tiempo de espera antes de error
    });
    console.log("Conectado a MongoDB:", db.connection.name);
  } catch (error) {
    console.error("Error al conectar con MongoDB:", error.message);
    process.exit(1);
  }
})();
