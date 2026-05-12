import mongoose from "mongoose";

const cvSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },

  cvData: {
    Title: {
      name: String,
      surename: String,
      job: String,
    },

    Contact: [
      {
        type: {
          type: String, // tel, email, github ...
        },
        link: String,
        icon: String,
        iconSVG: String,
      },
    ],

    Skills: {
      Frontend: [String],
      Backend: [String],
      Tools: [String],
    },

    Languages: [
      {
        lang: String,
        degree: String,
      },
    ],

    Profile: String,

    Experience: [
      {
        jobType: String,
        jobPeriod: {
          start: String,
          end: String,
        },
        company: String,
        address: String,
        description: String,
      },
    ],

    Projects: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Project",
      },
    ],
  },

  cvImage: {
    url: String,
    public_id: String
  },

  cvFile: {
    url: String,
    public_id: String
  },
  
  downloadCount: {
    type: Number,
    default: 0
  }


}, { timestamps: true });

export const CV = mongoose.model("CV", cvSchema);