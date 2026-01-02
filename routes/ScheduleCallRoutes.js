import express from "express";
import { createScheduleCall } from "../controllers/ScheduleCallController.js";

const router = express.Router();

// GET: Health check
router.get("/", (req, res) => {
  res.json({ message: 'Schedule Call API is running' });
});

// POST /api/schedule-call
router.post("/", createScheduleCall);

export default router;
