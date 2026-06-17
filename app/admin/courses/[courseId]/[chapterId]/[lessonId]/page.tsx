import { adminGetLesson } from "@/app/data/admin/admin-get-lesson";
import { LessonForm } from "./_components/LessonForm";
import { getConstructUrl } from "@/hooks/use-construct-url";

type Params = Promise<{
  courseId: string;
  chapterId: string;
  lessonId: string;
}>;

export default async function LessonIdPage({ params }: { params: Params }) {
  const { chapterId, courseId, lessonId } = await params;
  const lesson = await adminGetLesson(lessonId);
  let presignedUrl = "";
  if (!lesson.thumbnailKey) {
    presignedUrl = "";
  } else {
    presignedUrl = await getConstructUrl(lesson.thumbnailKey ?? "");
  }
  let presignedVideoUrl = "";
  if (!lesson.videoKey) {
    presignedVideoUrl = "";
  } else {
    presignedVideoUrl = await getConstructUrl(lesson.videoKey ?? "");
  }
  return (
    <LessonForm
      chapterId={chapterId}
      data={lesson}
      courseId={courseId}
      presignedUrl={presignedUrl}
      presignedVideoUrl={presignedVideoUrl}
    />
  );
}
