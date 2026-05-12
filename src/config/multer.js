import multer from "multer";
import {CloudinaryStorage} from "multer-storage-cloudinary";
import cloudinary from "./cloudinary.js";

const projects = new CloudinaryStorage({
    cloudinary: cloudinary,
    params: {
        folder: "project_images",
        allowed_formats: ["jpg", "png", "jpeg"],
    },
});

const developer = new CloudinaryStorage({
    cloudinary: cloudinary,
    params: {
        folder: "developer_images",
        allowed_formats: ["jpg", "png", "jpeg"],
    },
});

const cv = new CloudinaryStorage({
    cloudinary: cloudinary,
    params: {
        folder: "cv_images",
        allowed_formats: ["jpg", "png", "jpeg"],
    },
});

const certificates = new CloudinaryStorage({
    cloudinary: cloudinary,
    params: {
        folder: "certificate_images",
        allowed_formats: ["jpg", "png", "jpeg"],
    },
});

const upload_projects = multer({storage: projects });
const upload_developer = multer({storage: developer });
const upload_cv = multer({storage: cv });
const upload_certificates = multer({storage: certificates });

export {upload_projects, upload_developer, upload_cv, upload_certificates}
