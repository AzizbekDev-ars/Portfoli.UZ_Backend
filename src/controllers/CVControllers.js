import { CV } from "../models/CVModel.js";
import { User } from "../models/UserModel.js";
import { Project } from "../models/ProjectModel.js";
import { Experience } from "../models/ExperienceModel.js";
import { Certificate } from "../models/CertificateModel.js";
import { Visitor } from "../models/VisitorModel.js";
import axios from "axios";
import cloudinary from "../config/cloudinary.js";
import { generatePdfAndUpload } from "../utils/GeneratePdfAndUpload.js";

// Ma'lumotlarni yig'ish yordamchisi
const getCVData = async (userId, cvId, designOverride = null) => {
    const [user, projects, experiences, certificates] = await Promise.all([
        User.findById(userId),
        Project.find({ user: userId, isCV: true }),
        Experience.find({ user: userId, isCV: true }),
        Certificate.find({ user: userId })
    ]);

    if (!user) throw new Error("Foydalanuvchi topilmadi");

    return {
        _id: cvId,
        design: designOverride || user.selectedTemplate || 'modern',
        Title: {
            name: user.profileData?.fullName?.split(' ')[0] || user.username,
            surename: user.profileData?.fullName?.split(' ').slice(1).join(' ') || '',
            job: user.profileData?.profession || 'Developer'
        },
        Profile: user.profileData?.bio || '',
        Contact: Object.entries(user.socialLinks || {})
            .filter(([_, link]) => link)
            .map(([type, link]) => ({ type, link })),
        Skills: {
            Frontend: projects.reduce((acc, p) => [...new Set([...acc, ...p.techStacks])], []).slice(0, 5),
            Backend: [],
            Tools: []
        },
        Projects: projects.map(p => ({
            projectname: p.projectname,
            techStacks: p.techStacks,
            description: p.description
        })),
        Experience: experiences.map(e => ({
            jobType: e.role,
            company: e.company,
            jobPeriod: { start: e.startDate, end: e.endDate },
            description: e.description
        })),
        Certificates: certificates.map(c => ({
            title: c.title,
            provider: c.provider,
            date: c.date
        })),
        address: user.profileData?.location || '',
        image: user.profileImage?.url || user.profileData?.avatar
    };
};

// CV yaratish
const createCV = async (req, res, next) => {
    try {
        // 1. CV yaratish
        const cv = await CV.create({
            user: req.user.id,
            cvData: req.body.cvData,
            cvImage: {
                url: req.file ? req.file.path : null,
                public_id: req.file ? req.file.filename : null
            }
        });

        // 2. Populate qilish
        const populatedCV = await CV.findById(cv._id)
          .populate({
            path: "cvData.Projects"
          });

        // 3. PDF data tayyorlash
        const pdfData = {
            _id: populatedCV._id,
            Title: populatedCV.cvData.Title,
            Contact: populatedCV.cvData.Contact,
            Skills: populatedCV.cvData.Skills,
            Languages: populatedCV.cvData.Languages,
            Profile: populatedCV.cvData.Profile,
            Experience: populatedCV.cvData.Experience,

            Projects: populatedCV.cvData.Projects.map(p => ({
                projectname: p.projectname,
                techStacks: p.techStacks,
                description: p.description
            })),

            image: populatedCV.cvImage?.url
        };

        // 4. PDF yaratish
        const { result: pdfResult } = await generatePdfAndUpload(pdfData);

        // 5. DB update
        const downloadUrl = pdfResult.secure_url;
        cv.cvFile = {
            url: downloadUrl,
            public_id: pdfResult.public_id
        };

        await cv.save();

        res.json({
            success: true,
            cv
        });

    } catch (err) {
        next(err);
    }
};

// getCV cv ni id orqali olish
const getCV = async (req, res, next) => {
    try {
        const cv = await CV.findOne({ user: req.user.id}).populate("projects");

        if(!cv){
            return next(new Error("CV Topilmadi"))
        }
        res.status(200).json(cv)
    } catch (err) {
        next(err)
    }
}

const generateAutoCV = async (req, res, next) => {
    try {
        const userId = req.user.id;
        let cv = await CV.findOne({ user: userId });
        if (!cv) cv = await CV.create({ user: userId });

        const pdfData = await getCVData(userId, cv._id, req.body.design);
        const { result: pdfResult } = await generatePdfAndUpload(pdfData);

        // Dizaynni foydalanuvchi sozlamalariga saqlab qo'yamiz
        if (req.body.design) {
            const user = await User.findById(userId);
            if (user) {
                user.selectedTemplate = req.body.design;
                await user.save();
            }
        }

        if (cv.cvFile?.public_id) {
            await cloudinary.uploader.destroy(cv.cvFile.public_id, { resource_type: "raw" });
        }
        
        cv.cvFile = { url: pdfResult.secure_url, public_id: pdfResult.public_id };
        await cv.save();

        res.json({
            success: true,
            url: `${req.protocol}://${req.get('host')}/cv/pdf/${cv._id}`
        });
    } catch (err) {
        next(err);
    }
};

const getPDF = async (req, res, next) => {
    try {
        const cv = await CV.findById(req.params.id);
        if(!cv) return next(new Error("PDF topilmadi"));

        const pdfData = await getCVData(cv.user, cv._id);
        const { pdfBuffer } = await generatePdfAndUpload(pdfData);

        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', 'attachment; filename=cv.pdf');
        res.send(pdfBuffer);
    } catch (err) {
        next(err)
    }
}

// Ommaviy PDF olish va kuzatish (username orqali)
const getPublicPDF = async (req, res, next) => {
    try {
        const { username } = req.params;
        const user = await User.findOne({ username });
        if (!user) return next(new Error("Foydalanuvchi topilmadi"));

        const cv = await CV.findOne({ user: user._id }).populate("cvData.Projects");
        if (!cv) {
            return next(new Error("CV hali tayyor emas"));
        }

        // 1. Statistikani yangilash
        cv.downloadCount = (cv.downloadCount || 0) + 1;
        await cv.save();

        // 2. Visitorni log qilish
        const ip = req.headers["x-forwarded-for"] || req.socket.remoteAddress;
        let country = "Unknown";
        let city = "Unknown";
        try {
            const geoRes = await axios.get(`https://ipapi.co/${ip}/json`);
            country = geoRes.data.country_name || "Unknown";
            city = geoRes.data.city || "Unknown";
        } catch (geoErr) {
            console.error("Geo lookup failed for CV download:", geoErr.message);
        }

        const visitor = new Visitor({
            user: user._id,
            page: "CV Download",
            method: "GET",
            ip,
            userAgent: req.headers["user-agent"],
            country,
            city,
            isCVDownload: true
        });
        await visitor.save();

        // 3. PDF data tayyorlash
        const pdfData = await getCVData(user._id, cv._id, user.selectedTemplate);

        // PDF generatsiya qilish
        const { pdfBuffer } = await generatePdfAndUpload(pdfData);

        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', 'attachment; filename=cv.pdf');
        res.send(pdfBuffer);

    } catch (err) {
        next(err);
    }
}

const updateCV = async (req, res, next) => {
  try {
    const cv = await CV.findOne({
      _id: req.params.id,
      user: req.user.id
    }).populate("cvData.Projects");

    if (!cv) {
      return next(new Error("CV topilmadi"));
    }

    // 🔥 IMAGE UPDATE
    if (req.file) {
      if (cv.cvImage?.public_id) {
        await cloudinary.uploader.destroy(cv.cvImage.public_id);
      }

      cv.cvImage = {
        url: req.file.path,
        public_id: req.file.filename
      };
    }

    // 🔥 DATA UPDATE
    cv.cvData = req.body.cvData || cv.cvData;

    // 🔥 PDF DELETE
    if (cv.cvFile?.public_id) {
      await cloudinary.uploader.destroy(cv.cvFile.public_id, {
        resource_type: "raw"
      });
    }

    // 🔥 PDF REGENERATE
    const user = await User.findById(req.user.id);
    const { result: pdfResult } = await generatePdfAndUpload({
      _id: cv._id,
      ...cv.cvData,
      image: cv.cvImage?.url,
      design: user?.selectedTemplate || 'modern'
    });

    const downloadUrl = pdfResult.secure_url;
    cv.cvFile = {
      url: downloadUrl,
      public_id: pdfResult.public_id
    };

    await cv.save();

    res.status(200).json(cv);

  } catch (err) {
    next(err);
  }
};

// delete cv
const deleteCV = async (req, res, next) => {
  try {
    const cv = await CV.findOne({
      _id: req.params.id,
      user: req.user.id
    });

    if (!cv) {
      return next(new Error("CV topilmadi"));
    }

    // 🔥 IMAGE DELETE
    if (cv.cvImage?.public_id) {
      await cloudinary.uploader.destroy(cv.cvImage.public_id);
    }

    // 🔥 PDF DELETE
    if (cv.cvFile?.public_id) {
      await cloudinary.uploader.destroy(cv.cvFile.public_id, {
        resource_type: "raw"
      });
    }

    await cv.deleteOne();

    res.status(200).json({ message: "CV o'chirildi" });

  } catch (err) {
    next(err);
  }
};

export {createCV, getCV, getPDF, updateCV, deleteCV, generateAutoCV, getPublicPDF}