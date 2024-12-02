// controllers/FilesController.js
import redisClient from "../utils/redis.mjs";
import dbClient from "../utils/db.mjs";
import { v4 as uuidv4 } from "uuid";
import fs from "fs/promises";
import path from "path";

class FilesController {
  /**
   * POST /files
   * Creates a new file or folder in the database and optionally on disk.
   */
  static async postUpload(req, res) {
    const token = req.headers["x-token"];
    if (!token) return res.status(401).send("Unauthorized");

    const userId = await redisClient.get(`auth_${token}`);
    if (!userId) return res.status(401).send("Unauthorized");

    const { name, type, parentId = 0, isPublic = false, data } = req.body;

    // Validate required fields
    if (!name) return res.status(400).json({ error: "Missing name" });
    if (!["folder", "file", "image"].includes(type)) {
      return res.status(400).json({ error: "Missing type" });
    }
    if (!data && type !== "folder") {
      return res.status(400).json({ error: "Missing data" });
    }

    // Validate parentId if set
    if (parentId !== 0) {
      const parentFile = await dbClient.db
        .collection("files")
        .findOne({ _id: new dbClient.ObjectId(parentId) });
      if (!parentFile) {
        return res.status(400).json({ error: "Parent not found" });
      }
      if (parentFile.type !== "folder") {
        return res.status(400).json({ error: "Parent is not a folder" });
      }
    }

    const newFile = {
      userId: userId,
      name,
      type,
      isPublic,
      parentId,
    };

    // Handle file or image type
    if (type === "file" || type === "image") {
      const folderPath = process.env.FOLDER_PATH || "/tmp/files_manager";
      await fs.mkdir(folderPath, { recursive: true });

      const localPath = path.join(folderPath, uuidv4());
      await fs.writeFile(localPath, Buffer.from(data, "base64"));
      newFile.localPath = localPath;
    }

    // Save file to the database
    const result = await dbClient.db.collection("files").insertOne(newFile);
    newFile.id = result.insertedId.toString();
    delete newFile.localPath; // Do not expose localPath in the response

    return res.status(201).json(newFile);
  }
}

export default FilesController;
