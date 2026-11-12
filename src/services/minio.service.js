import { randomUUID } from "node:crypto";
// import { minioClient } from "../utils/minio.js";
import { errorResponse, successResponse } from "../utils/response.js";
import path from "node:path";
import sharp from "sharp";
import * as Minio from "minio";

export const minioClient = new Minio.Client({
  endPoint: process.env.MINIO_ENDPOINT,
  port: parseInt(process.env.MINIO_PORT, 10),
  accessKey: process.env.MINIO_ACCESS_KEY,
  secretKey: process.env.MINIO_SECRET_KEY,
  useSSL: process.env.MINIO_USE_SSL === "true",
});

/**
 * Get list of objects from MinIO bucket
 * @param {string} bucketName - Name of the bucket
 * @param {string} prefix - Optional prefix to filter objects
 * @returns {Promise<Array>} List of objects
 */
export const listObjects = async (bucketName, prefix = "") => {
  const objectsList = [];

  const stream = minioClient.listObjectsV2(bucketName, prefix, true);

  for await (const obj of stream) {
    objectsList.push({
      name: obj.name,
      size: obj.size,
      lastModified: obj.lastModified,
      etag: obj.etag,
    });
  }

  return objectsList;
};

/**
 * Get presigned URL for file access
 * @param {string} bucketName - Name of the bucket
 * @param {string} filePath - Path to the file in bucket
 * @param {number} expiry - Expiry time in seconds (default 24 hours)
 * @returns {Promise<string>} Presigned URL
 */
export const getPresignedUrl = async (
  bucketName,
  filePath,
  expiry = 24 * 60 * 60,
) => {
  if (!filePath) return null;

  const url = await minioClient.presignedGetObject(
    bucketName,
    filePath,
    expiry,
  );
  return url;
};

/**
 * Upload image to MinIO with compression
 * @param {string} bucketName - Name of the bucket
 * @param {Object} fileData - File data from request.file()
 * @param {string} folder - Folder prefix (e.g., 'users', 'products')
 * @returns {Promise<string>} File path in MinIO
 */
export const uploadImageToMinio = async (
  bucketName,
  fileData,
  folder = "uploads",
) => {
  const buffer = await fileData.toBuffer();

  // Compress image using sharp
  const compressedBuffer = await sharp(buffer).webp({ quality: 50 }).toBuffer();

  const fileName = `${randomUUID()}.webp`;
  const filePath = `${folder}/${fileName}`;

  // Check if bucket exists, create if not
  const bucketExists = await minioClient.bucketExists(bucketName);
  if (!bucketExists) {
    await minioClient.makeBucket(bucketName, "us-east-1");
  }

  // Upload compressed file to MinIO
  await minioClient.putObject(
    bucketName,
    filePath,
    compressedBuffer,
    compressedBuffer.length,
    {
      "Content-Type": "image/webp",
    },
  );

  return filePath;
};

/**
 * Delete file from MinIO
 * @param {string} bucketName - Name of the bucket
 * @param {string} filePath - Path to the file in bucket
 * @returns {Promise<void>}
 */
export const deleteFileFromMinio = async (bucketName, filePath) => {
  try {
    await minioClient.removeObject(bucketName, filePath);
  } catch (error) {
    console.error(`Failed to delete file ${filePath}:`, error);
    throw error;
  }
};

export const uploadFile = async (request, reply) => {
  const BUCKET_NAME = "smartfarm-storage";

  try {
    const data = await request.file();

    if (!data) {
      return errorResponse(reply, "No file uploaded", null, 400);
    }

    const compressedBuffer = await sharp(buffer)
      .webp({ quality: 50 })
      .toBuffer();

    const fileName = `${randomUUID()}.webp`;
    const filePath = `users/${fileName}`;

    const bucketExists = await minioClient.bucketExists(BUCKET_NAME);
    if (!bucketExists) {
      await minioClient.makeBucket(BUCKET_NAME, "us-east-1");
    }

    // Upload compressed file to MinIO
    await minioClient.putObject(
      BUCKET_NAME,
      filePath,
      compressedBuffer,
      compressedBuffer.length,
      {
        "Content-Type": "image/webp",
      },
    );

    const fileData = {
      fileName: data.filename,
      filePath: filePath,
      mimeType: "image/webp",
      compressedBe: data.mimetype,
      size: buffer.length,
      bucket: BUCKET_NAME,
    };

    return successResponse(reply, "File uploaded successfully", fileData, 201);
  } catch (error) {
    console.error("Upload error:", error);
    return errorResponse(reply, "Failed to upload file", error, 500);
  }
};

/**
 * Get presigned URL for file access
 */
export const getFileUrl = async (request, reply) => {
  try {
    const { filePath } = request.params;

    if (!filePath) {
      return errorResponse(reply, "File path is required", null, 400);
    }

    // Generate presigned URL (valid for 24 hours)
    const url = await minioClient.presignedGetObject(
      BUCKET_NAME,
      filePath,
      24 * 60 * 60,
    );

    return successResponse(
      reply,
      "File URL generated successfully",
      { url },
      200,
    );
  } catch (error) {
    console.error("Get URL error:", error);
    return errorResponse(reply, "Failed to generate file URL", error, 500);
  }
};

/**
 * Delete file from MinIO
 */
export const deleteFile = async (request, reply) => {
  try {
    const { filePath } = request.params;

    if (!filePath) {
      return errorResponse(reply, "File path is required", null, 400);
    }

    await minioClient.removeObject(BUCKET_NAME, filePath);

    return successResponse(reply, "File deleted successfully", null, 200);
  } catch (error) {
    console.error("Delete error:", error);
    return errorResponse(reply, "Failed to delete file", error, 500);
  }
};

/**
 * List all files in MinIO bucket
 */
export const listFiles = async (request, reply) => {
  try {
    const { prefix = "" } = request.query;
    const objectsList = [];

    const stream = minioClient.listObjectsV2(BUCKET_NAME, prefix, true);

    for await (const obj of stream) {
      objectsList.push({
        name: obj.name,
        size: obj.size,
        lastModified: obj.lastModified,
        etag: obj.etag,
      });
    }

    return successResponse(
      reply,
      "Files fetched successfully",
      objectsList,
      200,
    );
  } catch (error) {
    console.error("List files error:", error);
    return errorResponse(reply, "Failed to fetch files", error, 500);
  }
};

/**
 * Download file from MinIO
 */
export const downloadFile = async (request, reply) => {
  try {
    const { filePath } = request.params;

    if (!filePath) {
      return errorResponse(reply, "File path is required", null, 400);
    }

    const dataStream = await minioClient.getObject(BUCKET_NAME, filePath);

    reply.header(
      "Content-Disposition",
      `attachment; filename="${path.basename(filePath)}"`,
    );
    return reply.send(dataStream);
  } catch (error) {
    console.error("Download error:", error);
    return errorResponse(reply, "Failed to download file", error, 500);
  }
};
