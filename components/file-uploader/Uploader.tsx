"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { FileRejection, useDropzone } from "react-dropzone";
import { Card, CardContent } from "../ui/card";
import { cn } from "@/lib/utils";
import {
  RenderEmptyState,
  RenderErrorState,
  RenderUploadedState,
  RenderUploadingState,
} from "./RenderState";
import { toast } from "sonner";
import { v4 as uuidv4 } from "uuid";

interface UploaderState {
  id: string | null;
  file: File | null;
  uploading: boolean;
  progress: number;
  key?: string;
  isDeleting: boolean;
  error: boolean;
  objectUrl?: string;
  fileType: "image" | "video";
  presignedUrl?: string;
  presignedVideoUrl?: string;
}

interface UploaderProps {
  value?: string;
  onChange?: (value: string) => void;
  presignedUrl: string;
  fileTypeAccepted: "image" | "video";
  presignedVideoUrl: string;
}

export function Uploader({
  onChange,
  value,
  presignedUrl,
  fileTypeAccepted,
  presignedVideoUrl,
}: UploaderProps) {
  const isUploadingRef = useRef(false);
  const [fileState, setFileState] = useState<UploaderState>({
    error: false,
    file: null,
    id: null,
    uploading: false,
    progress: 0,
    isDeleting: false,
    fileType: fileTypeAccepted,
    key: value,
    presignedUrl: presignedUrl,
    presignedVideoUrl: presignedVideoUrl,
  });
  const uploadFile = useCallback(
    async (file: File) => {
      isUploadingRef.current = true;
      setFileState((prev) => ({
        ...prev,
        uploading: true,
        progress: 0,
      }));
      try {
        const presignedrResponse = await fetch("/api/s3/upload", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            fileName: file.name,
            contentType: file.type,
            size: file.size,
            isImage: fileTypeAccepted === "image" ? true : false,
          }),
        });
        if (!presignedrResponse.ok) {
          toast.error("Failed to get presigned URL");
          setFileState((prev) => ({
            ...prev,
            uploading: false,
            progress: 0,
            error: true,
          }));
          return;
        }
        const { presigenUrl, key } = await presignedrResponse.json();

        await new Promise<void>((resolve, reject) => {
          const xhr = new XMLHttpRequest();
          xhr.upload.onprogress = (event: ProgressEvent) => {
            if (event.lengthComputable) {
              const percentComplete = (event.loaded / event.total) * 100;
              setFileState((prev) => ({
                ...prev,
                progress: Math.round(percentComplete),
              }));
            }
          };
          xhr.onload = async () => {
            if (xhr.status === 200 || xhr.status === 204) {
              // Fetch presigned URL for viewing the uploaded file
              try {
                const getUrlResponse = await fetch("/api/s3/get-url", {
                  method: "POST",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify({ key }),
                });
                if (getUrlResponse.ok) {
                  const { presignedUrl } = await getUrlResponse.json();
                  setFileState((prev) => ({
                    ...prev,
                    progress: 100,
                    uploading: false,
                    key: key,
                    presignedUrl:
                      fileTypeAccepted === "image" ? presignedUrl : "",
                    presignedVideoUrl:
                      fileTypeAccepted === "video" ? presignedUrl : "",
                  }));
                } else {
                  setFileState((prev) => ({
                    ...prev,
                    progress: 100,
                    uploading: false,
                    key: key,
                  }));
                }
              } catch {
                setFileState((prev) => ({
                  ...prev,
                  progress: 100,
                  uploading: false,
                  key: key,
                }));
              }
              onChange?.(key);
              toast.success("File uploaded successfully");
              isUploadingRef.current = false;
              resolve();
            } else {
              reject(new Error("Upload failed..."));
            }
            xhr.onerror = () => {
              reject(new Error("Upload failed"));
            };
          };
          xhr.open("PUT", presigenUrl);
          xhr.setRequestHeader("Content-Type", file.type);
          xhr.send(file);
        });
      } catch {
        isUploadingRef.current = false;
        toast.error("Something wemt wromg");
        setFileState((prev) => ({
          ...prev,
          progress: 0,
          error: true,
          uploading: false,
        }));
      }
    },
    [fileTypeAccepted, onChange],
  );

  const onDrop = useCallback(
    (acceptedFiles: File[]) => {
      if (acceptedFiles.length > 0) {
        const file = acceptedFiles[0];
        if (fileState.objectUrl && !fileState.objectUrl.startsWith("http")) {
          URL.revokeObjectURL(fileState.objectUrl);
        }
        setFileState({
          file: file,
          uploading: false,
          progress: 0,
          objectUrl: URL.createObjectURL(file),
          error: false,
          id: uuidv4(),
          isDeleting: false,
          fileType: fileTypeAccepted,
        });
        uploadFile(file);
      }
    },
    [fileState.objectUrl, uploadFile, fileTypeAccepted],
  );

  async function handleRemoveFile() {
    if (fileState.isDeleting || !fileState.objectUrl) {
      return;
    }
    try {
      setFileState((prev) => ({
        ...prev,
        isDeleting: true,
        presignedUrl: "",
      }));
      const response = await fetch("/api/s3/delete", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          key: fileState.key,
        }),
      });
      if (!response.ok) {
        toast.error("Failed to remove file from storage");
        setFileState((prev) => ({
          ...prev,
          isDeleting: true,
          error: true,
          presignedUrl: "",
        }));

        return;
      }

      if (fileState.objectUrl && !fileState.objectUrl.startsWith("http")) {
        URL.revokeObjectURL(fileState.objectUrl);
      }
      onChange?.("");
      setFileState(() => ({
        file: null,
        uploading: false,
        progress: 0,
        objectUrl: undefined,
        error: false,
        id: null,
        isDeleting: false,
        fileType: fileTypeAccepted,
      }));
      toast.success("File removed successfully");
    } catch {
      toast.error("Error removing file. please try again");
      setFileState((prev) => ({
        ...prev,
        isDeleting: false,
        error: true,
      }));
    }
  }

  function rejectedFiles(fileRejection: FileRejection[]) {
    if (fileRejection.length) {
      const tooManyFiles = fileRejection.find(
        (rejection) => rejection.errors[0].code === "too-many-files",
      );
      if (tooManyFiles) {
        toast.error("Too many files selected, max is 1");
      }
      const fileSizeToBig = fileRejection.find(
        (rejection) => rejection.errors[0].code === "file-too-large",
      );
      if (fileSizeToBig) {
        toast.error("File size exceeds the limit");
      }
    }
  }

  function renderContent() {
    if (fileState.uploading) {
      return (
        <RenderUploadingState
          file={fileState.file as File}
          progress={fileState.progress}
        />
      );
    }
    if (fileState.error) {
      return <RenderErrorState />;
    }

    if (fileState.presignedVideoUrl !== "" && fileState.presignedVideoUrl) {
      return (
        <RenderUploadedState
          previewUrl=""
          handleRemoveFile={handleRemoveFile}
          isDeleting={fileState.isDeleting}
          fileType={fileState.fileType}
          presignedVideoUrl={fileState.presignedVideoUrl}
        />
      );
    }
    if (fileState.presignedUrl !== "" && fileState.presignedUrl) {
      return (
        <RenderUploadedState
          previewUrl={fileState.presignedUrl}
          handleRemoveFile={handleRemoveFile}
          isDeleting={fileState.isDeleting}
          fileType={fileState.fileType}
          presignedVideoUrl=""
        />
      );
    }
    if (fileState.objectUrl) {
      return (
        <RenderUploadedState
          previewUrl={fileState.objectUrl}
          handleRemoveFile={handleRemoveFile}
          isDeleting={fileState.isDeleting}
          fileType={fileState.fileType}
          presignedVideoUrl=""
        />
      );
    }

    return <RenderEmptyState isDragActive={isDragActive} />;
  }

  useEffect(() => {
    // Only sync props if not currently uploading
    // This prevents race conditions during file upload
    if (isUploadingRef.current) {
      return;
    }
    // Only sync props if they have values (loading existing file)
    // Don't overwrite state during new uploads
    setFileState((prev) => ({
      ...prev,
      presignedUrl: presignedUrl || prev.presignedUrl,
      presignedVideoUrl: presignedVideoUrl || prev.presignedVideoUrl,
      key: value || prev.key,
    }));
  }, [presignedUrl, presignedVideoUrl, value]);

  useEffect(() => {
    return () => {
      if (fileState.objectUrl && !fileState.objectUrl.startsWith("http")) {
        URL.revokeObjectURL(fileState.objectUrl);
      }
    };
  }, [fileState.objectUrl]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept:
      fileTypeAccepted === "video" ? { "video/*": [] } : { "image/*": [] },
    maxFiles: 1,
    maxSize: 10 * 1024 * 1024,
    onDropRejected: rejectedFiles,
    disabled:
      fileState.uploading ||
      !!fileState.objectUrl ||
      !!fileState.presignedUrl ||
      !!fileState.presignedVideoUrl,
  });

  return (
    <Card
      {...getRootProps()}
      className={cn(
        "relative border-2 border-dashed transition-colors duration-200 w-full h-64",
        isDragActive
          ? "border-primary bg-primary/10 border-solid"
          : "border-border hover:border-primary",
      )}
    >
      <CardContent className="flex items-center justify-center h-full w-full p-4">
        <input {...getInputProps()} />
        {renderContent()}
      </CardContent>
    </Card>
  );
}
