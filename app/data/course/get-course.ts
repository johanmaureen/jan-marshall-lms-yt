import { prisma } from "@/lib/db";
import { notFound } from "next/navigation";

export async function getIndividualCourse(slug: string) {
  const course = await prisma.course.findUnique({
    where: {
      slug: slug,
    },
    select: {
      id: true,
      title: true,
      price: true,
      description: true,
      smallDescription: true,
      slug: true,
      fileKey: true,
      level: true,
      duration: true,
      category: true,
      chapters: {
        select: {
          id: true,
          title: true,
          lessons: {
            select: {
              id: true,
              title: true,
            },
            orderBy: {
              position: "asc",
            },
          },
        },
        orderBy: {
          position: "asc",
        },
      },
    },
  });

  if (!course) {
    return notFound();
  }

  return course;
}

export type IndividualCourseType = Awaited<
  ReturnType<typeof getIndividualCourse>
>;
