import React, { useState, useEffect, useRef } from 'react';
import { Document, DocumentType, DocumentStatus, Dock, Carrier, Vendor } from '../types.ts';
import { ICONS } from '../constants.tsx';

interface DocumentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (document: Omit<Document, 'id'> & { id?: string }) => void;
  document: Document | null;
  entities: {
      docks: Dock[],
      carriers: Carrier[],
      vendors: Vendor[],
  }
}

const DocumentModal: React.FC<DocumentModalProps> = ({ isOpen, onClose, onSave, document, entities }) => {
  const [formData, setFormData] = useState({
    name: '',
    file: null as File | null,
    type: DocumentType.BoL,
    linkedTo: '',
    notes: '',
  });

  const linkedEntityOptions = [
      ...entities.docks.map(d => ({ value: d.id!, label: `Dock: ${d.name}`})),
      ...entities.carriers.map(c => ({ value: c.id, label: `Carrier: ${c.name}`})),
      ...entities.vendors.map(v => ({ value: v.id, label: `Vendor: ${v.name}`})),
  ];

  useEffect(() => {
    if (document) {
      setFormData({
        name: document.name,
        file: null,
        type: document.type,
        linkedTo: document.linkedTo,
        notes: document.notes || '',
      });
    } else {
      setFormData({
        name: '',
        file: null,
        type: DocumentType.BoL,
        linkedTo: '',
        notes: '',
      });
    }
  }, [document, isOpen]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setFormData(prev => ({...prev, name: file.name, file: file}));
    }
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name) {
        alert('Please provide a document name or upload a file.');
        return;
    }
    
    const docData = {
        id: document?.id,
        documentId: document?.documentId || `DOC-${Math.floor(10000 + Math.random() * 90000)}`,
        vehicleId: 'TRK-001', // Placeholder
        name: formData.name,
        type: formData.type,
        linkedTo: formData.linkedTo,
        notes: formData.notes,
        uploadedBy: 'John Doe', // Placeholder for current user
        status: document?.status || DocumentStatus.Pending,
        uploadDate: document?.uploadDate || new Date().toISOString(),
        fileUrl: '#' // Mock URL
    };
    onSave(docData);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-start pt-20 z-50 transition-opacity" onClick={onClose}>
      <div className="bg-white rounded-lg shadow-xl p-8 w-full max-w-lg mx-4" onClick={e => e.stopPropagation()}>
        <form onSubmit={handleSubmit}>
          <h2 className="text-xl font-bold text-gray-800 mb-6">Add New Document</h2>
          
          <div className="space-y-5">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">Document Name</label>
              <input type="text" name="name" id="name" value={formData.name} onChange={handleChange} className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm text-sm" required />
            </div>
            <div>
                <label htmlFor="file-upload" className="block text-sm font-medium text-gray-700 mb-1">Document File</label>
                <div className="relative">
                    <input type="file" id="file-upload" className="sr-only" onChange={handleFileChange} />
                    <label htmlFor="file-upload" className="w-full text-sm text-gray-700 px-3 py-2 border border-gray-300 rounded-md shadow-sm cursor-pointer flex items-center justify-between">
                       <span>{formData.file ? formData.file.name : "Choose a file"}</span>
                       <span className="font-semibold text-gray-500">Browse</span>
                    </label>
                </div>
            </div>
            <div>
              <label htmlFor="type" className="block text-sm font-medium text-gray-700 mb-1">Document Type</label>
              <select name="type" id="type" value={formData.type} onChange={handleChange} className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm text-sm" required>
                 {Object.values(DocumentType).map(type => <option key={type} value={type}>{type}</option>)}
              </select>
            </div>
             <div>
              <label htmlFor="linkedTo" className="block text-sm font-medium text-gray-700 mb-1">Linked Entity</label>
              <select name="linkedTo" id="linkedTo" value={formData.linkedTo} onChange={handleChange} className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm text-sm" required>
                  <option value="" disabled>Select an entity</option>
                  {linkedEntityOptions.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
                  <option value="other">Other...</option>
              </select>
            </div>
            <div>
              <label htmlFor="notes" className="block text-sm font-medium text-gray-700 mb-1">Notes (optional)</label>
              <textarea name="notes" id="notes" value={formData.notes} onChange={handleChange} rows={3} className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm text-sm" placeholder="Optional"></textarea>
            </div>
          </div>
          
          <div className="mt-8 flex justify-end space-x-4">
            <button type="button" onClick={onClose} className="bg-transparent text-gray-700 font-semibold py-2 px-6 rounded-lg hover:bg-gray-100 transition-colors border border-gray-300">Cancel</button>
            <button type="submit" className="bg-blue-600 text-white font-bold py-2 px-6 rounded-lg shadow hover:bg-blue-700 focus:outline-none transition-colors">{document ? 'Save' : 'Add'}</button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default DocumentModal;