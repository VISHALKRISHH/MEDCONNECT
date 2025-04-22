import React, { useState } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';

// Remove backendUrl from props
const UploadReport = ({ appointmentId, userId,docId, onClose, dToken, onSuccess }) => {
  const backendUrl = import.meta.env.VITE_BACKEND_URL;

  const [reportFile, setReportFile] = useState(null);
  const [reportName, setReportName] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  
  const handleUpload = async (e) => {
    e.preventDefault();
    
    if (!reportFile) {
      return toast.error('Please select a PDF file');
    }
    
    if (!reportName) {
      return toast.error('Please enter a report name');
    }
    
    try {
      setIsUploading(true);
      
      console.log('Using backend URL:', backendUrl);
      
      const formData = new FormData();
      formData.append('report', reportFile);
      formData.append('appointmentId', appointmentId);
      formData.append('userId', userId);
      formData.append('reportName', reportName);
      formData.append('docId', docId);
      
      // Add backticks around the URL string
      const { data } = await axios.post(
       `${backendUrl}/api/doctor/upload-report`, 
        formData, 
        { headers: { dToken } }
      );
      
      if (data.success) {
        toast.success(data.message);
        if (onSuccess) onSuccess();
        onClose();
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      console.error(error);
      toast.error('Error uploading report');
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded-lg w-full max-w-md">
        <h2 className="text-xl font-semibold mb-4">Upload Patient Report</h2>
        
        <form onSubmit={handleUpload}>
          <div className="mb-4">
            <label className="block text-gray-700 mb-2">Report Name</label>
            <input
              type="text"
              value={reportName}
              onChange={(e) => setReportName(e.target.value)}
              className="w-full p-2 border rounded"
              placeholder="Enter report name"
              required
            />
          </div>
          
          <div className="mb-4">
            <label className="block text-gray-700 mb-2">Select PDF Report</label>
            <input
              type="file"
              accept="application/pdf"
              onChange={(e) => setReportFile(e.target.files[0])}
              className="w-full p-2 border rounded"
              required
            />
            <p className="text-xs text-gray-500 mt-1">Only PDF files are accepted</p>
          </div>
          
          <div className="flex justify-end gap-3 mt-6">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border rounded hover:bg-gray-100"
              disabled={isUploading}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-primary text-white rounded"
              disabled={isUploading}
            >
              {isUploading ? 'Uploading...' : 'Upload Report'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default UploadReport;