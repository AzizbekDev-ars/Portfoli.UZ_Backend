import express from "express";
import { asyncHandler } from "../middlewares/checkerMiddleware.js";
import { Settings } from "../models/SettingsModel.js";

const platformRouter = express.Router();

// Platforma umumiy sozlamalarini olish (Maintenance mode, Pro narxi va h.k.)
platformRouter.get("/settings", asyncHandler(async (req, res) => {
    let settings = await Settings.findOne();
    if (!settings) {
        settings = await Settings.create({});
    }
    
    // Faqat xavfsiz (ommaviy) ma'lumotlarni qaytaramiz
    res.json({
        siteName: settings.siteName,
        proPrice: settings.proPrice,
        maintenanceMode: settings.maintenanceMode,
        bannerActive: settings.bannerActive,
        bannerText: settings.bannerText,
        metaDesc: settings.metaDesc,
        freeProjectsLimit: settings.freeProjectsLimit,
        freeCertLimit: settings.freeCertLimit
    });
}));

export default platformRouter;
