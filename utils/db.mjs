// utils/db.mjs
import { MongoClient } from "mongodb";

class DBClient {
  constructor() {
    const host = process.env.DB_HOST || "localhost";
    const port = process.env.DB_PORT || 27017;
    const database = process.env.DB_DATABASE || "files_manager";

    const uri = `mongodb://${host}:${port}`;
    this.client = new MongoClient(uri, { useUnifiedTopology: true });

    this.client
      .connect()
      .then(() => {
        this.db = this.client.db(database);
      })
      .catch((err) => {
        console.error("Failed to connect to MongoDB:", err);
      });
  }

  isAlive() {
    return (
      this.client && this.client.topology && this.client.topology.isConnected()
    );
  }

  async nbUsers() {
    try {
      return await this.db.collection("users").countDocuments();
    } catch (err) {
      console.error("Error counting documents in users collection:", err);
      return 0;
    }
  }

  async nbFiles() {
    try {
      return await this.db.collection("files").countDocuments();
    } catch (err) {
      console.error("Error counting documents in files collection:", err);
      return 0;
    }
  }
}

// Export an instance of DBClient
const dbClient = new DBClient();
export default dbClient;
