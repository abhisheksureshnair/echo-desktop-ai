import express from "express";
import cors from "cors";
import morgan from "morgan";
import authRoutes from "./routes/auth.routes.js"
import aiRoutes from "./routes/ai.routes.js"


const app = express();

app.use(cors());
app.use(express.json());
app.use(morgan("dev"));
app.use("/api/auth", authRoutes)
app.use("/api/assistence", aiRoutes)


export default app;
