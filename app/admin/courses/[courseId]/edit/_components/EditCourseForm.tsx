"use client";
import { Loader2, PlusIcon, SparklesIcon } from "lucide-react";
import {
  courseCategories,
  courseLevels,
  courseSchema,
  CourseSchemaType,
  courseStatus,
} from "@/lib/zodScmemas";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import slugify from "slugify";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { RichTextEditor } from "@/components/rich-text-editor/Editor";
import { Uploader } from "@/components/file-uploader/Uploader";
import { useTransition } from "react";
import { tryCatch } from "@/hooks/try-catch";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { editCourse } from "../actions";
import { AdminCourseType } from "@/app/data/admin/admin-get-course";

interface iAppProps {
  data: AdminCourseType;
  presignedUrl: string;
  presignedVideoUrl: string;
}

export function EditCourseForm({
  data,
  presignedUrl,
  presignedVideoUrl,
}: iAppProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const form = useForm<CourseSchemaType>({
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    resolver: zodResolver(courseSchema as any),
    defaultValues: {
      title: data.title,
      description: data.description,
      price: data.price,
      duration: data.duration,
      level: data.level,
      smallDescription: data.smallDescription,
      slug: data.slug,
      status: data.status,
      category: data.category as CourseSchemaType["category"],
      fileKey: data.fileKey,
    },
  });
  function onSubmit(values: CourseSchemaType) {
    startTransition(async () => {
      const { data: result, error } = await tryCatch(
        editCourse(values, data.id),
      );
      if (error) {
        toast.error("An unexpected  error occurred. Please try again");
        return;
      }
      if (result.status === "success") {
        toast.success(result.message);
        form.reset();
        router.push("/admin/courses");
      } else if (result.status === "error") {
        toast.error(result.message);
      }
    });
  }
  return (
    <Form {...form}>
      <form className="space-y-6" onSubmit={form.handleSubmit(onSubmit)}>
        <FormField
          control={form.control}
          name="title"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Title</FormLabel>
              <FormControl>
                <Input placeholder="Title..." {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="slug"
          render={({ field }) => (
            <FormItem className="w-full">
              <FormLabel>Slug</FormLabel>
              <div className="flex gap-4">
                <FormControl className="flex-1">
                  <Input placeholder="Slug..." {...field} />
                </FormControl>
                <Button
                  onClick={() => {
                    const titleValue = form.getValues("title");
                    const slug = slugify(titleValue);
                    form.setValue("slug", slug, {
                      shouldValidate: true,
                    });
                  }}
                  className="self-end w-fit"
                  type="button"
                >
                  Generate Slug
                  <SparklesIcon className="ml-1" size={16} />
                </Button>
              </div>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="smallDescription"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Small Description</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Small Description..."
                  {...field}
                  className="min-h-30 "
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Description</FormLabel>
              <FormControl>
                <RichTextEditor field={field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="fileKey"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Thumbnail image</FormLabel>
              <FormControl>
                <Uploader
                  onChange={field.onChange}
                  value={field.value}
                  presignedUrl={presignedUrl}
                  fileTypeAccepted="image"
                  presignedVideoUrl={presignedVideoUrl}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <div className="grid gid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="category"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Category</FormLabel>
                <Select
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                >
                  <FormControl>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Select Category" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {courseCategories.map((category) => (
                      <SelectItem key={category} value={category}>
                        {category}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="level"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Level</FormLabel>
                <Select
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                >
                  <FormControl>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Select Level" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {courseLevels.map((category) => (
                      <SelectItem key={category} value={category}>
                        {category}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="duration"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Duration (hours)</FormLabel>
                <FormControl>
                  <Input placeholder="Duration" type="number" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="price"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Price ($)</FormLabel>
                <FormControl>
                  <Input placeholder="Price" type="number" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        <FormField
          control={form.control}
          name="status"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Status</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select Status" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {courseStatus.map((category) => (
                    <SelectItem key={category} value={category}>
                      {category}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button disabled={isPending} type="submit">
          {isPending ? (
            <>
              Updating...
              <Loader2 className="ml-1 size-4 animate-spin" />
            </>
          ) : (
            <>
              Update Course <PlusIcon className="ml-1  " size={16} />
            </>
          )}
        </Button>
      </form>
    </Form>
  );
}
