import mongoose from "mongoose";

const messageSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    sendername: String,
    contactlink: String,
    messagetext: String,
    read: {
        type: Boolean,
        default: false
    },
    sendtime: {
        type: Date,
        default: Date.now
    }
})

export const Message = mongoose.model("Message", messageSchema)