import React, { useState, useEffect } from 'react';
import { ICONS } from '../constants.tsx';

interface BayModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (newName: string) => void;
  currentName: string;
}

const BayModal: React.FC<BayModalProps> = ({ isOpen, onClose, onSave, currentName }) => {
  const [newName, setNewName] = useState('');

  useEffect(() => {
    if (isOpen) {
      setNewName(currentName);
    }
  }, [isOpen, currentName]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (newName.trim() && newName.trim() !== currentName) {
      onSave(newName.trim());
    }
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 flex justify-center items-center z-50 transition-opacity animate-fade-in" onClick={onClose}>
      <div className="bg-white rounded-xl shadow-2xl p-8 w-full max-w-lg mx-4 transform transition-all animate-slide-up" onClick={e => e.stopPropagation()}>
        <form onSubmit={handleSubmit}>
          <h2 className="text-2xl font-bold text-gray-800 mb-6">Rename Bay</h2>
          <div className="space-y-4">
            <div>
              <label htmlFor="currentName" className="block text-sm font-medium text-gray-700">Current Name</label>
              <input type="text" id="currentName" value={currentName} className="mt-1 w-full px-3 py-2 border bg-gray-100 border-gray-300 rounded-lg" disabled />
            </div>
            <div>
              <label htmlFor="newName" className="block text-sm font-medium text-gray-700">New Name</label>
              <input
                type="text"
                id="newName"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-accent"
                required
              />
            </div>
          </div>
          <div className="mt-8 flex justify-end space-x-4">
            <button type="button" onClick={onClose} className="bg-gray-200 text-gray-700 font-bold py-2 px-6 rounded-lg hover:bg-gray-300 transition-colors">
              Cancel
            </button>
            <button type="submit" className="bg-brand-accent text-white font-bold py-2 px-6 rounded-lg shadow-lg hover:bg-brand-accent/90 focus:outline-none transition-transform transform hover:scale-105">
              Save Changes
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

export default BayModal;
