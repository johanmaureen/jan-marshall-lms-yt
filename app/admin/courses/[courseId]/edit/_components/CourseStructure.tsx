"use client";
import React, { useState } from "react";
import {
  DndContext,
  type DragEndEvent,
  closestCenter,
  PointerSensor,
  MouseSensor,
  TouchSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import {
  SortableContext,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AdminCourseType } from "@/app/data/admin/admin-get-course";
import { ChevronDown, ChevronRight, GripVertical } from "lucide-react";
//import { CSS } from '@dnd-kit/utilities'

interface SortableChapterProps {
  id: string;
  chapterId: string;
  title: string;
  isOpen: boolean;
  toggleOpen: () => void;
  lessons?: React.ReactNode;
}
interface SortableLessonProps {
  id: string;
  chapterId: string;
  title: string;
}

function SortableChapter({
  id,
  title,
  isOpen,
  toggleOpen,
  lessons,
}: SortableChapterProps) {
  const { setNodeRef, isDragging, attributes, listeners } = useSortable({ id });

  return (
    <>
      <li ref={setNodeRef}>
        <div
          className="flex flex-row items-center justify-between"
          data-shadow={isDragging || undefined}
        >
          {title}
          <Button onClick={toggleOpen} type="button">
            {isOpen ? (
              <ChevronDown className="size4" />
            ) : (
              <ChevronRight className="size4" />
            )}
          </Button>
          <button
            type="button"
            className="cursor-grab opacity-60 hover:opacity-100 rounded-lg border border-transparent bg-clip-padding text-sm font-medium whitespace-nowrap transition-all outline-none select-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 active:not-aria-[haspopup]:translate-y-px disabled:pointer-events-none disabled:opacity-50 aria-invalid:border-destructive aria-invalid:ring-3 aria-invalid:ring-destructive/20 dark:aria-invalid:border-destructive/50 dark:aria-invalid:ring-destructive/40 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4"
            {...attributes}
            {...listeners}
          >
            <GripVertical className="size-4" />
          </button>
        </div>
      </li>
      {lessons}
    </>
  );
}

function SortableLesson({ id, title }: SortableLessonProps) {
  const { setNodeRef, isDragging, attributes, listeners } = useSortable({ id });

  return (
    <li ref={setNodeRef}>
      <div
        className="flex flex-row items-center justify-between"
        data-shadow={isDragging || undefined}
      >
        {title}
        <button
          type="button"
          className="cursor-grab opacity-60 hover:opacity-100 rounded-lg border border-transparent bg-clip-padding text-sm font-medium whitespace-nowrap transition-all outline-none select-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 active:not-aria-[haspopup]:translate-y-px disabled:pointer-events-none disabled:opacity-50 aria-invalid:border-destructive aria-invalid:ring-3 aria-invalid:ring-destructive/20 dark:aria-invalid:border-destructive/50 dark:aria-invalid:ring-destructive/40 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4"
          {...attributes}
          {...listeners}
        >
          <GripVertical className="size-4" />
        </button>
      </div>
    </li>
  );
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

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(MouseSensor),
    useSensor(TouchSensor),
  );

  function toggleChapter(chapterId: string) {
    setItems(
      items.map((chapter) =>
        chapter.id === chapterId
          ? { ...chapter, isOpen: !chapter.isOpen }
          : chapter,
      ),
    );
  }

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
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
      onDragEnd={(event: DragEndEvent) => {
        const activeIdStr = String(event.active.id);
        const overIdStr = event.over?.id ? String(event.over.id) : null;

        console.log("[CourseStructure] onDragEnd", {
          active: activeIdStr,
          over: overIdStr,
          isActiveChapter: activeIdStr.startsWith("chapter-"),
          isOverChapter: overIdStr?.startsWith("chapter-"),
          event,
        });

        setItems((items) => {
          if (!overIdStr || activeIdStr === overIdStr) return items;

          const isActiveChapter = activeIdStr.startsWith("chapter-");
          const isOverChapter = overIdStr.startsWith("chapter-");

          const activeRaw = activeIdStr.replace(/^chapter-|^lesson-/, "");
          const overRaw = overIdStr.replace(/^chapter-|^lesson-/, "");

          // Move chapter
          if (isActiveChapter) {
            const next = [...items];
            const from = next.findIndex((c) => c.id === activeRaw);
            const to = isOverChapter
              ? next.findIndex((c) => c.id === overRaw)
              : next.findIndex((c) => c.lessons.some((l) => l.id === overRaw));
            if (from === -1 || to === -1) return items;
            const [moved] = next.splice(from, 1);
            next.splice(to, 0, moved);
            const updated = next.map((c, i) => ({ ...c, order: i }));
            console.log("[CourseStructure] moved chapter", {
              moved: moved.id,
              updated,
            });
            return updated;
          }

          // Move lesson within same chapter only
          const findChapterByLessonId = (id: string) =>
            items.find((chapter) => chapter.lessons.some((l) => l.id === id));

          const activeChapter = findChapterByLessonId(activeRaw);
          const overChapter = isOverChapter
            ? items.find((c) => c.id === overRaw)
            : findChapterByLessonId(overRaw);

          if (
            !activeChapter ||
            !overChapter ||
            activeChapter.id !== overChapter.id
          ) {
            return items;
          }

          const chapter = activeChapter;
          const lessons = [...chapter.lessons];
          const fromIndex = lessons.findIndex((l) => l.id === activeRaw);
          const toIndex = lessons.findIndex((l) => l.id === overRaw);
          if (fromIndex === -1 || toIndex === -1) return items;

          const [movedLesson] = lessons.splice(fromIndex, 1);
          lessons.splice(toIndex, 0, movedLesson);
          const updated = items.map((c) =>
            c.id === chapter.id
              ? { ...c, lessons: lessons.map((l, i) => ({ ...l, order: i })) }
              : c,
          );
          console.log("[CourseStructure] moved lesson", {
            movedLesson: movedLesson.id,
            updatedLessons: updated.find((c) => c.id === chapter.id)?.lessons,
          });
          return updated;
        });
      }}
    >
      <Card>
        <CardHeader className="flex flex-row items-center justify-between border-b border-border">
          <CardTitle>Chapters</CardTitle>
        </CardHeader>
        <CardContent>
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
                    title={item.title}
                    isOpen={item.isOpen}
                    toggleOpen={() => toggleChapter(item.id)}
                    lessons={
                      item.isOpen && item.lessons.length > 0 ? (
                        <SortableContext
                          items={item.lessons.map((l) => `lesson-${l.id}`)}
                          strategy={verticalListSortingStrategy}
                        >
                          <ul className="ml-4 mt-2 border-l border-border pl-4">
                            {item.lessons.map((lesson) => (
                              <SortableLesson
                                key={`lesson-${lesson.id}`}
                                id={`lesson-${lesson.id}`}
                                title={lesson.title}
                                chapterId={item.id}
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
        </CardContent>
      </Card>
    </DndContext>
  );
}
