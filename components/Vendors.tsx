import React, { useState, useMemo } from 'react';
import { Vendor, Vehicle, VehicleStatus } from '../types.ts';
import { ICONS } from '../constants.tsx';
import VendorModal from './VendorModal.tsx';
import ConfirmationModal from './ConfirmationModal.tsx';

interface VendorsProps {
  vendors: Vendor[];
  vehicles: Vehicle[];
  onSave: (vendor: Omit<Vendor, 'id'> & { id?: string }) => void;
  onDelete: (vendorId: string) => void;
}

const Vendors: React.FC<VendorsProps> = ({ vendors, vehicles, onSave, onDelete }) => {
    const [searchQuery, setSearchQuery] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [vendorToEdit, setVendorToEdit] = useState<Vendor | null>(null);
    const [vendorToDelete, setVendorToDelete] = useState<Vendor | null>(null);


    const filteredVendors = useMemo(() => {
        if (!searchQuery) return vendors;
        const query = searchQuery.toLowerCase();
        return vendors.filter(v => 
            v.name.toLowerCase().includes(query) ||
            v.contactPerson.toLowerCase().includes(query) ||
            v.email.toLowerCase().includes(query) ||
            v.phone.includes(query)
        );
    }, [vendors, searchQuery]);

    const handleOpenModal = (vendor: Vendor | null = null) => {
        setVendorToEdit(vendor);
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setVendorToEdit(null);
        setIsModalOpen(false);
    };

    const handleConfirmDelete = () => {
        if(vendorToDelete) {
            onDelete(vendorToDelete.id);
            setVendorToDelete(null);
        }
    }

    return (
        <div className="p-8">
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h1 className="text-3xl font-bold text-gray-800">Vendor Management</h1>
                    <p className="text-gray-500">Manage suppliers and contact information</p>
                </div>
                <button onClick={() => handleOpenModal()} className="bg-brand-accent text-white font-bold py-2 px-4 rounded-lg shadow hover:bg-brand-accent/90 transition-transform transform hover:scale-105">
                    + New Vendor
                </button>
            </div>

            <div className="relative mb-6">
              <input
                type="text"
                placeholder="Search vendors by name, contact person, email, or phone..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border bg-white rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-accent"
              />
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <svg className="h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" />
                </svg>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-md overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full min-w-max text-sm text-left">
                        <thead className="text-xs text-gray-600 uppercase bg-gray-50 border-b">
                            <tr>
                                <th scope="col" className="px-6 py-3 font-semibold">Vendor</th>
                                <th scope="col" className="px-6 py-3 font-semibold">Contact Info</th>
                                <th scope="col" className="px-6 py-3 font-semibold">Address</th>
                                <th scope="col" className="px-6 py-3 font-semibold">Stats</th>
                                <th scope="col" className="px-6 py-3 font-semibold text-center">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredVendors.map(vendor => {
                                const activeTrucks = vehicles.filter(v => v.vendorId === vendor.id && (v.status === VehicleStatus.Entered || v.status === VehicleStatus.Yard)).length;

                                return (
                                <tr key={vendor.id} className="bg-white border-b hover:bg-gray-50 transition-colors">
                                    <td className="px-6 py-4">
                                        <div className="font-semibold text-gray-800">{vendor.name}</div>
                                        <div className="text-xs text-gray-500 italic mt-1">"{vendor.notes}"</div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="font-medium text-gray-700">{vendor.contactPerson}</div>
                                        <a href={`mailto:${vendor.email}`} className="text-xs text-brand-accent hover:underline transition-colors">{vendor.email}</a>
                                        <div className="text-xs text-gray-500">{vendor.phone}</div>
                                    </td>
                                    <td className="px-6 py-4 text-gray-600">{vendor.address}</td>
                                    <td className="px-6 py-4">
                                        <div className="flex flex-col space-y-1">
                                            <div><span className="font-semibold">{vendor.totalAppointments || 0}</span> Total Appts</div>
                                            <div><span className="font-semibold">{vendor.lastAppointmentDate || 'N/A'}</span> Last Appt</div>
                                            <div><span className="font-semibold">{activeTrucks}</span> Active Trucks</div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-center">
                                        <div className="flex items-center justify-center space-x-4">
                                            <button onClick={() => handleOpenModal(vendor)} className="text-gray-400 hover:text-brand-accent transition-colors" title="Edit">
                                                {ICONS.edit}
                                            </button>
                                            <button onClick={() => setVendorToDelete(vendor)} className="text-gray-400 hover:text-status-red transition-colors" title="Delete">
                                                {ICONS.delete}
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
                {vendors.length > 0 && filteredVendors.length === 0 && (
                    <div className="text-center py-10">
                        <h3 className="text-xl font-semibold text-gray-700">No Vendors Found</h3>
                        <p className="text-gray-500 mt-2">Your search for "{searchQuery}" did not match any vendors.</p>
                    </div>
                )}
                 {vendors.length === 0 && (
                    <div className="text-center py-10">
                        <h3 className="text-xl font-semibold text-gray-700">No Vendors</h3>
                        <p className="text-gray-500 mt-2">There are no vendors to display.</p>
                    </div>
                 )}
            </div>
            <VendorModal
                isOpen={isModalOpen}
                onClose={handleCloseModal}
                onSave={onSave}
                vendor={vendorToEdit}
            />
            <ConfirmationModal
                isOpen={!!vendorToDelete}
                onClose={() => setVendorToDelete(null)}
                onConfirm={handleConfirmDelete}
                title="Delete Vendor"
                message={`Are you sure you want to permanently delete ${vendorToDelete?.name}? This action cannot be undone.`}
            />
        </div>
    );
};

export default Vendors;