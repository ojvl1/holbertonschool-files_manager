// controllers/AppController.js
import redisClient from "../utils/redis.mjs";
import dbClient from "../utils/db.mjs";

class AppController {
  /**
   * GET /status
   * Returns the status of Redis and MongoDB
   */
  static getStatus(req, res) {
    const redisStatus = redisClient.isAlive();
    const dbStatus = dbClient.isAlive();
    res.status(200).json({ redis: redisStatus, db: dbStatus });
  }

  /**
   * GET /stats
   * Returns the number of users and files in the database
   */
  static async getStats(req, res) {
    const usersCount = await dbClient.nbUsers();
    const filesCount = await dbClient.nbFiles();
    res.status(200).json({ users: usersCount, files: filesCount });
  }
}

export default AppController;
