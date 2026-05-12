import express from "express";
import { protect, asyncHandler } from "../middlewares/checkerMiddleware.js";
import { upload_certificates } from "../config/multer.js";
import { createCertificate, getCertificates, updateCertificate, deleteCertificate } from "../controllers/CertificateController.js";

const certificateRouter = express.Router();

certificateRouter.post("/", protect, upload_certificates.single("certificate_image"), asyncHandler(createCertificate));
certificateRouter.get("/", protect, asyncHandler(getCertificates));
certificateRouter.put("/:id", protect, upload_certificates.single("certificate_image"), asyncHandler(updateCertificate));
certificateRouter.delete("/:id", protect, asyncHandler(deleteCertificate));

export default certificateRouter;
