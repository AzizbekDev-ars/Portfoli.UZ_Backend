import mongoose from "mongoose";

const visitorSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"
    },
    page: String,
    ip: String,
    userAgent: String,
    method: String,
    country: String,
    city: String,
    isCVDownload: {
        type: Boolean,
        default: false
    },
    visitedAt: {
        type: Date,
        default: Date.now
    }
})

export const Visitor = mongoose.model("Visitor", visitorSchema)