import ScheduleCall from "../models/ScheduleCall.js";
import { sendScheduleCallEmails } from "../utils/Email.js";

// POST /api/schedule-call
export const createScheduleCall = async (req, res) => {
  try {
    const { name, email, phone, company, projectType, budget, date, time } =
      req.body;

    if (!name || !email || !phone || !projectType || !budget || !date || !time) {
      return res
        .status(400)
        .json({ success: false, message: "All required fields must be filled." });
    }

    const scheduleCall = await ScheduleCall.create({
      name,
      email,
      phone,
      company,
      projectType,
      budget,
      date,
      time,
    });

    // fire-and-forget, do not block response if email fails
    sendScheduleCallEmails({
      name,
      email,
      date,
      time,
      projectType,
      budget,
    }).catch((err) => console.error("Email error:", err));

    return res.status(201).json({
      success: true,
      message: "Appointment scheduled successfully.",
      data: scheduleCall,
    });
  } catch (err) {
    console.error("Schedule call error:", err);
    return res.status(500).json({
      success: false,
      message: "Server error. Please try again later.",
    });
  }
};
