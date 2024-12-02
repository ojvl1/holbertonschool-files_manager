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

// New endpoint
router.post("/files", FilesController.postUpload);

export default router;
