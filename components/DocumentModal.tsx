import React, { useState, useEffect, useRef } from 'react';
import { Document, DocumentType, DocumentStatus, Dock, Customer } from '../types.ts';
import { DocumentsIcon, XCircleIcon } from './icons/Icons.tsx';

interface DocumentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (document: Omit<Document, 'id'> & { id?: string }) => void;
  document: Document | null;
  entities: {
      docks: Dock[],
      carriers: Customer[],
      vendors: Customer[],
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

  const baseInputClasses = "w-full px-3 py-2 border bg-gray-100 border-gray-300 rounded-md shadow-sm text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-primary-500 placeholder:text-gray-500";

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

  return (
    <>
      <div className={`fixed inset-0 bg-black/30 z-40 transition-opacity ${isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`} onClick={onClose} />
      <div className={`fixed top-0 right-0 h-full w-full max-w-xl bg-white shadow-xl z-50 transform transition-transform duration-300 ease-in-out ${isOpen ? 'translate-x-0' : 'translate-x-full'}`}>
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="p-5 border-b border-gray-200">
              <div className="flex justify-between items-center">
                 <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
                    <DocumentsIcon className="w-6 h-6" />
                    {document ? 'Edit Document' : 'Add New Document'}
                 </h2>
                 <button onClick={onClose} className="p-1 rounded-full text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition-colors">
                    <XCircleIcon className="w-6 h-6"/>
                 </button>
              </div>
               <p className="text-sm text-gray-500 mt-1">
                  { document ? `Editing ${document.name}` : "Upload a new document and link it to an entity." }
               </p>
          </div>

          {/* Form Body */}
          <form onSubmit={handleSubmit} className="flex-grow flex flex-col">
            <div className="flex-grow p-5 space-y-5 overflow-y-auto bg-gray-50/50">
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">Document Name</label>
                <input type="text" name="name" id="name" value={formData.name} onChange={handleChange} className={baseInputClasses} required />
              </div>
              <div>
                  <label htmlFor="file-upload" className="block text-sm font-medium text-gray-700 mb-1">Document File</label>
                  <div className="relative">
                      <input type="file" id="file-upload" className="sr-only" onChange={handleFileChange} />
                      <label htmlFor="file-upload" className={`${baseInputClasses} cursor-pointer flex items-center justify-between`}>
                         <span className="truncate">{formData.file ? formData.file.name : "Choose a file"}</span>
                         <span className="font-semibold text-gray-500 ml-2 flex-shrink-0">Browse</span>
                      </label>
                  </div>
              </div>
              <div>
                <label htmlFor="type" className="block text-sm font-medium text-gray-700 mb-1">Document Type</label>
                <select name="type" id="type" value={formData.type} onChange={handleChange} className={baseInputClasses} required>
                   {Object.values(DocumentType).map(type => <option key={type} value={type}>{type}</option>)}
                </select>
              </div>
               <div>
                <label htmlFor="linkedTo" className="block text-sm font-medium text-gray-700 mb-1">Linked Entity</label>
                <select name="linkedTo" id="linkedTo" value={formData.linkedTo} onChange={handleChange} className={baseInputClasses} required>
                    <option value="" disabled>Select an entity</option>
                    {linkedEntityOptions.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
                    <option value="other">Other...</option>
                </select>
              </div>
              <div>
                <label htmlFor="notes" className="block text-sm font-medium text-gray-700 mb-1">Notes (optional)</label>
                <textarea name="notes" id="notes" value={formData.notes} onChange={handleChange} rows={3} className={baseInputClasses} placeholder="Optional"></textarea>
              </div>
            </div>

            {/* Footer */}
            <div className="flex-shrink-0 flex justify-end items-center p-4 border-t border-gray-200 bg-white gap-2">
                <button type="button" onClick={onClose} className="px-4 py-2 rounded-lg text-sm font-semibold text-gray-700 bg-gray-100 hover:bg-gray-200 transition-colors">Cancel</button>
                <button type="submit" className="px-5 py-2 rounded-lg text-sm font-semibold text-white bg-primary-600 hover:bg-primary-700 transition-colors">
                  {document ? 'Save Changes' : 'Add Document'}
                </button>
            </div>
          </form>
        </div>
      </div>
    </>
  );
};

export default DocumentModal;