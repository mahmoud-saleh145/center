import { connectDB } from "@/lib/db/mongoose";
import Student, { IStudent } from "@/lib/models/Student";
import Counter from "@/lib/models/Counter";

async function generateStudentCode(): Promise<string> {
  const counter = await Counter.findOneAndUpdate(
    { name: "student_code" },
    { $inc: { seq: 1 } },
    { new: true, upsert: true }
  );
  const num = String(counter.seq).padStart(4, "0");
  return `ST-${num}`;
}

export interface CreateStudentDTO {
  name: string;
  gender: "ذكر" | "أنثى";
  studentPhone: string;
  parentPhone: string;
  school: string;
  parentJob: string;
  createdBy: "student" | "admin";
}

export interface StudentFilters {
  search?: string;
  gender?: string;
  page?: number;
  limit?: number;
  sort?: string;
}

export async function createStudent(dto: CreateStudentDTO): Promise<IStudent> {
  await connectDB();

  // Prevent duplicate by phone
  const existing = await Student.findOne({
    $or: [
      { studentPhone: dto.studentPhone },
      { parentPhone: dto.parentPhone, name: dto.name },
    ],
  });
  if (existing) {
    throw new Error("هذا الطالب مسجل مسبقاً في النظام.");
  }

  const code = await generateStudentCode();
  const student = new Student({ ...dto, code });
  await student.save();
  return student;
}

export async function getStudents(filters: StudentFilters) {
  await connectDB();

  const {
    search = "",
    gender = "",
    page = 1,
    limit = 20,
    sort = "-createdAt",
  } = filters;

  const query: Record<string, unknown> = {};

  if (search) {
    const regex = new RegExp(search, "i");
    query.$or = [
      { name: regex },
      { code: regex },
      { studentPhone: regex },
      { parentPhone: regex },
    ];
  }

  if (gender && ["ذكر", "أنثى"].includes(gender)) {
    query.gender = gender;
  }

  const skip = (page - 1) * limit;
  const [students, total] = await Promise.all([
    Student.find(query).sort(sort).skip(skip).limit(limit).lean(),
    Student.countDocuments(query),
  ]);

  return { students, total, page, limit, pages: Math.ceil(total / limit) };
}

export async function getStudentById(id: string) {
  await connectDB();
  return Student.findById(id).lean();
}

export async function updateStudent(
  id: string,
  dto: Partial<CreateStudentDTO>
) {
  await connectDB();
  const student = await Student.findByIdAndUpdate(id, dto, {
    new: true,
    runValidators: true,
  });
  if (!student) throw new Error("الطالب غير موجود.");
  return student;
}

export async function deleteStudent(id: string) {
  await connectDB();
  const student = await Student.findByIdAndDelete(id);
  if (!student) throw new Error("الطالب غير موجود.");
  return student;
}

export async function getStatistics() {
  await connectDB();

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const [total, males, females, todayCount] = await Promise.all([
    Student.countDocuments(),
    Student.countDocuments({ gender: "ذكر" }),
    Student.countDocuments({ gender: "أنثى" }),
    Student.countDocuments({ createdAt: { $gte: today } }),
  ]);

  return { total, males, females, todayCount };
}

export async function getAllStudentsForExport() {
  await connectDB();
  return Student.find().sort("-createdAt").lean();
}
