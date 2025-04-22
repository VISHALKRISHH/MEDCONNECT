import React, { useContext, useEffect, useState } from 'react';
import { DoctorContext } from '../../context/DontorContext';
import { AppContext } from '../../context/AppContext';
import axios from 'axios';
import { toast } from 'react-toastify';

const DoctorReports = () => {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  
  const { dToken } = useContext(DoctorContext);
  const { backendUrl } = useContext(AppContext);
  
  const fetchReports = async () => {
    try {
      setLoading(true);
      const { data } = await axios.get(
        `${backendUrl}/api/doctor/patient-reports`,
        { headers: { dToken } }
      );
      
      if (data.success) {
        setReports(data.reports);
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      console.error(error);
      toast.error('Error fetching reports');
    } finally {
      setLoading(false);
    }
  };
  
  useEffect(() => {
    if (dToken) {
      fetchReports();
    }
  }, [dToken]);
  
  const formatDate = (timestamp) => {
    const date = new Date(timestamp);
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString();
  };
  
  const handleDownload = (reportId) => {
    const encodedId = encodeURIComponent(reportId);
    window.open(`${backendUrl}/api/doctor/download-report/${encodedId}`);
  };
  
  
  return (
    <div className="m-5 max-w-6xl">
      <h2 className="text-xl font-medium mb-4">Patient Reports</h2>
      
      {loading ? (
        <div className="flex justify-center py-10">
          <div className="w-10 h-10 border-4 border-gray-300 border-t-primary rounded-full animate-spin"></div>
        </div>
      ) : reports.length === 0 ? (
        <div className="bg-white p-8 text-center text-gray-500 border rounded">
          No reports have been uploaded yet.
        </div>
      ) : (
        <div className="bg-white border rounded overflow-hidden">
          <div className="grid grid-cols-[3fr_2fr_1fr] gap-4 p-4 font-medium border-b bg-gray-50">
            <div>Report Details</div>
            <div>Patient</div>
            <div>Actions</div>
          </div>
          
          {reports.map((report) => (
            <div key={report._id} className="grid grid-cols-[3fr_2fr_1fr] gap-4 p-4 border-b hover:bg-gray-50">
              <div>
                <p className="font-medium">{report.reportName}</p>
                <p className="text-sm text-gray-500">Uploaded: {formatDate(report.uploadDate)}</p>
              </div>
              
              <div className="flex items-center">
                <div>
                  <p className="font-medium">Patient ID: {report.userId}</p>
                  <p className="text-sm text-gray-500">Appointment ID: {report.appointmentId}</p>
                </div>
              </div>
              
              <div>
                <a 
                  href={report.reportUrl} 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="px-3 py-1 bg-primary text-white text-sm rounded hover:bg-primary/90"
                >
                  View Report
                </a>
              </div>

              <div>
                <a href={report.reportUrl} 
                target="_blank" 
                rel="noopener noreferrer" 
                className="px-3 py-1 bg-gray-200 text-gray-700 text-sm rounded hover:bg-gray-300 mr-2"
                >
                View
                </a>
                <a href={report.reportUrl} 
                download={`${report.reportName}.pdf`}
                className="px-3 py-1 bg-primary text-white text-sm rounded hover:bg-primary/90">
                Download
                 </a>

                {/* <button 
                onClick={() => handleDownload(report._id)}
                className="px-3 py-1 bg-primary text-white text-sm rounded hover:bg-primary/90"
                >
                Download
                </button> */}
            </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default DoctorReports;