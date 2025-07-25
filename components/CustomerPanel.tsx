import React, { useState, useEffect } from 'react';
import { Customer, CustomerType } from '../types.ts';
import { ICONS } from '../constants.tsx';

interface CustomerPanelProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (customer: Omit<Customer, 'id'> & { id?: string }) => void;
  customer: Customer | null;
}

const CustomerPanel: React.FC<CustomerPanelProps> = ({ isOpen, onClose, onSave, customer }) => {
  const isEditing = !!customer;

  const getInitialState = () => ({
    name: '',
    contactPerson: '',
    email: '',
    phone: '',
    address: '',
    notes: '',
    customerType: CustomerType.Vendor,
  });

  const [formData, setFormData] = useState(getInitialState());

  useEffect(() => {
    if (isOpen) {
      if (customer) {
        setFormData({
          name: customer.name,
          contactPerson: customer.contactPerson,
          email: customer.email,
          phone: customer.phone,
          address: customer.address,
          notes: customer.notes,
          customerType: customer.customerType,
        });
      } else {
        setFormData(getInitialState());
      }
    }
  }, [customer, isOpen]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.contactPerson) {
        alert("Please fill in the required fields.");
        return;
    }
    onSave({ ...formData, id: customer?.id });
  };
  
  const baseInputClasses = "mt-1 w-full px-3 py-2 border bg-gray-100 border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-accent text-sm text-gray-900";

  return (
    <>
      <div 
        className={`fixed inset-0 bg-black/60 z-40 transition-opacity ${isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`} 
        onClick={onClose} 
      />
      <div 
        className={`fixed top-0 right-0 h-full w-full max-w-2xl bg-white shadow-xl z-50 transform transition-transform duration-300 ease-in-out ${isOpen ? 'translate-x-0' : 'translate-x-full'}`}
      >
        <form onSubmit={handleSubmit} className="flex flex-col h-full">
            <div className="flex justify-between items-center p-6 border-b border-gray-200 flex-shrink-0">
              <h2 className="text-2xl font-bold text-gray-800">{isEditing ? 'Edit Customer' : 'Add New Customer'}</h2>
              <button type="button" onClick={onClose} className="p-1 rounded-full text-gray-400 hover:bg-gray-100 transition-colors">
                {ICONS.close}
              </button>
            </div>
          
            <div className="flex-grow overflow-y-auto p-6 space-y-4 bg-gray-50/50">
                <div>
                  <label htmlFor="customerType" className="block text-sm font-medium text-gray-700">Customer Type</label>
                  <select name="customerType" id="customerType" value={formData.customerType} onChange={handleChange} className={baseInputClasses} disabled={isEditing}>
                      <option value={CustomerType.Vendor}>Vendor</option>
                      <option value={CustomerType.Carrier}>Carrier</option>
                  </select>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label htmlFor="name" className="block text-sm font-medium text-gray-700">Name</label>
                      <input type="text" name="name" id="name" value={formData.name} onChange={handleChange} className={baseInputClasses} required />
                    </div>
                    <div>
                      <label htmlFor="contactPerson" className="block text-sm font-medium text-gray-700">Contact Person</label>
                      <input type="text" name="contactPerson" id="contactPerson" value={formData.contactPerson} onChange={handleChange} className={baseInputClasses} required />
                    </div>
                </div>
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label htmlFor="email" className="block text-sm font-medium text-gray-700">Email Address</label>
                        <input type="email" name="email" id="email" value={formData.email} onChange={handleChange} className={baseInputClasses} required />
                    </div>
                    <div>
                        <label htmlFor="phone" className="block text-sm font-medium text-gray-700">Phone Number</label>
                        <input type="tel" name="phone" id="phone" value={formData.phone} onChange={handleChange} className={baseInputClasses} required />
                    </div>
                </div>
                <div>
                  <label htmlFor="address" className="block text-sm font-medium text-gray-700">Address</label>
                  <input type="text" name="address" id="address" value={formData.address} onChange={handleChange} className={baseInputClasses} required />
                </div>
                <div>
                  <label htmlFor="notes" className="block text-sm font-medium text-gray-700">Notes</label>
                  <textarea name="notes" id="notes" value={formData.notes} onChange={handleChange} rows={3} className={baseInputClasses}></textarea>
                </div>
            </div>
          
            <div className="p-4 flex justify-end space-x-4 flex-shrink-0 bg-white border-t border-gray-200">
                <button type="button" onClick={onClose} className="bg-gray-200 text-gray-700 font-bold py-2 px-6 rounded-lg hover:bg-gray-300 transition-colors">
                  Cancel
                </button>
                <button type="submit" className="bg-primary-600 text-white font-bold py-2 px-6 rounded-lg shadow-lg hover:bg-primary-700 focus:outline-none transition-transform transform hover:scale-105">
                  {isEditing ? 'Save Changes' : 'Add Customer'}
                </button>
            </div>
        </form>
      </div>
    </>
  );
};

export default CustomerPanel;