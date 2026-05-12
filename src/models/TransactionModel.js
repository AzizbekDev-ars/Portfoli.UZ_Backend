import mongoose from "mongoose";

const transactionSchema = new mongoose.Schema({
    type: {
        type: String,
        enum: ["income", "expense"],
        required: true,
    },
    amount: {
        type: Number,
        required: true,
    },
    reason: {
        type: String,
        required: true,
    },
    date: {
        type: Date,
        default: Date.now
    }
}, { timestamps: true });

export const Transaction = mongoose.model("Transaction", transactionSchema);
