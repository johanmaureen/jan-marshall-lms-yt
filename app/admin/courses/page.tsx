import { adminGetCourses } from "@/app/data/admin/admin-get-courses";
import { buttonVariants } from "@/components/ui/button";
import Link from "next/link";
import { AdmindCourseCard } from "./_components/AdminCourseCard";

export default async function CouresePage() {
  const data = await adminGetCourses();
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
      <div className="grid  grid-cols-1 sm:grid-col-2 md:grid-col-1 md:grid-cols-1 lg:gid-cols-2 gap-7 ">
        {data.map((course) => (
          <AdmindCourseCard key={course.id} data={course} />
        ))}
      </div>
    </>
  );
}
