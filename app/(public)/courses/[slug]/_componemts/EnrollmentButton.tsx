"use client";

import { Button } from "@/components/ui/button";
import { tryCatch } from "@/hooks/try-catch";
import { useTransition } from "react";
import { enrollInCourseAction } from "../action";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

export function EnrollmentButton({ courseId }: { courseId: string }) {
  const [isPending, startTransition] = useTransition();

  function onSubmit() {
    startTransition(async () => {
      const { data, error } = await tryCatch(enrollInCourseAction(courseId));
      if (error) {
        toast.error("An unexpected  error occurred. Please try again");
        return;
      }
      if (data.status === "success") {
        toast.success(data.message);
      } else if (data.status === "error") {
        toast.error(data.message);
      }
    });
  }

  return (
    <Button onClick={onSubmit} disabled={isPending} className="w-full">
      {isPending ? (
        <>
          <Loader2 className="size-4 animate-spin" />
          Loading...
        </>
      ) : (
        "Enroll Now"
      )}
    </Button>
  );
}
