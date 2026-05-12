import { upload_projects } from "../config/multer.js";
import { asyncHandler, protect } from "../middlewares/checkerMiddleware.js";
import { createProject, getProjects, getOneProject, updateProjects, deleteProject } from "../controllers/ProjectController.js";
import express from "express";

const projectRouter = express.Router();

projectRouter.get("/", protect, asyncHandler(getProjects));
projectRouter.post("/", protect, upload_projects.single("project_image"), asyncHandler(createProject));
projectRouter.get("/:id", protect, asyncHandler(getOneProject));
projectRouter.put("/:id", protect, upload_projects.single("project_image"), asyncHandler(updateProjects));
projectRouter.delete("/:id", protect, asyncHandler(deleteProject));

export default projectRouter;
