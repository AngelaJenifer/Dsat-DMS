import React, { useState, useEffect } from 'react';
import { Document, ExtractedDocumentInfo } from '../types.ts';
import { ICONS } from '../constants.tsx';

interface DocumentExtractionModalProps {
  isOpen: boolean;
  onClose: () => void;
  document: Document;
  extractionResult: ExtractedDocumentInfo;
  onConfirm: (document: Document, confirmedData: Omit<ExtractedDocumentInfo, 'confidence' | 'notes'>) => void;
}

const DocumentExtractionModal: React.FC<DocumentExtractionModalProps> = ({ isOpen, onClose, document, extractionResult, onConfirm }) => {
  const [formData, setFormData] = useState({
    vehicleId: '',
    carrier: '',
    companyName: '',
  });

  useEffect(() => {
    if (extractionResult) {
      setFormData({
        vehicleId: extractionResult.vehicleId || '',
        carrier: extractionResult.carrier || '',
        companyName: extractionResult.companyName || '',
      });
    }
  }, [extractionResult]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onConfirm(document, formData);
  };
  
  const handleClose = () => {
    onClose();
  };

  if (!isOpen) return null;

  const confidenceColor = extractionResult.confidence >= 0.8 ? 'text-green-600' : extractionResult.confidence >= 0.5 ? 'text-yellow-600' : 'text-red-600';

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 flex justify-center items-center z-50 transition-opacity animate-fade-in" onClick={handleClose}>
      <div className="bg-white rounded-xl shadow-2xl p-8 w-full max-w-4xl mx-4 transform transition-all animate-slide-up h-[90vh] flex flex-col" onClick={e => e.stopPropagation()}>
        <form onSubmit={handleSubmit} className="flex flex-col h-full">
            <div className="flex-shrink-0">
                <div className="flex items-center gap-3 mb-2">
                    <span className="text-brand-accent">{ICONS.sparkles}</span>
                    <h2 className="text-2xl font-bold text-gray-800">AI Document Extraction</h2>
                </div>
                <p className="text-gray-600 mb-6 text-sm">AI has extracted the following information from <span className="font-semibold">{document.name}</span>. Please review and confirm.</p>
            </div>
          
            <div className="flex-grow grid grid-cols-1 md:grid-cols-2 gap-6 min-h-0">
                {/* Left: Extracted Text */}
                <div className="bg-gray-50 p-4 rounded-lg flex flex-col">
                     <h3 className="text-sm font-semibold text-gray-600 mb-2 flex-shrink-0">Source Text</h3>
                     <pre className="text-xs text-gray-700 whitespace-pre-wrap font-mono bg-white p-3 border rounded-md flex-grow overflow-y-auto">{document.extractedText || "No text extracted."}</pre>
                </div>
                {/* Right: Form & AI Notes */}
                <div className="flex flex-col gap-6">
                    <div className="space-y-4">
                        <div>
                        <label htmlFor="vehicleId" className="block text-sm font-medium text-gray-700">Vehicle ID</label>
                        <input type="text" id="vehicleId" value={formData.vehicleId} onChange={e => setFormData(p => ({...p, vehicleId: e.target.value}))} className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-lg" required />
                        </div>
                        <div>
                        <label htmlFor="carrier" className="block text-sm font-medium text-gray-700">Carrier</label>
                        <input type="text" id="carrier" value={formData.carrier} onChange={e => setFormData(p => ({...p, carrier: e.target.value}))} className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-lg" required />
                        </div>
                        <div>
                        <label htmlFor="companyName" className="block text-sm font-medium text-gray-700">Company Name</label>
                        <input type="text" id="companyName" value={formData.companyName} onChange={e => setFormData(p => ({...p, companyName: e.target.value}))} className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-lg" required />
                        </div>
                    </div>
                    <div className="bg-indigo-50 border border-indigo-200 p-4 rounded-lg">
                        <h3 className="text-sm font-semibold text-indigo-800 mb-2">AI Analysis</h3>
                        <p className="text-sm text-indigo-700">
                            Confidence: <span className={`font-bold ${confidenceColor}`}>{(extractionResult.confidence * 100).toFixed(0)}%</span>
                        </p>
                        <p className="text-sm text-indigo-700 mt-1">
                            Notes: <span className="italic">{extractionResult.notes}</span>
                        </p>
                    </div>
                </div>
            </div>
          
            <div className="mt-8 flex justify-end space-x-4 flex-shrink-0">
                <button type="button" onClick={handleClose} className="bg-gray-200 text-gray-700 font-bold py-2 px-6 rounded-lg hover:bg-gray-300 transition-colors">Cancel</button>
                <button type="submit" className="bg-brand-accent text-white font-bold py-2 px-6 rounded-lg shadow-lg hover:bg-brand-accent/90 focus:outline-none transition-transform transform hover:scale-105">Confirm & Verify</button>
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

export default DocumentExtractionModal;