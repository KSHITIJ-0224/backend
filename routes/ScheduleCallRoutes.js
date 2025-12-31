import express from "express";
import { createScheduleCall } from "../controllers/ScheduleCallController.js";

const router = express.Router();

// POST /api/schedule-call
router.post("/", createScheduleCall);

export default router;
