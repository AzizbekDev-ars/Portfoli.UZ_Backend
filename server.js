// kutubxonalar
import dotenv from "dotenv";
import express from "express";
import mongoose from "mongoose";
import cors from "cors";

// routerlar
import authRoute from "./src/routers/UserRoutes.js";
import projectRouter from "./src/routers/ProjectRoutes.js";
import messageRouter from "./src/routers/MessageRoutes.js";
import visitorRouter from "./src/routers/VisitorRoutes.js";
import cvRouter from "./src/routers/CVRoutes.js";
import experienceRouter from "./src/routers/ExperienceRoutes.js";
import certificateRouter from "./src/routers/CertificateRoutes.js";
import adminRoute from "./src/routers/AdminRoutes.js";
import transactionRouter from "./src/routers/TransactionRoutes.js";
import platformRouter from "./src/routers/PlatformRoutes.js";

// global error middleware
import { globalError } from "./src/middlewares/checkerMiddleware.js";


// dotenv ni faollashtiramiz
dotenv.config();

// express yaratamiz
const app = express();

// malumotlarni json formatda qabul qilishga ruhsat beramiz
app.use(express.json())
// Frontend bilan bog'lanishga ruhsat beramiz
app.use(cors())

// routerlar
app.use("/auth", authRoute);
app.use("/project", projectRouter);
app.use("/message", messageRouter);
app.use("/visitor", visitorRouter);
app.use("/cv", cvRouter);
app.use("/experience", experienceRouter);
app.use("/certificate", certificateRouter);
app.use("/transaction", transactionRouter);
app.use("/platform", platformRouter);
app.use("/admin", adminRoute);

// mongodb ulaymiz
mongoose
    .connect(process.env.MONGO_URI)
    .then(() => console.log("Mongodb ulandi! ✅"))
    .catch((err) => console.log("DB Xatosi: ", err))

// Global err har doim ohirda
app.use(globalError)

// Serverni ishga tushuramiz
const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
    console.log("Server "+PORT+" portda ishlayabdi!")
})