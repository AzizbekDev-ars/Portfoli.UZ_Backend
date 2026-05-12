import express from "express";
import { asyncHandler, protect } from "../middlewares/checkerMiddleware.js";
import { upload_developer } from "../config/multer.js";
import { register, login, updateUser, deleteUser, getMe, getPublicPortfolio, uploadAvatar, deleteAvatar } from "../controllers/UserController.js";
import { getAnnouncements } from "../controllers/AdminController.js";

const authRoute = express.Router();

authRoute.post("/register", asyncHandler(register));
authRoute.post("/login", asyncHandler(login));
authRoute.get("/me", protect, asyncHandler(getMe));
authRoute.get("/announcements", protect, asyncHandler(getAnnouncements));
authRoute.get("/portfolio/:username", asyncHandler(getPublicPortfolio));
authRoute.put("/user", protect, asyncHandler(updateUser));
authRoute.put("/user/avatar", protect, upload_developer.single("avatar"), asyncHandler(uploadAvatar));
authRoute.delete("/user/avatar", protect, asyncHandler(deleteAvatar));
authRoute.delete("/user", protect, asyncHandler(deleteUser));

export default authRoute;