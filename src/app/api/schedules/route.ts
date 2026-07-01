import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/middleware/auth";
import { apiSuccess, apiError } from "@/lib/utils/response";
import { ALL_GRADES, Grade } from "@/lib/constants/grades";
import { getAllSchedules, saveScheduleImage } from "@/lib/services/scheduleService";

const VALID_GRADES = new Set<string>(ALL_GRADES);
const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp", "image/gif"];
const MAX_SIZE_MB = 10;

export async function GET(req: NextRequest) {
  const auth = await requireAdmin(req);
  if (auth instanceof NextResponse) return auth;

  try {
    const schedules = await getAllSchedules();
    return apiSuccess(schedules);
  } catch (err) {
    const message = err instanceof Error ? err.message : "خطأ في جلب الجداول.";
    return apiError(message, 500);
  }
}

export async function POST(req: NextRequest) {
  const auth = await requireAdmin(req);
  if (auth instanceof NextResponse) return auth;

  try {
    const formData = await req.formData();
    const file = formData.get("image") as File | null;
    const grade = formData.get("grade") as string | null;

    if (!file) return apiError("يرجى رفع صورة الجدول.", 422);
    if (!grade || !VALID_GRADES.has(grade)) return apiError("يرجى اختيار الصف الدراسي.", 422);
    if (!ALLOWED_TYPES.includes(file.type)) return apiError("صيغة الصورة غير مدعومة. يُسمح بـ JPG, PNG, WebP, GIF فقط.", 422);
    if (file.size > MAX_SIZE_MB * 1024 * 1024) return apiError(`حجم الصورة يجب أن لا يتجاوز ${MAX_SIZE_MB}MB.`, 422);

    const schedule = await saveScheduleImage(file, grade as Grade);
    return apiSuccess(schedule, 201);
  } catch (err) {
    const message = err instanceof Error ? err.message : "خطأ في رفع الصورة.";
    return apiError(message, 500);
  }
}
