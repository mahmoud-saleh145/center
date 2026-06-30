import mongoose, { Document, Model, Schema } from "mongoose";

// ---------------------------------------------------------------------------
// Grade constants — single source of truth
// ---------------------------------------------------------------------------
export const SECONDARY_GRADES = [
  "أولى ثانوي",
  "تانية ثانوي",
  "تالتة ثانوي",
] as const;

export const NON_SECONDARY_GRADES = [
  "3 ابتدائي",
  "4 ابتدائي",
  "5 ابتدائي",
  "6 ابتدائي",
  "أولى إعدادي",
  "تانية إعدادي",
  "تالتة إعدادي",
] as const;

export const ALL_GRADES = [...NON_SECONDARY_GRADES, ...SECONDARY_GRADES] as const;

export type Grade = (typeof ALL_GRADES)[number];

// ---------------------------------------------------------------------------
// Track constants — only relevant for two specific grades
// ---------------------------------------------------------------------------
export const SECONDARY_2_TRACKS = [
  "مسار الطب و علوم الحياة",
  "مسار الهندسة و علوم الحاسب",
  "مسار الأعمال",
  "مسار الأدب و الفنون",
] as const;

export const SECONDARY_3_TRACKS = [
  "علمي رياضة",
  "علمي علوم",
  "أدبي",
] as const;

// Grades that require a track selection
export const GRADES_WITH_TRACK = ["تانية ثانوي", "تالتة ثانوي"] as const;

// ---------------------------------------------------------------------------
// IStudent interface
// ---------------------------------------------------------------------------
export interface IStudent extends Document {
  code: string;
  name: string;
  gender: "ذكر" | "أنثى";
  grade: Grade;
  track: string; // "" for grades that have no track; required value for تانية/تالتة ثانوي
  studentPhone: string;
  parentPhone: string;
  school: string;
  parentJob: string;
  createdBy: "student" | "admin";
  createdAt: Date;
  updatedAt: Date;
}

// ---------------------------------------------------------------------------
// Mongoose schema
// ---------------------------------------------------------------------------
const studentSchema = new Schema<IStudent>(
  {
    code: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
      minlength: 7, // at least 4 Arabic words
    },
    gender: {
      type: String,
      required: true,
      enum: ["ذكر", "أنثى"],
    },
    grade: {
      type: String,
      required: true,
      trim: true,
      enum: [...ALL_GRADES],
    },
    track: {
      type: String,
      trim: true,
      default: "",
      // Not required at schema level — conditional requirement is
      // enforced in the service layer and validation utility so that
      // grades without tracks can correctly store an empty string.
    },
    studentPhone: {
      type: String,
      required: true,
      trim: true,
      match: [/^01[0125]\d{8}$/, "رقم هاتف الطالب غير صحيح"],
    },
    parentPhone: {
      type: String,
      required: true,
      trim: true,
      match: [/^01[0125]\d{8}$/, "رقم هاتف ولي الأمر غير صحيح"],
    },
    school: {
      type: String,
      required: true,
      trim: true,
    },
    parentJob: {
      type: String,
      required: true,
      trim: true,
    },
    createdBy: {
      type: String,
      required: true,
      enum: ["student", "admin"],
      default: "student",
    },
  },
  { timestamps: true }
);

// Text search index
studentSchema.index({ name: "text", code: "text" });

const Student: Model<IStudent> =
  mongoose.models.Student ?? mongoose.model<IStudent>("Student", studentSchema);

export default Student;
