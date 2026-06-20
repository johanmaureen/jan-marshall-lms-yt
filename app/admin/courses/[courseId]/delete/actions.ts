"use server";

import { requireAdmin } from "@/app/data/admin/require-admin";
import { prisma } from "@/lib/db";
import { ApiResponse } from "@/lib/types";
import { revalidatePath } from "next/cache";

export async function deleteCourse(courseId: string): Promise<ApiResponse> {
  await requireAdmin();
  try {
    /* const req = await request();
    const decision = await aj.protect(req, { fingerprint: session.user.id });
    if (decision.isDenied()) {
      if (decision.reason.isRateLimit())
        return {
          status: "error",
          message: "You have blocked due to Rate Limiting ",
        };
      if (decision.reason.isBot())
        return {
          status: "error",
          message: "You are a bot",
        };
    }
 */

    await prisma.course.delete({
      where: {
        id: courseId,
      },
    });

    revalidatePath("/admin/courses");

    return {
      status: "success",
      message: "Course deleted successfully",
    };
  } catch {
    return {
      status: "error",
      message: "Failed to delete course",
    };
  }
}
