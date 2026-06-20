"use client";

import { Button, buttonVariants } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { tryCatch } from "@/hooks/try-catch";
import Link from "next/link";
import { useTransition } from "react";
import { toast } from "sonner";
import { deleteCourse } from "./actions";
import { useParams, useRouter } from "next/navigation";
import { Loader2, Trash2 } from "lucide-react";

export default function DeleteCourseRoute() {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const { courseId } = useParams<{ courseId: string }>();
  function onSubmit() {
    startTransition(async () => {
      const { data, error } = await tryCatch(deleteCourse(courseId));
      if (error) {
        toast.error("An unexpected  error occurred. Please try again");
        return;
      }
      if (data.status === "success") {
        toast.success(data.message);
        router.push("/admin/courses");
      } else if (data.status === "error") {
        toast.error(data.message);
      }
    });
  }

  return (
    <div className="max-w-xl mx-auto w-full">
      <Card className="mt-32">
        <CardHeader>
          <CardTitle>Are you sure you want to delete this course?</CardTitle>
          <CardDescription>This action cannot be undone.</CardDescription>
        </CardHeader>
        <CardContent className="flex items-center justify-between ">
          <Link
            className={buttonVariants({ variant: "outline" })}
            href="/admin/courses"
          >
            Cancel
          </Link>
          <Button variant="destructive" onClick={onSubmit} disabled={isPending}>
            {isPending ? (
              <>
                <Loader2 className="size-4 animate-spin" />
                Deleting..
              </>
            ) : (
              <>
                <Trash2 className="size-4" />
                Delete
              </>
            )}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
