import React from 'react';
import { Vehicle } from '../types.ts';

interface GatePassModalProps {
  vehicle: Vehicle | null;
  onClose: () => void;
}

const QRCode: React.FC = () => (
    <svg width="100" height="100" viewBox="0 0 29 29" fill="none" xmlns="http://www.w3.org/2000/svg" className="mx-auto">
        <path fillRule="evenodd" clipRule="evenodd" d="M0 0H11V11H0V0ZM2 2V9H9V2H2Z" fill="black"/>
        <path d="M4 4H7V7H4V4Z" fill="black"/>
        <path fillRule="evenodd" clipRule="evenodd" d="M18 0H29V11H18V0ZM20 2V9H27V2H20Z" fill="black"/>
        <path d="M22 4H25V7H22V4Z" fill="black"/>
        <path fillRule="evenodd" clipRule="evenodd" d="M0 18H11V29H0V18ZM2 20V27H9V20H2Z" fill="black"/>
        <path d="M4 22H7V25H4V22Z" fill="black"/>
        <path d="M20 18H18V20H20V22H18V25H20V27H22V29H25V27H27V29H29V27H27V25H29V22H27V20H25V18H22V20H20V18ZM25 22H22V25H25V22Z" fill="black"/>
        <path d="M13 2H16V4H13V2ZM13 5H14V6H13V5ZM13 7H14V9H13V7ZM14 10H13V11H14V10ZM16 7H14V9H16V7ZM16 5H14V6H16V5ZM16 13H14V14H16V13ZM13 13H11V14H13V13ZM13 16H11V18H13V16ZM14 14H13V16H14V14ZM2 13H4V14H2V13ZM5 13H7V14H5V13ZM9 13H11V14H9V13ZM7 14H9V16H7V14ZM5 16H7V18H5V16ZM2 14H4V16H2V14ZM20 13H18V14H20V13ZM18 16H20V18H18V16ZM22 16H20V14H22V16Z" fill="black"/>
    </svg>
);


const GatePassModal: React.FC<GatePassModalProps> = ({ vehicle, onClose }) => {
  if (!vehicle) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 flex justify-center items-center z-50 transition-opacity animate-fade-in" onClick={onClose}>
      <div className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-md mx-4 transform transition-all animate-slide-up" onClick={e => e.stopPropagation()}>
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-800">Gate Pass</h2>
          <p className="text-sm text-gray-500 mb-6">Vehicle Cleared for Entry</p>
        </div>
        
        <div className="space-y-4 mb-6">
          <div className="flex justify-between items-center bg-gray-50 p-3 rounded-lg">
            <span className="font-semibold text-gray-600">Vehicle ID</span>
            <span className="font-bold text-gray-800">{vehicle.id}</span>
          </div>
          <div className="flex justify-between items-center bg-gray-50 p-3 rounded-lg">
            <span className="font-semibold text-gray-600">Carrier</span>
            <span className="font-bold text-gray-800">{vehicle.carrier}</span>
          </div>
          <div className="flex justify-between items-center bg-gray-50 p-3 rounded-lg">
            <span className="font-semibold text-gray-600">Driver</span>
            <span className="font-bold text-gray-800">{vehicle.driverName}</span>
          </div>
          <div className="flex justify-between items-center bg-gray-50 p-3 rounded-lg">
            <span className="font-semibold text-gray-600">Assigned Dock</span>
            <span className="font-bold text-status-green">{vehicle.assignedDockId}</span>
          </div>
          <div className="flex justify-between items-center bg-gray-50 p-3 rounded-lg">
            <span className="font-semibold text-gray-600">Check-in Time</span>
            <span className="font-bold text-gray-800">{vehicle.entryTime ? new Date(vehicle.entryTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'N/A'}</span>
          </div>
        </div>
        
        <div className="my-6">
            <QRCode />
        </div>

        <div className="flex justify-end space-x-4">
          <button
            onClick={onClose}
            className="w-full bg-brand-accent text-white font-bold py-3 px-6 rounded-lg shadow-lg hover:bg-brand-accent/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-accent transition-all transform hover:scale-105"
          >
            Close
          </button>
        </div>
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

export default GatePassModal;