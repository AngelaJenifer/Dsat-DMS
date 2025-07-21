import React, { useState } from 'react';
import { ICONS } from '../constants.tsx';

interface OptimalSlotFinderModalProps {
  isOpen: boolean;
  onClose: () => void;
  onFindSlot: (requirements: { duration: number; isRefrigerated: boolean }) => void;
  isFinding: boolean;
}

const OptimalSlotFinderModal: React.FC<OptimalSlotFinderModalProps> = ({ isOpen, onClose, onFindSlot, isFinding }) => {
    const [duration, setDuration] = useState(60);
    const [isRefrigerated, setIsRefrigerated] = useState(false);

    if (!isOpen) return null;

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onFindSlot({ duration, isRefrigerated });
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex justify-center items-center z-50 transition-opacity animate-fade-in" onClick={onClose}>
            <div className="bg-white rounded-xl shadow-2xl p-8 w-full max-w-md mx-4 transform transition-all animate-slide-up" onClick={e => e.stopPropagation()}>
                <form onSubmit={handleSubmit}>
                    <div className="flex items-center gap-3 mb-6">
                        <span className="text-brand-accent">{ICONS.sparkles}</span>
                        <h2 className="text-2xl font-bold text-gray-800">Find Optimal Slot (AI)</h2>
                    </div>
                    <p className="text-gray-600 mb-6 text-sm">Let the AI find the best available time and dock for your appointment based on your needs.</p>
                    
                    <div className="space-y-4">
                        <div>
                            <label htmlFor="duration" className="block text-sm font-medium text-gray-700">Appointment Duration</label>
                            <select id="duration" value={duration} onChange={e => setDuration(parseInt(e.target.value, 10))} className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-lg">
                                <option value={30}>30 minutes</option>
                                <option value={60}>1 hour</option>
                                <option value={90}>1.5 hours</option>
                                <option value={120}>2 hours</option>
                            </select>
                        </div>
                        <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                            <label htmlFor="refrigerated" className="text-sm font-medium text-gray-700">Requires Refrigerated Dock?</label>
                            <input type="checkbox" id="refrigerated" checked={isRefrigerated} onChange={e => setIsRefrigerated(e.target.checked)} className="h-5 w-5 rounded border-gray-300 text-brand-accent focus:ring-brand-accent"/>
                        </div>
                    </div>
                    
                    <div className="mt-8 flex justify-end space-x-4">
                        <button type="button" onClick={onClose} className="bg-gray-200 text-gray-700 font-bold py-2 px-6 rounded-lg hover:bg-gray-300">Cancel</button>
                        <button type="submit" disabled={isFinding} className="bg-brand-accent text-white font-bold py-2 px-6 rounded-lg shadow-lg hover:bg-brand-accent/90 disabled:bg-gray-400">
                            {isFinding ? 'Finding...' : 'Find Slot'}
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

export default OptimalSlotFinderModal;
