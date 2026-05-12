import express from "express";
import { createCV, getCV, getPDF, updateCV, deleteCV, generateAutoCV, getPublicPDF } from "../controllers/CVControllers.js";
import { asyncHandler, protect } from "../middlewares/checkerMiddleware.js";
import { upload_cv } from "../config/multer.js";

const cvRouter = express.Router();

cvRouter.post("/", protect, upload_cv.single("cv_image"), asyncHandler(createCV));
cvRouter.post("/generate-auto", protect, asyncHandler(generateAutoCV));
cvRouter.get("/cv", protect, asyncHandler(getCV));
cvRouter.get("/pdf/:id", asyncHandler(getPDF));
cvRouter.get("/public-pdf/:username", asyncHandler(getPublicPDF));
cvRouter.put("/:id", protect, upload_cv.single("cv_image"), asyncHandler(updateCV));
cvRouter.delete("/:id", protect, asyncHandler(deleteCV));

export default cvRouter;