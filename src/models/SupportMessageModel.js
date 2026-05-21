import mongoose from "mongoose";

const supportMessageSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    subject: {
        type: String,
        required: true
    },
    message: {
        type: String,
        required: true
    },
    status: {
        type: String,
        enum: ["open", "closed"],
        default: "open"
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

export const SupportMessage = mongoose.model("SupportMessage", supportMessageSchema);
