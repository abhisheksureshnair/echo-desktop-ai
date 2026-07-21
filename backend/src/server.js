import dotenv from "dotenv";
import app from "./app.js";
import { createServer } from "http";
import connectDB from "./config/db.js";

dotenv.config();

const PORT = process.env.PORT || 8080;

connectDB();

const httpServer = createServer(app);

// Start server
httpServer.listen(PORT, () => {
    console.log(`🚀 Server running on http://localhost:${PORT}`);
});