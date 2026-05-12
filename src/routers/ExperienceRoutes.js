import express from "express";
import { protect, asyncHandler } from "../middlewares/checkerMiddleware.js";
import { createExperience, getExperiences, updateExperience, deleteExperience } from "../controllers/ExperienceController.js";

const experienceRouter = express.Router();

experienceRouter.post("/", protect, asyncHandler(createExperience));
experienceRouter.get("/", protect, asyncHandler(getExperiences));
experienceRouter.put("/:id", protect, asyncHandler(updateExperience));
experienceRouter.delete("/:id", protect, asyncHandler(deleteExperience));

export default experienceRouter;
