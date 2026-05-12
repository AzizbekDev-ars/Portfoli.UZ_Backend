import express from "express";
import { asyncHandler, protect } from "../middlewares/checkerMiddleware.js";
import { CreateVisitor, GetVisitor, SendCountryStats, SendDailyStats, deleteVisitor } from "../controllers/VisitorController.js";

const visitorRouter = express.Router();

// Public route (Profil sahifasidan keladi)
visitorRouter.post("/report", asyncHandler(CreateVisitor));

// Protected routes (Dashboard uchun)
visitorRouter.get("/", protect, asyncHandler(GetVisitor));
visitorRouter.get("/stats/country", protect, asyncHandler(SendCountryStats));
visitorRouter.get("/stats/daily", protect, asyncHandler(SendDailyStats));
visitorRouter.delete("/:id", protect, asyncHandler(deleteVisitor));

export default visitorRouter;