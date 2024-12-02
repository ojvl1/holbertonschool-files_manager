// controllers/FilesController.js
import Queue from "bull";
import imageThumbnail from "image-thumbnail";

// Create Bull queue
const fileQueue = new Queue("fileQueue");

class FilesController {
  // Existing methods...

  static async postUpload(req, res) {
    // ...Existing logic for validating input and saving the file...

    if (file.type === "image") {
      // Add job to Bull queue
      await fileQueue.add({
        userId,
        fileId: file._id.toString(),
      });
    }

    return res.status(201).send({
      id: file._id,
      userId: file.userId,
      name: file.name,
      type: file.type,
      isPublic: file.isPublic,
      parentId: file.parentId,
    });
  }
}
