import mongoose from "mongoose";

const projectSchema = new mongoose.Schema({
    projectname: {
        type: String,
        required: true,
    },
    description: {
        type: String,
        required: true,
    },
    techStacks: [String],
    demoLink: { type: String, required: false },
    codeLink: { type: String, required: false },
    startDate: { type: String },
    endDate: { type: String },
    isOngoing: { type: Boolean, default: false },
    image: String,
    public_id: String,
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
    },
    isCV: {
        type: Boolean,
        default: false,
    }
},
{timestamps: true})

export const Project = mongoose.model("Project", projectSchema)