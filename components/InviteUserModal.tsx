import React, { useState } from 'react';
import { Role } from '../types.ts';
import { ICONS } from '../constants.tsx';

interface InviteUserModalProps {
  isOpen: boolean;
  onClose: () => void;
  onInvite: (userData: { name: string; email: string; role: Role }) => void;
}

const InviteUserModal: React.FC<InviteUserModalProps> = ({ isOpen, onClose, onInvite }) => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    role: Role.GateKeeper,
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.email.trim()) {
        alert('Please fill out all fields.');
        return;
    }
    onInvite(formData);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 flex justify-center items-center z-50 transition-opacity animate-fade-in" onClick={onClose}>
      <div className="bg-white rounded-xl shadow-2xl p-8 w-full max-w-lg mx-4 transform transition-all animate-slide-up" onClick={e => e.stopPropagation()}>
        <form onSubmit={handleSubmit}>
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-gray-800">Invite New User</h2>
             <button type="button" onClick={onClose} className="text-gray-400 hover:text-gray-700">
              {ICONS.close}
            </button>
          </div>
          
          <div className="space-y-4">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700">Full Name</label>
              <input type="text" name="name" id="name" value={formData.name} onChange={handleChange} className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-lg" required />
            </div>
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700">Email Address</label>
              <input type="email" name="email" id="email" value={formData.email} onChange={handleChange} className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-lg" required />
            </div>
             <div>
              <label htmlFor="role" className="block text-sm font-medium text-gray-700">Role</label>
              <select name="role" id="role" value={formData.role} onChange={handleChange} className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-lg" required>
                 {Object.values(Role).map(role => <option key={role} value={role}>{role}</option>)}
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
              type="submit"
              className="bg-brand-accent text-white font-bold py-2 px-6 rounded-lg shadow-lg hover:bg-brand-accent/90 focus:outline-none transition-transform transform hover:scale-105"
            >
              Send Invitation
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

export default InviteUserModal;