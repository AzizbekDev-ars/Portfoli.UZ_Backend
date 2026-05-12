import mongoose from 'mongoose';
import dotenv from 'dotenv';
import bcrypt from 'bcrypt';
import { User } from './src/models/UserModel.js';

dotenv.config();

const MONGO_URI = process.env.MONGO_URI || "mongodb://localhost:27017/portfolio-uz";

async function findAdmin() {
    try {
        await mongoose.connect(MONGO_URI);
        console.log("Connected to MongoDB");

        const email = "admin@portfolio.uz";
        const userWithEmail = await User.findOne({ email });
        
        if (userWithEmail) {
            console.log("User with email found:", userWithEmail.username);
            console.log("Role:", userWithEmail.role);
            
            // Reset this user to be the SuperAdmin
            userWithEmail.username = "SuperAdmin";
            userWithEmail.password = await bcrypt.hash("17022007SuperAdminARS", 10);
            userWithEmail.role = "admin";
            await userWithEmail.save();
            console.log("User updated to SuperAdmin with requested password.");
        } else {
            console.log("No user with that email. Creating new...");
            const hashedPassword = await bcrypt.hash("17022007SuperAdminARS", 10);
            await User.create({
                username: "SuperAdmin",
                email: "admin@portfolio.uz",
                password: hashedPassword,
                role: "admin",
                isPro: true
            });
            console.log("SuperAdmin created.");
        }

    } catch (err) {
        console.error("Error:", err);
    } finally {
        await mongoose.disconnect();
    }
}

findAdmin();
