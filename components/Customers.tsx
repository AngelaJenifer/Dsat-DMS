import React, { useState, useMemo } from 'react';
import { Customer, CustomerType } from '../types.ts';
import { ICONS } from '../constants.tsx';
import ConfirmationModal from './ConfirmationModal.tsx';
import { SearchIcon, ChevronUpDownIcon } from './icons/Icons.tsx';

interface CustomersProps {
  customers: Customer[];
  onDelete: (customerId: string) => void;
  onOpenPanel: (customer?: Customer | null) => void;
}

const Customers: React.FC<CustomersProps> = ({ customers, onDelete, onOpenPanel }) => {
    const [searchQuery, setSearchQuery] = useState('');
    const [typeFilter, setTypeFilter] = useState<'all' | CustomerType>('all');
    const [customerToDelete, setCustomerToDelete] = useState<Customer | null>(null);

    const filteredCustomers = useMemo(() => {
        const sortedCustomers = [...customers].sort((a, b) => a.name.localeCompare(b.name));
        
        return sortedCustomers.filter(customer => {
            const typeMatch = typeFilter === 'all' || customer.customerType === typeFilter;

            const query = searchQuery.toLowerCase();
            const searchMatch = !searchQuery || (
                customer.name.toLowerCase().includes(query) ||
                customer.contactPerson.toLowerCase().includes(query) ||
                customer.email.toLowerCase().includes(query) ||
                customer.phone.includes(query) ||
                customer.customerType.toLowerCase().includes(query)
            );

            return typeMatch && searchMatch;
        });
    }, [customers, searchQuery, typeFilter]);

    const handleConfirmDelete = () => {
        if(customerToDelete) {
            onDelete(customerToDelete.id);
            setCustomerToDelete(null);
        }
    }
    
    const CustomerTypeBadge: React.FC<{ type: CustomerType }> = ({ type }) => {
        const isCarrier = type === CustomerType.Carrier;
        const styles = isCarrier
            ? 'bg-blue-100 text-blue-800'
            : 'bg-purple-100 text-purple-800';
        return (
            <span className={`px-2 py-1 text-xs font-semibold rounded-full ${styles}`}>
                {type}
            </span>
        );
    };

    return (
        <div className="p-8 space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold text-gray-800">Customers</h1>
                    <p className="text-gray-500">Manage carriers and vendors</p>
                </div>
                <button onClick={() => onOpenPanel()} className="bg-primary-600 text-white font-bold py-2 px-4 rounded-lg shadow hover:bg-primary-700 transition-transform transform hover:scale-105">
                    + Add Customer
                </button>
            </div>

            <div className="flex items-center gap-4">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search all customers..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-96 pl-10 pr-4 py-3 border bg-white rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-accent text-gray-900"
                />
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <SearchIcon className="h-5 w-5 text-gray-400" />
                </div>
              </div>
              <div className="relative">
                    <select
                        value={typeFilter}
                        onChange={e => setTypeFilter(e.target.value as any)}
                        className="appearance-none w-full md:w-48 bg-white border border-gray-300 rounded-lg pl-4 pr-10 py-3 text-gray-800 font-semibold focus:outline-none focus:ring-2 focus:ring-brand-accent"
                        aria-label="Filter by Customer Type"
                    >
                        <option value="all">All Types</option>
                        <option value={CustomerType.Carrier}>Carrier</option>
                        <option value={CustomerType.Vendor}>Vendor</option>
                    </select>
                    <div className="absolute inset-y-0 right-0 flex items-center px-2 pointer-events-none">
                        <ChevronUpDownIcon className="w-5 h-5 text-gray-400" />
                    </div>
                </div>
            </div>
            
            <div className="bg-white rounded-xl shadow-md overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full min-w-max text-sm text-left">
                        <thead className="text-xs text-gray-600 uppercase bg-gray-50 border-b">
                            <tr>
                                <th scope="col" className="px-6 py-3 font-semibold">Name</th>
                                <th scope="col" className="px-6 py-3 font-semibold">Customer Type</th>
                                <th scope="col" className="px-6 py-3 font-semibold">Contact Info</th>
                                <th scope="col" className="px-6 py-3 font-semibold">Address</th>
                                <th scope="col" className="px-6 py-3 font-semibold text-center">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredCustomers.map(customer => (
                                <tr key={customer.id} className="bg-white border-b hover:bg-gray-50 transition-colors">
                                    <td className="px-6 py-4">
                                        <div className="font-semibold text-gray-800">{customer.name}</div>
                                        <div className="text-xs text-gray-500 italic mt-1 max-w-xs truncate" title={customer.notes}>"{customer.notes}"</div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <CustomerTypeBadge type={customer.customerType} />
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="font-medium text-gray-700">{customer.contactPerson}</div>
                                        <a href={`mailto:${customer.email}`} className="text-xs text-brand-accent hover:underline transition-colors">{customer.email}</a>
                                        <div className="text-xs text-gray-500">{customer.phone}</div>
                                    </td>
                                    <td className="px-6 py-4 text-gray-600">{customer.address}</td>
                                    <td className="px-6 py-4 text-center">
                                        <div className="flex items-center justify-center space-x-4">
                                            <button onClick={() => onOpenPanel(customer)} className="text-gray-400 hover:text-brand-accent transition-colors" title="Edit">
                                                {ICONS.edit}
                                            </button>
                                            <button onClick={() => setCustomerToDelete(customer)} className="text-gray-400 hover:text-status-red transition-colors" title="Delete">
                                                {ICONS.delete}
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                            {filteredCustomers.length === 0 && (
                                <tr>
                                    <td colSpan={5} className="text-center py-10 text-gray-500">
                                        {customers.length > 0 ? 'No customers match your search.' : 'No customers found.'}
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            <ConfirmationModal
                isOpen={!!customerToDelete}
                onClose={() => setCustomerToDelete(null)}
                onConfirm={handleConfirmDelete}
                title={`Delete ${customerToDelete?.customerType}`}
                message={`Are you sure you want to permanently delete ${customerToDelete?.name}? This action cannot be undone.`}
            />
        </div>
    );
};

export default Customers;