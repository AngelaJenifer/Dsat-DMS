import React, { useState, useEffect } from 'react';
import { Operation } from '../types.ts';

interface ReportDelayModalProps {
  operation: Operation | null;
  onClose: () => void;
  onSubmit: (operationId: string, reason: string) => void;
}

const ReportDelayModal: React.FC<ReportDelayModalProps> = ({ operation, onClose, onSubmit }) => {
  const [reason, setReason] = useState('');

  useEffect(() => {
    // Reset reason when modal is opened for a new operation or closed
    if (operation) {
      setReason('');
    }
  }, [operation]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!reason.trim()) {
      alert('Please provide a reason for the delay.');
      return;
    }
    if (operation) {
      onSubmit(operation.id, reason);
    }
  };
  
  if (!operation) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 flex justify-center items-center z-50 transition-opacity animate-fade-in" onClick={onClose}>
      <div className="bg-white rounded-xl shadow-2xl p-8 w-full max-w-lg mx-4 transform transition-all animate-slide-up" onClick={e => e.stopPropagation()}>
        <form onSubmit={handleSubmit}>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Report Delay</h2>
          <p className="text-gray-600 mb-6">Provide a reason for the delay on operation for vehicle <span className="font-bold">{operation.vehicleId}</span>.</p>
          
          <div className="space-y-6">
            <div>
              <label htmlFor="reason" className="block text-sm font-medium text-gray-700 mb-1">
                Delay Reason
              </label>
              <textarea
                id="reason"
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-brand-accent"
                rows={4}
                placeholder="e.g., Equipment malfunction, staffing issue..."
                required
              />
            </div>
          </div>
          
          <div className="mt-8 flex justify-end space-x-4">
            <button
              type="button"
              onClick={onClose}
              className="bg-gray-200 text-gray-700 font-bold py-2 px-6 rounded-lg hover:bg-gray-300 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="bg-status-red text-white font-bold py-2 px-6 rounded-lg shadow-lg hover:bg-status-red/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-status-red transition-transform transform hover:scale-105"
            >
              Submit Report
            </button>
          </div>
        </form>
         <style>{`
          @keyframes fade-in {
            from { opacity: 0; }
            to { opacity: 1; }
          }
          @keyframes slide-up {
            from { transform: translateY(20px); opacity: 0; }
            to { transform: translateY(0); opacity: 1; }
          }
          .animate-fade-in { animation: fade-in 0.3s ease-out forwards; }
          .animate-slide-up { animation: slide-up 0.4s ease-out forwards; }
        `}</style>
      </div>
    </div>
  );
};

export default ReportDelayModal;