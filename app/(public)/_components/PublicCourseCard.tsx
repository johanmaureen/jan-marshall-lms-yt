"use client";

import { PublicCourseType } from "@/app/data/course/get-all-courses";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import Image from "next/image";
import { useEffect, useState } from "react";
import { clsx } from "clsx";
import Link from "next/link";
import { School, TimerIcon } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";

interface PublicCouresCardProps {
  data: PublicCourseType;
}

export function PublicCouresCard({ data }: PublicCouresCardProps) {
  const [presignedUrl, setPresignedUrl] = useState<string>("");

  useEffect(() => {
    const fetchPresignedUrl = async () => {
      try {
        const response = await fetch("/api/s3/get-url", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ key: data.fileKey }),
        });
        const data_response = await response.json();
        setPresignedUrl(data_response.presignedUrl);
      } catch (error) {
        console.error("Failed to fetch presigned URL:", error);
      }
    };

    fetchPresignedUrl();
  }, [data.fileKey]);

  return (
    <Card className="group relative py-0 gap-0">
      <Badge className="absolute top-2 right-2 z-10">{data.level}</Badge>

      {presignedUrl && (
        <Image
          unoptimized
          src={presignedUrl}
          alt="thumbnail"
          width={600}
          height={400}
          loading="eager"
          className="w-full h-full rounded-t-lg aspect-video object-cover"
        />
      )}
      <CardContent className="p-4 ">
        <Link
          className="font-medium text-lg line-clamp-2 hover:underline group-hover:text-primary transition-colors "
          href={`/coureses/${data.slug}`}
        >
          {data.title}
        </Link>
        <p className="line-clamp-2 text-sm text-muted-foreground learning-tight mt-2">
          {data.smallDescription}
        </p>
        <div className="mt-4 flex items-center gap-x-5">
          <div className="flex items-center gap-x-2">
            <TimerIcon className="size-6 p-1 rounded-md text-primary bg-primary/10" />
            <p className="text-sm text-muted-foreground">{data.duration}h</p>
          </div>
          <div className="flex items-center gap-x-2">
            <School className="size-6 p-1 rounded-md text-primary bg-primary/10" />
            <p className="text-sm text-muted-foreground">{data.category}</p>
          </div>
        </div>
        <Link
          href={`/courses/${data.slug}`}
          className={buttonVariants({ className: "w-full mt-4" })}
        >
          Learn More
        </Link>
      </CardContent>
    </Card>
  );
}
export function PublicCourseCardSkeleton() {
  return (
    <Card className="group relative py-0 gap-0">
      <div className="absolute top-2 right-2 z-10 flex items-center">
        <Skeleton className="h-6 w-20 rounded-full" />
      </div>
      <div className="w-full relative h-fit">
        <Skeleton className="w-full rounded-t-xl aspect-video" />
      </div>
      <CardContent className="p-4">
        <div className="space-y-2">
          <Skeleton className="h-6 w-full" />
          <Skeleton className="h-6 w-3/4" />
        </div>
        <div className="mt-4 flex items-center gap-x-5">
          <div className="flex items-center gap-x-2">
            <Skeleton className="size-6 rounded-md" />
            <Skeleton className="h-4 w-8 rounded-md" />
          </div>
          <div className="flex items-center gap-x-2">
            <Skeleton className="size-6 rounded-md" />
            <Skeleton className="h-4 w-8 rounded-md" />
          </div>
        </div>
        <Skeleton className="mt-4 h-10 w-full rounded-md" />
      </CardContent>
    </Card>
  );
}
