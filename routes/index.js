// routes/index.js
import express from "express";
import AppController from "../controllers/AppController.js";
import AuthController from "../controllers/AuthController.js";
import UserController from "../controllers/UserController.js";

const router = express.Router();

// Existing endpoints
router.get("/status", AppController.getStatus);
router.get("/stats", AppController.getStats);

// New endpoints
router.get("/connect", AuthController.getConnect);
router.get("/disconnect", AuthController.getDisconnect);
router.get("/users/me", UserController.getMe);

export default router;
