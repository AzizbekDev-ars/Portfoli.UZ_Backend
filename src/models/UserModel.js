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
        required: function() { return !this.googleId; } // Google orqali kirsa parol shart emas
    },
    googleId: {
        type: String,
        unique: true,
        sparse: true // Hammasida bo'lishi shart emas
    },
    resetPasswordToken: String,
    resetPasswordExpires: Date,
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
    customDesign: {
        primaryColor: { type: String, default: '#00F0FF' },
        backgroundColor: { type: String, default: '#050505' },
        textColor: { type: String, default: '#FFFFFF' },
        fontFamily: { type: String, default: 'sans' },
        borderRadius: { type: String, default: '4px' },
        effectType: { type: String, default: 'grid' },
        animationStyle: { type: String, default: 'glow' }
    },
    profileImage: {
        url: String,
        public_id: String
    }
}, { timestamps: true })

export const User = mongoose.model("User", userSchema)