// worker.js
import Queue from "bull";
import imageThumbnail from "image-thumbnail";
import fs from "fs/promises";
import { existsSync } from "fs";
import dbClient from "./utils/db.mjs";

// Create Bull queue
const fileQueue = new Queue("fileQueue");

fileQueue.process(async (job) => {
  const { fileId, userId } = job.data;

  if (!fileId) throw new Error("Missing fileId");
  if (!userId) throw new Error("Missing userId");

  // Find file in DB
  const file = await dbClient.db.collection("files").findOne({
    _id: new dbClient.ObjectId(fileId),
    userId: new dbClient.ObjectId(userId),
  });

  if (!file) throw new Error("File not found");

  if (file.type !== "image" || !file.localPath || !existsSync(file.localPath)) {
    throw new Error("File is not a valid image or does not exist locally");
  }

  // Generate thumbnails
  try {
    const sizes = [500, 250, 100];
    for (const size of sizes) {
      const thumbnail = await imageThumbnail(file.localPath, { width: size });
      const thumbnailPath = `${file.localPath}_${size}`;
      await fs.writeFile(thumbnailPath, thumbnail);
    }
  } catch (error) {
    console.error(`Error generating thumbnails: ${error.message}`);
    throw error;
  }
});
