import React, { useState, useMemo, useEffect, useRef } from 'react';
import { TimelineAppointment, TimelineDock, TimelineAppointmentStatus } from '../types.ts';
import { PlusIcon, XCircleIcon, ChevronDownIcon, ClockIcon, PaperclipIcon, TrashIcon, AppointmentsIcon, TruckIcon, BuildingOfficeIcon, DocumentsIcon, SettingsIcon, CarriersIcon } from './icons/Icons.tsx';


const formatDate = (date: Date) => date.toISOString().split('T')[0];
const formatTime = (date: Date) => date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false });

// --- FORM HELPER COMPONENTS ---
const FormSection: React.FC<{ title: string; children: React.ReactNode; defaultOpen?: boolean, icon: React.ReactNode }> = ({ title, children, defaultOpen, icon }) => (
    <details className="border border-gray-200 rounded-lg bg-white" open={defaultOpen}>
        <summary className="font-semibold text-md text-gray-700 bg-gray-50 p-4 cursor-pointer list-none flex justify-between items-center hover:bg-gray-100 transition-colors rounded-t-lg">
            <div className="flex items-center gap-3">
                <span className="w-5 h-5 text-gray-500">{icon}</span>
                {title}
            </div>
            <ChevronDownIcon className="w-5 h-5 transition-transform" />
        </summary>
        <div className="p-4 grid grid-cols-1 md:grid-cols-2 gap-x-4 gap-y-5">
            {children}
        </div>
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

const AppointmentModal: React.FC<{ isOpen: boolean; onClose: () => void; appointment: TimelineAppointment | null; onSave: (appt: TimelineAppointment) => void; onDelete: (id: string) => void; createData?: { time: Date, dockId: string }, docks: TimelineDock[] }> = ({ isOpen, onClose, appointment, onSave, onDelete, createData, docks }) => {
    const [formData, setFormData] = useState<Partial<TimelineAppointment>>({});
    const isCreating = !appointment;
    const fileInputRef = useRef<HTMLInputElement>(null);

    const baseInputClasses = "relative w-full bg-gray-100 border-gray-200 border p-2 text-sm rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 text-gray-900 placeholder:text-gray-500";

    useEffect(() => {
        if (isOpen) {
            if (isCreating && createData) {
                const duration = 30; // Default to 30 mins
                const startTime = createData.time;
                const endTime = new Date(startTime.getTime() + duration * 60 * 1000);
                const baseData: Partial<TimelineAppointment> = {
                    status: 'Draft', appointmentType: 'Inbound', dockId: createData.dockId,
                    startTime: startTime, endTime: endTime, expectedDuration: duration,
                    companyName: '', purposeOfVisit: '', vehicleNumber: '', transporter: '',
                    driverName: '', driverContact: '', vehicleType: '', loadType: '',
                    quantity: '', gatePassRequired: false, documentUploads: [],
                    securityClearanceStatus: 'Pending',
                };
                setFormData(baseData);
            } else {
                const initialData = { ...appointment };
                if (initialData.startTime && initialData.endTime && !initialData.expectedDuration) {
                    initialData.expectedDuration = (new Date(initialData.endTime).getTime() - new Date(initialData.startTime).getTime()) / (60 * 1000);
                }
                setFormData(initialData as TimelineAppointment);
            }
        }
    }, [isOpen, appointment, createData, isCreating]);
    
    useEffect(() => {
        if (formData.startTime && formData.expectedDuration) {
            const newEndTime = new Date(new Date(formData.startTime).getTime() + formData.expectedDuration * 60 * 1000);
            if (formData.endTime?.getTime() !== newEndTime.getTime()) {
                handleFormChange('endTime', newEndTime);
            }
        }
    }, [formData.startTime, formData.expectedDuration]);


    const handleSave = () => {
        const mandatoryFields: (keyof TimelineAppointment)[] = [
            'appointmentType', 'startTime', 'expectedDuration', 'dockId',
            'vehicleNumber', 'transporter', 'driverName', 'driverContact', 'vehicleType',
            'companyName', 'purposeOfVisit', 'loadType', 'quantity', 'status'
        ];
        const missingFields = mandatoryFields.filter(field => !formData[field]);

        if (missingFields.length > 0) {
            alert(`Please fill all mandatory fields: ${missingFields.join(', ')}`);
            return;
        }
        onSave(formData as TimelineAppointment);
        onClose();
    };
    
    const handleFormChange = (field: keyof TimelineAppointment, value: any) => setFormData(p => ({ ...p, [field]: value }));

    const handleDateChange = (dateValue: string) => {
        const newStartDate = new Date(dateValue);
        if (formData.startTime) {
          const currentStartTime = new Date(formData.startTime);
          newStartDate.setHours(currentStartTime.getHours(), currentStartTime.getMinutes());
        }
        handleFormChange('startTime', newStartDate);
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files) {
            const newFiles = Array.from(e.target.files).map(file => ({ name: file.name, size: file.size }));
            handleFormChange('documentUploads', [...(formData.documentUploads || []), ...newFiles]);
        }
    };
    
    const removeFile = (index: number) => {
        handleFormChange('documentUploads', formData.documentUploads?.filter((_, i) => i !== index));
    };

    const handleDeleteClick = () => {
        if (appointment && window.confirm('Are you sure you want to delete this appointment?')) {
            onDelete(appointment.id);
            onClose();
        }
    };

     return (
        <>
            <div className={`fixed inset-0 bg-black/30 z-40 transition-opacity ${isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`} onClick={onClose} />
            <div className={`fixed top-0 right-0 h-full w-full max-w-4xl bg-white shadow-xl z-50 transform transition-transform duration-300 ease-in-out ${isOpen ? 'translate-x-0' : 'translate-x-full'}`} onClick={(e) => e.stopPropagation()}>
                <div className="flex flex-col h-full">
                    <div className="p-5 border-b border-gray-200">
                        <div className="flex justify-between items-center">
                           <h2 className="text-2xl font-bold text-gray-800">{isCreating ? 'New Appointment' : 'Edit Appointment'}</h2>
                           <button onClick={onClose} className="p-1 rounded-full text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition-colors"><XCircleIcon className="w-6 h-6"/></button>
                        </div>
                         <p className="text-sm text-gray-500 mt-1">
                            { isCreating ? "Create a new dock appointment" : `Editing Appointment ID: ${formData.appointmentId || 'N/A'}` }
                         </p>
                    </div>

                    <div className="flex-grow p-5 space-y-4 overflow-y-auto bg-gray-50/50">
                        <FormSection title="Appointment Details" icon={<AppointmentsIcon />} defaultOpen>
                            <FormField label="Appointment ID" className="md:col-span-1"><input type="text" value={formData.appointmentId || ''} onChange={e => handleFormChange('appointmentId', e.target.value)} className={baseInputClasses} placeholder="Auto-generated or enter manually" /></FormField>
                            <FormField label="Appointment Type" isMandatory><select value={formData.appointmentType} onChange={e => handleFormChange('appointmentType', e.target.value as any)} className={baseInputClasses}><option>Inbound</option><option>Outbound</option><option>Transfer</option></select></FormField>
                            <FormField label="Date" isMandatory>
                                <>
                                    <input type="date" value={formData.startTime ? formatDate(new Date(formData.startTime)) : ''} onChange={e => handleDateChange(e.target.value)} className={`${baseInputClasses} pr-10`}/>
                                    <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                                        <AppointmentsIcon className="w-5 h-5 text-gray-400" />
                                    </div>
                                </>
                            </FormField>
                            <FormField label="Start Time" isMandatory>
                                <>
                                    <input type="time" step="1800" value={formData.startTime ? formatTime(new Date(formData.startTime)) : ''} onChange={e => handleFormChange('startTime', new Date(`${formatDate(formData.startTime!)}T${e.target.value}`))} className={`${baseInputClasses} pr-10`}/>
                                    <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                                        <ClockIcon className="w-5 h-5 text-gray-400" />
                                    </div>
                                </>
                            </FormField>
                             <FormField label="Expected Duration" isMandatory>
                                <select value={formData.expectedDuration || ''} onChange={e => handleFormChange('expectedDuration', parseInt(e.target.value))} className={baseInputClasses}>
                                    <option value="30">30 mins</option>
                                    <option value="60">1 hour</option>
                                    <option value="90">1.5 hours</option>
                                    <option value="120">2 hours</option>
                                    <option value="180">3 hours</option>
                                </select>
                            </FormField>
                            <FormField label="Dock Location" isMandatory><select value={formData.dockId} onChange={e => handleFormChange('dockId', e.target.value)} className={baseInputClasses}>{docks.map(d=><option key={d.id} value={d.id}>{d.name}</option>)}</select></FormField>
                        </FormSection>
                        
                        <FormSection title="Vehicle & Transport Details" icon={<TruckIcon/>} defaultOpen>
                             <FormField label="Vehicle Number" isMandatory><input type="text" value={formData.vehicleNumber || ''} onChange={e => handleFormChange('vehicleNumber', e.target.value)} className={baseInputClasses} /></FormField>
                             <FormField label="Transporter/Carrier Name" isMandatory><input type="text" value={formData.transporter || ''} onChange={e => handleFormChange('transporter', e.target.value)} className={baseInputClasses} /></FormField>
                             <FormField label="Driver Name" isMandatory><input type="text" value={formData.driverName || ''} onChange={e => handleFormChange('driverName', e.target.value)} className={baseInputClasses} /></FormField>
                             <FormField label="Driver Contact No." isMandatory><input type="text" value={formData.driverContact || ''} onChange={e => handleFormChange('driverContact', e.target.value)} className={baseInputClasses} /></FormField>
                             <FormField label="Vehicle Type" isMandatory><input type="text" value={formData.vehicleType || ''} onChange={e => handleFormChange('vehicleType', e.target.value)} className={baseInputClasses} /></FormField>
                        </FormSection>

                        <FormSection title="Supplier / Client Details" icon={<BuildingOfficeIcon/>} defaultOpen>
                            <FormField label="Company Name" isMandatory className="md:col-span-2"><input type="text" value={formData.companyName || ''} onChange={e => handleFormChange('companyName', e.target.value)} className={baseInputClasses} /></FormField>
                            <FormField label="Contact Person Name"><input type="text" value={formData.contactPerson || ''} onChange={e => handleFormChange('contactPerson', e.target.value)} className={baseInputClasses} /></FormField>
                            <FormField label="Purpose of Visit" isMandatory><input type="text" value={formData.purposeOfVisit || ''} onChange={e => handleFormChange('purposeOfVisit', e.target.value)} className={baseInputClasses} /></FormField>
                        </FormSection>
                        
                        <FormSection title="Goods / Load Information" icon={<CarriersIcon />} defaultOpen>
                            <FormField label="Load Type" isMandatory><input type="text" value={formData.loadType || ''} onChange={e => handleFormChange('loadType', e.target.value)} className={baseInputClasses} /></FormField>
                            <FormField label="Quantity / Volume" isMandatory><input type="text" value={formData.quantity || ''} onChange={e => handleFormChange('quantity', e.target.value)} className={baseInputClasses} /></FormField>
                            <FormField label="Product Category"><input type="text" value={formData.productCategory || ''} onChange={e => handleFormChange('productCategory', e.target.value)} className={baseInputClasses} /></FormField>
                            <FormField label="Load ID / Order Number"><input type="text" value={formData.loadId || ''} onChange={e => handleFormChange('loadId', e.target.value)} className={baseInputClasses} /></FormField>
                        </FormSection>
                        
                        <FormSection title="Documents & Compliance" icon={<DocumentsIcon />} defaultOpen>
                             <FormField label="Gate Pass Required?" className="md:col-span-2"><input type="checkbox" checked={formData.gatePassRequired || false} onChange={e => handleFormChange('gatePassRequired', e.target.checked)} className="h-5 w-5 rounded border-gray-300 text-primary-600 focus:ring-primary-500" /></FormField>
                             <FormField label="Document Uploads" className="md:col-span-2">
                                <div className="w-full p-3 border border-dashed border-gray-300 rounded-md bg-white">
                                    <input type="file" id="file-upload" multiple className="hidden" onChange={handleFileChange} ref={fileInputRef} />
                                    <div className="mt-2 space-y-2">
                                        {formData.documentUploads?.map((file, index) => (
                                            <div key={index} className="flex justify-between items-center bg-gray-100 p-1.5 rounded text-sm">
                                                <div className="flex items-center gap-2">
                                                    <PaperclipIcon className="w-4 h-4 text-gray-500" />
                                                    <span className="text-gray-700">{file.name} ({(file.size / 1024).toFixed(1)} KB)</span>
                                                </div>
                                                <button onClick={() => removeFile(index)} className="text-red-500 hover:text-red-700 p-1 rounded-full hover:bg-red-100"><TrashIcon className="w-4 h-4" /></button>
                                            </div>
                                        ))}
                                    </div>
                                    <button onClick={() => fileInputRef.current?.click()} className="mt-2 w-full text-center text-sm text-primary-600 font-semibold p-2 rounded-md hover:bg-primary-50 transition-colors">
                                        + Add Documents
                                    </button>
                                </div>
                            </FormField>
                            <FormField label="Security Clearance Status"><select value={formData.securityClearanceStatus} onChange={e => handleFormChange('securityClearanceStatus', e.target.value as any)} className={baseInputClasses}><option>Approved</option><option>Pending</option></select></FormField>
                        </FormSection>

                        <FormSection title="Operational Settings" icon={<SettingsIcon />} defaultOpen>
                            <FormField label="Special Instructions" className="md:col-span-2"><textarea value={formData.specialInstructions || ''} onChange={e => handleFormChange('specialInstructions', e.target.value)} rows={3} className={baseInputClasses} /></FormField>
                            <FormField label="Status" isMandatory><select value={formData.status} onChange={e => handleFormChange('status', e.target.value as TimelineAppointmentStatus)} className={baseInputClasses}><option>Draft</option><option>Approved</option><option>Cancelled</option><option>Completed</option></select></FormField>
                        </FormSection>
                    </div>

                    <div className="flex-shrink-0 flex justify-between items-center p-4 border-t border-gray-200 bg-white">
                        <button onClick={handleDeleteClick} disabled={isCreating} className={`font-semibold text-sm text-red-500 hover:text-red-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1`}>
                            <TrashIcon className="w-4 h-4" /> Delete
                        </button>
                        <div className="flex items-center gap-2">
                           <button onClick={onClose} className="px-4 py-2 rounded-lg text-sm font-semibold text-gray-700 bg-gray-100 hover:bg-gray-200 transition-colors">Cancel</button>
                           <button onClick={handleSave} className="px-5 py-2 rounded-lg text-sm font-semibold text-white bg-primary-600 hover:bg-primary-700 transition-colors">Save Appointment</button>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
};

export default AppointmentModal;