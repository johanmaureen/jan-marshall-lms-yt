"use server";

import { requireAdmin } from "@/app/data/admin/require-admin";
import { prisma } from "@/lib/db";
import { ApiResponse } from "@/lib/types";
import {
  chapterSchema,
  ChapterSchemaType,
  courseSchema,
  CourseSchemaType,
  lessonSchema,
  LessonSchemaType,
} from "@/lib/zodScmemas";
import arcjet, { fixedWindow } from "@/lib/arcjet";
import { request } from "@arcjet/next";
import { revalidatePath } from "next/cache";

const aj = arcjet.withRule(
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

export async function createChapter(
  values: ChapterSchemaType,
): Promise<ApiResponse> {
  await requireAdmin();
  try {
    /*  const req = await request();
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
    } */

    const validation = chapterSchema.safeParse(values);
    if (!validation.success) {
      return {
        status: "error",
        message: "Invalid Form Data",
      };
    }

    const maxPos = await prisma.chapter.findFirst({
      where: {
        courseId: validation.data.courseId,
      },
      select: {
        position: true,
      },
      orderBy: {
        position: "desc",
      },
    });

    await prisma.chapter.create({
      data: {
        title: validation.data.name,
        courseId: validation.data.courseId,
        position: (maxPos?.position ?? 0) + 1,
      },
    });
    revalidatePath(`/admin/courses/${validation.data.courseId}/edit`);
    return {
      status: "success",
      message: "Chapter created successfully",
    };
  } catch {
    return {
      status: "error",
      message: "Failed to create chapter",
    };
  }
}

export async function createLesson(
  values: LessonSchemaType,
): Promise<ApiResponse> {
  await requireAdmin();
  try {
    /*  const req = await request();
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
    } */

    const validation = lessonSchema.safeParse(values);
    if (!validation.success) {
      return {
        status: "error",
        message: "Invalid Form Data",
      };
    }

    const maxPos = await prisma.lesson.findFirst({
      where: {
        chapterId: validation.data.chapterId,
      },
      select: {
        position: true,
      },
      orderBy: {
        position: "desc",
      },
    });

    await prisma.lesson.create({
      data: {
        title: validation.data.name,
        chapterId: validation.data.chapterId,
        description: validation.data.description,
        videoKey: validation.data.videoKey,
        thumbnailKey: validation.data.thumbnailKey,
        position: (maxPos?.position ?? 0) + 1,
      },
    });
    revalidatePath(`/admin/courses/${validation.data.courseId}/edit`);
    return {
      status: "success",
      message: "Lesson created successfully",
    };
  } catch {
    return {
      status: "error",
      message: "Failed to create lesson",
    };
  }
}

export async function deleteLesson({
  courseId,
  lessonId,
  chapterId,
}: {
  courseId: string;
  lessonId: string;
  chapterId: string;
}): Promise<ApiResponse> {
  await requireAdmin();
  try {
    /*  const req = await request();
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
    } */

    const chapterWithLessons = await prisma.chapter.findUnique({
      where: {
        id: chapterId,
      },
      select: {
        lessons: {
          orderBy: {
            position: "asc",
          },
          select: {
            id: true,
            position: true,
          },
        },
      },
    });
    if (!chapterWithLessons) {
      return {
        status: "error",
        message: "Chapter not found",
      };
    }
    const lessons = chapterWithLessons.lessons;
    const lessonToDelete = lessons.find((lesson) => lesson.id === lessonId);
    if (!lessonToDelete) {
      return {
        status: "error",
        message: "Lesson not found in the chapter",
      };
    }
    const remainingLessons = lessons.filter((lesson) => lesson.id !== lessonId);
    remainingLessons.map(async (lesson, index) => {
      await prisma.lesson.update({
        where: {
          id: lesson.id,
        },
        data: {
          position: index + 1,
        },
      });
    });
    await prisma.lesson.delete({
      where: {
        id: lessonId,
        chapterId: chapterId,
      },
    });

    revalidatePath(`/admin/courses/${courseId}/edit`);

    return {
      status: "success",
      message: "Lesson deleted successfully",
    };
  } catch {
    return {
      status: "error",
      message: "Failed to delete lesson",
    };
  }
}

export async function deleteChapter({
  courseId,
  chapterId,
}: {
  courseId: string;
  chapterId: string;
}): Promise<ApiResponse> {
  await requireAdmin();
  try {
    /*  const req = await request();
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
    } */

    const courseWithChapters = await prisma.course.findUnique({
      where: {
        id: courseId,
      },
      select: {
        chapters: {
          orderBy: {
            position: "asc",
          },
          select: {
            id: true,
            position: true,
          },
        },
      },
    });
    if (!courseWithChapters) {
      return {
        status: "error",
        message: "Course not found",
      };
    }
    const chapters = courseWithChapters.chapters;
    const chapterToDelete = chapters.find(
      (chapter) => chapter.id === chapterId,
    );
    if (!chapterToDelete) {
      return {
        status: "error",
        message: "Chapter not found in the course",
      };
    }
    const remainingChapters = chapters.filter(
      (chapter) => chapter.id !== chapterId,
    );
    remainingChapters.map(async (chapter, index) => {
      await prisma.chapter.update({
        where: {
          id: chapter.id,
        },
        data: {
          position: index + 1,
        },
      });
    });

    await prisma.chapter.delete({
      where: {
        id: chapterId,
      },
    });

    revalidatePath(`/admin/courses/${courseId}/edit`);

    return {
      status: "success",
      message: "Chapter deleted successfully",
    };
  } catch {
    return {
      status: "error",
      message: "Failed to delete chapter",
    };
  }
}

export async function updateLesson(
  values: LessonSchemaType,
  lessonId: string,
): Promise<ApiResponse> {
  await requireAdmin();
  try {
    /*  const req = await request();
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
    } */

    const validation = lessonSchema.safeParse(values);
    if (!validation.success) {
      return {
        status: "error",
        message: "Invalid Form Data",
      };
    }

    await prisma.lesson.update({
      where: {
        id: lessonId,
      },
      data: {
        title: validation.data.name,
        chapterId: validation.data.chapterId,
        description: validation.data.description,
        videoKey: validation.data.videoKey,
        thumbnailKey: validation.data.thumbnailKey,
      },
    });
    return {
      status: "success",
      message: "Lesson updated successfully",
    };
  } catch {
    return {
      status: "error",
      message: "Failed to update lesson",
    };
  }
}
