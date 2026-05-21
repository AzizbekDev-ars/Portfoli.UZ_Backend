import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import crypto from "crypto";
import { OAuth2Client } from "google-auth-library";
import { User } from "../models/UserModel.js";
import { Project } from "../models/ProjectModel.js";
import { Experience } from "../models/ExperienceModel.js";
import { Certificate } from "../models/CertificateModel.js";
import { CV } from "../models/CVModel.js";
import cloudinary from "../config/cloudinary.js";
import sendEmail from "../utils/sendEmail.js";

const client = new OAuth2Client(process.env.CLIENT_ID);

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
            password: hashedPassword,
            selectedTemplate: "zamonaviy"
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

// Google Auth (Login/Register)
export const googleAuth = async (req, res, next) => {
    try {
        const { token } = req.body;
        const ticket = await client.verifyIdToken({
            idToken: token,
            audience: process.env.CLIENT_ID
        });

        const { email, name, sub, picture, email_verified } = ticket.getPayload();

        if (!email_verified) {
            return res.status(400).json({ success: false, message: "Google email tasdiqlanmagan!" });
        }

        // Gmail haqiqiyligini tekshirish (Google payload orqali allaqachon tekshirilgan bo'ladi)
        // Ammo foydalanuvchi so'raganidek, agar email bo'sh bo'lsa hato beramiz
        if (!email) {
            return res.status(400).json({ success: false, message: "Google accountda email mavjud emas!" });
        }

        let user = await User.findOne({ email });

        if (!user) {
            // Yangi user yaratish
            const username = name.replace(/\s+/g, '').toLowerCase() + Math.floor(Math.random() * 1000);
            user = await User.create({
                username,
                email,
                googleId: sub,
                profileImage: { url: picture, public_id: "" },
                selectedTemplate: "zamonaviy"
            });
        } else if (!user.googleId) {
            // Mavjud userga googleId ni bog'lash
            user.googleId = sub;
            if (!user.profileImage?.url) {
                user.profileImage = { url: picture, public_id: "" };
            }
            await user.save();
        }

        const jwtToken = jwt.sign(
            { id: user._id, role: user.role },
            process.env.JWT_SECRET,
            { expiresIn: "30d" }
        );

        res.json({
            success: true,
            token: jwtToken,
            user,
            message: "Google orqali kirish muvaffaqiyatli"
        });
    } catch (err) {
        res.status(400).json({ success: false, message: "Google xatoligi: " + err.message });
    }
};

// Forgot Password
export const forgotPassword = async (req, res, next) => {
    try {
        const { email } = req.body;
        const user = await User.findOne({ email });

        if (!user) {
            return res.status(404).json({ success: false, message: "Ushbu emailga ega foydalanuvchi topilmadi!" });
        }

        // Token yaratish
        const resetToken = crypto.randomBytes(32).toString("hex");
        user.resetPasswordToken = crypto.createHash("sha256").update(resetToken).digest("hex");
        user.resetPasswordExpires = Date.now() + 3600000; // 1 soat

        await user.save();

        const resetUrl = `${req.get("origin")}/reset-password/${resetToken}`;
        const message = `Siz parolni tiklashni so'radingiz. Iltimos ushbu linkka o'ting:\n\n ${resetUrl}\n\n Agar buni siz so'ramagan bo'lsangiz, xatga e'tibor bermang.`;

        try {
            await sendEmail({
                email: user.email,
                subject: "Portfolio.uz - Parolni tiklash",
                message,
                html: `<h3>Parolni tiklash</h3><p>Tiklash uchun quyidagi tugmani bosing:</p><a href="${resetUrl}" style="padding: 10px 20px; background: #6366f1; color: white; text-decoration: none; border-radius: 5px;">Parolni tiklash</a>`
            });
            res.json({ success: true, message: "Tiklash havolasi emailingizga yuborildi!" });
        } catch (err) {
            user.resetPasswordToken = undefined;
            user.resetPasswordExpires = undefined;
            await user.save();
            return res.status(500).json({ success: false, message: "Xat yuborishda xatolik yuz berdi" });
        }
    } catch (err) {
        next(err);
    }
};

// Reset Password
export const resetPassword = async (req, res, next) => {
    try {
        const resetPasswordToken = crypto.createHash("sha256").update(req.params.token).digest("hex");

        const user = await User.findOne({
            resetPasswordToken,
            resetPasswordExpires: { $gt: Date.now() }
        });

        if (!user) {
            return res.status(400).json({ success: false, message: "Token yaroqsiz yoki muddati o'tgan" });
        }

        user.password = await bcrypt.hash(req.body.password, 10);
        user.resetPasswordToken = undefined;
        user.resetPasswordExpires = undefined;

        await user.save();

        res.json({ success: true, message: "Parol muvaffaqiyatli o'zgartirildi!" });
    } catch (err) {
        next(err);
    }
};