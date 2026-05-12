import mongoose from "mongoose";

const settingsSchema = new mongoose.Schema({
    proPrice: { type: Number, default: 50000 },
    freeProjectsLimit: { type: Number, default: 3 },
    freeCertLimit: { type: Number, default: 2 },
    siteName: { type: String, default: "Portfolio.uz" },
    metaDesc: { type: String, default: "Yaratuvchilar uchun eng zo'r portfolio platformasi" },
    maintenanceMode: { type: Boolean, default: false },
    bannerActive: { type: Boolean, default: false },
    bannerText: { type: String, default: "" }
});

export const Settings = mongoose.model("Settings", settingsSchema);
