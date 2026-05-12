import express from "express";
import { protect, asyncHandler } from "../middlewares/checkerMiddleware.js";
import { User } from "../models/UserModel.js";
import { Transaction } from "../models/TransactionModel.js";
import { Settings } from "../models/SettingsModel.js";

const transactionRouter = express.Router();

// PRO tarifiga to'lov qilish
transactionRouter.post("/pay-pro", protect, asyncHandler(async (req, res) => {
    const user = await User.findById(req.user.id);
    if (!user) {
        return res.status(404).json({ success: false, message: "Foydalanuvchi topilmadi" });
    }

    if (user.isPro) {
        return res.status(400).json({ success: false, message: "Siz allaqachon PRO tarifidasiz" });
    }

    // Platforma sozlamalaridan PRO narxini olamiz
    let settings = await Settings.findOne();
    if (!settings) {
        settings = await Settings.create({});
    }

    const amount = settings.proPrice || 50000;

    // Tranzaksiyani saqlaymiz
    const transaction = await Transaction.create({
        type: "income",
        amount: amount,
        reason: `PRO Upgrade: ${user.username}`,
        date: new Date()
    });

    // Userni PRO ga o'tkazamiz
    user.isPro = true;
    await user.save();

    res.json({
        success: true,
        message: "To'lov muvaffaqiyatli amalga oshirildi! Endi siz PRO tarifidasiz.",
        user,
        transaction
    });
}));

export default transactionRouter;
