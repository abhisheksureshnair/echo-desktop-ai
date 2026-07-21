import express from "express"
import { addAIModels, fetchModels } from "../controllers/ai.controllers.js";
import auth from "../middleware/auth.middleware.js";

const router = express.Router()

router.post("/add-model", auth, addAIModels)
router.get("/fetch-model", auth, fetchModels)


export default router;