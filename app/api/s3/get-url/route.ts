import { env } from "@/lib/env";
import { GetObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { NextResponse } from "next/server";
import { z } from "zod";
import { S3 } from "@/lib/S3Client";
import { requireAdmin } from "@/app/data/admin/require-admin";

export const getUrlSchema = z.object({
  key: z.string().min(1, "Key is required"),
});

export async function POST(request: Request) {
  await requireAdmin();
  try {
    const body = await request.json();
    const validation = getUrlSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json(
        { error: "Invalid request body" },
        { status: 400 },
      );
    }
    const { key } = validation.data;
    const command = new GetObjectCommand({
      Bucket: env.NEXT_PUBLIC_S3_BUCKET_NAME_IMAGES,
      Key: key,
    });
    const presignedUrl = await getSignedUrl(S3, command, { expiresIn: 3600 });
    return NextResponse.json({ presignedUrl });
  } catch {
    return NextResponse.json(
      {
        error: "Failed to generate presigned URL",
      },
      { status: 500 },
    );
  }
}
