import { Certificate } from "../models/CertificateModel.js";
import cloudinary from "../config/cloudinary.js";

// Certificate yaratish
export const createCertificate = async (req, res, next) => {
    try {
        const certificate = new Certificate({
            ...req.body,
            image: req.file ? req.file.path : null,
            public_id: req.file ? req.file.filename : null,
            user: req.user.id
        });
        await certificate.save();
        res.status(201).json(certificate);
    } catch (err) {
        next(err);
    }
};

// Sertifikatlarni olish
export const getCertificates = async (req, res, next) => {
    try {
        const certificates = await Certificate.find({ user: req.user.id });
        res.json(certificates);
    } catch (err) {
        next(err);
    }
};

// Sertifikatni yangilash
export const updateCertificate = async (req, res, next) => {
    try {
        const certificate = await Certificate.findOne({ _id: req.params.id, user: req.user.id });
        if (!certificate) return next(new Error("Sertifikat topilmadi"));

        if (req.file) {
            if (certificate.public_id) {
                await cloudinary.uploader.destroy(certificate.public_id);
            }
            certificate.image = req.file.path;
            certificate.public_id = req.file.filename;
        }

        certificate.title = req.body.title || certificate.title;
        certificate.provider = req.body.provider || certificate.provider;
        certificate.date = req.body.date || certificate.date;
        certificate.description = req.body.description || certificate.description;

        await certificate.save();
        res.json(certificate);
    } catch (err) {
        next(err);
    }
};

// Sertifikatni o'chirish
export const deleteCertificate = async (req, res, next) => {
    try {
        const certificate = await Certificate.findOne({ _id: req.params.id, user: req.user.id });
        if (!certificate) return next(new Error("Sertifikat topilmadi"));

        if (certificate.public_id) {
            await cloudinary.uploader.destroy(certificate.public_id);
        }
        await Certificate.findByIdAndDelete(req.params.id);

        res.json({ message: "Sertifikat o'chirildi" });
    } catch (err) {
        next(err);
    }
};
