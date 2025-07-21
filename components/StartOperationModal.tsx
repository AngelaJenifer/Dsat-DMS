import React, { useState } from 'react';
import { Vehicle, OperationType } from '../types.ts';

interface StartOperationModalProps {
  isOpen: boolean;
  onClose: () => void;
  vehicles: Vehicle[];
  onStartOperation: (vehicleId: string, operationType: OperationType, durationMinutes: number) => void;
}

const StartOperationModal: React.FC<StartOperationModalProps> = ({ isOpen, onClose, vehicles, onStartOperation }) => {
  const [selectedVehicleId, setSelectedVehicleId] = useState('');
  const [operationType, setOperationType] = useState<OperationType>(OperationType.Loading);
  const [duration, setDuration] = useState('60');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedVehicleId || !duration) {
      alert('Please fill out all fields.');
      return;
    }
    onStartOperation(selectedVehicleId, operationType, parseInt(duration, 10));
    handleClose();
  };
  
  const handleClose = () => {
    setSelectedVehicleId('');
    setOperationType(OperationType.Loading);
    setDuration('60');
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 flex justify-center items-center z-50 transition-opacity animate-fade-in" onClick={handleClose}>
      <div className="bg-white rounded-xl shadow-2xl p-8 w-full max-w-lg mx-4 transform transition-all animate-slide-up" onClick={e => e.stopPropagation()}>
        <form onSubmit={handleSubmit}>
          <h2 className="text-2xl font-bold text-gray-800 mb-6">Start New Operation</h2>
          
          <div className="space-y-6">
            <div>
              <label htmlFor="vehicle" className="block text-sm font-medium text-gray-700 mb-1">
                Vehicle
              </label>
              <select
                id="vehicle"
                value={selectedVehicleId}
                onChange={(e) => setSelectedVehicleId(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-brand-accent"
                required
              >
                <option value="" disabled>Select a vehicle at a dock</option>
                {vehicles.map(v => (
                  <option key={v.id} value={v.id}>{v.id} - {v.carrier} (Dock: {v.assignedDockId})</option>
                ))}
              </select>
            </div>
            
            <div>
              <label htmlFor="operationType" className="block text-sm font-medium text-gray-700 mb-1">
                Operation Type
              </label>
              <select
                id="operationType"
                value={operationType}
                onChange={(e) => setOperationType(e.target.value as OperationType)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-brand-accent"
                required
              >
                {Object.entries(OperationType).map(([key, value]) => (
                  <option key={key} value={value}>{value}</option>
                ))}
              </select>
            </div>

            <div>
              <label htmlFor="duration" className="block text-sm font-medium text-gray-700 mb-1">
                Estimated Duration (minutes)
              </label>
              <input
                type="number"
                id="duration"
                value={duration}
                onChange={(e) => setDuration(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-brand-accent"
                min="1"
                required
              />
            </div>
          </div>
          
          <div className="mt-8 flex justify-end space-x-4">
            <button
              type="button"
              onClick={handleClose}
              className="bg-gray-200 text-gray-700 font-bold py-2 px-6 rounded-lg hover:bg-gray-300 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="bg-brand-accent text-white font-bold py-2 px-6 rounded-lg shadow-lg hover:bg-brand-accent/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-accent transition-transform transform hover:scale-105"
            >
              Start Operation
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

export default StartOperationModal;