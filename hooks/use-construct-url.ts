import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { S3 } from "../lib/S3Client";
import { env } from "@/lib/env";
import { GetObjectCommand } from "@aws-sdk/client-s3";

export async function getConstructUrl(key: string) {
  const command = new GetObjectCommand({
    Bucket: env.NEXT_PUBLIC_S3_BUCKET_NAME_IMAGES,
    Key: key,
  });
  const signedUrl = await getSignedUrl(S3, command, {
    expiresIn: 3600,
  });
  return signedUrl;
}
