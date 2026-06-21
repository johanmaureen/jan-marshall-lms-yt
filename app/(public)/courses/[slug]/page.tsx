import { getIndividualCourse } from "@/app/data/course/get-course";
import { RenderDescription } from "@/components/rich-text-editor/RenderDescription";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { getConstructUrl } from "@/hooks/use-construct-url";
import { IconCategory, IconChartBar, IconClock } from "@tabler/icons-react";
import Image from "next/image";

type Params = Promise<{ slug: string }>;

export default async function SlugPage({ params }: { params: Params }) {
  const { slug } = await params;
  const course = await getIndividualCourse(slug);
  const presignedUrl = await getConstructUrl(course.fileKey ?? "");

  return (
    <div className="grid grid-cols-1 gap-8 lg:grid-cols-3 mt-5">
      <div className="order-1 lg:col-span-2">
        <div className="relative  aspect-video w-full  overflow-hidden rounded-xl shadow-lg">
          {presignedUrl && (
            <Image
              unoptimized
              src={presignedUrl}
              alt="thumbnail"
              fill
              priority
              className="rounded-t-lg object-cover"
            />
          )}
          <div className="absolute inset-0 bg-linear-to-t from-black/20 to-transparent"></div>
        </div>

        <div className="mt-8 space-y-6">
          <div className="space-y-4">
            <h1 className="text-4xl font-bold tracking-tight">
              {course.title}
            </h1>
            <p className="text-lg text-muted-foreground leading-relaxed line-clamp-2">
              {course.smallDescription}
            </p>
          </div>
          <div className="flex flex-wrao gap-3">
            <Badge className="flex items-center gap-1 px-3 py-1">
              <IconChartBar className="size-4" />
              <span>{course.level}</span>
            </Badge>
            <Badge className="flex items-center gap-1 px-3 py-1">
              <IconCategory className="size-4" />
              <span>{course.category}</span>
            </Badge>
            <Badge className="flex items-center gap-1 px-3 py-1">
              <IconClock className="size-4" />
              <span>{course.duration} hours</span>
            </Badge>
          </div>
          <Separator className="my-8" />
          <div className="space-y-6">
            <h2 className="text-3xl font-semibold tracking-tight">
              Course Description
            </h2>
            <div>
              <RenderDescription json={JSON.parse(course.description)} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
