import mongoose, { Document, Model, Schema } from "mongoose";

export interface IStudent extends Document {
  code: string;
  name: string;
  gender: "ذكر" | "أنثى";
  studentPhone: string;
  parentPhone: string;
  school: string;
  parentJob: string;
  createdBy: "student" | "admin";
  createdAt: Date;
  updatedAt: Date;
  grade: string;
  track?: string;
}

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
    grade: {
      type: String,
      required: true,
      trim: true,
      enum: [
        "3 ابتدائي",
        "4 ابتدائي",
        "5 ابتدائي",
        "6 ابتدائي",
        "أولى إعدادي",
        "تانية إعدادي",
        "تالتة إعدادي",
        "أولى ثانوي",
        "تانية ثانوي",
        "تالتة ثانوي",
      ],
    },
    track: {
      type: String,
      trim: true,
      default: "",
    },
  },
  { timestamps: true }
);

// Text search index
studentSchema.index({ name: "text", code: "text" });

const Student: Model<IStudent> =
  mongoose.models.Student ?? mongoose.model<IStudent>("Student", studentSchema);

export default Student;
