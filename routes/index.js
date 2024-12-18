// routes/index.js
import express from "express";
import AppController from "../controllers/AppController.js";
import AuthController from "../controllers/AuthController.js";
import UserController from "../controllers/UserController.js";
import FilesController from "../controllers/FilesController.js";

const router = express.Router();

// Existing endpoints
router.get("/status", AppController.getStatus);
router.get("/stats", AppController.getStats);
router.get("/connect", AuthController.getConnect);
router.get("/disconnect", AuthController.getDisconnect);
router.get("/users/me", UserController.getMe);
router.post("/files", FilesController.postUpload);
router.get("/files/:id", FilesController.getShow);
router.get("/files", FilesController.getIndex);

// New endpoint
router.get("/files/:id/data", FilesController.getFile);

export default router;
