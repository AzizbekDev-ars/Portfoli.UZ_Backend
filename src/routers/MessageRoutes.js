import express from "express";
import { asyncHandler, protect } from "../middlewares/checkerMiddleware.js";
import { createMessage, getMessages, getOneMessage, updateMessage, deleteMessage } from "../controllers/MessageController.js";

const messageRouter = express.Router();

// Public route (Profil sahifasidan xabar qoldirish uchun)
messageRouter.post("/", asyncHandler(createMessage));

// Protected routes (Dashboard uchun)
messageRouter.get("/", protect, asyncHandler(getMessages));
messageRouter.get("/:id", protect, asyncHandler(getOneMessage));
messageRouter.put("/:id", protect, asyncHandler(updateMessage));
messageRouter.delete("/:id", protect, asyncHandler(deleteMessage));

export default messageRouter;