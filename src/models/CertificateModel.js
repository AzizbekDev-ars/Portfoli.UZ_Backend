import mongoose from "mongoose";

const certificateSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
    },
    title: {
        type: String,
        required: true,
    },
    provider: {
        type: String,
        required: true,
    },
    date: {
        type: String,
        required: true,
    },
    description: {
        type: String,
    },
    url: {
        type: String,
    },
    image: {
        type: String,
    },
    public_id: {
        type: String,
    }
}, { timestamps: true });

export const Certificate = mongoose.model("Certificate", certificateSchema);
