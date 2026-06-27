import { NextRequest, NextResponse } from "next/server";
import { verifyToken, JWTPayload } from "@/lib/utils/jwt";

export async function requireAdmin(
  req: NextRequest
): Promise<JWTPayload | NextResponse> {
  const token =
    req.cookies.get("admin_token")?.value ??
    req.headers.get("authorization")?.replace("Bearer ", "");

  if (!token) {
    return NextResponse.json(
      { success: false, message: "غير مصرح. يرجى تسجيل الدخول." },
      { status: 401 }
    );
  }

  const payload = await verifyToken(token);
  if (!payload) {
    return NextResponse.json(
      { success: false, message: "الجلسة منتهية. يرجى تسجيل الدخول مجدداً." },
      { status: 401 }
    );
  }

  return payload;
}
