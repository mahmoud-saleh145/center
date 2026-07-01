import mongoose, { Document, Model, Schema } from "mongoose";
import { ALL_GRADES, Grade } from "@/lib/constants/grades";

export interface ISchedule extends Document {
  grade: Grade;           // academic year / grade this schedule belongs to
  imageUrl: string;       // public URL path e.g. /uploads/schedules/filename.jpg
  filename: string;       // stored filename for deletion
  createdAt: Date;
  updatedAt: Date;
}

const scheduleSchema = new Schema<ISchedule>(
  {
    grade: {
      type: String,
      required: true,
      trim: true,
      enum: [...ALL_GRADES],
    },
    imageUrl: {
      type: String,
      required: true,
      trim: true,
    },
    filename: {
      type: String,
      required: true,
      trim: true,
    },
  },
  { timestamps: true }
);

// Index for fast grade lookups
scheduleSchema.index({ grade: 1 });

const Schedule: Model<ISchedule> =
  mongoose.models.Schedule ??
  mongoose.model<ISchedule>("Schedule", scheduleSchema);

export default Schedule;
