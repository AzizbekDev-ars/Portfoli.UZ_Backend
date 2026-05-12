import mongoose from 'mongoose';
import dotenv from 'dotenv';
import bcrypt from 'bcrypt';
import { User } from './src/models/UserModel.js';

dotenv.config();

const MONGO_URI = process.env.MONGO_URI || "mongodb://localhost:27017/portfolio-uz";

async function checkAdmin() {
    try {
        await mongoose.connect(MONGO_URI);
        console.log("Connected to MongoDB");

        const username = "SuperAdmin";
        const password = "17022007SuperAdminARS";

        const admin = await User.findOne({ username });
        if (admin) {
            console.log("Admin found:", admin.username);
            const isMatch = await bcrypt.compare(password, admin.password);
            console.log("Password match:", isMatch);
            
            if (!isMatch) {
                console.log("Resetting password...");
                admin.password = await bcrypt.hash(password, 10);
                admin.role = "admin";
                await admin.save();
                console.log("Password reset successful");
            }
        } else {
            console.log("Admin not found. Creating...");
            const hashedPassword = await bcrypt.hash(password, 10);
            await User.create({
                username,
                email: "admin@portfolio.uz",
                password: hashedPassword,
                role: "admin",
                isPro: true
            });
            console.log("Admin created successfully");
        }

    } catch (err) {
        console.error("Error:", err);
    } finally {
        await mongoose.disconnect();
    }
}

checkAdmin();
