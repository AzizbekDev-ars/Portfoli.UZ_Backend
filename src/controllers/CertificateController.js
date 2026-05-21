import { Certificate } from "../models/CertificateModel.js";
import cloudinary from "../config/cloudinary.js";
import axios from "axios";
import * as cheerio from "cheerio";

// Certificate yaratish
export const createCertificate = async (req, res, next) => {
    try {
        let imageUrl = req.body.image_url || null;
        let publicId = null;

        // Agar fayl yuklangan bo'lsa (manual), uni ishlatamiz
        if (req.file) {
            imageUrl = req.file.path;
            publicId = req.file.filename;
        }

        const certificate = new Certificate({
            ...req.body,
            image: imageUrl,
            public_id: publicId,
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
        certificate.url = req.body.url || certificate.url;

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

// Sertifikat linkini tekshirish va ma'lumotlarni olish
export const verifyCertificateLink = async (req, res, next) => {
    try {
        const { url } = req.body;
        if (!url) return next(new Error("URL manzili kiritilmadi"));

        const response = await axios.get(url, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
            },
            timeout: 10000
        });

        const $ = cheerio.load(response.data);
        
        // Metadata olish
        const title = $('meta[property="og:title"]').attr('content') || $('title').text() || "";
        const image = $('meta[property="og:image"]').attr('content') || "";
        const description = $('meta[property="og:description"]').attr('content') || "";
        const provider = url.includes('coursera.org') ? 'Coursera' : 
                         url.includes('udemy.com') ? 'Udemy' : 
                         url.includes('linkedin.com') ? 'LinkedIn' : "";

        if (!title && !image) {
            return res.status(404).json({ 
                success: false, 
                message: "Ushbu link orqali sertifikat ma'lumotlarini topib bo'lmadi." 
            });
        }

        res.json({
            success: true,
            data: {
                title: title.trim(),
                image,
                description: description.trim(),
                provider,
                url
            }
        });

    } catch (err) {
        res.status(400).json({ 
            success: false, 
            message: "Link yaroqsiz yoki sahifa yuklanmadi. Iltimos, linkni tekshiring yoki qo'lda qo'shing." 
        });
    }
};
