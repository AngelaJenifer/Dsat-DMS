import React, { useMemo } from 'react';
import { Vehicle, Dock, Operation, Customer, Document, OperationStatus, DockStatus, VehicleStatus, OperationType, TimelineAppointment } from '../types.ts';
import { ICONS } from '../constants.tsx';
import { formatDate } from '../utils.ts';

// Helper components for the panel
const DetailSection: React.FC<{ title: string; children: React.ReactNode; }> = ({ title, children }) => (
    <div className="py-4">
        <h3 className="text-xs font-semibold uppercase text-gray-500 tracking-wider mb-2">{title}</h3>
        {children}
    </div>
);

const DetailRow: React.FC<{ label: string; value: React.ReactNode; }> = ({ label, value }) => (
    <div className="flex justify-between items-start py-2 border-b border-gray-200 last:border-b-0">
        <span className="text-sm text-gray-600 flex-shrink-0 mr-4">{label}</span>
        <div className="text-sm font-semibold text-gray-800 text-right">{value}</div>
    </div>
);

const getVehicleStatusBadge = (status: VehicleStatus) => {
    const styles: { [key in VehicleStatus]: string } = {
        [VehicleStatus.Approved]: 'bg-blue-100 text-blue-800',
        [VehicleStatus.Entered]: 'bg-green-100 text-green-800',
        [VehicleStatus.Yard]: 'bg-yellow-100 text-yellow-800',
        [VehicleStatus.Exited]: 'bg-gray-100 text-gray-800',
    };
    return <span className={`px-2 py-1 text-xs font-bold rounded-full ${styles[status]}`}>{status.charAt(0).toUpperCase() + status.slice(1)}</span>;
};

const getDockStatusBadge = (status: DockStatus) => {
    const styles: { [key in DockStatus]: string } = {
      [DockStatus.Available]: 'bg-status-green/20 text-status-green',
      [DockStatus.Occupied]: 'bg-status-yellow/20 text-status-yellow',
      [DockStatus.Maintenance]: 'bg-status-red/20 text-status-red',
    };
    return <span className={`px-2 py-1 text-xs font-bold rounded-full ${styles[status]}`}>{status.charAt(0).toUpperCase() + status.slice(1)}</span>;
};


// Main Panel Component
interface DetailPanelProps {
    item: Vehicle | Dock | null;
    vehicles: Vehicle[];
    operations: Operation[];
    vendors: Customer[];
    documents: Document[];
    docks: Dock[];
    timelineAppointments: TimelineAppointment[];
    onClose: () => void;
    onCheckOut: (vehicleId: string) => void;
    onReportDelay: (operationId: string, reason: string) => void;
    onStartOperation: (vehicleId: string, type: OperationType, duration: number) => void;
    onBookAppointment: (dockId: string) => void;
    currentDate: Date;
}

const DetailPanel: React.FC<DetailPanelProps> = ({ 
    item, 
    vehicles, 
    operations, 
    vendors, 
    documents,
    docks,
    timelineAppointments,
    onClose,
    onCheckOut,
    onReportDelay,
    onStartOperation,
    onBookAppointment,
    currentDate
}) => {
    const isOpen = item !== null;
    
    // Type guard to differentiate Vehicle from Dock
    const isVehicle = (item: any): item is Vehicle => item && 'driverName' in item;

    const vehicleToShow = useMemo(() => isVehicle(item) ? item : null, [item]);
    const dockToShow = useMemo(() => !isVehicle(item) ? item : null, [item]);

    const vehicleForDock = useMemo(() => {
        if (!dockToShow) return null;
        return vehicles.find(v => v.assignedDockId === dockToShow.id && v.status === VehicleStatus.Entered);
    }, [dockToShow, vehicles]);

    const activeVehicle = vehicleToShow || vehicleForDock;

    const relevantOperation = useMemo(() => {
        if (!activeVehicle) return null;
        return operations.find(op => op.vehicleId === activeVehicle.id && op.status !== OperationStatus.Completed);
    }, [activeVehicle, operations]);

    const relevantDocuments = useMemo(() => {
        if (!activeVehicle) return [];
        return documents.filter(doc => doc.vehicleId === activeVehicle.id);
    }, [activeVehicle, documents]);

    const vendorForVehicle = useMemo(() => {
        if (!activeVehicle) return null;
        return vendors.find(v => v.id === activeVehicle.vendorId);
    }, [activeVehicle, vendors]);

    const upcomingAppointmentForDock = useMemo(() => {
        if (!dockToShow) return null;
        const now = new Date();
        return timelineAppointments
            .filter(appt =>
                appt.dockId === dockToShow.id &&
                new Date(appt.startTime) > now &&
                (appt.status === 'Approved' || appt.status === 'Draft')
            )
            .sort((a, b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime())[0];
    }, [dockToShow, timelineAppointments]);

    const renderVehicleContent = (vehicle: Vehicle) => {
        const dockName = docks.find(d => d.id === vehicle.assignedDockId)?.name || vehicle.assignedDockId;
        return (
            <>
                <div className="p-6 text-center border-b border-gray-200">
                    <h2 className="text-xl font-bold text-gray-800">{vehicle.id}</h2>
                    <p className="text-gray-500">{vehicle.carrier}</p>
                    <div className="mt-4">{getVehicleStatusBadge(vehicle.status)}</div>
                </div>
                <div className="flex-grow p-6 overflow-y-auto">
                    <DetailSection title="Appointment Info">
                        <DetailRow label="Appointment Time" value={vehicle.appointmentTime} />
                        <DetailRow label="Assigned Dock" value={dockName} />
                        <DetailRow label="Entry Time" value={vehicle.entryTime ? new Date(vehicle.entryTime).toLocaleTimeString() : 'N/A'} />
                        <DetailRow label="Exit Time" value={vehicle.exitTime ? new Date(vehicle.exitTime).toLocaleTimeString() : 'N/A'} />
                    </DetailSection>
                    <DetailSection title="Driver & Vendor">
                        <DetailRow label="Driver" value={vehicle.driverName} />
                        <DetailRow label="Vendor" value={vendorForVehicle?.name || 'N/A'} />
                    </DetailSection>
                    {relevantOperation && (
                        <DetailSection title="Active Operation">
                            <DetailRow label="Type" value={relevantOperation.type} />
                            <DetailRow label="Status" value={relevantOperation.status} />
                            <DetailRow label="Start Time" value={new Date(relevantOperation.startTime).toLocaleTimeString()} />
                            <DetailRow label="Est. Completion" value={new Date(relevantOperation.estCompletionTime).toLocaleTimeString()} />
                            {relevantOperation.delayReason && <DetailRow label="Delay Reason" value={<span className="text-red-600 break-all">{relevantOperation.delayReason}</span>} />}
                        </DetailSection>
                    )}
                    {relevantDocuments.length > 0 && (
                        <DetailSection title="Documents">
                            {relevantDocuments.map(doc => (
                                <div key={doc.id} className="flex items-center justify-between p-2 bg-gray-50 rounded-md mb-2">
                                    <span className="text-sm text-gray-700 truncate pr-2">{doc.name}</span>
                                    <a href={doc.fileUrl} target="_blank" rel="noopener noreferrer" className="text-brand-accent hover:text-brand-accent/80 flex-shrink-0">{ICONS.download}</a>
                                </div>
                            ))}
                        </DetailSection>
                    )}
                </div>
                <div className="p-4 bg-gray-50 border-t border-gray-200 flex flex-wrap gap-2 justify-center">
                     {vehicle.status === VehicleStatus.Entered && !relevantOperation && (
                        <button onClick={() => onStartOperation(vehicle.id, OperationType.Unloading, 60)} className="flex-1 bg-blue-500 text-white font-bold py-2 px-4 rounded-lg shadow hover:bg-blue-600">Start Operation</button>
                    )}
                    {relevantOperation && relevantOperation.status === OperationStatus.InProgress && (
                        <button onClick={() => onReportDelay(relevantOperation.id, 'Manual delay report from panel.')} className="flex-1 bg-yellow-500 text-white font-bold py-2 px-4 rounded-lg shadow hover:bg-yellow-600">Report Delay</button>
                    )}
                    {vehicle.status === VehicleStatus.Entered && (
                        <button onClick={() => onCheckOut(vehicle.id)} className="flex-1 bg-red-500 text-white font-bold py-2 px-4 rounded-lg shadow hover:bg-red-600">Check Out</button>
                    )}
                </div>
            </>
        );
    }
    
    const renderDockContent = (dock: Dock) => {
        let displayStatus: DockStatus;
        const isToday = formatDate(currentDate) === formatDate(new Date());

        if (dock.status === DockStatus.Maintenance) {
            displayStatus = DockStatus.Maintenance;
        } else {
            const appointmentsForDockOnDay = timelineAppointments.filter(appt =>
                appt.dockId === dock.id &&
                formatDate(new Date(appt.startTime)) === formatDate(currentDate)
            );

            if (isToday) {
                const now = new Date();
                const hasAppointmentInProgress = appointmentsForDockOnDay.some(appt =>
                    new Date(appt.startTime) <= now &&
                    new Date(appt.endTime) > now &&
                    (appt.status === 'Approved' || appt.status === 'Draft')
                );

                if (dock.status === DockStatus.Occupied || hasAppointmentInProgress || appointmentsForDockOnDay.length > 0) {
                    displayStatus = DockStatus.Occupied;
                } else {
                    displayStatus = DockStatus.Available;
                }
            } else {
                 // For future or past dates, only consider scheduled appointments
                if (appointmentsForDockOnDay.length > 0) {
                    displayStatus = DockStatus.Occupied;
                } else {
                    displayStatus = DockStatus.Available;
                }
            }
        }
        
        return (
        <>
            <div className="p-6 text-center border-b border-gray-200">
                <h2 className="text-xl font-bold text-gray-800">{dock.name}</h2>
                <p className="text-gray-500">{dock.location}</p>
                <div className="mt-4">{getDockStatusBadge(displayStatus)}</div>
            </div>
            <div className="flex-grow p-6 overflow-y-auto">
                <DetailSection title="Dock Info">
                    <DetailRow label="Capacity" value={`${dock.capacity} truck(s)`} />
                    <DetailRow label="Last Maintenance" value={new Date(dock.lastMaintenance).toLocaleDateString()} />
                    {dock.notes && <DetailRow label="Notes" value={<span className="text-sm italic">{dock.notes}</span>} />}
                </DetailSection>

                {vehicleForDock ? (
                    <>
                        <DetailSection title="Occupying Vehicle">
                            <DetailRow label="Vehicle ID" value={vehicleForDock.id} />
                            <DetailRow label="Carrier" value={vehicleForDock.carrier} />
                            <DetailRow label="Driver" value={vehicleForDock.driverName} />
                        </DetailSection>
                        {relevantOperation && (
                            <DetailSection title="Active Operation">
                                <DetailRow label="Type" value={relevantOperation.type} />
                                <DetailRow label="Status" value={relevantOperation.status} />
                                <DetailRow label="Start Time" value={new Date(relevantOperation.startTime).toLocaleTimeString()} />
                            </DetailSection>
                        )}
                    </>
                ) : (
                    <>
                        <div className="text-center py-4 text-gray-500">
                            <p>Physical dock status is {dock.status}.</p>
                        </div>
                        {dock.status === DockStatus.Available && upcomingAppointmentForDock && (
                            <DetailSection title="Next Appointment">
                                <DetailRow label="Time" value={new Date(upcomingAppointmentForDock.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} />
                                <DetailRow label="Vehicle ID" value={upcomingAppointmentForDock.vehicleNumber} />
                                <DetailRow label="Carrier" value={upcomingAppointmentForDock.transporter} />
                                <DetailRow label="Status" value={upcomingAppointmentForDock.status} />
                            </DetailSection>
                        )}
                    </>
                )}
            </div>
            <div className="p-4 bg-gray-50 border-t border-gray-200 flex flex-wrap gap-2 justify-center">
                 {dock.status === DockStatus.Available && (
                    <button 
                        onClick={() => onBookAppointment(dock.id!)}
                        className="w-full bg-blue-500 text-white font-bold py-3 px-4 rounded-lg shadow-lg hover:bg-blue-600 transition-colors"
                    >
                        Book Appointment
                    </button>
                )}
            </div>
        </>
    )};

    return (
        <>
            <div className={`fixed inset-0 bg-black/30 z-40 transition-opacity ${isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`} onClick={onClose} />
            <div className={`fixed top-0 right-0 h-full w-full max-w-md bg-white shadow-xl z-50 transform transition-transform duration-300 ease-in-out flex flex-col ${isOpen ? 'translate-x-0' : 'translate-x-full'}`}>
                {item ? (
                    <>
                         <div className="flex-shrink-0 p-4 border-b border-gray-200">
                           <button onClick={onClose} className="p-1 rounded-full text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition-colors float-right">{ICONS.close}</button>
                        </div>
                        {vehicleToShow && renderVehicleContent(vehicleToShow)}
                        {dockToShow && renderDockContent(dockToShow)}
                    </>
                ) : (
                    <div className="p-4"><button onClick={onClose}>{ICONS.close}</button></div>
                )}
            </div>
        </>
    );
};

export default DetailPanel;