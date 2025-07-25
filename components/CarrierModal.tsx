import React, { useState, useEffect } from 'react';
import { Customer, CustomerType } from '../types.ts';
import { ICONS } from '../constants.tsx';

interface CarrierModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (carrier: Omit<Customer, 'id'> & { id?: string }) => void;
  carrier: Customer | null;
}

const CarrierModal: React.FC<CarrierModalProps> = ({ isOpen, onClose, onSave, carrier }) => {
  const [formData, setFormData] = useState<Omit<Customer, 'id' | 'customerType' | 'totalAppointments' | 'lastAppointmentDate'>>({
    name: '',
    contactPerson: '',
    email: '',
    phone: '',
    address: '',
    notes: '',
  });

  useEffect(() => {
    if (carrier) {
      setFormData({
        name: carrier.name,
        contactPerson: carrier.contactPerson,
        email: carrier.email,
        phone: carrier.phone,
        address: carrier.address,
        notes: carrier.notes,
      });
    } else {
      setFormData({
        name: '',
        contactPerson: '',
        email: '',
        phone: '',
        address: '',
        notes: '',
      });
    }
  }, [carrier, isOpen]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({ ...formData, id: carrier?.id, customerType: CustomerType.Carrier });
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 flex justify-center items-center z-50 transition-opacity animate-fade-in" onClick={onClose}>
      <div className="bg-white rounded-xl shadow-2xl p-8 w-full max-w-2xl mx-4 transform transition-all animate-slide-up" onClick={e => e.stopPropagation()}>
        <form onSubmit={handleSubmit}>
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-gray-800">{carrier ? 'Edit Carrier' : 'Add New Carrier'}</h2>
            <button type="button" onClick={onClose} className="text-gray-400 hover:text-gray-700">
              {ICONS.close}
            </button>
          </div>
          
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-gray-700">Carrier Name</label>
                  <input type="text" name="name" id="name" value={formData.name} onChange={handleChange} className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-lg" required />
                </div>
                <div>
                  <label htmlFor="contactPerson" className="block text-sm font-medium text-gray-700">Contact Person</label>
                  <input type="text" name="contactPerson" id="contactPerson" value={formData.contactPerson} onChange={handleChange} className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-lg" required />
                </div>
            </div>
             <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                    <label htmlFor="email" className="block text-sm font-medium text-gray-700">Email Address</label>
                    <input type="email" name="email" id="email" value={formData.email} onChange={handleChange} className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-lg" required />
                </div>
                <div>
                    <label htmlFor="phone" className="block text-sm font-medium text-gray-700">Phone Number</label>
                    <input type="tel" name="phone" id="phone" value={formData.phone} onChange={handleChange} className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-lg" required />
                </div>
            </div>
            <div>
              <label htmlFor="address" className="block text-sm font-medium text-gray-700">Address</label>
              <input type="text" name="address" id="address" value={formData.address} onChange={handleChange} className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-lg" required />
            </div>
            <div>
              <label htmlFor="notes" className="block text-sm font-medium text-gray-700">Notes</label>
              <textarea name="notes" id="notes" value={formData.notes} onChange={handleChange} rows={3} className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-lg"></textarea>
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
              className="bg-primary-600 text-white font-bold py-2 px-6 rounded-lg shadow-lg hover:bg-primary-700 focus:outline-none transition-transform transform hover:scale-105"
            >
              {carrier ? 'Save Changes' : 'Add Carrier'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CarrierModal;