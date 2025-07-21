import React, { useState, useEffect } from 'react';
import { Dock, Carrier, Vendor } from '../types.ts';
import { ICONS } from '../constants.tsx';

interface SpotAppointmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  availableDocks: Dock[];
  carriers: Carrier[];
  vendors: Vendor[];
  onCreateAppointment: (data: { vehicleId: string; driverName: string; carrier: string; vendorId: string; assignedDockId: string; checkIn: boolean }) => void;
}

const SpotAppointmentModal: React.FC<SpotAppointmentModalProps> = ({ isOpen, onClose, availableDocks, carriers, vendors, onCreateAppointment }) => {
  const [formData, setFormData] = useState({
    vehicleId: '',
    driverName: '',
    carrier: '',
    vendorId: '',
    assignedDockId: '',
  });

  useEffect(() => {
    if (isOpen) {
      setFormData({
        vehicleId: '',
        driverName: '',
        carrier: carriers.length > 0 ? carriers[0].name : '',
        vendorId: vendors.length > 0 ? vendors[0].id : '',
        assignedDockId: availableDocks.length > 0 ? availableDocks[0].id! : '',
      });
    }
  }, [isOpen, availableDocks, carriers, vendors]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleCreateAndCheckIn = () => {
    if (!formData.vehicleId || !formData.driverName || !formData.assignedDockId) {
        alert("Please fill in Vehicle ID, Driver Name, and select a Dock.");
        return;
    }
    onCreateAppointment({ ...formData, checkIn: true });
  };
  
  const handleCreateAndAssignToYard = () => {
    if (!formData.vehicleId || !formData.driverName) {
        alert("Please fill in Vehicle ID and Driver Name.");
        return;
    }
    onCreateAppointment({ ...formData, assignedDockId: formData.assignedDockId || 'YARD', checkIn: false });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 flex justify-center items-center z-50 transition-opacity animate-fade-in" onClick={onClose}>
      <div className="bg-white rounded-xl shadow-2xl p-8 w-full max-w-lg mx-4 transform transition-all animate-slide-up" onClick={e => e.stopPropagation()}>
        <form onSubmit={(e) => e.preventDefault()}>
          <h2 className="text-2xl font-bold text-gray-800 mb-6">Create Walk-in Appointment</h2>
          
          <div className="space-y-4">
            <div>
              <label htmlFor="vehicleId" className="block text-sm font-medium text-gray-700">Vehicle ID / License Plate</label>
              <input type="text" name="vehicleId" id="vehicleId" value={formData.vehicleId} onChange={handleChange} className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-lg" required />
            </div>
             <div>
              <label htmlFor="carrier" className="block text-sm font-medium text-gray-700">Carrier</label>
              <select name="carrier" id="carrier" value={formData.carrier} onChange={handleChange} className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-lg" required>
                 {carriers.map(c => <option key={c.id} value={c.name}>{c.name}</option>)}
              </select>
            </div>
            <div>
              <label htmlFor="driverName" className="block text-sm font-medium text-gray-700">Driver's Name</label>
              <input type="text" name="driverName" id="driverName" value={formData.driverName} onChange={handleChange} className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-lg" required />
            </div>
            <div>
              <label htmlFor="assignedDockId" className="block text-sm font-medium text-gray-700">Assign to Dock</label>
              <select name="assignedDockId" id="assignedDockId" value={formData.assignedDockId} onChange={handleChange} className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-lg" disabled={availableDocks.length === 0}>
                 {availableDocks.length > 0 ? (
                    availableDocks.map(d => <option key={d.id} value={d.id!}>{d.name}</option>)
                 ) : (
                    <option>No docks available</option>
                 )}
              </select>
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
              type="button"
              onClick={handleCreateAndAssignToYard}
              className="bg-status-yellow text-white font-bold py-2 px-6 rounded-lg shadow-lg hover:bg-yellow-600 focus:outline-none transition-transform transform hover:scale-105"
            >
              Create & Assign to Yard
            </button>
            <button
              type="button"
              onClick={handleCreateAndCheckIn}
              disabled={availableDocks.length === 0}
              className="bg-status-green text-white font-bold py-2 px-6 rounded-lg shadow-lg hover:bg-green-600 focus:outline-none transition-transform transform hover:scale-105 disabled:bg-gray-400 disabled:cursor-not-allowed"
            >
              Create & Check-In
            </button>
          </div>
        </form>
        <style>{`
          @keyframes fade-in { from { opacity: 0; } to { opacity: 1; } }
          @keyframes slide-up { from { transform: translateY(20px); opacity: 0; } to { transform: translateY(0); opacity: 1; } }
          .animate-fade-in { animation: fade-in 0.3s ease-out forwards; }
          .animate-slide-up { animation: slide-up 0.4s ease-out forwards; }
        `}</style>
      </div>
    </div>
  );
};

export default SpotAppointmentModal;