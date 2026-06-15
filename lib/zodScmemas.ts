import * as z from "zod";

export const courseLevels = ["Beginner", "Intermediate", "Advanced"] as const;
export const courseStatus = ["Draft", "Published", "Archived"] as const;
export const courseCategories = [
  "Development",
  "Business",
  "Finance",
  "It & Software",
  "Office productify",
  "Personal Development",
  "Design",
  "Marketing",
  "Health & Fitness",
  "Music",
  "Teaching & Academics",
] as const;

export const courseSchema = z.object({
  title: z
    .string()
    .min(3, "Title must be at least 3 characters long")
    .max(100, "Title must be at most 100 characters long"),
  description: z.string().min(3, "Description must be at least 3 characters."),
  price: z.coerce.number().min(1, "Price must be a positive number"),
  duration: z.coerce
    .number()
    .min(1, "Duration must be at least 1 hour")
    .max(500, "Description must be at most 500 hours."),
  level: z.enum(courseLevels, "Level is required"),
  category: z.enum(courseCategories, "Category is required"),
  smallDescription: z
    .string()
    .min(3, "Small Description must be at least 3 characters.")
    .max(200, "Small Description must be at most 200 characters long."),
  slug: z.string().min(3, "Slug must be at least 3 characters long"),
  status: z.enum(courseStatus, "Status is required"),
  fileKey: z.string(),
});

export const chapterSchema = z.object({
  name: z
    .string()
    .min(3, "Name must be at least 3 characters long")
    .max(100, "Title must be at most 100 characters long"),
  courseId: z.uuid("invalid courseId"),
});

export const lessonSchema = z.object({
  name: z
    .string()
    .min(3, "Name must be at least 3 characters long")
    .max(100, "Title must be at most 100 characters long"),
  courseId: z.uuid("invalid courseId"),
  chapterId: z.uuid("invalid chapterId"),
  description: z
    .string()
    .min(3, "Description must be at least 3 characters.")
    .optional(),
  thumbnailKey: z.string().optional(),
  videoKey: z.string().optional(),
});

export type CourseSchemaType = z.infer<typeof courseSchema>;
export type ChapterSchemaType = z.infer<typeof chapterSchema>;
export type LessonSchemaType = z.infer<typeof lessonSchema>;
