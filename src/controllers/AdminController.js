import { User } from "../models/UserModel.js";
import { Visitor } from "../models/VisitorModel.js";
import { Transaction } from "../models/TransactionModel.js";
import { Announcement } from "../models/AnnouncementModel.js";
import { Project } from "../models/ProjectModel.js";
import { Message } from "../models/MessageModel.js";
import { Settings } from "../models/SettingsModel.js";
import { Experience } from "../models/ExperienceModel.js";
import { Certificate } from "../models/CertificateModel.js";
import bcrypt from "bcrypt";

// ... stats logic ...

// Settings management
export const getAdminSettings = async (req, res, next) => {
    try {
        let settings = await Settings.findOne();
        if (!settings) {
            settings = await Settings.create({});
        }
        res.json(settings);
    } catch (err) {
        next(err);
    }
};

export const updateAdminSettings = async (req, res, next) => {
    try {
        let settings = await Settings.findOne();
        if (!settings) {
            settings = new Settings({});
        }
        
        Object.assign(settings, req.body);
        await settings.save();
        res.json({ success: true, settings });
    } catch (err) {
        next(err);
    }
};

// Dashboard stats
export const getStats = async (req, res, next) => {
    try {
        const totalUsers = await User.countDocuments();
        const proUsers = await User.countDocuments({ isPro: true });
        const totalProjects = await Project.countDocuments();
        const totalMessages = await Message.countDocuments();
        
        // Total visits (all records in Visitor model)
        const totalVisits = await Visitor.countDocuments();
        
        // Unique visitors (distinct IPs)
        const uniqueVisitors = await Visitor.distinct("ip").then(ips => ips.length);
        
        // Financial stats
        const transactions = await Transaction.find();
        const totalRevenue = transactions
            .filter(t => t.type === "income")
            .reduce((sum, t) => sum + t.amount, 0);
        const totalExpenses = transactions
            .filter(t => t.type === "expense")
            .reduce((sum, t) => sum + t.amount, 0);

        res.json({
            totalUsers,
            proUsers,
            totalProjects,
            totalMessages,
            totalVisits,
            uniqueVisitors,
            totalRevenue,
            totalExpenses
        });
    } catch (err) {
        next(err);
    }
};


// User management
export const getAllUsers = async (req, res, next) => {
    try {
        const { search, filter, page = 1, limit = 10 } = req.query;
        let query = {};

        if (search) {
            query.$or = [
                { username: { $regex: search, $options: "i" } },
                { email: { $regex: search, $options: "i" } }
            ];
        }

        if (filter === "pro") {
            query.isPro = true;
        } else if (filter === "free") {
            query.isPro = false;
        }

        const users = await User.find(query)
            .select("-password")
            .sort({ createdAt: -1 })
            .skip((page - 1) * limit)
            .limit(parseInt(limit))
            .lean(); // Use lean for performance and to add extra fields

        // Fetch counts for each user
        const usersWithStats = await Promise.all(users.map(async (user) => {
            const [projects, messages, visitors, certificates, experiences] = await Promise.all([
                Project.countDocuments({ user: user._id }),
                Message.countDocuments({ user: user._id }),
                Visitor.countDocuments({ user: user._id }),
                Certificate.countDocuments({ user: user._id }),
                Experience.countDocuments({ user: user._id })
            ]);
            
            return {
                ...user,
                stats: {
                    projects,
                    messages,
                    visitors,
                    certificates,
                    experience: experiences
                }
            };
        }));


        const total = await User.countDocuments(query);

        res.json({
            users: usersWithStats,
            totalPages: Math.ceil(total / limit),
            currentPage: parseInt(page),
            total
        });
    } catch (err) {
        next(err);
    }
};


export const updateUserStatus = async (req, res, next) => {
    try {
        const { userId } = req.params;
        const { isPro, role } = req.body;
        
        const user = await User.findById(userId);
        if (!user) return next(new Error("Foydalanuvchi topilmadi"));

        if (isPro !== undefined) user.isPro = isPro;
        if (role !== undefined) user.role = role;

        await user.save();
        res.json({ success: true, user });
    } catch (err) {
        next(err);
    }
};

export const deleteUserAdmin = async (req, res, next) => {
    try {
        const { userId } = req.params;
        const user = await User.findByIdAndDelete(userId);
        if (!user) return next(new Error("Foydalanuvchi topilmadi"));
        res.json({ success: true, message: "Foydalanuvchi o'chirildi" });
    } catch (err) {
        next(err);
    }
};

// Announcements
export const getAnnouncements = async (req, res, next) => {
    try {
        const announcements = await Announcement.find().sort({ createdAt: -1 });
        res.json(announcements);
    } catch (err) {
        next(err);
    }
};

export const addAnnouncement = async (req, res, next) => {
    try {
        const { title, description, youtubeUrl } = req.body;
        const announcement = await Announcement.create({ title, description, youtubeUrl });
        res.status(201).json(announcement);
    } catch (err) {
        next(err);
    }
};

export const deleteAnnouncement = async (req, res, next) => {
    try {
        const { id } = req.params;
        await Announcement.findByIdAndDelete(id);
        res.json({ success: true });
    } catch (err) {
        next(err);
    }
};

// Transactions
export const getTransactions = async (req, res, next) => {
    try {
        const transactions = await Transaction.find().sort({ date: -1 });
        res.json(transactions);
    } catch (err) {
        next(err);
    }
};

export const addTransaction = async (req, res, next) => {
    try {
        const { type, amount, reason, date } = req.body;
        const transaction = await Transaction.create({ type, amount, reason, date });
        res.status(201).json(transaction);
    } catch (err) {
        next(err);
    }
};

export const deleteTransaction = async (req, res, next) => {
    try {
        const { id } = req.params;
        await Transaction.findByIdAndDelete(id);
        res.json({ success: true });
    } catch (err) {
        next(err);
    }
};

// Seed Super Admin
export const seedSuperAdmin = async (req, res, next) => {
    try {
        const { login, password } = req.body;
        
        // Checking if already exists
        const existing = await User.findOne({ username: login });
        if (existing) {
            existing.password = await bcrypt.hash(password, 10);
            existing.role = "admin";
            await existing.save();
            return res.json({ message: "Super Admin yangilandi", user: existing });
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        const admin = await User.create({
            username: login,
            email: "admin@portfolio.uz", // Default email
            password: hashedPassword,
            role: "admin",
            isPro: true
        });

        res.status(201).json({ message: "Super Admin yaratildi", user: admin });
    } catch (err) {
        next(err);
    }
};
