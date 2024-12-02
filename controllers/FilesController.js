// controllers/FilesController.js
import fs from "fs/promises";
import { existsSync } from "fs";
import mime from "mime-types";
import redisClient from "../utils/redis.mjs";
import dbClient from "../utils/db.mjs";

class FilesController {
  // Existing methods...

  /**
   * GET /files/:id/data
   * Retrieves the content of a file document by its ID.
   */
  static async getFile(req, res) {
    const fileId = req.params.id;
    if (!fileId) return res.status(404).send("Not found");

    const file = await dbClient.db.collection("files").findOne({
      _id: new dbClient.ObjectId(fileId),
    });

    if (!file) return res.status(404).send("Not found");

    // Validate file type
    if (file.type === "folder") {
      return res.status(400).send("A folder doesn't have content");
    }

    // Authenticate user if the file is not public
    if (!file.isPublic) {
      const token = req.headers["x-token"];
      if (!token) return res.status(404).send("Not found");

      const userId = await redisClient.get(`auth_${token}`);
      if (!userId || userId !== file.userId.toString()) {
        return res.status(404).send("Not found");
      }
    }

    // Check if the file exists locally
    if (!file.localPath || !existsSync(file.localPath)) {
      return res.status(404).send("Not found");
    }

    try {
      const fileContent = await fs.readFile(file.localPath);
      const mimeType = mime.lookup(file.name) || "application/octet-stream";
      res.setHeader("Content-Type", mimeType);
      return res.status(200).send(fileContent);
    } catch (error) {
      return res.status(500).send("Error retrieving file content");
    }
  }
}

export default FilesController;
