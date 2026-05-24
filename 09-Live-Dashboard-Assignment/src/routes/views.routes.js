import { Router } from "express";
import { incrementPostViews } from "../controllers/views.controller.js";

const router = Router();

router.post("/:id, view", incrementPostViews);
export default router;