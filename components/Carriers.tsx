import React, { useState, useMemo } from 'react';
import { Customer, Vehicle, VehicleStatus } from '../types.ts';
import { ICONS } from '../constants.tsx';
import CarrierModal from './CarrierModal.tsx';
import ConfirmationModal from './ConfirmationModal.tsx';
import { ChevronDownIcon } from './icons/Icons.tsx';

interface CarriersProps {
  carriers: Customer[];
  vehicles: Vehicle[];
  onSave: (carrier: Omit<Customer, 'id'> & { id?: string }) => void;
  onDelete: (carrierId: string) => void;
}

const Carriers: React.FC<CarriersProps> = ({ carriers, vehicles, onSave, onDelete }) => {
    const [searchQuery, setSearchQuery] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [carrierToEdit, setCarrierToEdit] = useState<Customer | null>(null);
    const [carrierToDelete, setCarrierToDelete] = useState<Customer | null>(null);
    const [expandedCarrierId, setExpandedCarrierId] = useState<string | null>(null);

    const filteredCarriers = useMemo(() => {
        if (!searchQuery) return carriers;
        const query = searchQuery.toLowerCase();
        return carriers.filter(c => 
            c.name.toLowerCase().includes(query) ||
            c.contactPerson.toLowerCase().includes(query) ||
            c.email.toLowerCase().includes(query) ||
            c.phone.includes(query)
        );
    }, [carriers, searchQuery]);

    const handleOpenModal = (carrier: Customer | null = null) => {
        setCarrierToEdit(carrier);
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setCarrierToEdit(null);
        setIsModalOpen(false);
    };

    const handleConfirmDelete = () => {
        if(carrierToDelete) {
            onDelete(carrierToDelete.id);
            setCarrierToDelete(null);
        }
    }

    const toggleExpand = (carrierId: string) => {
        setExpandedCarrierId(prevId => (prevId === carrierId ? null : carrierId));
    };

    return (
        <div className="p-8">
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h1 className="text-3xl font-bold text-gray-800">Carrier Management</h1>
                    <p className="text-gray-500">Manage trucking companies and contact information</p>
                </div>
                <button onClick={() => handleOpenModal()} className="bg-brand-accent text-white font-bold py-2 px-4 rounded-lg shadow hover:bg-brand-accent/90 transition-transform transform hover:scale-105">
                    + New Carrier
                </button>
            </div>

            <div className="relative mb-6">
              <input
                type="text"
                placeholder="Search carriers by name, contact person, email, or phone..."
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
                                <th scope="col" className="px-6 py-3 font-semibold">Carrier</th>
                                <th scope="col" className="px-6 py-3 font-semibold">Contact Info</th>
                                <th scope="col" className="px-6 py-3 font-semibold">Address</th>
                                <th scope="col" className="px-6 py-3 font-semibold">Stats</th>
                                <th scope="col" className="px-6 py-3 font-semibold text-center">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredCarriers.map(carrier => {
                                const isExpanded = expandedCarrierId === carrier.id;
                                const activeTrucks = vehicles.filter(v => v.carrier === carrier.name && (v.status === VehicleStatus.Entered || v.status === VehicleStatus.Yard));

                                return (
                                <React.Fragment key={carrier.id}>
                                    <tr className="bg-white border-b hover:bg-gray-50 transition-colors">
                                        <td className="px-6 py-4">
                                            <div className="font-semibold text-gray-800">{carrier.name}</div>
                                            <div className="text-xs text-gray-500 italic mt-1">"{carrier.notes}"</div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="font-medium text-gray-700">{carrier.contactPerson}</div>
                                            <a href={`mailto:${carrier.email}`} className="text-xs text-brand-accent hover:underline transition-colors">{carrier.email}</a>
                                            <div className="text-xs text-gray-500">{carrier.phone}</div>
                                        </td>
                                        <td className="px-6 py-4 text-gray-600">{carrier.address}</td>
                                        <td className="px-6 py-4">
                                            <div className="flex flex-col space-y-1">
                                                <div><span className="font-semibold">{carrier.totalAppointments || 0}</span> Total Appts</div>
                                                <div><span className="font-semibold">{carrier.lastAppointmentDate || 'N/A'}</span> Last Appt</div>
                                                <button 
                                                    onClick={() => toggleExpand(carrier.id)} 
                                                    className="flex items-center gap-1 bg-blue-100 text-blue-800 text-xs font-semibold px-2 py-0.5 rounded-full self-start mt-1 hover:bg-blue-200 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors disabled:cursor-not-allowed disabled:opacity-50"
                                                    disabled={activeTrucks.length === 0}
                                                    title={isExpanded ? "Hide details" : "Show active truck details"}
                                                >
                                                    <span>{activeTrucks.length} active trucks</span>
                                                    <ChevronDownIcon className={`w-3 h-3 transition-transform ${isExpanded ? 'rotate-180' : ''}`} />
                                                </button>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-center">
                                            <div className="flex items-center justify-center space-x-4">
                                                <button onClick={() => handleOpenModal(carrier)} className="text-gray-400 hover:text-brand-accent transition-colors" title="Edit">
                                                    {ICONS.edit}
                                                </button>
                                                <button onClick={() => setCarrierToDelete(carrier)} className="text-gray-400 hover:text-status-red transition-colors" title="Delete">
                                                    {ICONS.delete}
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                    {isExpanded && (
                                        <tr className="bg-gray-50/50">
                                            <td colSpan={5} className="p-4 border-b">
                                                <div className="bg-white p-4 rounded-lg border border-blue-200 shadow-sm">
                                                    <h4 className="font-bold text-gray-700 mb-3">Active Truck Details for {carrier.name}</h4>
                                                    {activeTrucks.length > 0 ? (
                                                        <ul className="space-y-2">
                                                            {activeTrucks.map(truck => (
                                                                <li key={truck.id} className="grid grid-cols-1 md:grid-cols-4 gap-4 text-sm p-3 rounded-md bg-gray-50 border border-gray-200 items-center">
                                                                    <div className="truncate"><strong className="text-gray-500 font-medium">Vehicle ID:</strong> <span className="font-semibold text-gray-800">{truck.id}</span></div>
                                                                    <div className="truncate"><strong className="text-gray-500 font-medium">Driver:</strong> <span className="font-semibold text-gray-800">{truck.driverName}</span></div>
                                                                    <div><strong className="text-gray-500 font-medium">Status:</strong> <span className="font-semibold text-gray-800">{truck.status === VehicleStatus.Entered ? `At Dock ${truck.assignedDockId}` : 'In Yard'}</span></div>
                                                                    <div className="truncate"><strong className="text-gray-500 font-medium">Appointment:</strong> <span className="font-semibold text-gray-800">{truck.appointmentTime}</span></div>
                                                                </li>
                                                            ))}
                                                        </ul>
                                                    ) : (
                                                        <p className="text-gray-500 text-center py-2">No active trucks to display for this carrier.</p>
                                                    )}
                                                </div>
                                            </td>
                                        </tr>
                                    )}
                                </React.Fragment>
                                )
                            })}
                        </tbody>
                    </table>
                </div>
                 {carriers.length > 0 && filteredCarriers.length === 0 && (
                    <div className="text-center py-10">
                        <h3 className="text-xl font-semibold text-gray-700">No Carriers Found</h3>
                        <p className="text-gray-500 mt-2">Your search for "{searchQuery}" did not match any carriers.</p>
                    </div>
                )}
                 {carriers.length === 0 && (
                    <div className="text-center py-10">
                        <h3 className="text-xl font-semibold text-gray-700">No Carriers</h3>
                        <p className="text-gray-500 mt-2">There are no carriers to display.</p>
                    </div>
                 )}
            </div>
            <CarrierModal
                isOpen={isModalOpen}
                onClose={handleCloseModal}
                onSave={onSave}
                carrier={carrierToEdit}
            />
            <ConfirmationModal
                isOpen={!!carrierToDelete}
                onClose={() => setCarrierToDelete(null)}
                onConfirm={handleConfirmDelete}
                title="Delete Carrier"
                message={`Are you sure you want to permanently delete ${carrierToDelete?.name}? This action cannot be undone.`}
            />
        </div>
    );
};

export default Carriers;