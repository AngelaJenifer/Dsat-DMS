import React, { useState, useEffect } from 'react';
import { Dock, Customer } from '../types.ts';
import { XCircleIcon } from './icons/Icons.tsx';

interface SpotAppointmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  availableDocks: Dock[];
  customers: Customer[];
  onCreateAppointment: (data: { vehicleId: string; driverName: string; customerId: string; assignedDockId: string; checkIn: boolean }) => void;
}

const SpotAppointmentModal: React.FC<SpotAppointmentModalProps> = ({ isOpen, onClose, availableDocks, customers, onCreateAppointment }) => {
  const [formData, setFormData] = useState({
    vehicleId: '',
    driverName: '',
    customerId: '',
    assignedDockId: '',
  });
  
  const baseInputClasses = "mt-1 w-full px-3 py-2 border bg-gray-100 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-accent text-gray-900 placeholder:text-gray-500";

  useEffect(() => {
    if (isOpen) {
      setFormData({
        vehicleId: '',
        driverName: '',
        customerId: customers.length > 0 ? customers[0].id : '',
        assignedDockId: availableDocks.length > 0 ? availableDocks[0].id! : '',
      });
    }
  }, [isOpen, availableDocks, customers]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleCreateAndCheckIn = () => {
    if (!formData.vehicleId || !formData.driverName || !formData.assignedDockId || !formData.customerId) {
        alert("Please fill in all fields.");
        return;
    }
    onCreateAppointment({ ...formData, checkIn: true });
  };
  
  const handleCreateAndAssignToYard = () => {
    if (!formData.vehicleId || !formData.driverName || !formData.customerId) {
        alert("Please fill in Vehicle ID, Driver Name, and select a Customer.");
        return;
    }
    onCreateAppointment({ ...formData, assignedDockId: formData.assignedDockId || 'YARD', checkIn: false });
  };

  return (
    <>
      <div className={`fixed inset-0 bg-black/30 z-40 transition-opacity ${isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`} onClick={onClose} />
      <div className={`fixed top-0 right-0 h-full w-full max-w-lg bg-white shadow-xl z-50 transform transition-transform duration-300 ease-in-out ${isOpen ? 'translate-x-0' : 'translate-x-full'}`}>
        <div className="flex flex-col h-full">
            <div className="p-5 border-b border-gray-200">
                <div className="flex justify-between items-center">
                   <h2 className="text-2xl font-bold text-gray-800">Create Spot Appointment</h2>
                   <button onClick={onClose} className="p-1 rounded-full text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition-colors"><XCircleIcon className="w-6 h-6"/></button>
                </div>
                <p className="text-sm text-gray-500 mt-1">Create a new walk-in appointment for a customer.</p>
            </div>

            <form onSubmit={(e) => e.preventDefault()} className="flex-grow flex flex-col">
                <div className="flex-grow p-5 space-y-4 overflow-y-auto bg-gray-50/50">
                    <div>
                        <label htmlFor="vehicleId" className="block text-sm font-medium text-gray-700">Vehicle ID / License Plate</label>
                        <input type="text" name="vehicleId" id="vehicleId" value={formData.vehicleId} onChange={handleChange} className={baseInputClasses} required />
                    </div>
                    <div>
                        <label htmlFor="driverName" className="block text-sm font-medium text-gray-700">Driver's Name</label>
                        <input type="text" name="driverName" id="driverName" value={formData.driverName} onChange={handleChange} className={baseInputClasses} required />
                    </div>
                     <div>
                        <label htmlFor="customerId" className="block text-sm font-medium text-gray-700">Customer</label>
                        <select name="customerId" id="customerId" value={formData.customerId} onChange={handleChange} className={baseInputClasses} required>
                            {customers.map(c => <option key={c.id} value={c.id}>{c.name} ({c.customerType})</option>)}
                        </select>
                    </div>
                    <div>
                        <label htmlFor="assignedDockId" className="block text-sm font-medium text-gray-700">Assign to Dock</label>
                        <select name="assignedDockId" id="assignedDockId" value={formData.assignedDockId} onChange={handleChange} className={baseInputClasses} disabled={availableDocks.length === 0}>
                            {availableDocks.length > 0 ? (
                            availableDocks.map(d => <option key={d.id} value={d.id!}>{d.name}</option>)
                            ) : (
                            <option>No docks available</option>
                            )}
                        </select>
                    </div>
                </div>
              
                <div className="flex-shrink-0 flex flex-col sm:flex-row justify-end items-center p-4 border-t border-gray-200 bg-white gap-2">
                    <button
                        type="button"
                        onClick={onClose}
                        className="w-full sm:w-auto px-4 py-2 rounded-lg text-sm font-semibold text-gray-700 bg-gray-100 hover:bg-gray-200 transition-colors"
                    >
                        Cancel
                    </button>
                    <button
                        type="button"
                        onClick={handleCreateAndAssignToYard}
                        className="w-full sm:w-auto bg-status-yellow text-white font-bold py-2 px-4 rounded-lg shadow hover:bg-yellow-600"
                    >
                        Create & Assign to Yard
                    </button>
                    <button
                        type="button"
                        onClick={handleCreateAndCheckIn}
                        disabled={availableDocks.length === 0}
                        className="w-full sm:w-auto bg-status-green text-white font-bold py-2 px-4 rounded-lg shadow hover:bg-green-600 disabled:bg-gray-400 disabled:cursor-not-allowed"
                    >
                        Create & Check-In
                    </button>
                </div>
            </form>
        </div>
      </div>
    </>
  );
};

export default SpotAppointmentModal;