import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/middleware/auth";
import { getAllStudentsForExport } from "@/lib/services/studentService";
import * as XLSX from "xlsx";
import { connectDB } from "@/lib/db/mongoose";

export async function GET(req: NextRequest) {
  await connectDB();
  const auth = await requireAdmin(req);
  if (auth instanceof NextResponse) return auth;

  try {
    const students = await getAllStudentsForExport();

    const rows = students.map((s) => ({
      "كود الطالب": s.code,
      "الاسم الكامل": s.name,
      الجنس: s.gender,
      "هاتف الطالب": s.studentPhone,
      "هاتف ولي الأمر": s.parentPhone,
      المدرسة: s.school,
      "وظيفة ولي الأمر": s.parentJob,
      "مصدر التسجيل": s.createdBy === "student" ? "تسجيل ذاتي" : "أدمن",
      "تاريخ التسجيل": new Date(s.createdAt).toLocaleDateString("ar-EG"),
    }));

    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.json_to_sheet(rows);
    XLSX.utils.book_append_sheet(wb, ws, "الطلاب");

    const buffer = XLSX.write(wb, { type: "buffer", bookType: "xlsx" });

    return new NextResponse(buffer, {
      status: 200,
      headers: {
        "Content-Type":
          "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        "Content-Disposition": `attachment; filename="students_${Date.now()}.xlsx"`,
      },
    });
  } catch (err) {
    console.error(err);
    return NextResponse.json(
      { success: false, message: "خطأ في تصدير البيانات." },
      { status: 500 }
    );
  }
}
