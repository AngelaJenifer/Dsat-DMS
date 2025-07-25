import React, { useState, useMemo, useRef, useEffect } from 'react';
import { BuildingOfficeIcon, ClockIcon, TrashIcon, ChevronDownIcon, PencilIcon, PlusIcon, XCircleIcon, WrenchScrewdriverIcon, AppointmentsIcon } from './icons/Icons.tsx';
import { Warehouse, Dock, TimeSlotsData } from '../types.ts';
import TimeSlotsConfig from './TimeSlotsConfig.tsx';
import ConfirmationModal from './ConfirmationModal.tsx';


interface ConfigWarehouse extends Warehouse {
    docks: Dock[];
}

interface ConfigurationsProps {
    warehouses: Warehouse[];
    docks: Dock[];
    onSaveWarehouse: (warehouse: Omit<Warehouse, 'id'> & { id?: string }) => void;
    onSaveDock: (dockData: Dock) => void;
    onDeleteWarehouse: (warehouseId: string) => void;
    onDeleteDock: (dockId: string) => void;
    onOpenWarehousePanel: (warehouse: Warehouse | null) => void;
    onOpenDockPanel: (dock: Dock | null, warehouseId?: string) => void;
    timeSlots: TimeSlotsData;
    onSaveTimeSlots: (slots: TimeSlotsData) => void;
}

interface MaintenanceRecord {
    id: string;
    dockName: string;
    warehouseName: string;
    type: string;
    start: string;
    end: string;
    status: string;
    technician?: string;
    notes?: string;
    isNew?: boolean;
    warehouseId: string;
    dockId: string;
}

const initialMaintenanceRecords: MaintenanceRecord[] = [
    { id: 'maint-1', warehouseId: 'W01', dockId: 'D04', dockName: 'Bay A - D04', warehouseName: 'Metro Logistics Center', type: 'Scheduled', start: '2024-07-28T10:00', end: '2024-07-28T12:00', status: 'Upcoming', technician: 'Bob', notes: 'Quarterly inspection' },
    { id: 'maint-2', warehouseId: 'W01', dockId: 'D14', dockName: 'Bay B - D14', warehouseName: 'Metro Logistics Center', type: 'Repair', start: '2024-07-29T09:00', end: '2024-07-29T17:00', status: 'Upcoming' },
    { id: 'maint-3', warehouseId: 'W02', dockId: 'D30', dockName: 'Bay C - D30', warehouseName: 'Coastal Distribution Hub', type: 'Inspection', start: '2024-07-27T14:00', end: '2024-07-27T15:00', status: 'In Progress' },
    { id: 'maint-4', warehouseId: 'W02', dockId: 'D48', dockName: 'Bay D - D48', warehouseName: 'Coastal Distribution Hub', type: 'Emergency', start: '2024-07-26T11:00', end: '2024-07-26T13:00', status: 'Completed' },
];

const FormField: React.FC<{ label: string; children: React.ReactNode; isRequired?: boolean; id?: string; }> = ({ label, children, isRequired, id }) => (
    <div>
        <label htmlFor={id} className="block text-sm font-medium text-gray-700">
            {label} {isRequired && <span className="text-red-500">*</span>}
        </label>
        <div className="mt-1">{children}</div>
    </div>
);

const TabButton: React.FC<{
    label: string;
    name: 'warehouses' | 'maintenance';
    icon: React.ReactNode;
    activeTab: 'warehouses' | 'maintenance';
    setActiveTab: (name: 'warehouses' | 'maintenance') => void;
}> = ({ label, name, icon, activeTab, setActiveTab }) => (
    <button
        onClick={() => setActiveTab(name)}
        className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-semibold text-left transition-colors ${
            activeTab === name
            ? 'bg-brand-accent text-white shadow'
            : 'text-gray-600 hover:bg-gray-200'
        }`}
    >
        {icon}
        <span>{label}</span>
    </button>
);


const WarehouseAndDocksConfig: React.FC<Omit<ConfigurationsProps, 'onSaveWarehouse' | 'onSaveDock' | 'timeSlots' | 'onSaveTimeSlots'> & { onOpenTimeSlotConfig: (dock: Dock) => void }> = ({
    warehouses,
    docks,
    onDeleteWarehouse,
    onDeleteDock,
    onOpenWarehousePanel,
    onOpenDockPanel,
    onOpenTimeSlotConfig,
}) => {
    const [openedWarehouseId, setOpenedWarehouseId] = useState<string | null>(warehouses.length > 0 ? warehouses[0].id : null);

    const groupedWarehouses = useMemo((): ConfigWarehouse[] => {
        const warehouseMap: Record<string, ConfigWarehouse> = {};

        warehouses.forEach(wh => {
            warehouseMap[wh.id] = { ...wh, docks: [] };
        });

        docks.forEach(dock => {
            if (warehouseMap[dock.warehouseId]) {
                warehouseMap[dock.warehouseId].docks.push(dock);
            }
        });

        Object.values(warehouseMap).forEach(wh => {
            wh.docks.sort((a, b) => a.name.localeCompare(b.name, undefined, { numeric: true }));
        });

        return Object.values(warehouseMap);
    }, [warehouses, docks]);

    const handleDeleteWarehouseClick = (warehouseId: string) => {
        if (window.confirm("Are you sure you want to delete this warehouse and all its docks?")) {
            onDeleteWarehouse(warehouseId);
        }
    };
    
    const handleDeleteDockClick = (dockId: string) => {
         if (window.confirm("Are you sure you want to delete this dock?")) {
            onDeleteDock(dockId);
        }
    }

    const toggleAccordion = (warehouseId: string) => {
        setOpenedWarehouseId(prevId => prevId === warehouseId ? null : warehouseId);
    };
    
    return (
        <div className="h-full overflow-y-auto p-6">
            <div className="space-y-6">
                <div className="flex justify-between items-center">
                    <h3 className="text-xl font-bold text-gray-700">Warehouses</h3>
                    <button
                        onClick={() => onOpenWarehousePanel(null)}
                        className="bg-brand-accent text-white font-bold py-2 px-4 rounded-lg shadow hover:bg-brand-accent/90 transition-transform transform hover:scale-105 text-sm"
                    >
                        + Add Warehouse
                    </button>
                </div>
                <div className="space-y-3">
                    {groupedWarehouses.map(wh => (
                        <div key={wh.id} className="border border-gray-200 rounded-lg bg-white shadow-sm">
                            <div onClick={() => toggleAccordion(wh.id)} className="flex justify-between items-center p-4 cursor-pointer hover:bg-gray-50/50 transition-colors">
                                <h3 className="font-bold text-lg text-gray-800">{wh.name} ({wh.id})</h3>
                                <div className="flex items-center gap-4">
                                    <button onClick={(e) => { e.stopPropagation(); onOpenWarehousePanel(wh); }} className="text-gray-400 hover:text-brand-accent transition-colors" title="Edit Warehouse">
                                        <PencilIcon className="w-5 h-5"/>
                                    </button>
                                    <button onClick={(e) => { e.stopPropagation(); handleDeleteWarehouseClick(wh.id); }} className="text-gray-400 hover:text-red-600 transition-colors" title="Delete Warehouse">
                                        <TrashIcon className="w-5 h-5"/>
                                    </button>
                                    <ChevronDownIcon className={`w-6 h-6 text-gray-400 transition-transform ${openedWarehouseId === wh.id ? 'rotate-180' : ''}`} />
                                </div>
                            </div>
                            {openedWarehouseId === wh.id && (
                                <div className="p-4 border-t border-gray-200 bg-gray-50 space-y-4">
                                    <h4 className="font-semibold text-gray-600">Docks ({wh.docks.length})</h4>
                                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
                                        {wh.docks.map(dock => (
                                            <div 
                                                key={dock.id} 
                                                onClick={() => onOpenDockPanel(dock, wh.id)}
                                                className="relative group p-4 bg-white rounded-lg border shadow-sm flex items-center justify-center text-center h-20 cursor-pointer hover:border-brand-accent hover:-translate-y-0.5 transition-all"
                                            >
                                                <span className="font-bold text-gray-800">{dock.name}</span>
                                                <div className="absolute -top-1.5 -right-1.5 flex gap-1">
                                                    <button 
                                                        onClick={(e) => { e.stopPropagation(); onOpenTimeSlotConfig(dock); }} 
                                                        className="p-1 rounded-full bg-blue-100 text-blue-600 opacity-0 group-hover:opacity-100 hover:bg-blue-200 transition-all"
                                                        title={`Configure time slots for ${dock.name}`}
                                                    >
                                                        <ClockIcon className="w-4 h-4" />
                                                    </button>
                                                    <button 
                                                        onClick={(e) => { e.stopPropagation(); handleDeleteDockClick(dock.id!); }} 
                                                        className="p-1 rounded-full bg-red-100 text-red-600 opacity-0 group-hover:opacity-100 hover:bg-red-200 transition-all"
                                                        title={`Remove ${dock.name}`}
                                                    >
                                                        <TrashIcon className="w-4 h-4" />
                                                    </button>
                                                </div>
                                            </div>
                                        ))}
                                         <div
                                            onClick={() => onOpenDockPanel(null, wh.id)}
                                            className="group p-4 bg-gray-100 rounded-lg border-2 border-dashed border-gray-300 flex flex-col items-center justify-center text-center h-20 cursor-pointer hover:border-brand-accent hover:bg-white hover:-translate-y-0.5 transition-all opacity-75 hover:opacity-100"
                                            title="Add a new dock"
                                        >
                                            <PlusIcon className="w-6 h-6 text-gray-400 group-hover:text-brand-accent transition-colors" />
                                            <span className="text-xs font-semibold text-gray-500 group-hover:text-brand-accent transition-colors mt-1">Add Dock</span>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

const MaintenanceTimelinePanel: React.FC<{ 
    isOpen: boolean, 
    onClose: () => void, 
    record: MaintenanceRecord | null,
    onEdit: (recordId: string) => void,
    onDelete: (recordId: string) => void
}> = ({ isOpen, onClose, record, onEdit, onDelete }) => {
    
    const mockHistory = [
        { id: 'hist-1', dockName: 'Bay A - D04', date: '2024-05-10', type: 'Inspection', notes: 'Quarterly check-up. All systems nominal.', status: 'Completed' },
        { id: 'hist-2', dockName: 'Bay B - D14', date: '2024-06-20', type: 'Repair', notes: 'Replaced hydraulic fluid.', status: 'Completed' },
        { id: 'hist-3', dockName: 'Bay A - D04', date: '2024-02-15', type: 'Routine', notes: 'Lubricated door mechanism.', status: 'Completed' },
        { id: 'hist-4', dockName: 'Bay C - D30', date: '2024-04-01', type: 'Upgrade', notes: 'Installed new sensor array.', status: 'Completed' },
        { id: 'hist-5', dockName: 'Bay C - D30', date: '2024-07-27', type: 'Inspection', notes: 'Ongoing sensor calibration.', status: 'In Progress' },
        { id: 'hist-6', dockName: 'Bay D - D48', date: '2024-07-20', type: 'Emergency Repair', notes: 'Faulty gate sensor replaced.', status: 'Completed' },
        { id: 'hist-7', dockName: 'Bay A - D04', date: '2023-11-20', type: 'Routine', notes: 'General wear and tear check.', status: 'Completed' },
        { id: 'hist-8', dockName: 'Bay B - D14', date: '2024-01-05', type: 'Inspection', notes: 'Passed annual safety inspection.', status: 'Completed' },
        { id: 'hist-9', dockName: 'Bay A - D04', date: '2023-08-01', type: 'Inspection', notes: 'Scheduled inspection was cancelled due to part unavailability.', status: 'Not-Performed' },
    ];
    
    const fullHistory = useMemo(() => {
        if (!record) return [];

        const currentEvent = {
            id: record.id,
            date: record.start,
            type: record.type,
            notes: `Scheduled from ${new Date(record.start).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})} to ${new Date(record.end).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}. Notes: ${record.notes || 'N/A'}`,
            status: record.status,
        };

        let pastEvents = mockHistory
            .filter(h => h.dockName === record.dockName)
            .map(h => ({
                id: h.id,
                date: h.date,
                type: h.type,
                notes: h.notes,
                status: h.status,
            }));
            
        if (record.isNew) {
            const recordStartDate = new Date(record.start);
            pastEvents = [
                {
                    id: `gen-${record.id}-1`,
                    date: new Date(recordStartDate.getTime() - 30 * 24 * 60 * 60 * 1000).toISOString(),
                    type: 'Routine',
                    notes: 'General check-up and lubrication.',
                    status: 'Completed'
                },
                {
                    id: `gen-${record.id}-2`,
                    date: new Date(recordStartDate.getTime() - 90 * 24 * 60 * 60 * 1000).toISOString(),
                    type: 'Inspection',
                    notes: 'Quarterly safety inspection passed.',
                    status: 'Completed'
                },
                 {
                    id: `gen-${record.id}-3`,
                    date: new Date(recordStartDate.getTime() - 180 * 24 * 60 * 60 * 1000).toISOString(),
                    type: 'Repair',
                    notes: 'Replaced faulty loading ramp sensor.',
                    status: 'Completed'
                }
            ];
        }

        return [currentEvent, ...pastEvents].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    }, [record]);

    const getStatusTag = (status: string) => {
        const styles: { [key: string]: string } = {
            Completed: 'bg-green-100 text-green-700',
            'In Progress': 'bg-yellow-100 text-yellow-700',
            Upcoming: 'bg-blue-100 text-blue-700',
            'Not-Performed': 'bg-gray-200 text-gray-700',
        };
        const style = styles[status] || styles['Not-Performed'];
        return <span className={`inline-block ml-2 px-2.5 py-1 text-xs font-semibold rounded-full ${style}`}>{status}</span>;
    };


    return (
        <>
            <div className={`fixed inset-0 bg-black/30 z-40 transition-opacity ${isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`} onClick={onClose} />
            <div className={`fixed top-0 right-0 h-full w-full max-w-lg bg-white shadow-xl z-50 transform transition-transform duration-300 ease-in-out ${isOpen ? 'translate-x-0' : 'translate-x-full'}`}>
                <div className="flex flex-col h-full">
                    {/* Header */}
                    <div className="p-5 border-b border-gray-200">
                        <div className="flex justify-between items-center">
                            <h2 className="text-2xl font-bold text-gray-800">Timeline</h2>
                            <button onClick={onClose} className="p-1 rounded-full text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition-colors">
                                <XCircleIcon className="w-6 h-6"/>
                            </button>
                        </div>
                        <p className="text-sm text-gray-500 mt-1">{record ? `${record.warehouseName} - ${record.dockName}` : 'Select a maintenance record to view its history.'}</p>
                    </div>

                    {/* Content */}
                    <div className="flex-grow p-6 bg-gray-50/50 overflow-y-auto">
                        {record ? (
                            <div>
                                {fullHistory.length > 0 ? (
                                    <div className="relative border-l-2 border-gray-200 ml-2">
                                        {fullHistory.map((item, index) => {
                                            const isCompleted = item.status === 'Completed';
                                            const isInProgress = item.status === 'In Progress';
                                            const isNotPerformed = item.status === 'Not-Performed';
                                            const isUpcoming = item.status === 'Upcoming';
                                            
                                            const dotColorClass = isCompleted ? 'bg-green-500' : isInProgress ? 'bg-yellow-400' : isNotPerformed ? 'bg-gray-400' : 'bg-blue-500';
                                            const pulseClass = (isInProgress || isUpcoming) ? 'animate-pulse' : '';
                                            const canEditOrDelete = item.status === 'Upcoming' || item.status === 'In Progress';

                                            return (
                                                <div key={item.id || index} className="mb-8 pl-8 relative">
                                                    <div className="absolute -left-[9px] top-1">
                                                         <span className={`relative flex h-4 w-4`}>
                                                            { (isUpcoming || isInProgress) && <span className={`animate-ping absolute inline-flex h-full w-full rounded-full ${dotColorClass} opacity-75`}></span>}
                                                            <span className={`relative inline-flex rounded-full h-4 w-4 ${dotColorClass} border-2 border-white`}></span>
                                                        </span>
                                                    </div>
                                                    <div className="flex items-baseline">
                                                        <p className="text-sm font-bold text-gray-800">
                                                            {new Date(item.date).toLocaleDateString()}
                                                        </p>
                                                        {getStatusTag(item.status)}
                                                    </div>
                                                    <p className="text-xs text-gray-500">{item.type}</p>
                                                    <div className="mt-2 text-sm text-gray-700 bg-white p-3 rounded-md border shadow-sm flex justify-between items-start">
                                                        <p className="flex-grow pr-4 break-words">{item.notes}</p>
                                                        {canEditOrDelete && (
                                                            <div className="flex-shrink-0 flex items-center gap-1">
                                                                <button
                                                                    onClick={() => onEdit(item.id)}
                                                                    className="p-1 rounded-full text-gray-500 hover:bg-blue-100 hover:text-blue-600 transition-colors"
                                                                    title="Edit Maintenance"
                                                                >
                                                                    <PencilIcon className="w-4 h-4" />
                                                                </button>
                                                                <button
                                                                    onClick={() => onDelete(item.id)}
                                                                    className="p-1 rounded-full text-gray-500 hover:bg-red-100 hover:text-red-600 transition-colors"
                                                                    title="Delete Maintenance"
                                                                >
                                                                    <TrashIcon className="w-4 h-4" />
                                                                </button>
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                ) : (
                                    <div className="border border-dashed border-gray-300 rounded-lg p-6 flex items-center justify-center text-center">
                                        <p className="text-gray-500">No past maintenance history found for this dock.</p>
                                    </div>
                                )}
                            </div>
                        ) : (
                             <div className="border border-dashed border-gray-300 rounded-lg h-full flex items-center justify-center">
                                <p className="text-gray-500">No maintenance record selected.</p>
                            </div>
                        )}
                    </div>

                    {/* Footer */}
                    <div className="flex-shrink-0 flex justify-end items-center p-4 border-t border-gray-200 bg-white">
                        <button onClick={onClose} className="px-4 py-2 rounded-lg text-sm font-semibold text-gray-700 bg-gray-100 hover:bg-gray-200 transition-colors">
                            Close
                        </button>
                    </div>
                </div>
            </div>
        </>
    );
};


const MaintenanceConfig: React.FC<{
    warehouses: Warehouse[],
    docks: Dock[],
    maintenanceRecords: MaintenanceRecord[],
    setMaintenanceRecords: React.Dispatch<React.SetStateAction<MaintenanceRecord[]>>,
    onOpenTimeline: (record: MaintenanceRecord) => void,
    onEdit: (record: MaintenanceRecord) => void
}> = ({ warehouses, docks, maintenanceRecords, setMaintenanceRecords, onOpenTimeline, onEdit }) => {
    const docksForSelectedWarehouse = useMemo(() => {
        return (formData: any) => docks.filter(d => d.warehouseId === formData.selectedWarehouseId);
    }, [docks]);
    
    return (
        <div className="h-full grid grid-cols-1 xl:grid-cols-2">
            {/* Left side: Set Maintenance Form is now part of the parent state */}
            <div className="p-6 border-r border-gray-200 flex flex-col h-full overflow-y-auto">
                 <h3 className="text-xl font-bold text-gray-700">Set Maintenance</h3>
                 <p className="text-sm text-gray-500 mb-6">Create or update a maintenance record for a dock.</p>
                {/* Form will be managed by the parent Configurations component */}
            </div>

            {/* Right side: Maintenance List */}
            <div className="p-6 flex flex-col h-full overflow-y-auto">
                <h3 className="text-xl font-bold text-gray-700">Maintenance List</h3>
                <p className="text-sm text-gray-500 mb-6">View upcoming and ongoing maintenance tasks.</p>
                <div className="flex-grow space-y-3">
                    {maintenanceRecords.sort((a,b) => new Date(b.start).getTime() - new Date(a.start).getTime()).map(record => (
                        <div 
                            key={record.id}
                            onClick={() => onOpenTimeline(record)}
                            className="p-3 border rounded-lg flex items-center justify-between hover:bg-gray-50 transition-colors cursor-pointer"
                        >
                            <div className="flex items-center gap-3">
                                <span className={`w-2.5 h-2.5 rounded-full ${record.status === 'Upcoming' ? 'bg-blue-500' : record.status === 'In Progress' ? 'bg-yellow-500 animate-pulse' : 'bg-green-500'}`}></span>
                                <div>
                                    <p className="font-semibold text-gray-800">{record.dockName} - {record.type}</p>
                                    <p className="text-xs text-gray-500">
                                        {new Date(record.start).toLocaleString()} &rarr; {new Date(record.end).toLocaleString()}
                                    </p>
                                </div>
                            </div>
                            <span className="text-xs font-medium text-gray-600 bg-gray-100 px-2 py-1 rounded">{record.status}</span>
                        </div>
                    ))}
                    {maintenanceRecords.length === 0 && <p className="text-center text-gray-500 py-4">No maintenance records.</p>}
                </div>
            </div>
        </div>
    );
};


// Main Configurations Component
const Configurations: React.FC<ConfigurationsProps> = (props) => {
    const [activeTab, setActiveTab] = useState<'warehouses' | 'maintenance'>('warehouses');
    const [isTimeSlotConfigOpen, setIsTimeSlotConfigOpen] = useState(false);
    const [selectedDockForTimeSlot, setSelectedDockForTimeSlot] = useState<Dock | null>(null);

    // Lifted state for maintenance
    const [maintenanceRecords, setMaintenanceRecords] = useState<MaintenanceRecord[]>(initialMaintenanceRecords);
    const [isTimelineOpen, setIsTimelineOpen] = useState(false);
    const [selectedMaintenanceRecord, setSelectedMaintenanceRecord] = useState<MaintenanceRecord | null>(null);
    const [recordToDelete, setRecordToDelete] = useState<MaintenanceRecord | null>(null);
    const [isEditing, setIsEditing] = useState(false);

    const initialFormState = {
        selectedWarehouseId: props.warehouses[0]?.id || '',
        selectedDockId: '',
        maintenanceType: 'Routine',
        startDateTime: '',
        endDateTime: '',
        technician: '',
        notes: '',
        id: ''
    };
    const [formData, setFormData] = useState(initialFormState);
    
    useEffect(() => {
        const initialDocks = props.docks.filter(d => d.warehouseId === initialFormState.selectedWarehouseId);
        if (initialDocks.length > 0) {
            setFormData(prev => ({...prev, selectedDockId: initialDocks[0].id!}));
        }
    }, [props.docks, initialFormState.selectedWarehouseId]);

    const handleOpenTimeline = (record: MaintenanceRecord) => {
        setSelectedMaintenanceRecord(record);
        setIsTimelineOpen(true);
    };

    const handleCloseTimeline = () => {
        setIsTimelineOpen(false);
        setSelectedMaintenanceRecord(null);
    };
    
    const handleEdit = (recordId: string) => {
        const recordToEdit = maintenanceRecords.find(r => r.id === recordId);
        if (recordToEdit) {
            setFormData({
                id: recordToEdit.id,
                selectedWarehouseId: recordToEdit.warehouseId,
                selectedDockId: recordToEdit.dockId,
                maintenanceType: recordToEdit.type,
                startDateTime: recordToEdit.start,
                endDateTime: recordToEdit.end,
                technician: recordToEdit.technician || '',
                notes: recordToEdit.notes || '',
            });
            setIsEditing(true);
            setIsTimelineOpen(false);
        }
    };

    const handleOpenDeleteModal = (recordId: string) => {
        const record = maintenanceRecords.find(r => r.id === recordId);
        if(record) setRecordToDelete(record);
    }
    
    const handleDelete = () => {
        if (recordToDelete) {
            setMaintenanceRecords(prev => prev.filter(r => r.id !== recordToDelete.id));
            setRecordToDelete(null);
            setIsTimelineOpen(false);
        }
    };


    const handleWarehouseChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const newWarehouseId = e.target.value;
        const docksInNewWarehouse = props.docks.filter(d => d.warehouseId === newWarehouseId);
        const newDockId = docksInNewWarehouse.length > 0 ? docksInNewWarehouse[0].id! : '';
        
        setFormData(prev => ({ ...prev, selectedWarehouseId: newWarehouseId, selectedDockId: newDockId }));
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({...prev, [name]: value}));
    };

    const docksForSelectedWarehouse = useMemo(() => {
        return props.docks.filter(d => d.warehouseId === formData.selectedWarehouseId);
    }, [props.docks, formData.selectedWarehouseId]);


    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const warehouseName = props.warehouses.find(w => w.id === formData.selectedWarehouseId)?.name || 'Unknown Warehouse';
        const dockName = props.docks.find(d => d.id === formData.selectedDockId)?.name || 'Unknown Dock';

        if (!formData.selectedDockId || !formData.startDateTime || !formData.endDateTime) {
            alert('Please fill all required fields.');
            return;
        }

        const newRecord: MaintenanceRecord = {
            id: isEditing ? formData.id : `maint-${Date.now()}`,
            dockName, warehouseName,
            warehouseId: formData.selectedWarehouseId,
            dockId: formData.selectedDockId,
            type: formData.maintenanceType,
            start: formData.startDateTime,
            end: formData.endDateTime,
            status: new Date(formData.startDateTime) > new Date() ? 'Upcoming' : 'In Progress',
            isNew: !isEditing,
            technician: formData.technician.trim() || undefined,
            notes: formData.notes.trim() || undefined,
        };
        
        if (isEditing) {
            setMaintenanceRecords(prev => prev.map(r => r.id === newRecord.id ? newRecord : r));
        } else {
            setMaintenanceRecords(prev => [newRecord, ...prev]);
        }
        
        setFormData(initialFormState);
        setIsEditing(false);
    };

    const handleOpenTimeSlotConfig = (dock: Dock) => {
        setSelectedDockForTimeSlot(dock);
        setIsTimeSlotConfigOpen(true);
    };
    
    const tabs = [
        { id: 'warehouses', label: 'Warehouses & Docks', icon: <BuildingOfficeIcon className="w-5 h-5" /> },
        { id: 'maintenance', label: 'Maintenance', icon: <WrenchScrewdriverIcon className="w-5 h-5" /> },
    ];
    
     const baseInputClasses = "w-full px-3 py-2 border bg-white border-gray-300 rounded-md shadow-sm text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-brand-accent";

    return (
        <div className="p-8 h-full flex flex-col bg-gray-50">
            <div className="flex-shrink-0">
                <h1 className="text-3xl font-bold text-gray-800">Dock Management</h1>
                <p className="text-gray-500 mt-1">Manage warehouses and their associated docks.</p>
            </div>
            <div className="flex-grow flex mt-6 gap-8 min-h-0">
                <aside className="w-64 flex-shrink-0">
                    <nav className="space-y-1">
                        {tabs.map(tab => (
                            <TabButton 
                                key={tab.id} 
                                label={tab.label} 
                                name={tab.id as any} 
                                icon={tab.icon} 
                                activeTab={activeTab}
                                setActiveTab={setActiveTab}
                            />
                        ))}
                    </nav>
                </aside>
                <main className="flex-1 bg-white rounded-xl shadow-md overflow-hidden">
                    {activeTab === 'warehouses' && <WarehouseAndDocksConfig {...props} onOpenTimeSlotConfig={handleOpenTimeSlotConfig} />}
                    {activeTab === 'maintenance' && (
                        <div className="h-full grid grid-cols-1 xl:grid-cols-2">
                            {/* Left side: Set Maintenance Form */}
                            <div className="p-6 border-r border-gray-200 flex flex-col h-full overflow-y-auto">
                                <h3 className="text-xl font-bold text-gray-700">{isEditing ? 'Edit Maintenance' : 'Set Maintenance'}</h3>
                                <p className="text-sm text-gray-500 mb-6">{isEditing ? `Updating record for ${formData.id}` : 'Create a new maintenance record for a dock.'}</p>
                                <form onSubmit={handleSubmit} className="space-y-4 flex-grow flex flex-col">
                                    <FormField label="Select Warehouse" isRequired id="warehouse-select">
                                        <select id="warehouse-select" name="selectedWarehouseId" value={formData.selectedWarehouseId} onChange={handleWarehouseChange} className={baseInputClasses}>
                                            {props.warehouses.map(w => <option key={w.id} value={w.id}>{w.name}</option>)}
                                        </select>
                                    </FormField>
                                    <FormField label="Select Dock" isRequired id="dock-select">
                                        <select id="dock-select" name="selectedDockId" value={formData.selectedDockId} onChange={handleChange} className={baseInputClasses} disabled={docksForSelectedWarehouse.length === 0}>
                                            {docksForSelectedWarehouse.length > 0 ? (
                                                docksForSelectedWarehouse.map(d => <option key={d.id} value={d.id!}>{d.name}</option>)
                                            ) : ( <option>No docks in this warehouse</option> )}
                                        </select>
                                    </FormField>
                                    <FormField label="Maintenance Type" isRequired id="maint-type">
                                        <select id="maint-type" name="maintenanceType" value={formData.maintenanceType} onChange={handleChange} className={baseInputClasses}>
                                            <option>Routine</option><option>Repair</option><option>Inspection</option><option>Emergency</option><option>Upgrade</option>
                                        </select>
                                    </FormField>
                                    <div className="grid grid-cols-2 gap-4">
                                        <FormField label="Start Date/Time" isRequired id="start-datetime"><div className="relative"><input id="start-datetime" name="startDateTime" type="datetime-local" value={formData.startDateTime} onChange={handleChange} className={`${baseInputClasses} pr-10`} /><div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none"><AppointmentsIcon className="w-5 h-5 text-gray-400" /></div></div></FormField>
                                        <FormField label="End Date/Time" isRequired id="end-datetime"><div className="relative"><input id="end-datetime" name="endDateTime" type="datetime-local" value={formData.endDateTime} onChange={handleChange} className={`${baseInputClasses} pr-10`} /><div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none"><AppointmentsIcon className="w-5 h-5 text-gray-400" /></div></div></FormField>
                                    </div>
                                    <FormField label="Technician/Vendor Name" id="technician"><input id="technician" name="technician" type="text" value={formData.technician} onChange={handleChange} className={baseInputClasses} /></FormField>
                                    <FormField label="Notes/Attachments" id="notes"><textarea id="notes" name="notes" rows={3} value={formData.notes} onChange={handleChange} className={baseInputClasses} /></FormField>
                                    <div className="mt-auto pt-4 flex items-center gap-2">
                                        {isEditing && <button type="button" onClick={() => { setIsEditing(false); setFormData(initialFormState); }} className="w-full bg-gray-200 text-gray-700 font-bold py-3 px-5 rounded-lg hover:bg-gray-300">Cancel Edit</button>}
                                        <button type="submit" className="w-full bg-brand-accent text-white font-bold py-3 px-5 rounded-lg shadow-lg hover:bg-brand-accent/90 transition-transform transform hover:scale-105">{isEditing ? 'Update Maintenance' : 'Create Maintenance'}</button>
                                    </div>
                                </form>
                            </div>
                            <div className="p-6 flex flex-col h-full overflow-y-auto">
                                <h3 className="text-xl font-bold text-gray-700">Maintenance List</h3>
                                <p className="text-sm text-gray-500 mb-6">View upcoming and ongoing maintenance tasks.</p>
                                <div className="flex-grow space-y-3">
                                    {maintenanceRecords.sort((a,b) => new Date(b.start).getTime() - new Date(a.start).getTime()).map(record => (
                                        <div key={record.id} onClick={() => handleOpenTimeline(record)} className="p-3 border rounded-lg flex items-center justify-between hover:bg-gray-50 transition-colors cursor-pointer">
                                            <div className="flex items-center gap-3">
                                                <span className={`w-2.5 h-2.5 rounded-full ${record.status === 'Upcoming' ? 'bg-blue-500' : record.status === 'In Progress' ? 'bg-yellow-500 animate-pulse' : record.status === 'Completed' ? 'bg-green-500' : 'bg-gray-400'}`}></span>
                                                <div>
                                                    <p className="font-semibold text-gray-800">{record.dockName} - {record.type}</p>
                                                    <p className="text-xs text-gray-500">{new Date(record.start).toLocaleString()} &rarr; {new Date(record.end).toLocaleString()}</p>
                                                </div>
                                            </div>
                                            <span className="text-xs font-medium text-gray-600 bg-gray-100 px-2 py-1 rounded">{record.status}</span>
                                        </div>
                                    ))}
                                    {maintenanceRecords.length === 0 && <p className="text-center text-gray-500 py-4">No maintenance records.</p>}
                                </div>
                            </div>
                        </div>
                    )}
                </main>
            </div>
            <TimeSlotsConfig isOpen={isTimeSlotConfigOpen} onClose={() => setIsTimeSlotConfigOpen(false)} dock={selectedDockForTimeSlot} slots={props.timeSlots} onSave={props.onSaveTimeSlots} />
            <MaintenanceTimelinePanel isOpen={isTimelineOpen} onClose={handleCloseTimeline} record={selectedMaintenanceRecord} onEdit={handleEdit} onDelete={handleOpenDeleteModal} />
            <ConfirmationModal
                isOpen={!!recordToDelete}
                onClose={() => setRecordToDelete(null)}
                onConfirm={handleDelete}
                title="Delete Maintenance Record"
                message={`Are you sure you want to delete the maintenance for ${recordToDelete?.dockName} on ${recordToDelete?.start ? new Date(recordToDelete.start).toLocaleDateString() : ''}? This action cannot be undone.`}
            />
        </div>
    );
};

export default Configurations;