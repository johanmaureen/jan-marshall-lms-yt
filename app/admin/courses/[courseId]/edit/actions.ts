"use server";

import { requireAdmin } from "@/app/data/admin/require-admin";
import { prisma } from "@/lib/db";
import { ApiResponse } from "@/lib/types";
import { courseSchema, CourseSchemaType } from "@/lib/zodScmemas";
import arcjet, { detectBot, fixedWindow } from "@/lib/arcjet";
import { request } from "@arcjet/next";
import { revalidatePath } from "next/cache";

const aj = arcjet
  .withRule(
    detectBot({
      mode: "LIVE",
      allow: [],
    }),
  )
  .withRule(
    fixedWindow({
      mode: "LIVE",
      window: "1m",
      max: 5,
    }),
  );
export async function editCourse(
  input: CourseSchemaType,
  courseId: string,
): Promise<ApiResponse> {
  const session = await requireAdmin();
  try {
    const req = await request();
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

    const validation = courseSchema.safeParse(input);
    if (!validation.success) {
      return {
        status: "error",
        message: "Invalid Form Data",
      };
    }
    await prisma.course.updateMany({
      where: {
        id: courseId,
        userId: session.user.id,
      },
      data: {
        ...validation.data,
      },
    });
    return {
      status: "success",
      message: "Course updated successfully",
    };
  } catch {
    return {
      status: "error",
      message: "Failed to create course",
    };
  }
}

export async function reorderLessons(
  chapterId: string,
  lessons: {
    id: string;
    position: number;
  }[],
  courseId: string,
): Promise<ApiResponse> {
  await requireAdmin();
  try {
    if (!lessons || lessons.length === 0) {
      return {
        status: "error",
        message: "No lessons provided for reordering",
      };
    }
    //console.log("reorderLessons called", { courseId, chapterId, lessons });
    try {
      for (const lesson of lessons) {
        await prisma.lesson.update({
          where: { id: lesson.id },
          data: { position: lesson.position },
        });
      }
      revalidatePath(`/admin/courses/${courseId}/edit`);
      return {
        status: "success",
        message: "Lessons reordered successfully",
      };
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
      console.error("reorderLessons error", { error });
      return {
        status: "error",
        message: error?.message ?? "Failed to reorder lessons",
      };
    }
  } catch {
    return {
      status: "error",
      message: "Failed to reorder lessons",
    };
  }
}
export async function reorderChapters(
  courseId: string,
  chapters: {
    id: string;
    position: number;
  }[],
): Promise<ApiResponse> {
  //console.log("reorderChapters called", { courseId, chapters });
  await requireAdmin();
  try {
    if (!chapters || chapters.length === 0) {
      return {
        status: "error",
        message: "No chapters provided for reordering",
      };
    }
    for (const chapter of chapters) {
      await prisma.chapter.update({
        where: { id: chapter.id },
        data: { position: chapter.position },
      });
    }
    revalidatePath(`/admin/courses/${courseId}/edit`);
    return {
      status: "success",
      message: "Chapters reordered successfully",
    };
  } catch {
    return {
      status: "error",
      message: "Failed to reorder chapters",
    };
  }
}
