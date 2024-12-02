// controllers/FilesController.js
import redisClient from "../utils/redis.mjs";
import dbClient from "../utils/db.mjs";

class FilesController {
  /**
   * GET /files/:id
   * Retrieves a file document by its ID.
   */
  static async getShow(req, res) {
    const token = req.headers["x-token"];
    if (!token) return res.status(401).send("Unauthorized");

    const userId = await redisClient.get(`auth_${token}`);
    if (!userId) return res.status(401).send("Unauthorized");

    const fileId = req.params.id;
    if (!fileId) return res.status(404).send("Not found");

    const file = await dbClient.db.collection("files").findOne({
      _id: new dbClient.ObjectId(fileId),
      userId,
    });

    if (!file) return res.status(404).send("Not found");

    // Remove sensitive fields before sending response
    const { localPath, ...fileData } = file;
    return res.status(200).json(fileData);
  }

  /**
   * GET /files
   * Retrieves file documents for the authenticated user with pagination and optional parentId.
   */
  static async getIndex(req, res) {
    const token = req.headers["x-token"];
    if (!token) return res.status(401).send("Unauthorized");

    const userId = await redisClient.get(`auth_${token}`);
    if (!userId) return res.status(401).send("Unauthorized");

    const parentId = req.query.parentId || 0;
    const page = parseInt(req.query.page, 10) || 0;

    const matchFilter = {
      userId,
      parentId: parentId == 0 ? 0 : new dbClient.ObjectId(parentId),
    };

    const files = await dbClient.db
      .collection("files")
      .aggregate([
        { $match: matchFilter },
        { $skip: page * 20 },
        { $limit: 20 },
        { $project: { localPath: 0 } }, // Exclude sensitive field
      ])
      .toArray();

    return res.status(200).json(files);
  }
}

export default FilesController;
