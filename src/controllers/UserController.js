import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { User } from "../models/UserModel.js";
import { Project } from "../models/ProjectModel.js";
import { Experience } from "../models/ExperienceModel.js";
import { Certificate } from "../models/CertificateModel.js";
import { CV } from "../models/CVModel.js";
import cloudinary from "../config/cloudinary.js";

// Register
export const register = async (req, res, next) => {
    try {
        const { username, email, password } = req.body;
        if (!username || !email || !password) {
            return res.status(400).json({ success: false, message: "Ma'lumot to'liq emas" });
        }

        // Check if email exists
        const existEmail = await User.findOne({ email });
        if (existEmail) {
            return res.status(400).json({ success: false, message: "Bu email allaqachon ro'yxatdan o'tgan!" });
        }

        // Check if username exists
        const existUsername = await User.findOne({ username });
        if (existUsername) {
            return res.status(400).json({ success: false, message: "Bu username allaqachon band qilingan!" });
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        const user = await User.create({
            username,
            email,
            password: hashedPassword
        });

        const token = jwt.sign(
            { id: user._id, role: user.role },
            process.env.JWT_SECRET,
            { expiresIn: "30d" }
        );

        res.status(201).json({
            success: true,
            token,
            user,
            message: "Ro'yxatdan o'tish muvaffaqiyatli"
        });
    } catch (err) {
        next(err);
    }
};

// Login
export const login = async (req, res, next) => {
    try {
        const { email, password } = req.body;
        if (!email || !password) {
            return res.status(400).json({ success: false, message: "Ma'lumot to'liq emas!" });
        }

        // Support both email and username login
        const user = await User.findOne({
            $or: [{ email: email }, { username: email }]
        });
        if (!user) {
            return res.status(404).json({ success: false, message: "Foydalanuvchi topilmadi!" });
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(401).json({ success: false, message: "Parol noto'g'ri!" });
        }

        const token = jwt.sign(
            { id: user._id, role: user.role },
            process.env.JWT_SECRET,
            { expiresIn: "30d" }
        );

        res.json({
            success: true,
            token,
            user,
            message: "Login muvaffaqiyatli"
        });
    } catch (err) {
        next(err);
    }
};

// Userni jwt orqali update qilish 
export const updateUser = async (req, res, next) => {
    try {
        const userId = req.user.id;
        const { username, email, password } = req.body;
        const updatedData = { ...req.body };

        // Check if username is being changed and if it's already taken
        if (username) {
            const existingUser = await User.findOne({ username, _id: { $ne: userId } });
            if (existingUser) {
                return res.status(400).json({ success: false, message: "Bu username allaqachon band qilingan!" });
            }
        }

        // Check if email is being changed and if it's already taken
        if (email) {
            const existingEmail = await User.findOne({ email, _id: { $ne: userId } });
            if (existingEmail) {
                return res.status(400).json({ success: false, message: "Bu email allaqachon ro'yxatdan o'tgan!" });
            }
        }

        if (password) {
            updatedData.password = await bcrypt.hash(password, 10);
        }

        const user = await User.findByIdAndUpdate(
            userId,
            updatedData,
            { new: true }
        ).select("-password");

        if (!user) {
            return res.status(404).json({ success: false, message: "Foydalanuvchi topilmadi" });
        }
        res.json(user);
    } catch (err) {
        next(err);
    }
};

// Current Userni olish
export const getMe = async (req, res, next) => {
    try {
        const user = await User.findById(req.user.id).select("-password");
        if(!user) return next(new Error("Foydalanuvchi topilmadi"));
        res.json(user);
    } catch(err) {
        next(err);
    }
}

// Ommaviy portfolioni barcha ma'lumotlari bilan olish
export const getPublicPortfolio = async (req, res, next) => {
    try {
        const { username } = req.params;
        
        // 1. Foydalanuvchini topish
        const user = await User.findOne({ username }).select("-password -email -role");
        if (!user) return next(new Error("Profil topilmadi"));

        // 2. Unga tegishli barcha ma'lumotlarni parallel ravishda olish
        const [projects, experiences, certificates, cv] = await Promise.all([
            Project.find({ user: user._id }),
            Experience.find({ user: user._id }),
            Certificate.find({ user: user._id }),
            CV.findOne({ user: user._id })
        ]);

        res.json({
            user,
            projects,
            experiences,
            certificates,
            cv
        });
    } catch (err) {
        next(err);
    }
}

// Userni delete qilish 
export const deleteUser = async (req, res, next) => {
    try{
        const user = await User.findByIdAndDelete(req.user.id);
        if(!user){
            return next(new Error("Foydalanuvchi topilmadi"))
        }
        res.json({ success: true });
    }catch(err){
        next(err)
    }
}

// Avatar upload
export const uploadAvatar = async (req, res, next) => {
    try {
        if (!req.file) return next(new Error("Rasm yuklanmadi"));
        
        const user = await User.findById(req.user.id);
        if (!user) return next(new Error("Foydalanuvchi topilmadi"));

        // Eskisini o'chirish
        if (user.profileImage?.public_id) {
            await cloudinary.uploader.destroy(user.profileImage.public_id);
        }

        user.profileImage = {
            url: req.file.path,
            public_id: req.file.filename
        };
        await user.save();

        res.json({ avatar: user.profileImage.url });
    } catch (err) {
        next(err);
    }
};

// Avatar delete
export const deleteAvatar = async (req, res, next) => {
    try {
        const user = await User.findById(req.user.id);
        if (!user) return next(new Error("Foydalanuvchi topilmadi"));

        if (user.profileImage?.public_id) {
            await cloudinary.uploader.destroy(user.profileImage.public_id);
        }

        user.profileImage = { url: "", public_id: "" };
        await user.save();

        res.json({ message: "Avatar o'chirildi" });
    } catch (err) {
        next(err);
    }
};