// controllers/UserController.js
import redisClient from "../utils/redis.mjs";
import dbClient from "../utils/db.mjs";

class UserController {
  /**
   * GET /users/me
   * Retrieves the current user's information based on their token.
   */
  static async getMe(req, res) {
    const token = req.headers["x-token"];
    if (!token) {
      return res.status(401).send("Unauthorized");
    }

    const redisKey = `auth_${token}`;
    const userId = await redisClient.get(redisKey);

    if (!userId) {
      return res.status(401).send("Unauthorized");
    }

    // Fetch user from MongoDB
    const user = await dbClient.db
      .collection("users")
      .findOne({ _id: new dbClient.ObjectId(userId) });

    if (!user) {
      return res.status(401).send("Unauthorized");
    }

    // Return user data
    res.status(200).json({ id: user._id, email: user.email });
  }
}

export default UserController;
