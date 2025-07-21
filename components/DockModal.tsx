import React, { useState, useEffect } from 'react';
import { Dock, DockStatus, DockType, Warehouse } from '../types.ts';
import { BuildingOfficeIcon, ClockIcon, XCircleIcon, TrashIcon, ChevronDownIcon, TruckIcon } from './icons/Icons.tsx';

// --- FORM HELPER COMPONENTS ---
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
            details summary::-webkit-details-marker { display:none; }
            details[open] .details-marker { transform: rotate(180deg); }
        `}</style>
    </details>
);

const FormField: React.FC<{ label: string; children: React.ReactNode; className?: string, isMandatory?: boolean }> = ({ label, children, className, isMandatory }) => (
    <div className={className}>
        <label className="text-sm font-medium text-gray-600 flex items-center">
            {label} {isMandatory && <span className="text-red-500 ml-1">*</span>}
        </label>
        <div className="relative mt-1">{children}</div>
    </div>
);


interface DockModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (dock: any) => void;
  onDelete?: (dockId: string) => void;
  dock: Dock | null;
  warehouses: Warehouse[];
  currentWarehouseId: string;
}

const DockModal: React.FC<DockModalProps> = ({ isOpen, onClose, onSave, onDelete, dock, warehouses, currentWarehouseId }) => {
    const isCreating = !dock;
    const [formData, setFormData] = useState<Partial<Dock>>({});
    const baseInputClasses = "relative w-full bg-gray-100 border-gray-200 border p-2 text-sm rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 text-gray-900 placeholder:text-gray-500";

    useEffect(() => {
        if (isOpen) {
            const initialData: Partial<Dock> = dock ? 
                { ...dock } : 
                {
                    name: '',
                    warehouseId: currentWarehouseId,
                    location: '',
                    dockType: DockType.Both,
                    status: DockStatus.Available,
                    operationalHours: { start: '08:00', end: '17:00' },
                    capacity: 1,
                    compatibleVehicleTypes: [],
                    dimensions: '',
                    safetyComplianceTags: [],
                };
            setFormData(initialData);
        }
    }, [isOpen, dock, currentWarehouseId]);

    const handleFormChange = (field: keyof Dock, value: any) => {
        setFormData(p => ({ ...p, [field]: value }));
    };

    const handleHoursChange = (part: 'start' | 'end', value: string) => {
        const newHours = { ...formData.operationalHours, [part]: value };
        handleFormChange('operationalHours', newHours);
    };

    const handleArrayStringChange = (field: 'compatibleVehicleTypes' | 'safetyComplianceTags', value: string) => {
        handleFormChange(field, value.split(',').map(s => s.trim()).filter(Boolean));
    };

    const handleSave = () => {
        if (!formData.name || !formData.warehouseId || !formData.dockType) {
            alert('Please fill all mandatory fields.');
            return;
        }
        onSave({ ...formData, id: dock?.id });
    };
    
    const handleDeleteClick = () => {
        if (dock && onDelete && window.confirm(`Are you sure you want to delete dock ${dock.name}?`)) {
            onDelete(dock.id!);
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
                           <h2 className="text-2xl font-bold text-gray-800">{isCreating ? 'Create Dock' : 'Edit Dock'}</h2>
                           <button onClick={onClose} className="p-1 rounded-full text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition-colors"><XCircleIcon className="w-6 h-6"/></button>
                        </div>
                         <p className="text-sm text-gray-500 mt-1">
                            { isCreating ? "Define a new dock for your warehouse." : `Editing ${formData.name || ''}` }
                         </p>
                    </div>

                    <div className="flex-grow p-5 space-y-4 overflow-y-auto bg-gray-50/50">
                        <FormSection title="Dock Identity" icon={<TruckIcon />} defaultOpen>
                            <FormField label="Dock ID / Name" isMandatory><input type="text" value={formData.name || ''} onChange={e => handleFormChange('name', e.target.value)} className={baseInputClasses} /></FormField>
                            <FormField label="Warehouse Location" isMandatory>
                                <select value={formData.warehouseId} onChange={e => handleFormChange('warehouseId', e.target.value)} className={baseInputClasses} disabled={!isCreating}>
                                    {warehouses.map(wh => <option key={wh.id} value={wh.id}>{wh.name}</option>)}
                                </select>
                            </FormField>
                            <FormField label="Dock Type" isMandatory>
                                <select value={formData.dockType} onChange={e => handleFormChange('dockType', e.target.value as DockType)} className={baseInputClasses}>
                                    {Object.values(DockType).map(type => <option key={type} value={type}>{type}</option>)}
                                </select>
                            </FormField>
                             <FormField label="Dock Status" isMandatory>
                                <select value={formData.status} onChange={e => handleFormChange('status', e.target.value as DockStatus)} className={baseInputClasses}>
                                    {Object.values(DockStatus).map(s => <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>)}
                                </select>
                            </FormField>
                        </FormSection>
                        
                        <FormSection title="Operational Details" icon={<ClockIcon />} defaultOpen>
                             <FormField label="Operational Hours" isMandatory className="md:col-span-2">
                                <div className="flex items-center gap-2">
                                    <input type="time" value={formData.operationalHours?.start || '00:00'} onChange={e => handleHoursChange('start', e.target.value)} className={baseInputClasses} />
                                    <span>to</span>
                                    <input type="time" value={formData.operationalHours?.end || '00:00'} onChange={e => handleHoursChange('end', e.target.value)} className={baseInputClasses} />
                                </div>
                            </FormField>
                            <FormField label="Capacity" isMandatory><input type="number" value={formData.capacity || 1} onChange={e => handleFormChange('capacity', parseInt(e.target.value) || 1)} min="1" className={baseInputClasses} /></FormField>
                            <FormField label="Dock Dimensions (Optional)"><input type="text" value={formData.dimensions || ''} onChange={e => handleFormChange('dimensions', e.target.value)} placeholder="e.g., 12x14x60" className={baseInputClasses} /></FormField>
                        </FormSection>

                        <FormSection title="Compatibility & Compliance" icon={<BuildingOfficeIcon />} defaultOpen>
                           <FormField label="Compatible Vehicle Types" isMandatory className="md:col-span-2">
                                <input type="text" value={formData.compatibleVehicleTypes?.join(', ') || ''} onChange={e => handleArrayStringChange('compatibleVehicleTypes', e.target.value)} placeholder="Trailer, Box Truck, Reefer" className={baseInputClasses} />
                           </FormField>
                           <FormField label="Safety/Compliance Tags" className="md:col-span-2">
                               <input type="text" value={formData.safetyComplianceTags?.join(', ') || ''} onChange={e => handleArrayStringChange('safetyComplianceTags', e.target.value)} placeholder="Cold Storage, Hazmat Ready" className={baseInputClasses} />
                           </FormField>
                        </FormSection>
                    </div>

                    <div className="flex-shrink-0 flex justify-between items-center p-4 border-t border-gray-200 bg-white">
                        <button onClick={handleDeleteClick} disabled={isCreating || !onDelete} className="font-semibold text-sm text-red-500 hover:text-red-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1">
                            <TrashIcon className="w-4 h-4" /> Delete
                        </button>
                        <div className="flex items-center gap-2">
                           <button onClick={onClose} className="px-4 py-2 rounded-lg text-sm font-semibold text-gray-700 bg-gray-100 hover:bg-gray-200 transition-colors">Cancel</button>
                           <button onClick={handleSave} className="px-5 py-2 rounded-lg text-sm font-semibold text-white bg-primary-600 hover:bg-primary-700 transition-colors">
                            {isCreating ? 'Create Dock' : 'Save Changes'}
                           </button>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
};

export default DockModal;
