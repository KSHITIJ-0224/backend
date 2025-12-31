import mongoose from "mongoose";

const scheduleCallSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      maxlength: 50,
    },
    email: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
      match: [/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/, "Invalid email"],
    },
    phone: {
      type: String,
      required: true,
      trim: true,
    },
    company: {
      type: String,
      trim: true,
      maxlength: 100,
    },
    projectType: {
      type: String,
      required: true,
      enum: ["web-development", "mobile-app", "saas", "ui-ux", "other"],
    },
    budget: {
      type: String,
      required: true,
      enum: ["10k-25k", "25k-50k", "50k-100k", "100k+"],
    },
    date: {
      type: Date,
      required: true,
    },
    time: {
      type: String,
      required: true, // "HH:MM"
    },
    status: {
      type: String,
      enum: ["pending", "scheduled", "completed", "cancelled"],
      default: "pending",
    },
  },
  { timestamps: true }
);

export default mongoose.model("ScheduleCall", scheduleCallSchema);
