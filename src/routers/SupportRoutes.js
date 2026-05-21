import express from "express";
import { protect, asyncHandler } from "../middlewares/checkerMiddleware.js";
import { CreateSupportMessage } from "../controllers/SupportController.js";

const supportRouter = express.Router();

supportRouter.post("/", protect, asyncHandler(CreateSupportMessage));

export default supportRouter;
