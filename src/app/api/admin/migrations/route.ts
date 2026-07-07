import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db/mongoose";
import Student from "@/lib/models/Student";

export async function POST() {
    try {
        await connectDB();

        const result = await Student.updateMany(
            {
                $or: [
                    { branch: { $exists: false } },
                    { branch: "" },
                    { branch: null },
                ],
            },
            {
                $set: {
                    branch: "غير محدد",
                },
            }
        );

        return NextResponse.json({
            success: true,
            matched: result.matchedCount,
            modified: result.modifiedCount,
        });
    } catch (error) {
        return NextResponse.json(
            {
                success: false,
                message: error instanceof Error ? error.message : "Unknown error",
            },
            { status: 500 }
        );
    }
}