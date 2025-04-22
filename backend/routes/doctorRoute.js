import express from "express";
const doctorRouter = express.Router();
import {
  appointmentCancel,
  appointmentComplete,
  appointmentsDoctor,
  doctorDashboard,
  doctorList,
  doctorLogin,
  doctorProfile,
  updateDoctorProfile,
  uploadReport,
  getPatientReports,
  downloadReport

} from "../controllers/doctorController.js";
import authDoctor from "../middlewares/authDoctor.js";

//added
import upload from '../middlewares/multer.js';


// all doctor api
doctorRouter.get("/list", doctorList);
doctorRouter.post("/login", doctorLogin);
doctorRouter.get("/appointments", authDoctor, appointmentsDoctor);
doctorRouter.post("/complete-appointment", authDoctor, appointmentComplete);
doctorRouter.post("/cancel-appointment", authDoctor, appointmentCancel);
doctorRouter.get("/dashboard", authDoctor, doctorDashboard);
doctorRouter.get("/profile", authDoctor, doctorProfile);
doctorRouter.post("/update-profile", authDoctor, updateDoctorProfile);

//added
doctorRouter.post("/upload-report", authDoctor, upload.single('report'), uploadReport)
doctorRouter.get("/patient-reports", authDoctor, getPatientReports)
doctorRouter.get("/download-report/:reportId", authDoctor, downloadReport);

export default doctorRouter;
