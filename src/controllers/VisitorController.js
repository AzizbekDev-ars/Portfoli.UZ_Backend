import { Visitor } from "../models/VisitorModel.js";
import axios from "axios";
import mongoose from "mongoose";

// Visitor yaratish + saqlash (Public profile va Platforma uchun)
export const CreateVisitor = async (req, res, next) => {
    try {
        const ip = req.headers["x-forwarded-for"] || req.socket.remoteAddress;
        let country = "Unknown";
        let city = "Unknown";
        try {
            const geoRes = await axios.get(`https://ipapi.co/${ip}/json`);
            country = geoRes.data.country_name || "Unknown";
            city = geoRes.data.city || "Unknown";
        } catch (geoErr) {
            console.error("Geo lookup failed:", geoErr.message);
        }

        const visitor = new Visitor({
            user: req.body.user || null, // Optional user ID
            page: req.body.page,
            method: req.method,
            ip,
            userAgent: req.headers["user-agent"],
            country,
            city
        });

        await visitor.save();
        res.json({ message: "tracked" });
    } catch (err) {
        next(err);
    }
};

// Visitor malumotlarini jo'natish (Dashboard uchun)
export const GetVisitor = async (req, res, next) => {
    try {
        const totalVisits = await Visitor.countDocuments({ user: req.user.id });
        const uniqueVisitors = await Visitor.distinct("ip", { user: req.user.id });
        const totalCVDownloads = await Visitor.countDocuments({ user: req.user.id, isCVDownload: true });
        
        // So'nggi tashriflar ro'yxati
        const recentVisitors = await Visitor.find({ user: req.user.id })
            .sort({ visitedAt: -1 })
            .limit(50);

        res.json({
            totalVisits,
            uniqueVisitors: uniqueVisitors.length,
            totalCVDownloads,
            recentVisitors
        });
    } catch (err) {
        next(err);
    }
};

// Davlatlar bo'yicha chart data (Dashboard uchun)
export const SendCountryStats = async (req, res, next) => {
    try {
        const data = await Visitor.aggregate([
            { $match: { user: new mongoose.Types.ObjectId(req.user.id) } },
            {
                $group: {
                    _id: "$country",
                    total: { $sum: 1 }
                }
            },
            { $sort: { total: -1 } }
        ]);
        res.json(data);
    } catch (err) {
        next(err);
    }
};

// Kunlik tashriflar bo'yicha chart data (Dashboard uchun)
export const SendDailyStats = async (req, res, next) => {
    try {
        const data = await Visitor.aggregate([
            { $match: { user: new mongoose.Types.ObjectId(req.user.id) } },
            {
                $group: {
                    _id: {
                        $dateToString: {
                            format: "%Y-%m-%d",
                            date: "$visitedAt"
                        }
                    },
                    total: { $sum: 1 }
                }
            },
            { $sort: { _id: 1 } }
        ]);
        res.json(data);
    } catch (err) {
        next(err);
    }
};

// ADMIN: Umumiy tashriflar (Hamma tashriflar)
export const GetGeneralVisitorStats = async (req, res, next) => {
    try {
        const totalVisits = await Visitor.countDocuments();
        const uniqueVisitors = await Visitor.distinct("ip");
        
        const recentVisitors = await Visitor.find()
            .populate("user", "username")
            .sort({ visitedAt: -1 })
            .limit(100);

        res.json({
            totalVisits,
            uniqueVisitors: uniqueVisitors.length,
            recentVisitors
        });
    } catch (err) {
        next(err);
    }
};

// ADMIN: Davlatlar bo'yicha umumiy stats
export const SendGeneralCountryStats = async (req, res, next) => {
    try {
        const data = await Visitor.aggregate([
            {
                $group: {
                    _id: "$country",
                    total: { $sum: 1 }
                }
            },
            { $sort: { total: -1 } }
        ]);
        res.json(data);
    } catch (err) {
        next(err);
    }
};

// ADMIN: Kunlik umumiy stats
export const SendGeneralDailyStats = async (req, res, next) => {
    try {
        const data = await Visitor.aggregate([
            {
                $group: {
                    _id: {
                        $dateToString: {
                            format: "%Y-%m-%d",
                            date: "$visitedAt"
                        }
                    },
                    total: { $sum: 1 }
                }
            },
            { $sort: { _id: 1 } }
        ]);
        res.json(data);
    } catch (err) {
        next(err);
    }
};

// Tashrifni o'chirish
export const deleteVisitor = async (req, res, next) => {
    try {
        const visitor = await Visitor.findOneAndDelete({ _id: req.params.id, user: req.user.id });
        if (!visitor) return next(new Error("Tashrif topilmadi"));
        res.json({ message: "Tashrif o'chirildi" });
    } catch (err) {
        next(err);
    }
};

