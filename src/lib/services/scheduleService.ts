import { connectDB } from "@/lib/db/mongoose";
import Schedule from "@/lib/models/Schedule";
import fs from "fs/promises";
import path from "path";
import { Grade } from "../constants/grades";

// Public uploads directory — served as static files via /uploads/schedules/...
const UPLOADS_DIR = path.join(process.cwd(), "public", "uploads", "schedules");

// Ensure the directory exists on first use
async function ensureDir() {
  await fs.mkdir(UPLOADS_DIR, { recursive: true });
}

export async function saveScheduleImage(
  file: File,
  grade: Grade
) {
  await connectDB();
  await ensureDir();

  // Build a unique filename: timestamp + sanitised original name
  const ext = file.name.split(".").pop()?.toLowerCase() ?? "jpg";
  const filename = `schedule_${Date.now()}.${ext}`;
  const filepath = path.join(UPLOADS_DIR, filename);

  // Write buffer to disk
  const buffer = Buffer.from(await file.arrayBuffer());
  await fs.writeFile(filepath, buffer);

  const imageUrl = `/uploads/schedules/${filename}`;

  const schedule = await Schedule.create({ grade, imageUrl, filename });
  return schedule;
}

export async function getSchedulesByGrade(grade: Grade) {
  await connectDB();
  return Schedule.find({ grade }).sort({ createdAt: -1 }).lean();
}

export async function getAllSchedules() {
  await connectDB();
  return Schedule.find().sort({ grade: 1, createdAt: -1 }).lean();
}

export async function deleteSchedule(id: string) {
  await connectDB();
  const schedule = await Schedule.findByIdAndDelete(id);
  if (!schedule) throw new Error("الجدول غير موجود.");

  // Delete file from disk — silent if already missing
  try {
    const filepath = path.join(UPLOADS_DIR, schedule.filename);
    await fs.unlink(filepath);
  } catch {
    // file may already be gone — not a fatal error
  }

  return schedule;
}
