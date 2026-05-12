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
    demoLink: String,
    codeLink: String,
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