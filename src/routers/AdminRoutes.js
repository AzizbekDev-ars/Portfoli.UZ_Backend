import express from "express";
import { protect, isAdmin, asyncHandler } from "../middlewares/checkerMiddleware.js";
import {
    getStats,
    getAllUsers,
    updateUserStatus,
    deleteUserAdmin,
    getAnnouncements,
    addAnnouncement,
    deleteAnnouncement,
    getTransactions,
    addTransaction,
    deleteTransaction,
    seedSuperAdmin,
    getAdminSettings,
    updateAdminSettings
} from "../controllers/AdminController.js";
import { GetAllSupportMessages, UpdateSupportStatus, DeleteSupportMessage } from "../controllers/SupportController.js";
import { GetGeneralVisitorStats, SendGeneralCountryStats, SendGeneralDailyStats } from "../controllers/VisitorController.js";

const adminRoute = express.Router();

// Publicly accessible for initial setup (or protected by a secret if needed)
adminRoute.get("/seed", asyncHandler(seedSuperAdmin));

// Protected admin routes
adminRoute.get("/stats", protect, isAdmin, asyncHandler(getStats));
adminRoute.get("/users", protect, isAdmin, asyncHandler(getAllUsers));
adminRoute.put("/users/:userId", protect, isAdmin, asyncHandler(updateUserStatus));
adminRoute.delete("/users/:userId", protect, isAdmin, asyncHandler(deleteUserAdmin));

adminRoute.get("/announcements", protect, asyncHandler(getAnnouncements));
adminRoute.post("/announcements", protect, isAdmin, asyncHandler(addAnnouncement));
adminRoute.delete("/announcements/:id", protect, isAdmin, asyncHandler(deleteAnnouncement));

adminRoute.get("/transactions", protect, isAdmin, asyncHandler(getTransactions));
adminRoute.post("/transactions", protect, isAdmin, asyncHandler(addTransaction));
adminRoute.delete("/transactions/:id", protect, isAdmin, asyncHandler(deleteTransaction));

adminRoute.get("/settings", protect, isAdmin, asyncHandler(getAdminSettings));
adminRoute.put("/settings", protect, isAdmin, asyncHandler(updateAdminSettings));

// Support Routes
adminRoute.get("/support", protect, isAdmin, asyncHandler(GetAllSupportMessages));
adminRoute.put("/support/:id", protect, isAdmin, asyncHandler(UpdateSupportStatus));
adminRoute.delete("/support/:id", protect, isAdmin, asyncHandler(DeleteSupportMessage));

// Visitor Stats Routes
adminRoute.get("/visitors/stats", protect, isAdmin, asyncHandler(GetGeneralVisitorStats));
adminRoute.get("/visitors/country", protect, isAdmin, asyncHandler(SendGeneralCountryStats));
adminRoute.get("/visitors/daily", protect, isAdmin, asyncHandler(SendGeneralDailyStats));

export default adminRoute;

