import { adminGetCourses } from "@/app/data/admin/admin-get-courses";
import { buttonVariants } from "@/components/ui/button";
import Link from "next/link";
import {
  AdminCourseCardSkeleton,
  AdmindCourseCard,
} from "./_components/AdminCourseCard";
import { EmptyState } from "@/components/general/EmptyState";
import { Suspense } from "react";

export default function CouresePage() {
  return (
    <>
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Your Courses</h1>
        <Link href="/admin/courses/create" className={buttonVariants()}>
          Create Course
        </Link>
      </div>
      <div>
        <h1>Here you will see all of the courses</h1>
      </div>
      <Suspense fallback={<AdminCourseCardSkeletonLayout />}>
        <RenderCourses />
      </Suspense>
    </>
  );
}

async function RenderCourses() {
  const data = await adminGetCourses();

  return (
    <>
      {data.length === 0 ? (
        <EmptyState
          buttonText="Create Course"
          description="Create a new course to get started"
          title="No courses found"
          href="/admin/courses/create"
        />
      ) : (
        <div className="grid  grid-cols-1 sm:grid-col-1 md:grid-col-2 lg:grid-cols-3 gap-7 ">
          {data.map((course) => (
            <AdmindCourseCard key={course.id} data={course} />
          ))}
        </div>
      )}
    </>
  );
}

function AdminCourseCardSkeletonLayout() {
  return (
    <div className="grid  grid-cols-1 sm:grid-col-1 md:grid-col-2 gap-7">
      {Array.from({ length: 4 }).map((_, index) => (
        <AdminCourseCardSkeleton key={index} />
      ))}
    </div>
  );
}
