import { Experience } from "../models/ExperienceModel.js";

// Experience yaratish
export const createExperience = async (req, res, next) => {
    try {
        const experience = new Experience({
            ...req.body,
            user: req.user.id
        });
        await experience.save();
        res.status(201).json(experience);
    } catch (err) {
        next(err);
    }
};

// Tajribalarni olish
export const getExperiences = async (req, res, next) => {
    try {
        const experiences = await Experience.find({ user: req.user.id });
        res.json(experiences);
    } catch (err) {
        next(err);
    }
};

// Tajribani yangilash
export const updateExperience = async (req, res, next) => {
    try {
        const experience = await Experience.findOneAndUpdate(
            { _id: req.params.id, user: req.user.id },
            req.body,
            { new: true }
        );
        if (!experience) return next(new Error("Tajriba topilmadi"));
        res.json(experience);
    } catch (err) {
        next(err);
    }
};

// Tajribani o'chirish
export const deleteExperience = async (req, res, next) => {
    try {
        const experience = await Experience.findOneAndDelete({ _id: req.params.id, user: req.user.id });
        if (!experience) return next(new Error("Tajriba topilmadi"));
        res.json({ message: "Tajriba o'chirildi" });
    } catch (err) {
        next(err);
    }
};
