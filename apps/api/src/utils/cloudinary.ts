import { v2 as cloudinary } from "cloudinary";
import { requireCloudinaryConfig } from "../config/env.js";

export type MediaUploadResult = {
  publicId: string;
  url: string;
  secureUrl: string;
  format: string | null;
  resourceType: "image" | "video" | "raw";
  width: number | null;
  height: number | null;
  bytes: number;
  durationSeconds: number | null;
};

export const allowedMimeTypes = [
  // Images
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
  "image/avif",
  // Videos
  "video/mp4",
  "video/webm",
  "video/quicktime",
  // Documents
  "application/pdf",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "application/vnd.ms-excel",
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  "application/vnd.ms-powerpoint",
  "application/vnd.openxmlformats-officedocument.presentationml.presentation",
];

export function normalizeResourceType(mimeType: string, fallback?: "image" | "video" | "raw"): "image" | "video" | "raw" {
  if (mimeType.startsWith("image/")) return "image";
  if (mimeType.startsWith("video/")) return "video";
  if (mimeType.startsWith("text/") && mimeType !== "text/html") return "raw";
  return fallback ?? "raw";
}

export function validateMimeType(mimeType: string): boolean {
  return allowedMimeTypes.includes(mimeType.toLowerCase());
}

const MAX_IMAGE_BYTES = 10 * 1024 * 1024; // 10 MB
const MAX_VIDEO_BYTES = 100 * 1024 * 1024; // 100 MB
const MAX_RAW_BYTES = 10 * 1024 * 1024; // 10 MB

export function validateFileSize(bytes: number, mimeType: string): boolean {
  if (mimeType.startsWith("video/")) return bytes <= MAX_VIDEO_BYTES;
  return bytes <= MAX_RAW_BYTES || bytes <= MAX_IMAGE_BYTES;
}

function getConfiguredCloudinary() {
  const config = requireCloudinaryConfig();
  cloudinary.config({
    cloud_name: config.cloudName,
    api_key: config.apiKey,
    api_secret: config.apiSecret,
    secure: true,
  });
  return cloudinary;
}

export function uploadMediaBuffer(
  buffer: Buffer,
  options: {
    folder?: string;
    publicId?: string;
    mimeType: string;
    tags?: string[];
    overwrite?: boolean;
  },
): Promise<MediaUploadResult> {
  const { folder, publicId, mimeType, tags, overwrite } = options;
  const resourceType = normalizeResourceType(mimeType);
  const cloud = getConfiguredCloudinary();

  return new Promise((resolve, reject) => {
    const stream = cloud.uploader.upload_stream(
      {
        folder,
        public_id: publicId,
        resource_type: resourceType,
        overwrite: overwrite ?? true,
        tags,
      },
      (error, result) => {
        if (error || !result) {
          reject(error ?? new Error("Cloudinary upload failed."));
          return;
        }

        resolve({
          publicId: result.public_id,
          url: result.url,
          secureUrl: result.secure_url,
          format: result.format ?? null,
          resourceType,
          width: result.width ?? null,
          height: result.height ?? null,
          bytes: result.bytes ?? 0,
          durationSeconds: typeof result.duration === "number" ? result.duration : null,
        });
      },
    );

    stream.on("error", reject);
    stream.end(buffer);
  });
}

export function destroyMedia(publicId: string, resourceType: "image" | "video" | "raw") {
  const cloud = getConfiguredCloudinary();
  return cloud.uploader.destroy(publicId, { resource_type: resourceType });
}

export function generateUploadSignature(params: {
  folder?: string;
  resourceType: "image" | "video" | "raw";
}) {
  const cloud = getConfiguredCloudinary();
  const timestamp = Math.round(Date.now() / 1000);
  const signaturePayload: Record<string, string | number> = {
    timestamp,
    ...(params.folder ? { folder: params.folder } : {}),
    resource_type: params.resourceType,
  };

  const signature = cloud.utils.api_sign_request(signaturePayload, cloud.config().api_secret as string);

  return {
    cloudName: cloud.config().cloud_name as string,
    apiKey: cloud.config().api_key as string,
    timestamp,
    signature,
    folder: params.folder,
    resourceType: params.resourceType,
  };
}
