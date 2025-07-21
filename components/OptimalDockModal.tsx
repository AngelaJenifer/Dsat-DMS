import React from 'react';
import { ICONS } from '../constants.tsx';

interface OptimalDockModalProps {
  isOpen: boolean;
  onClose: () => void;
  suggestion: { dockId: string; reason: string };
  onAccept: (dockId: string) => void;
  onReject: () => void;
  vehicleId: string;
}

const OptimalDockModal: React.FC<OptimalDockModalProps> = ({ isOpen, onClose, suggestion, onAccept, onReject, vehicleId }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 flex justify-center items-center z-50 transition-opacity animate-fade-in" onClick={onClose}>
      <div className="bg-white rounded-xl shadow-2xl p-8 w-full max-w-lg mx-4 transform transition-all animate-slide-up" onClick={e => e.stopPropagation()}>
        <div className="flex items-center gap-3 mb-4">
            <span className="text-brand-accent">{ICONS.sparkles}</span>
            <h2 className="text-2xl font-bold text-gray-800">AI Dock Suggestion</h2>
        </div>

        <p className="text-gray-600 mb-6">
            The scheduled dock for vehicle <span className="font-semibold text-gray-800">{vehicleId}</span> is currently busy.
            Our AI assistant has found an optimal alternative:
        </p>

        <div className="bg-indigo-50 border-l-4 border-indigo-400 p-4 rounded-r-lg mb-8">
            <p className="text-lg font-bold text-indigo-800">Assign to Dock {suggestion.dockId}</p>
            <p className="text-sm text-indigo-700 mt-1 italic">"{suggestion.reason}"</p>
        </div>
        
        <div className="flex flex-col sm:flex-row justify-end space-y-3 sm:space-y-0 sm:space-x-4">
          <button
            onClick={onReject}
            className="w-full sm:w-auto bg-yellow-500 text-white font-bold py-3 px-6 rounded-lg shadow-lg hover:bg-yellow-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-yellow-500 transition-transform transform hover:scale-105"
          >
            Send to Yard Instead
          </button>
          <button
            onClick={() => onAccept(suggestion.dockId)}
            className="w-full sm:w-auto bg-brand-accent text-white font-bold py-3 px-6 rounded-lg shadow-lg hover:bg-brand-accent/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-accent transition-transform transform hover:scale-105"
          >
            Accept & Reassign
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

export default OptimalDockModal;