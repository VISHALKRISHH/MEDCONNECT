import React, { useContext, useEffect, useState } from 'react';
import { AppContext } from '../context/AppContext';
import axios from 'axios';
import { toast } from 'react-toastify';

const MyReports = () => {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  
  const { token, backendUrl } = useContext(AppContext);
  
  const fetchReports = async () => {
    try {
      setLoading(true);
      const { data } = await axios.get(
        `${backendUrl}/api/user/my-reports`,
        { headers: { token } }
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
    if (token) {
      fetchReports();
    }
  }, [token]);
  
  const formatDate = (timestamp) => {
    const date = new Date(timestamp);
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString();
  };
  
  const handleDownload = (reportId) => {
    const encodedId = encodeURIComponent(reportId);
    window.open(`${backendUrl}/api/user/download-report/${encodedId}`);
  };

  return (
    <div className="min-h-[70vh]">
      <h2 className="text-xl font-medium mb-4 border-b pb-3">My Medical Reports</h2>
      
      {loading ? (
        <div className="flex justify-center py-10">
          <div className="w-10 h-10 border-4 border-gray-300 border-t-primary rounded-full animate-spin"></div>
        </div>
      ) : reports.length === 0 ? (
        <div className="p-8 text-center text-gray-500 border rounded">
          You don't have any medical reports yet.
        </div>
      ) : (
        <div className="grid gap-4">
          {reports.map((report) => (
            <div key={report._id} className="border rounded-lg overflow-hidden bg-white hover:shadow-md transition-shadow">
              <div className="p-4 border-b bg-gray-50">
                <h3 className="font-medium">{report.reportName}</h3>
                <p className="text-sm text-gray-500">Uploaded on {formatDate(report.uploadDate)}</p>
              </div>
              
              <div className="p-4 flex justify-between items-center">
                <div>
                  <p className="text-sm text-gray-600">Appointment ID: {report.appointmentId}</p>
                </div>
                
                <div className="flex gap-2">
                  <a 
                    href={report.reportUrl} 
                    target="_blank" 
                    rel="noopener noreferrer" 
                    className="px-4 py-2 bg-gray-200 text-gray-700 rounded hover:bg-gray-300"
                  >
                    View Report
                  </a>
                  <a 
                    href={report.reportUrl} 
                    download={`${report.reportName}.pdf`}
                    className="px-4 py-2 bg-primary text-white rounded hover:bg-primary/90"
                  >
                    Download
                  </a>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default MyReports;