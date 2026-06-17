import { cn } from "@/lib/utils";
import { CloudUploadIcon, ImageIcon, Loader2, XIcon } from "lucide-react";
import { Button } from "../ui/button";
import Image from "next/image";

export function RenderEmptyState(isDragActive: { isDragActive: boolean }) {
  return (
    <div className="text-center">
      <div className="flex items-center mx-auto justify-center size-12 rounded-full bg-muted mb-4">
        <CloudUploadIcon
          className={cn(
            "size-6 text-muted-foreground ",
            isDragActive && "text-primary",
          )}
        />
      </div>
      <p className="text-base font-semibold text-foreground">
        Drop your files here or{" "}
        <span className="text-primary font-bold cursor-pointer">
          Click to upload
        </span>
      </p>
      <Button type="button" className="mt-4">
        Select File
      </Button>
    </div>
  );
}

export function RenderErrorState() {
  return (
    <div className="text-center">
      <div className="flex items-center mx-auto justify-center size-12 rounded-full bg-destructive/30 mb-4">
        <ImageIcon className={cn("size-6 text-destructive")} />
      </div>
      <p className="text-base font-semibold">Upload failed</p>
      <p className="text-xs mt-1 text-muted-foreground">Something went wrong</p>
      <Button type="button" className="mt-4">
        Retry file selection
      </Button>
    </div>
  );
}

export function RenderUploadedState({
  previewUrl,
  isDeleting,
  handleRemoveFile,
  fileType,
  presignedVideoUrl,
}: {
  previewUrl: string;
  isDeleting: boolean;
  handleRemoveFile: () => void;
  fileType: "image" | "video";
  presignedVideoUrl: string;
}) {
  return (
    <div>
      <div className="relative group w-full h-full flex items-center justify-center">
        {fileType === "video" ? (
          <video
            key={presignedVideoUrl}
            src={presignedVideoUrl}
            controls
            crossOrigin="anonymous"
            preload="auto"
            className="rounded-md w-full h-full"
            style={{ width: "100%", height: "auto", maxWidth: "100%" }}
          />
        ) : (
          <Image
            unoptimized
            src={previewUrl}
            alt="Uploaded file"
            width={500}
            height={500}
            className="h-full w-75 object-contain p-2"
          />
        )}
      </div>
      <Button
        type="button"
        onClick={handleRemoveFile}
        disabled={isDeleting}
        variant="destructive"
        size="icon"
        className={cn("absolute top-4 right-4")}
      >
        {isDeleting ? (
          <Loader2 className="size-4 animate-spin" />
        ) : (
          <XIcon className="size-4" />
        )}
      </Button>
    </div>
  );
}

export function RenderUploadingState({
  progress,
  file,
}: {
  progress: number;
  file: File;
}) {
  return (
    <div className="text-center flex justify-center items-center flex-col">
      <p>{progress} </p>
      <p className="mt-2 text-sm font-medium text-foreground">Uploading...</p>
      <p className="mt-1 text-xs text-muted-foreground truncate max-w-xs">
        {file.name}
      </p>
    </div>
  );
}
