import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
    username: {
        type: String,
        required: true,
        unique: true,
    },
    email: {
        type: String,
        required: true,
        unique: true,
    },
    password: {
        type: String,
        required: true,
    },
    role: {
        type: String,
        enum: ["user", "admin"],
        default: "user"
    },
    isPro: {
        type: Boolean,
        default: false
    },
    profileData: {
        bio: String,
        jobTitle: String,
        phone: String,
        location: String,
        showAvatarOnPortfolio: {
            type: Boolean,
            default: true
        }
    },
    socialLinks: {
        github: String,
        linkedin: String,
        telegram: String,
        instagram: String,
        twitter: String,
        website: String
    },
    selectedTemplate: {
        type: String,
        default: null
    },
    profileImage: {
        url: String,
        public_id: String
    }
}, { timestamps: true })

export const User = mongoose.model("User", userSchema)