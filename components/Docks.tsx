import React, { useState, useMemo, useEffect, useCallback, useRef } from 'react';
import { Dock, DockStatus, Vehicle, Operation, OperationStatus, VehicleStatus, TimelineAppointment } from '../types.ts';
import { ICONS } from '../constants.tsx';
import MaintenanceModal from './MaintenanceModal.tsx';
import { SparklesIcon, ChevronLeftIcon, ChevronRightIcon, ChevronUpDownIcon } from './icons/Icons.tsx';

interface DocksProps {
    docks: Dock[];
    vehicles: Vehicle[];
    operations: Operation[];
    timelineAppointments: TimelineAppointment[];
    automationMode: 'Manual' | 'Automatic';
    recentlyUpdatedDocks: string[];
    onRunPredictiveMaintenance: () => void;
    onSetMaintenance: (dockId: string, notes: string) => void;
    onClearMaintenance: (dockId: string) => void;
    onSelectItem: (item: Dock | Vehicle) => void;
    onBookAppointment: (dockId: string) => void;
}

const getStatusBadge = (status: DockStatus) => {
  const styles: { [key in DockStatus]: string } = {
    [DockStatus.Available]: 'bg-status-green/20 text-status-green',
    [DockStatus.Occupied]: 'bg-status-yellow/20 text-status-yellow',
    [DockStatus.Maintenance]: 'bg-status-red/20 text-status-red',
  };
  return <span className={`px-2 py-1 text-xs font-bold rounded-full ${styles[status]}`}>{status.charAt(0).toUpperCase() + status.slice(1)}</span>;
};

const OperationProgress: React.FC<{ operation: Operation }> = ({ operation }) => {
    const [progress, setProgress] = useState(0);

    useEffect(() => {
        if (!operation) return;

        const calculateProgress = () => {
            const elapsed = Date.now() - operation.startTime;
            const total = operation.estCompletionTime - operation.startTime;
            const value = Math.min(Math.round((elapsed / total) * 100), 100);
            setProgress(value < 0 ? 0 : value);
        };

        calculateProgress();
        const interval = setInterval(calculateProgress, 5000); // Update every 5 seconds

        return () => clearInterval(interval);
    }, [operation]);

    return (
        <div className="pt-3 border-t border-indigo-200/50">
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Operation Status</p>
            <div className="flex justify-between items-center mt-1">
                <p className="font-bold text-gray-800 flex items-center">
                    <span className="text-brand-accent">{ICONS.operations}</span>
                    <span className="ml-2">{operation.type}</span>
                </p>
                {operation.status === OperationStatus.Delayed && (
                    <span className="text-xs font-bold text-white bg-status-red px-2 py-0.5 rounded-full">Delayed</span>
                )}
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                <div 
                    className={`h-2 rounded-full transition-all duration-500 ${operation.status === OperationStatus.Delayed ? 'bg-status-red' : 'bg-brand-accent'}`} 
                    style={{ width: `${progress}%` }}
                ></div>
            </div>
            <div className="flex justify-between text-xs text-gray-500 mt-1">
                <span>Start: {new Date(operation.startTime).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
                <span>ETA: {new Date(operation.estCompletionTime).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
            </div>
        </div>
    );
};


const DockCard: React.FC<{ 
    dock: Dock,
    vehicles: Vehicle[],
    operations: Operation[],
    upcomingAppointment?: TimelineAppointment,
    recentlyUpdatedDocks: string[],
    onSetMaintenanceClick: () => void, 
    onClearMaintenance: (dockId: string) => void,
    onSelectItem: (item: Dock | Vehicle) => void,
    onBookAppointmentClick: () => void,
}> = ({ dock, vehicles, operations, upcomingAppointment, recentlyUpdatedDocks, onSetMaintenanceClick, onClearMaintenance, onSelectItem, onBookAppointmentClick }) => {
    const statusStyles = {
        [DockStatus.Available]: 'border-status-green',
        [DockStatus.Occupied]: 'border-status-yellow',
        [DockStatus.Maintenance]: 'border-status-red',
    };
    
    const isHighlighted = recentlyUpdatedDocks.includes(dock.id!);

    return (
        <div className={`w-full min-h-[460px] bg-white p-4 rounded-xl shadow-md flex flex-col transition-all duration-300 hover:shadow-lg hover:-translate-y-1 border-l-4 ${statusStyles[dock.status]} ${isHighlighted ? 'animate-pulse-bg' : ''}`} onClick={() => onSelectItem(dock)}>
            <div className="flex-grow">
                <div className="flex justify-between items-start mb-2">
                    <h3 className="text-lg font-bold text-gray-800 flex items-center gap-2">
                        {dock.name}
                        {dock.safetyComplianceTags?.includes('Cold Storage') && <span title="Refrigerated" className="text-cyan-500">{ICONS.snowflake}</span>}
                    </h3>
                </div>
                <div className="mb-4 flex items-center gap-2 flex-wrap">
                    {getStatusBadge(dock.status)}
                    {dock.status === DockStatus.Maintenance && dock.maintenanceType === 'ai' && (
                        <span className="flex items-center gap-1 px-2 py-0.5 text-xs font-semibold rounded-full bg-purple-100 text-purple-800">
                            <SparklesIcon className="w-3 h-3"/>
                            AI Recommended
                        </span>
                    )}
                </div>
                <div className="space-y-1 text-sm text-gray-600 mb-4">
                    <p><span className="font-semibold">Capacity:</span> {dock.capacity} truck(s)</p>
                    <p><span className="font-semibold">Last Maintenance:</span> {new Date(dock.lastMaintenance).toLocaleDateString()}</p>
                    {dock.operationsSinceMaintenance !== undefined && <p><span className="font-semibold">Ops Since Maint:</span> {dock.operationsSinceMaintenance}</p>}
                </div>
                {dock.notes && (
                    <div className="text-xs bg-gray-50 p-2 rounded-md mb-4">
                        <p className="text-gray-700 not-italic">{dock.notes}</p>
                    </div>
                )}
                {dock.status === DockStatus.Occupied && vehicles.length > 0 && (
                    <div className="p-3 bg-indigo-50 rounded-lg space-y-3">
                        {vehicles.map((vehicle, index) => {
                            const operation = operations.find(op => op.vehicleId === vehicle.id);
                            return (
                                <div key={vehicle.id} className={`cursor-pointer ${index > 0 ? 'mt-3 pt-3 border-t border-indigo-200/50' : ''}`} onClick={(e) => { e.stopPropagation(); onSelectItem(vehicle); }}>
                                    <div>
                                        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Vehicle Details</p>
                                        <div className="flex items-center mt-1">
                                            <div className="text-brand-accent">{ICONS.carriers}</div>
                                            <div className="ml-2">
                                                <p className="font-bold text-gray-800">{vehicle.id}</p>
                                                <p className="text-sm text-gray-600">{vehicle.carrier}</p>
                                            </div>
                                        </div>
                                    </div>
                                    {operation && <OperationProgress operation={operation} />}
                                </div>
                            );
                        })}
                    </div>
                )}
                 {dock.status === DockStatus.Available && upcomingAppointment && (
                    <div className="mt-4 pt-3 border-t border-dashed border-gray-200">
                        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Next Appointment</p>
                        <div className="flex items-center mt-2">
                            <div className="text-gray-400">{ICONS.appointments}</div>
                            <div className="ml-2">
                                <p className="font-bold text-gray-700">{upcomingAppointment.vehicleNumber}</p>
                                <p className="text-sm text-gray-600">{upcomingAppointment.transporter} at {new Date(upcomingAppointment.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                                <p className="text-xs text-gray-500">{upcomingAppointment.companyName}</p>
                            </div>
                        </div>
                    </div>
                )}
            </div>
            <div className="mt-auto pt-4 border-t flex flex-wrap gap-2">
                {dock.status === DockStatus.Available && (
                    <>
                        <button onClick={(e) => { e.stopPropagation(); onBookAppointmentClick(); }} className="flex-1 text-sm bg-blue-100 text-blue-800 font-semibold py-2 px-3 rounded-md hover:bg-blue-200 transition-colors">Book Appt.</button>
                        <button onClick={(e) => { e.stopPropagation(); onSetMaintenanceClick(); }} className="flex-1 text-sm bg-red-100 text-red-800 font-semibold py-2 px-3 rounded-md hover:bg-red-200 transition-colors">Set Maintenance</button>
                    </>
                )}
                {dock.status === DockStatus.Occupied && (
                    <button onClick={(e) => { e.stopPropagation(); onSetMaintenanceClick(); }} className="w-full text-sm bg-red-100 text-red-800 font-semibold py-2 px-3 rounded-md hover:bg-red-200 transition-colors">Set Maintenance</button>
                )}
                {dock.status === DockStatus.Maintenance && (
                     <button onClick={(e) => { e.stopPropagation(); onClearMaintenance(dock.id!); }} className="w-full text-sm bg-green-100 text-green-800 font-semibold py-2 px-3 rounded-md hover:bg-green-200 transition-colors">Clear Maintenance</button>
                )}
            </div>
        </div>
    );
};

const BayRow: React.FC<{
    docks: Dock[];
    renderDock: (dock: Dock) => React.ReactNode;
}> = ({ docks, renderDock }) => {
    const scrollContainerRef = useRef<HTMLDivElement>(null);
    const [canScrollLeft, setCanScrollLeft] = useState(false);
    const [canScrollRight, setCanScrollRight] = useState(false);

    const checkScrollability = useCallback(() => {
        const el = scrollContainerRef.current;
        if (el) {
            const hasOverflow = el.scrollWidth > el.clientWidth;
            setCanScrollLeft(el.scrollLeft > 5);
            setCanScrollRight(hasOverflow && el.scrollLeft < el.scrollWidth - el.clientWidth - 5);
        }
    }, []);

    useEffect(() => {
        const timer = setTimeout(() => checkScrollability(), 100);
        return () => clearTimeout(timer);
    }, [docks, checkScrollability]);

    useEffect(() => {
        const el = scrollContainerRef.current;
        if (el) {
            const handleScroll = () => checkScrollability();
            el.addEventListener('scroll', handleScroll, { passive: true });
            window.addEventListener('resize', checkScrollability);

            const resizeObserver = new ResizeObserver(checkScrollability);
            resizeObserver.observe(el);

            return () => {
                el.removeEventListener('scroll', handleScroll);
                window.removeEventListener('resize', checkScrollability);
                resizeObserver.disconnect();
            };
        }
    }, [checkScrollability]);

    const scroll = (direction: 'left' | 'right') => {
        const el = scrollContainerRef.current;
        if (el) {
            const scrollAmount = el.clientWidth * 0.8;
            el.scrollBy({
                left: direction === 'left' ? -scrollAmount : scrollAmount,
                behavior: 'smooth',
            });
        }
    };

    return (
        <div className="relative group/bay">
            <div
                ref={scrollContainerRef}
                className="flex items-stretch overflow-x-auto py-4 -mx-8 px-8 space-x-6 scrollbar-hide"
            >
                {docks.map(dock => renderDock(dock))}
            </div>

            <button
                onClick={() => scroll('left')}
                className={`absolute left-2 top-1/2 -translate-y-1/2 z-10 bg-white/80 backdrop-blur-sm rounded-full p-2 shadow-md hover:bg-white focus:outline-none transition-all duration-300 opacity-0 group-hover/bay:opacity-100 disabled:opacity-0 disabled:cursor-not-allowed`}
                aria-label="Scroll left"
                disabled={!canScrollLeft}
            >
                <ChevronLeftIcon className="w-6 h-6 text-gray-700" />
            </button>
            <button
                onClick={() => scroll('right')}
                className={`absolute right-2 top-1/2 -translate-y-1/2 z-10 bg-white/80 backdrop-blur-sm rounded-full p-2 shadow-md hover:bg-white focus:outline-none transition-all duration-300 opacity-0 group-hover/bay:opacity-100 disabled:opacity-0 disabled:cursor-not-allowed`}
                aria-label="Scroll right"
                disabled={!canScrollRight}
            >
                <ChevronRightIcon className="w-6 h-6 text-gray-700" />
            </button>
        </div>
    );
};

const Docks: React.FC<DocksProps> = ({ docks, vehicles, operations, timelineAppointments, automationMode, recentlyUpdatedDocks, onRunPredictiveMaintenance, onSetMaintenance, onClearMaintenance, onSelectItem, onBookAppointment }) => {
    const [maintenanceModal, setMaintenanceModal] = useState<{isOpen: boolean; dock: Dock | null}>({isOpen: false, dock: null});
    const [filterStatus, setFilterStatus] = useState<DockStatus | 'all'>('all');
    const [searchQuery, setSearchQuery] = useState('');
    const [bayFilter, setBayFilter] = useState<string>('all');

    const uniqueBays = useMemo(() => {
        return [...new Set(docks.map(d => d.location))].sort();
    }, [docks]);
    
    const handleMaintenanceSubmit = (notes: string) => {
        if (maintenanceModal.dock) {
            onSetMaintenance(maintenanceModal.dock.id!, notes);
        }
        setMaintenanceModal({isOpen: false, dock: null});
    };
    
    const summaryStats = useMemo(() => {
        const counts = {
            all: docks.length,
            [DockStatus.Available]: docks.filter(d => d.status === DockStatus.Available).length,
            [DockStatus.Occupied]: docks.filter(d => d.status === DockStatus.Occupied).length,
            [DockStatus.Maintenance]: docks.filter(d => d.status === DockStatus.Maintenance).length,
        };
        return [
            { label: 'All Docks', status: 'all' as const, count: counts.all, color: 'text-gray-700', bgColor: 'bg-gray-100' },
            { label: 'Available', status: DockStatus.Available, count: counts[DockStatus.Available], color: 'text-status-green', bgColor: 'bg-status-green/10' },
            { label: 'Occupied', status: DockStatus.Occupied, count: counts[DockStatus.Occupied], color: 'text-status-yellow', bgColor: 'bg-status-yellow/10' },
            { label: 'Maintenance', status: DockStatus.Maintenance, count: counts[DockStatus.Maintenance], color: 'text-status-red', bgColor: 'bg-status-red/10' },
        ];
    }, [docks]);
    
    const groupedDocks = useMemo(() => {
        const filtered = docks
            .filter(dock => bayFilter === 'all' || dock.location === bayFilter)
            .filter(dock => filterStatus === 'all' || dock.status === filterStatus)
            .filter(dock => dock.name.toLowerCase().includes(searchQuery.toLowerCase()) || dock.location.toLowerCase().includes(searchQuery.toLowerCase()));

        return filtered.reduce((acc, dock) => {
            (acc[dock.location] = acc[dock.location] || []).push(dock);
            return acc;
        }, {} as Record<string, Dock[]>);
    }, [docks, filterStatus, searchQuery, bayFilter]);
    const locations = Object.keys(groupedDocks).sort();

    const getVehiclesForDock = (dockId: string) => {
        return vehicles.filter(v => v.assignedDockId === dockId && v.status === VehicleStatus.Entered);
    };
    const getOperationsForDock = (dockId: string) => {
        const vehicleIdsAtDock = getVehiclesForDock(dockId).map(v => v.id);
        return operations.filter(op => vehicleIdsAtDock.includes(op.vehicleId) && (op.status === OperationStatus.InProgress || op.status === OperationStatus.Delayed));
    };
    const getNextAppointmentForDock = (dockId: string): TimelineAppointment | undefined => {
        const now = new Date();
        const todayStr = now.toISOString().split('T')[0];
    
        return timelineAppointments
            .filter(appt => {
                const apptDate = new Date(appt.startTime);
                return appt.dockId === dockId &&
                       apptDate.toISOString().split('T')[0] === todayStr &&
                       appt.status === 'Approved' &&
                       apptDate > now;
            })
            .sort((a, b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime())
        [0];
    };


    return (
        <div className="p-8">
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h1 className="text-3xl font-bold text-gray-800">Docks</h1>
                    <p className="text-gray-500">View dock locations, status, and maintenance.</p>
                </div>
                <div className="flex items-center space-x-3">
                    {automationMode === 'Automatic' && (
                         <button onClick={onRunPredictiveMaintenance} className="flex items-center space-x-2 bg-purple-100 text-purple-700 font-bold py-2 px-4 rounded-lg shadow-sm border border-purple-200 hover:bg-purple-200 transition-colors transform hover:scale-105">
                            {ICONS.sparkles}
                            <span>Run Predictive Maintenance</span>
                        </button>
                    )}
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                {summaryStats.map(stat => (
                    <button key={stat.status} onClick={() => setFilterStatus(stat.status)} className={`p-4 rounded-xl shadow-md transition-all duration-300 ${stat.bgColor} ${filterStatus === stat.status ? `ring-2 ring-brand-accent` : 'hover:shadow-lg hover:-translate-y-0.5'}`}>
                        <div className="flex justify-between items-center">
                            <span className={`text-lg font-bold ${stat.color}`}>{stat.label}</span>
                            <span className={`text-2xl font-extrabold ${stat.color}`}>{stat.count}</span>
                        </div>
                    </button>
                ))}
            </div>
            
             <div className="flex items-center gap-4 mb-6">
                <div className="relative flex-grow">
                    <input
                      type="text"
                      placeholder="Search by dock name or location..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full pl-10 pr-4 py-2 border bg-white rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-accent"
                    />
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      {ICONS.docks}
                    </div>
                </div>
                <div className="relative">
                    <select
                        value={bayFilter}
                        onChange={(e) => setBayFilter(e.target.value)}
                        className="appearance-none w-full md:w-56 bg-white border border-gray-300 rounded-lg pl-4 pr-10 py-2 text-gray-800 font-semibold focus:outline-none focus:ring-2 focus:ring-brand-accent"
                        aria-label="Filter by Bay"
                    >
                        <option value="all">All Bays</option>
                        {uniqueBays.map(bay => (
                            <option key={bay} value={bay}>{bay}</option>
                        ))}
                    </select>
                    <div className="absolute inset-y-0 right-0 flex items-center px-2 pointer-events-none">
                        <ChevronUpDownIcon className="w-5 h-5 text-gray-400" />
                    </div>
                </div>
            </div>
            
            <div className="space-y-8">
                {locations.map(location => (
                    <div key={location}>
                        <div className="flex items-center gap-4 mb-4 pb-2 border-b-2 border-gray-200">
                            <h2 className="text-2xl font-bold text-gray-700">{location}</h2>
                        </div>
                        <BayRow
                            docks={groupedDocks[location]}
                            renderDock={(dock) => {
                                const vehiclesForDock = getVehiclesForDock(dock.id!);
                                const operationsForDock = getOperationsForDock(dock.id!);
                                const upcomingAppointment = getNextAppointmentForDock(dock.id!);
                                return (
                                    <div key={dock.id} className="w-80 flex flex-shrink-0">
                                        <DockCard
                                            dock={dock}
                                            vehicles={vehiclesForDock}
                                            operations={operationsForDock}
                                            upcomingAppointment={upcomingAppointment}
                                            recentlyUpdatedDocks={recentlyUpdatedDocks}
                                            onSetMaintenanceClick={() => setMaintenanceModal({isOpen: true, dock: dock})}
                                            onClearMaintenance={onClearMaintenance}
                                            onSelectItem={onSelectItem}
                                            onBookAppointmentClick={() => onBookAppointment(dock.id!)}
                                        />
                                    </div>
                                );
                            }}
                        />
                    </div>
                ))}
            </div>

            {locations.length === 0 && (
                <div className="text-center bg-white p-10 rounded-xl shadow-md mt-6">
                    <h3 className="text-xl font-semibold text-gray-700">No Docks Found</h3>
                    <p className="text-gray-500 mt-2">Your search and filter criteria did not match any docks.</p>
                </div>
            )}

            <MaintenanceModal
                isOpen={maintenanceModal.isOpen}
                onClose={() => setMaintenanceModal({isOpen: false, dock: null})}
                onSubmit={handleMaintenanceSubmit}
                dockName={maintenanceModal.dock?.name || ''}
            />
        </div>
    );
};

export default Docks;