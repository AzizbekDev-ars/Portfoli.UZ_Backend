import { SupportMessage } from "../models/SupportMessageModel.js";

// Foydalanuvchi tomonidan habar yuborish
export const CreateSupportMessage = async (req, res, next) => {
    try {
        const { subject, message } = req.body;
        const supportMessage = new SupportMessage({
            user: req.user.id,
            subject,
            message
        });
        await supportMessage.save();
        res.status(201).json({ success: true, message: "Habaringiz yuborildi. Tez orada ko'rib chiqiladi." });
    } catch (err) {
        next(err);
    }
};

// ADMIN: Barcha habarlarni olish
export const GetAllSupportMessages = async (req, res, next) => {
    try {
        const messages = await SupportMessage.find()
            .populate("user", "username email")
            .sort({ createdAt: -1 });
        res.json(messages);
    } catch (err) {
        next(err);
    }
};

// ADMIN: Habar holatini o'zgartirish
export const UpdateSupportStatus = async (req, res, next) => {
    try {
        const { id } = req.params;
        const { status } = req.body;
        const message = await SupportMessage.findByIdAndUpdate(id, { status }, { new: true });
        if (!message) return next(new Error("Habar topilmadi"));
        res.json({ success: true, message });
    } catch (err) {
        next(err);
    }
};

// ADMIN: Habarni o'chirish
export const DeleteSupportMessage = async (req, res, next) => {
    try {
        const { id } = req.params;
        await SupportMessage.findByIdAndDelete(id);
        res.json({ success: true, message: "Habar o'chirildi" });
    } catch (err) {
        next(err);
    }
};
