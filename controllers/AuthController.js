// controllers/AuthController.js
import redisClient from "../utils/redis.mjs";
import dbClient from "../utils/db.mjs";
import { v4 as uuidv4 } from "uuid";
import sha1 from "sha1";

class AuthController {
  /**
   * GET /connect
   * Authenticates a user and generates a token.
   */
  static async getConnect(req, res) {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Basic ")) {
      return res.status(401).send("Unauthorized");
    }

    // Decode Base64 and extract email and password
    const base64Credentials = authHeader.split(" ")[1];
    const credentials = Buffer.from(base64Credentials, "base64").toString(
      "utf-8"
    );
    const [email, password] = credentials.split(":");

    if (!email || !password) {
      return res.status(401).send("Unauthorized");
    }

    // Check for user in MongoDB
    const hashedPassword = sha1(password);
    const user = await dbClient.db
      .collection("users")
      .findOne({ email, password: hashedPassword });

    if (!user) {
      return res.status(401).send("Unauthorized");
    }

    // Generate token and store in Redis
    const token = uuidv4();
    const redisKey = `auth_${token}`;
    await redisClient.set(redisKey, user._id.toString(), 24 * 3600);

    res.status(200).json({ token });
  }

  /**
   * GET /disconnect
   * Signs out the user by invalidating their token.
   */
  static async getDisconnect(req, res) {
    const token = req.headers["x-token"];
    if (!token) {
      return res.status(401).send("Unauthorized");
    }

    const redisKey = `auth_${token}`;
    const userId = await redisClient.get(redisKey);
    if (!userId) {
      return res.status(401).send("Unauthorized");
    }

    await redisClient.del(redisKey);
    res.status(204).send();
  }
}

export default AuthController;
