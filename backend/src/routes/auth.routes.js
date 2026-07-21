import express from "express";
import { fetchUser, login, registration } from "../controllers/auth.controllers.js";
import auth from "../middleware/auth.middleware.js";

const router = express.Router();

router.post("/registration", registration)
router.post("/login", login)
router.get("/me", auth, fetchUser)

export default router;
