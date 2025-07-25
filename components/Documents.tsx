import React, { useState, useMemo } from 'react';
import { Document, DocumentType, DocumentStatus, Vehicle, Dock, Customer } from '../types.ts';
import { ICONS } from '../constants.tsx';
import DocumentModal from './DocumentModal.tsx';
import ConfirmationModal from './ConfirmationModal.tsx';
import { SearchIcon } from './icons/Icons.tsx';

interface DocumentsProps {
  documents: Document[];
  vehicles: Vehicle[];
  docks: Dock[];
  carriers: Customer[];
  vendors: Customer[];
  onSave: (document: Omit<Document, 'id'> & { id?: string }) => void;
  onDelete: (documentId: string) => void;
}

const StatusBadge: React.FC<{ status: DocumentStatus }> = ({ status }) => {
  const styles = {
    [DocumentStatus.Verified]: 'bg-green-100 text-green-700',
    [DocumentStatus.Pending]: 'bg-gray-200 text-gray-700',
  };
  return (
    <span className={`px-3 py-1 text-xs font-semibold rounded-md ${styles[status]}`}>{status}</span>
  );
};

const Documents: React.FC<DocumentsProps> = ({ documents, vehicles, docks, carriers, vendors, onSave, onDelete }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState<DocumentType | 'all'>('all');
  const [filterStatus, setFilterStatus] = useState<DocumentStatus | 'all'>('all');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [docToEdit, setDocToEdit] = useState<Document | null>(null);
  const [docToDelete, setDocToDelete] = useState<Document | null>(null);

  const filteredDocuments = useMemo(() => {
    return documents
      .filter(doc => filterType === 'all' || doc.type === filterType)
      .filter(doc => filterStatus === 'all' || doc.status === filterStatus)
      .filter(doc => {
        const query = searchQuery.toLowerCase();
        return doc.name.toLowerCase().includes(query) || 
               doc.documentId.toLowerCase().includes(query) ||
               doc.linkedTo.toLowerCase().includes(query) ||
               doc.uploadedBy.toLowerCase().includes(query);
      })
      .sort((a, b) => new Date(b.uploadDate).getTime() - new Date(a.uploadDate).getTime());
  }, [documents, filterType, filterStatus, searchQuery]);

  const handleOpenModal = (doc: Document | null = null) => {
    setDocToEdit(doc);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setDocToEdit(null);
    setIsModalOpen(false);
  };
  
  const handleSaveDocument = (docData: Omit<Document, 'id'> & { id?: string }) => {
    onSave(docData);
    handleCloseModal();
  }

  const handleConfirmDelete = () => {
    if (docToDelete) {
      onDelete(docToDelete.id);
      setDocToDelete(null);
    }
  };
  
  const baseSelectClasses = "bg-white border border-gray-300 rounded-md px-4 py-2 text-sm text-gray-600 focus:outline-none focus:ring-2 focus:ring-primary-500 transition-colors";

  return (
    <div className="p-6 bg-gray-50 h-full">
        <div className="bg-white p-6 rounded-lg shadow-sm ">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold text-gray-800">Documents</h1>
                <button 
                    onClick={() => handleOpenModal()} 
                    className="bg-primary-600 text-white font-bold py-2 px-4 rounded-lg shadow hover:bg-primary-700 transition-colors"
                >
                    Add New Document
                </button>
            </div>

            <div className="flex items-center space-x-4 mb-4">
                <div className="relative">
                    <input
                      type="text"
                      placeholder="Search..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-56 pl-10 pr-4 py-2 border bg-white rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 text-sm"
                    />
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <SearchIcon className="h-5 w-5 text-gray-400" />
                    </div>
                </div>
                <select value={filterType} onChange={e => setFilterType(e.target.value as any)} className={baseSelectClasses}>
                    <option value="all">All Types</option>
                    {Object.values(DocumentType).map(type => (
                       <option key={type} value={type}>{type}</option>
                    ))}
                </select>
                <select value={filterStatus} onChange={e => setFilterStatus(e.target.value as any)} className={baseSelectClasses}>
                    <option value="all">All Status</option>
                    {Object.values(DocumentStatus).map(status => (
                        <option key={status} value={status}>{status}</option>
                    ))}
                </select>
            </div>
          
            <div className="overflow-x-auto">
              <table className="w-full min-w-max text-sm text-left">
                <thead className="text-xs text-gray-500 uppercase border-b border-gray-200">
                  <tr>
                    <th scope="col" className="px-4 py-3 font-medium">Document ID</th>
                    <th scope="col" className="px-4 py-3 font-medium">Document Name</th>
                    <th scope="col" className="px-4 py-3 font-medium">Linked To</th>
                    <th scope="col" className="px-4 py-3 font-medium">Document Type</th>
                    <th scope="col" className="px-4 py-3 font-medium">Uploaded By</th>
                    <th scope="col" className="px-4 py-3 font-medium">Status</th>
                    <th scope="col" className="px-4 py-3 font-medium text-center"></th>
                  </tr>
                </thead>
                <tbody className="text-gray-700">
                  {filteredDocuments.map(doc => (
                    <tr key={doc.id} className="border-b border-gray-200 hover:bg-gray-50 transition-colors">
                      <td className="px-4 py-3 font-semibold">{doc.documentId}</td>
                      <td className="px-4 py-3">{doc.name}</td>
                      <td className="px-4 py-3">{doc.linkedTo}</td>
                      <td className="px-4 py-3">{doc.type}</td>
                      <td className="px-4 py-3">{doc.uploadedBy}</td>
                      <td className="px-4 py-3"><StatusBadge status={doc.status} /></td>
                      <td className="px-4 py-3">
                        <div className="flex items-center justify-center space-x-2">
                           <a href={doc.fileUrl} target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-blue-600 transition-colors p-1" title="Download">{ICONS.download}</a>
                           <button onClick={() => setDocToDelete(doc)} className="text-gray-400 hover:text-red-600 transition-colors p-1" title="Delete">{ICONS.delete}</button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {documents.length > 0 && filteredDocuments.length === 0 && (
              <div className="text-center py-10">
                <h3 className="text-lg font-semibold text-gray-700">No Documents Found</h3>
                <p className="text-gray-500 mt-2">Your search and filter criteria did not match any documents.</p>
              </div>
            )}
            {documents.length === 0 && (
              <div className="text-center py-10">
                <h3 className="text-lg font-semibold text-gray-700">No Documents Yet</h3>
                <p className="text-gray-500 mt-2">Upload your first document to get started.</p>
              </div>
            )}
        </div>

      <DocumentModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        onSave={handleSaveDocument}
        document={docToEdit}
        entities={{docks, carriers, vendors}}
      />
      <ConfirmationModal
        isOpen={!!docToDelete}
        onClose={() => setDocToDelete(null)}
        onConfirm={handleConfirmDelete}
        title="Delete Document"
        message={`Are you sure you want to permanently delete the document ${docToDelete?.name}? This action cannot be undone.`}
      />
    </div>
  );
};

export default Documents;