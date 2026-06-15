"use client";
import React, { useEffect, useState } from "react";
import {
  DndContext,
  type DragEndEvent,
  closestCenter,
  PointerSensor,
  TouchSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import {
  SortableContext,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AdminCourseType } from "@/app/data/admin/admin-get-course";
import {
  ChevronDown,
  ChevronRight,
  FileText,
  GripVertical,
} from "lucide-react";
import Link from "next/link";
import { reorderChapters, reorderLessons } from "../actions";
import { toast } from "sonner";
import { NewChapterModal } from "./NewChapterModal";
import { NewLessonModal } from "./NewLessonModal";
import { DeleteLesson } from "./DeleteLesson";
import { DeleteChapter } from "./DeleteChapter";

interface SortableChapterProps {
  id: string;
  chapterId: string;
  title: string;
  isOpen: boolean;
  toggleOpen: () => void;
  lessons?: React.ReactNode;
  lessonCreate: React.ReactNode;
  courseId: string;
}
interface SortableLessonProps {
  id: string;
  chapterId: string;
  title: string;
  courseId: string;
  lessonId: string;
}

interface CourseStructureProps {
  data: AdminCourseType;
}
export function CourseStructure({ data }: CourseStructureProps) {
  const initialItems =
    data.chapters.map((chapter) => ({
      id: chapter.id,
      title: chapter.title,
      order: chapter.position,
      isOpen: true,
      lessons: chapter.lessons.map((lesson) => ({
        id: lesson.id,
        title: lesson.title,
        order: lesson.position,
      })),
    })) || [];
  const [items, setItems] = useState(initialItems);

  const sensors = useSensors(useSensor(PointerSensor), useSensor(TouchSensor));

  function getLessonOrderChanges(
    originalChapters: typeof initialItems,
    updatedChapters: typeof initialItems,
  ) {
    return updatedChapters
      .map((chapter) => {
        const lessonChanges = chapter.lessons
          .map((lesson) => {
            const originalChapter = originalChapters.find(
              (original) => original.id === chapter.id,
            );
            const originalLesson = originalChapter?.lessons.find(
              (originalLesson) => originalLesson.id === lesson.id,
            );
            if (!originalLesson || originalLesson.order === lesson.order) {
              return null;
            }
            return {
              lessonId: lesson.id,
              position: lesson.order,
            };
          })
          .filter(
            (
              change,
            ): change is {
              lessonId: string;
              position: number;
            } => change !== null,
          );

        return {
          chapterId: chapter.id,
          lessonChanges,
        };
      })
      .filter((chapter) => chapter.lessonChanges.length > 0);
  }

  function getChapterOrderChanges(
    originalChapters: typeof initialItems,
    updatedChapters: typeof initialItems,
  ) {
    return updatedChapters
      .map((chapter) => {
        const originalChapter = originalChapters.find(
          (original) => original.id === chapter.id,
        );
        const originalPosition = originalChapter?.order ?? -1;

        if (originalPosition === chapter.order) {
          return null;
        }

        return {
          chapterId: chapter.id,
          position: chapter.order,
        };
      })
      .filter(
        (
          change,
        ): change is {
          chapterId: string;
          position: number;
        } => change !== null,
      );
  }

  function toggleChapter(chapterId: string) {
    setItems(
      items.map((chapter) =>
        chapter.id === chapterId
          ? { ...chapter, isOpen: !chapter.isOpen }
          : chapter,
      ),
    );
  }

  function SortableChapter({
    id,
    title,
    isOpen,
    toggleOpen,
    lessons,
    lessonCreate,
    chapterId,
    courseId,
  }: SortableChapterProps) {
    const {
      setNodeRef,
      isDragging,
      attributes,
      listeners,
      transform,
      transition,
    } = useSortable({ id });

    const style = {
      transform: CSS.Translate.toString(transform),
      transition,
    };

    return (
      <>
        <li ref={setNodeRef} {...attributes} style={style}>
          <div
            className="flex  items-center justify-between p-3 border-b border-border"
            data-shadow={isDragging || undefined}
          >
            <div className="flex items-center gap-2">
              <button
                type="button"
                className="cursor-grab opacity-60 hover:opacity-100 rounded-lg border border-transparent bg-clip-padding text-sm font-medium whitespace-nowrap transition-all outline-none select-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 active:not-aria-[haspopup]:translate-y-px disabled:pointer-events-none disabled:opacity-50 aria-invalid:border-destructive aria-invalid:ring-3 aria-invalid:ring-destructive/20 dark:aria-invalid:border-destructive/50 dark:aria-invalid:ring-destructive/40 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4"
                {...listeners}
              >
                <GripVertical className="size-4" />
              </button>
              <Button onClick={toggleOpen} type="button" variant="outline">
                {isOpen ? (
                  <ChevronDown className="size4" />
                ) : (
                  <ChevronRight className="size4" />
                )}
              </Button>
            </div>
            <div className="flex-1 min-w-0 px-4 text-center">
              <p className="truncate cursor-pointer hover:text-primary">
                {title}
              </p>
            </div>
            <DeleteChapter chapterId={chapterId} courseId={courseId} />
          </div>
        </li>
        {lessons}
        {lessonCreate}
      </>
    );
  }

  function SortableLesson({
    id,
    title,
    chapterId,
    courseId,
    lessonId,
  }: SortableLessonProps) {
    const {
      setNodeRef,
      isDragging,
      attributes,
      listeners,
      transform,
      transition,
    } = useSortable({ id });

    const style = {
      transform: CSS.Translate.toString(transform),
      transition,
    };

    return (
      <li ref={setNodeRef} {...attributes} style={style}>
        <div
          className="flex flex-row items-center justify-between p-3 border-b border-border"
          data-shadow={isDragging || undefined}
        >
          <div className="flex items-center gap-2">
            <button
              type="button"
              className="cursor-grab opacity-60 hover:opacity-100 rounded-lg border border-transparent bg-clip-padding text-sm font-medium whitespace-nowrap transition-all outline-none select-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 active:not-aria-[haspopup]:translate-y-px disabled:pointer-events-none disabled:opacity-50 aria-invalid:border-destructive aria-invalid:ring-3 aria-invalid:ring-destructive/20 dark:aria-invalid:border-destructive/50 dark:aria-invalid:ring-destructive/40 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4"
              {...listeners}
            >
              <GripVertical className="size-4" />
            </button>
            <FileText className="size-4" />
          </div>
          <div className="flex-1 min-w-0 px-4 text-center">
            <Link
              className="block w-full truncate"
              href={`/admin/courses/${courseId}/${chapterId}/${lessonId}`}
            >
              {title}
            </Link>
          </div>
          <DeleteLesson
            chapterId={chapterId}
            courseId={courseId}
            lessonId={lessonId}
          />
        </div>
      </li>
    );
  }

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setItems((prevItems) => {
      const updatedItems =
        data.chapters.map((chapter) => ({
          id: chapter.id,
          title: chapter.title,
          order: chapter.position,
          isOpen:
            prevItems.find((item) => item.id === chapter.id)?.isOpen ?? true,
          lessons: chapter.lessons.map((lesson) => ({
            id: lesson.id,
            title: lesson.title,
            order: lesson.position,
          })),
        })) || [];
      return updatedItems;
    });
  }, [data]);

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      /*
      onDragStart={(event) => {
        console.log("[CourseStructure] onDragStart", {
          active: String(event.active.id),
        });
      }}
      onDragOver={(event) => {
        console.log("[CourseStructure] onDragOver", {
          over: event.over?.id ? String(event.over.id) : null,
        });
      }}
        */

      onDragEnd={(event: DragEndEvent) => {
        const activeIdStr = String(event.active.id);
        const overIdStr = event.over?.id ? String(event.over.id) : null;

        if (!overIdStr || activeIdStr === overIdStr) return;

        const isActiveChapter = activeIdStr.startsWith("chapter-");
        const isOverChapter = overIdStr.startsWith("chapter-");

        const activeRaw = activeIdStr.replace(/^chapter-|^lesson-/, "");
        const overRaw = overIdStr.replace(/^chapter-|^lesson-/, "");

        // Work with current items outside of the state updater to avoid side-effects during render
        const currentItems = items;

        // Move chapter
        if (isActiveChapter) {
          const next = [...currentItems];
          const from = next.findIndex((c) => c.id === activeRaw);
          const to = isOverChapter
            ? next.findIndex((c) => c.id === overRaw)
            : next.findIndex((c) => c.lessons.some((l) => l.id === overRaw));
          if (from === -1 || to === -1) return;
          const [moved] = next.splice(from, 1);
          next.splice(to, 0, moved);
          const updated = next.map((c, i) => ({ ...c, order: i + 1 }));
          const previousItems = [...items];

          const courseId = data.id;
          if (courseId) {
            const chapterOrderChanges = getChapterOrderChanges(
              initialItems,
              updated,
            );
            /*  console.log("[CourseStructure] Chapter order changes", {
              courseId,
              chapterOrderChanges,
            }); */
            //logChapterOrderChanges(initialItems, updated, courseId);
            const reorderChaptersPromise = () =>
              reorderChapters(
                courseId,
                chapterOrderChanges.map(({ chapterId, position }) => ({
                  id: chapterId,
                  position,
                })),
              );
            toast.promise(reorderChaptersPromise(), {
              loading: "Reordering Chapters...",
              success: (result) => {
                if (result.status === "success") {
                  return result.message;
                }
                throw new Error(result.message);
              },
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              error: (err: any) => {
                setItems(previousItems);
                return err?.message ?? "Failed to reorder chapters";
              },
            });
          }

          return updated;
        }

        // Move lesson within same chapter only
        const findChapterByLessonId = (id: string) =>
          currentItems.find((chapter) =>
            chapter.lessons.some((l) => l.id === id),
          );

        const activeChapter = findChapterByLessonId(activeRaw);
        const overChapter = isOverChapter
          ? currentItems.find((c) => c.id === overRaw)
          : findChapterByLessonId(overRaw);

        if (
          !activeChapter ||
          !overChapter ||
          activeChapter.id !== overChapter.id
        ) {
          return;
        }

        const chapter = activeChapter;
        const lessons = [...chapter.lessons];
        const fromIndex = lessons.findIndex((l) => l.id === activeRaw);
        const toIndex = lessons.findIndex((l) => l.id === overRaw);
        if (fromIndex === -1 || toIndex === -1) return;

        const [movedLesson] = lessons.splice(fromIndex, 1);
        lessons.splice(toIndex, 0, movedLesson);
        const updated = currentItems.map((c) =>
          c.id === chapter.id
            ? {
                ...c,
                lessons: lessons.map((l, i) => ({ ...l, order: i + 1 })),
              }
            : c,
        );
        const previousItems = currentItems;

        const courseId = data.id;
        setItems(updated);

        if (courseId) {
          const lessonOrderChanges = getLessonOrderChanges(
            initialItems,
            updated,
          );
          const chapterOrderChanges = lessonOrderChanges.find(
            (change) => change.chapterId === chapter.id,
          );
          if (chapterOrderChanges) {
            /*   console.log("[CourseStructure] Lesson order changes", {
              courseId,
              lessonOrderChanges: chapterOrderChanges.lessonChanges,
            }); */

            const reorderLessonsPromise = () =>
              reorderLessons(
                chapter.id,
                chapterOrderChanges.lessonChanges.map(
                  ({ lessonId, position }) => ({
                    id: lessonId,
                    position,
                  }),
                ),
                courseId,
              );
            toast.promise(reorderLessonsPromise(), {
              loading: "Reordering Lessons...",
              success: (result) => {
                if (result.status === "success") {
                  return result.message;
                }
                throw new Error(result.message);
              },
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              error: (err: any) => {
                setItems(previousItems);
                return err?.message ?? "Failed to reorder lessons";
              },
            });
          }
        }
      }}
    >
      <Card>
        <CardHeader className="flex flex-row items-center justify-between border-b border-border">
          <CardTitle>Chapters</CardTitle>
          <NewChapterModal courseId={data.id} />
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <SortableContext
              items={items.map((c) => `chapter-${c.id}`)}
              strategy={verticalListSortingStrategy}
            >
              <ul className="list">
                {items.map((item) => (
                  <React.Fragment key={`chapter-${item.id}`}>
                    <SortableChapter
                      id={`chapter-${item.id}`}
                      chapterId={item.id}
                      courseId={data.id}
                      title={item.title}
                      isOpen={item.isOpen}
                      toggleOpen={() => toggleChapter(item.id)}
                      lessonCreate={
                        item.isOpen && (
                          <div className="p-2">
                            <NewLessonModal
                              chapterId={item.id}
                              courseId={data.id}
                            />
                          </div>
                        )
                      }
                      lessons={
                        item.isOpen && item.lessons.length > 0 ? (
                          <SortableContext
                            items={item.lessons.map((l) => `lesson-${l.id}`)}
                            strategy={verticalListSortingStrategy}
                          >
                            <ul className="mt-2 border-l border-border pl-3 space-y-4">
                              {item.lessons.map((lesson) => (
                                <SortableLesson
                                  key={`lesson-${lesson.id}`}
                                  id={`lesson-${lesson.id}`}
                                  title={lesson.title}
                                  chapterId={item.id}
                                  courseId={data.id}
                                  lessonId={lesson.id}
                                />
                              ))}
                            </ul>
                          </SortableContext>
                        ) : null
                      }
                    />
                  </React.Fragment>
                ))}
              </ul>
            </SortableContext>
          </div>
        </CardContent>
      </Card>
    </DndContext>
  );
}
