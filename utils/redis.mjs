import { createClient } from "redis";

class RedisClient {
  constructor() {
    console.log("Initializing Redis client...");
    try {
      this.client = createClient({
        url: "redis://localhost:6379",
      });

      this.client.on("error", (err) => {
        console.error("Redis client error:", err);
      });

      this.connect();
    } catch (err) {
      console.error("Error during Redis client initialization:", err);
    }
  }

  async connect() {
    try {
      await this.client.connect();
      console.log("Redis client connected.");
    } catch (err) {
      console.error("Error connecting to Redis:", err);
    }
  }

  isAlive() {
    return this.client && this.client.isOpen;
  }

  async get(key) {
    try {
      return await this.client.get(key);
    } catch (err) {
      console.error("Error getting value from Redis:", err);
      return null;
    }
  }

  async set(key, value, duration) {
    try {
      await this.client.set(key, value, { EX: duration });
    } catch (err) {
      console.error("Error setting value in Redis:", err);
    }
  }

  async del(key) {
    try {
      await this.client.del(key);
    } catch (err) {
      console.error("Error deleting key from Redis:", err);
    }
  }
}

const redisClient = new RedisClient();

export default redisClient;
