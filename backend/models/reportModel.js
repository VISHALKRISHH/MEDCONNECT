import mongoose from "mongoose";

const reportSchema = new mongoose.Schema({
    appointmentId: { type: String, required: true },
    userId: { type: String, required: true },
    docId: { type: String, required: true },
    reportName: { type: String, required: true },
    reportUrl: { type: String, required: true },
    uploadDate: { type: Number, required: true }
});

const reportModel = mongoose.models.report || mongoose.model("report", reportSchema);
export default reportModel;