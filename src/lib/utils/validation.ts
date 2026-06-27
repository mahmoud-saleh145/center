const EG_PHONE = /^01[0125]\d{8}$/;
const QUADRUPLE_NAME = /^\S+(\s+\S+){3,}/;

export function validateStudentInput(body: Record<string, unknown>) {
  const errors: string[] = [];

  if (!body.name || !QUADRUPLE_NAME.test(String(body.name).trim())) {
    errors.push("يرجى إدخال الاسم رباعياً على الأقل (4 كلمات).");
  }
  if (!body.gender || !["ذكر", "أنثى"].includes(String(body.gender))) {
    errors.push("الجنس غير صحيح.");
  }
  if (!body.studentPhone || !EG_PHONE.test(String(body.studentPhone).trim())) {
    errors.push("رقم هاتف الطالب غير صحيح.");
  }
  if (!body.parentPhone || !EG_PHONE.test(String(body.parentPhone).trim())) {
    errors.push("رقم هاتف ولي الأمر غير صحيح.");
  }
  if (!body.school || String(body.school).trim().length < 2) {
    errors.push("اسم المدرسة مطلوب.");
  }
  if (!body.parentJob || String(body.parentJob).trim().length < 2) {
    errors.push("وظيفة ولي الأمر مطلوبة.");
  }

  return errors;
}

export function validateAdminInput(body: Record<string, unknown>) {
  const errors: string[] = [];

  if (!body.name || String(body.name).trim().length < 3) {
    errors.push("الاسم مطلوب.");
  }
  if (!body.email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(body.email))) {
    errors.push("البريد الإلكتروني غير صحيح.");
  }
  if (body.password !== undefined && String(body.password).length < 6) {
    errors.push("كلمة المرور يجب أن تكون 6 أحرف على الأقل.");
  }
  if (
    body.role &&
    !["مدير عام", "أدمن", "مشرف"].includes(String(body.role))
  ) {
    errors.push("الصلاحية غير صحيحة.");
  }

  return errors;
}
