// src/lib/services/scheduleService.ts
import { connectDB } from "@/lib/db/mongoose";
import Schedule from "@/lib/models/Schedule";
import { v2 as cloudinary } from "cloudinary";
import { Grade } from "../constants/grades";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export async function saveScheduleImage(file: File, grade: Grade) {
  await connectDB();

  const buffer = Buffer.from(await file.arrayBuffer());

  const uploaded = await new Promise<{ secure_url: string; public_id: string }>(
    (resolve, reject) => {
      const stream = cloudinary.uploader.upload_stream(
        { folder: "2total/schedules", resource_type: "image" },
        (error, result) => {
          if (error || !result) return reject(error ?? new Error("Cloudinary upload failed"));
          resolve({ secure_url: result.secure_url, public_id: result.public_id });
        }
      );

      stream.end(buffer);
    }
  );

  const schedule = await Schedule.create({
    grade,
    imageUrl: uploaded.secure_url,
    publicId: uploaded.public_id,
  });

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

  try {
    await cloudinary.uploader.destroy(schedule.publicId);
  } catch {
    // Cloudinary deletion failure is non-fatal — record is already removed from DB
  }

  return schedule;
}
