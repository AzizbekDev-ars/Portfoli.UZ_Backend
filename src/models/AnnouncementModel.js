import mongoose from "mongoose";

const announcementSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true,
    },
    description: {
        type: String,
    },
    youtubeUrl: {
        type: String,
        required: true,
    }
}, { timestamps: true });

export const Announcement = mongoose.model("Announcement", announcementSchema);
