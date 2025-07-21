import React, { useState, useEffect } from 'react';
import { Warehouse, WarehouseType } from '../types.ts';
import { BuildingOfficeIcon, ClockIcon, XCircleIcon, TrashIcon, ChevronDownIcon, UserIcon } from './icons/Icons.tsx';

const FormSection: React.FC<{ title: string; children: React.ReactNode; icon: React.ReactNode; defaultOpen?: boolean }> = ({ title, children, icon, defaultOpen }) => (
    <details className="border border-gray-200 rounded-lg bg-white" open={defaultOpen}>
        <summary className="font-semibold text-md text-gray-700 bg-gray-50 p-4 cursor-pointer list-none flex justify-between items-center hover:bg-gray-100 transition-colors rounded-t-lg">
            <div className="flex items-center gap-3">
                <span className="w-5 h-5 text-gray-500">{icon}</span>
                {title}
            </div>
            <ChevronDownIcon className="w-5 h-5 transition-transform details-marker" />
        </summary>
        <div className="p-4 grid grid-cols-1 md:grid-cols-2 gap-x-4 gap-y-5">
            {children}
        </div>
        <style>{`
            details summary::-webkit-details-marker {
                display:none;
            }
            details[open] .details-marker {
                transform: rotate(180deg);
            }
        `}</style>
    </details>
);

const FormField: React.FC<{ label: string; children: React.ReactNode; className?: string; isMandatory?: boolean }> = ({ label, children, className, isMandatory }) => (
    <div className={className}>
        <label className="text-sm font-medium text-gray-600 flex items-center">
            {label} {isMandatory && <span className="text-red-500 ml-1">*</span>}
        </label>
        <div className="relative mt-1">{children}</div>
    </div>
);

interface WarehousePanelProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (warehouse: Omit<Warehouse, 'id'> & { id?: string }) => void;
  onDelete: (warehouseId: string) => void;
  warehouse: Warehouse | null;
}

const WarehousePanel: React.FC<WarehousePanelProps> = ({ isOpen, onClose, onSave, onDelete, warehouse }) => {
    const isCreating = !warehouse;
    const [formData, setFormData] = useState<Partial<Warehouse>>({});
    const baseInputClasses = "relative w-full bg-gray-100 border-gray-200 border p-2 text-sm rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 text-gray-900 placeholder:text-gray-500";

    useEffect(() => {
        if (isOpen) {
            const initialData: Partial<Warehouse> = warehouse ? 
                { ...warehouse } : 
                {
                    name: '',
                    address: '',
                    type: WarehouseType.Fulfillment,
                    operatingHours: { start: '08:00', end: '17:00' },
                    timezone: '',
                    contactPerson: '',
                    contactInfo: '',
                    dockCount: 10,
                    isEnabled: true,
                    zones: '',
                    maxVehicleCapacity: 0,
                };
            setFormData(initialData);
        }
    }, [isOpen, warehouse]);

    const handleFormChange = (field: keyof Warehouse, value: any) => {
        setFormData(p => ({ ...p, [field]: value }));
    };

    const handleHoursChange = (part: 'start' | 'end', value: string) => {
        const newHours = { ...formData.operatingHours, [part]: value };
        handleFormChange('operatingHours', newHours);
    };

    const handleSave = () => {
        // Simple validation
        if (!formData.name || !formData.address || !formData.contactPerson || !formData.contactInfo || !formData.timezone) {
            alert('Please fill all mandatory fields.');
            return;
        }
        onSave(formData as Omit<Warehouse, 'id'> & { id?: string });
        onClose();
    };
    
    const handleDeleteClick = () => {
        if (warehouse && window.confirm(`Are you sure you want to delete warehouse ${warehouse.name}? This action cannot be undone.`)) {
            onDelete(warehouse.id);
            onClose();
        }
    };

    return (
        <>
            <div className={`fixed inset-0 bg-black/30 z-40 transition-opacity ${isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`} onClick={onClose} />
            <div className={`fixed top-0 right-0 h-full w-full max-w-2xl bg-white shadow-xl z-50 transform transition-transform duration-300 ease-in-out ${isOpen ? 'translate-x-0' : 'translate-x-full'}`}>
                <div className="flex flex-col h-full">
                    <div className="p-5 border-b border-gray-200">
                        <div className="flex justify-between items-center">
                           <h2 className="text-2xl font-bold text-gray-800">{isCreating ? 'Create Warehouse' : 'Edit Warehouse'}</h2>
                           <button onClick={onClose} className="p-1 rounded-full text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition-colors"><XCircleIcon className="w-6 h-6"/></button>
                        </div>
                         <p className="text-sm text-gray-500 mt-1">
                            { isCreating ? "Define a new operational warehouse." : `Editing ${formData.name || ''}` }
                         </p>
                    </div>

                    <div className="flex-grow p-5 space-y-4 overflow-y-auto bg-gray-50/50">
                         <FormSection title="Basic Information" icon={<BuildingOfficeIcon />} defaultOpen>
                            <FormField label="Warehouse ID / Name" isMandatory className="md:col-span-2"><input type="text" value={formData.name || ''} onChange={e => handleFormChange('name', e.target.value)} className={baseInputClasses} /></FormField>
                            <FormField label="Location / Address" isMandatory className="md:col-span-2"><textarea value={formData.address || ''} onChange={e => handleFormChange('address', e.target.value)} rows={3} className={baseInputClasses} /></FormField>
                            <FormField label="Warehouse Type" isMandatory>
                                <select value={formData.type} onChange={e => handleFormChange('type', e.target.value as WarehouseType)} className={baseInputClasses}>
                                    {Object.values(WarehouseType).map(type => <option key={type} value={type}>{type}</option>)}
                                </select>
                            </FormField>
                             <FormField label="Enabled for Operations" isMandatory>
                                <div className="p-2 h-9 flex items-center">
                                    <input type="checkbox" checked={formData.isEnabled || false} onChange={e => handleFormChange('isEnabled', e.target.checked)} className="h-5 w-5 rounded border-gray-300 text-primary-600 focus:ring-primary-500" />
                                </div>
                            </FormField>
                        </FormSection>

                        <FormSection title="Operational Details" icon={<ClockIcon />} defaultOpen>
                            <FormField label="Operating Hours" isMandatory className="md:col-span-2">
                                <div className="flex items-center gap-2">
                                    <input type="time" value={formData.operatingHours?.start || '00:00'} onChange={e => handleHoursChange('start', e.target.value)} className={baseInputClasses} />
                                    <span>to</span>
                                    <input type="time" value={formData.operatingHours?.end || '00:00'} onChange={e => handleHoursChange('end', e.target.value)} className={baseInputClasses} />
                                </div>
                            </FormField>
                            <FormField label="Timezone" isMandatory>
                                <input list="timezones" value={formData.timezone || ''} onChange={e => handleFormChange('timezone', e.target.value)} className={baseInputClasses} />
                                <datalist id="timezones">
                                    <option value="America/New_York (EST)" />
                                    <option value="America/Chicago (CST)" />
                                    <option value="America/Denver (MST)" />
                                    <option value="America/Los_Angeles (PST)" />
                                    <option value="Europe/London (GMT)" />
                                </datalist>
                            </FormField>
                            {isCreating && (
                                <FormField label="Initial Dock Count" isMandatory>
                                    <input type="number" value={formData.dockCount || 0} onChange={e => handleFormChange('dockCount', parseInt(e.target.value) || 0)} min="0" className={baseInputClasses} />
                                </FormField>
                            )}
                             <FormField label="Max Vehicle Capacity" className={isCreating ? "" : "md:col-span-2"}>
                                <input type="number" value={formData.maxVehicleCapacity || 0} onChange={e => handleFormChange('maxVehicleCapacity', parseInt(e.target.value) || 0)} min="0" className={baseInputClasses} />
                            </FormField>
                            <FormField label="Warehouse Zones" className="md:col-span-2">
                                <textarea value={formData.zones || ''} onChange={e => handleFormChange('zones', e.target.value)} placeholder="e.g. Aisles, Cold Zones, etc." rows={3} className={baseInputClasses} />
                            </FormField>
                        </FormSection>
                        
                        <FormSection title="Contact Information" icon={<UserIcon className="w-5 h-5" />}>
                            <FormField label="Contact Person" isMandatory><input type="text" value={formData.contactPerson || ''} onChange={e => handleFormChange('contactPerson', e.target.value)} className={baseInputClasses} /></FormField>
                            <FormField label="Contact Number / Email" isMandatory><input type="text" value={formData.contactInfo || ''} onChange={e => handleFormChange('contactInfo', e.target.value)} className={baseInputClasses} /></FormField>
                        </FormSection>

                    </div>

                    <div className="flex-shrink-0 flex justify-between items-center p-4 border-t border-gray-200 bg-white">
                        <button onClick={handleDeleteClick} disabled={isCreating} className="font-semibold text-sm text-red-500 hover:text-red-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1">
                            <TrashIcon className="w-4 h-4" /> Delete
                        </button>
                        <div className="flex items-center gap-2">
                           <button onClick={onClose} className="px-4 py-2 rounded-lg text-sm font-semibold text-gray-700 bg-gray-100 hover:bg-gray-200 transition-colors">Cancel</button>
                           <button onClick={handleSave} className="px-5 py-2 rounded-lg text-sm font-semibold text-white bg-primary-600 hover:bg-primary-700 transition-colors">
                            {isCreating ? 'Create Warehouse' : 'Save Changes'}
                           </button>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
};

export default WarehousePanel;