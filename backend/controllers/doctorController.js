import doctorModel from "../models/doctorModel.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import appointmentModel from "../models/appointmentModel.js";

//added
import reportModel from "../models/reportModel.js";
import { v2 as cloudinary } from "cloudinary";


const changeAvailabilty = async (req, res) => {
  try {
    const { docId } = req.body;
    const docData = await doctorModel.findById(docId);

    if (!docData) {
      res.json({ success: false, message: "Doctor not found" });
    }

    await doctorModel.findByIdAndUpdate(docId, {
      available: !docData.available,
    });
    res.json({ success: true, message: "Availability changed" });
  } catch (error) {
    console.log("error:", error);
    res.json({ success: false, message: error.message });
  }
};

const doctorList = async (req, res) => {
  try {
    const doctors = await doctorModel.find({}).select(["-password", "-email"]);

    res.json({ success: true, doctors });
  } catch (error) {
    console.log("error:", error);
    res.json({ success: false, message: error.message });
  }
};

// API for doctor login

const doctorLogin = async (req, res) => {
  try {
    const { email, password } = req.body;
    const doctor = await doctorModel.findOne({ email });

    if (!doctor) {
      return res.json({ success: false, message: "Invalid Crendentials" });
    }

    const isMatch = await bcrypt.compare(password, doctor.password);

    if (isMatch) {
      const token = jwt.sign({ id: doctor._id }, process.env.JWT_SECRET);
      res.json({ success: true, token });
    } else {
      res.json({ success: false, message: "Invalid Crendentials" });
    }
  } catch (error) {
    console.log("error:", error);
    res.json({ success: false, message: error.message });
  }
};

//API to get doctor appointments for doctor panel

const appointmentsDoctor = async (req, res) => {
  try {
    const { docId } = req.body;
    const appointments = await appointmentModel.find({ docId });

    res.json({ success: true, appointments });
  } catch (error) {
    console.log("error:", error);
    res.json({ success: false, message: error.message });
  }
};

// API to mark appointment completed for doctor panel
const appointmentComplete = async (req, res) => {
  try {
    const { docId, appointmentId } = req.body;
    const appointmentData = await appointmentModel.findById(appointmentId);

    if (appointmentData && appointmentData.docId === docId) {
      await appointmentModel.findByIdAndUpdate(appointmentId, {
        isCompleted: true,
      });
      return res.json({ success: true, message: "Appointment completed" });
    } else {
      return res.json({ success: false, message: "Mark failed" });
    }
  } catch (error) {
    console.log("error:", error);
    res.json({ success: false, message: error.message });
  }
};

// API to mark appointment cancle for doctor panel
const appointmentCancel = async (req, res) => {
  try {
    const { docId, appointmentId } = req.body;
    console.log("appointmentId:", appointmentId);
    const appointmentData = await appointmentModel.findById(appointmentId);

    if (appointmentData && appointmentData.docId === docId) {
      await appointmentModel.findByIdAndUpdate(appointmentId, {
        cancelled: true,
      });
      return res.json({ success: true, message: "Appointment cancelled" });
    } else {
      return res.json({ success: false, message: "Cancellation failed" });
    }
  } catch (error) {
    console.log("error:", error);
    res.json({ success: false, message: error.message });
  }
};

// API to get dashboard data for doctor panel
const doctorDashboard = async (req, res) => {
  try {
    const { docId } = req.body;
    const appointments = await appointmentModel.find({ docId });
    let earnings = 0;
    appointments.map((item) => {
      if (item.isCompleted || item.payment) {
        earnings += item.amount;
      }
    });
    let patients = [];
    appointments.map((item) => {
      if (!patients.includes(item.userId)) {
        patients.push(item.userId);
      }
    });

    const dashData = {
      earnings,
      appointments: appointments.length,
      patients: patients.length,
      latestAppointments: appointments.reverse().slice(0, 5),
    };

    res.json({ success: true, dashData });
  } catch (error) {
    console.log("error:", error);
    res.json({ success: false, message: error.message });
  }
};
// API to get doctor profile for doctor panel

const doctorProfile = async (req, res) => {
  try {
    const { docId } = req.body;
    const profileData = await doctorModel.findById(docId).select("-password");
    res.json({ success: true, profileData });
  } catch (error) {
    console.log("error:", error);
    res.json({ success: false, message: error.message });
  }
};

const updateDoctorProfile = async (req, res) => {
  try {
    const { docId, fees, address, available } = req.body;
    await doctorModel.findByIdAndUpdate(docId, {
      fees,
      address,
      available,
    });
    res.json({ success: true, message: "profile Updated" });
  } catch (error) {
    console.log("error:", error);
    res.json({ success: false, message: error.message });
  }
};






//added
// Function to upload patient report
const uploadReport = async (req, res) => {
  try {
      const { docId, appointmentId, userId, reportName } = req.body;
      const reportFile = req.file;

      if (!reportFile) {
          return res.json({ success: false, message: "Report file is required" });
      }

//       // Upload report to cloudinary
      const reportUpload = await cloudinary.uploader.upload(reportFile.path, { 
//           // resource_type: "auto", // Automatically detect file type
//           // folder: "patient-reports", // Store reports in a specific folder
//           // access_mode: "public" // Make the report accessible to everyone

          resource_type: "auto", // Auto-detect file type
          folder: "patient-reports", // Store in specific folder
          access_mode: "public", // Make publicly accessible
          type: "upload"
      });
      
      const reportUrl = reportUpload.secure_url;

//       // Create new report entry
      const newReport = new reportModel({
          appointmentId,
          userId,
          docId,
          reportName,
          reportUrl,
          uploadDate: Date.now()
      });

      await newReport.save();
      res.json({ success: true, message: 'Report uploaded successfully' });

  } catch (error) {
      console.log(error);
      res.json({ success: false, message: error.message });
  }
};


// // Function to get patient reports
const getPatientReports = async (req, res) => {
  try {
      const { docId, userId } = req.body;
      
      let query = { docId };
      if (userId) {
          query.userId = userId;
      }
      
      const reports = await reportModel.find(query).sort({ uploadDate: -1 });
      res.json({ success: true, reports });
      
  } catch (error) {
      console.log(error);
      res.json({ success: false, message: error.message });
  }
};



const downloadReport = async (req, res) => {
  try {
    const publicId = req.params.publicId; // or however you get it

    const secureUrl = cloudinary.utils.private_download_url(
      `patient-reports/${publicId}`,
      null, // file format (optional)
      {
        type: 'upload',
        resource_type: 'raw',
        sign_url: true,
        expires_at: Math.floor(Date.now() / 1000) + 60 * 30, // 30 minutes
      }
    );

    return res.redirect(secureUrl);
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: error.message });
  }
};



// Function to upload patient report
// Function to upload patient report
// Function to upload patient report
// const uploadReport = async (req, res) => {
//   try {
//     const { docId, appointmentId, userId, reportName } = req.body;
//     const reportFile = req.file;

//     if (!reportFile) {
//       return res.json({ success: false, message: "Report file is required" });
//     }

//     // Upload report to Cloudinary (public access, patient-reports folder)
//     const reportUpload = await cloudinary.uploader.upload(reportFile.path, {
//       resource_type: "raw",
//       folder: "patient-reports",          // <- folder for storing reports
//       access_mode: "public",              // <- allow direct access via secure_url
//       type: "upload"
//     });

//     const reportUrl = reportUpload.secure_url;      // Publicly accessible URL
//     const reportPublicId = reportUpload.public_id;  // Store this for downloading with signed URLs (optional)

//     // Save report entry to DB
//     const newReport = new reportModel({
//       appointmentId,
//       userId,
//       docId,
//       reportName,
//       reportUrl,
//       reportPublicId,
//       uploadDate: Date.now()
//     });

//     await newReport.save();
//     res.json({ success: true, message: "Report uploaded successfully" });

//   } catch (error) {
//     console.log("Upload error:", error);
//     res.json({ success: false, message: error.message });
//   }
// };


// // Function to get patient reports
// const getPatientReports = async (req, res) => {
//   try {
//     const { docId, userId } = req.body;

//     let query = { docId };
//     if (userId) {
//       query.userId = userId;
//     }

//     const reports = await reportModel.find(query).sort({ uploadDate: -1 });
//     res.json({ success: true, reports });

//   } catch (error) {
//     console.log("Fetch error:", error);
//     res.json({ success: false, message: error.message });
//   }
// };


// // Function to securely download report using signed URL (optional if access_mode is public)
// const downloadReport = async (req, res) => {
//   try {
//     const encodedFileName = req.params.publicId; // file name only, e.g., "abc123.pdf"
//     const fileName = decodeURIComponent(encodedFileName);

//     // Specify folder path explicitly
//     const folderPath = "patient-reports";
//     const fullPublicId = `${folderPath}/${fileName}`;

//     const signedUrl = cloudinary.utils.private_download_url(
//       fullPublicId, // includes folder
//       null,         // file format (optional)
//       {
//         type: "upload",
//         resource_type: "raw",
//         expires_at: Math.floor(Date.now() / 1000) + 60 * 30, // 30 minutes expiry
//       }
//     );

//     return res.redirect(signedUrl);

//   } catch (error) {
//     console.error("Download error:", error);
//     res.status(500).json({ success: false, message: error.message });
//   }
// };




export {
  changeAvailabilty,
  doctorList,
  doctorLogin,
  appointmentsDoctor,
  appointmentComplete,
  appointmentCancel,
  doctorDashboard,
  doctorProfile,
  updateDoctorProfile,
  //added
  uploadReport,
  getPatientReports,
  downloadReport,
};
