

import React from 'react';
import { TimelineAppointment, TimelineDock, TimelineAppointmentStatus, AppSettings } from '../types.ts';
import { PlusIcon, ChevronLeftIcon, ChevronRightIcon, SparklesIcon, ListBulletIcon, SearchIcon } from './icons/Icons.tsx';
import { ICONS } from '../constants.tsx';
import AppointmentList from './AppointmentList.tsx';

interface AppointmentsProps {
    appointments: TimelineAppointment[];
    docks: TimelineDock[];
    onOpenCreatePanel: (createData?: { time: Date, dockId: string }) => void;
    onOpenEditPanel: (appointment: TimelineAppointment) => void;
    onOpenSlotFinder: () => void;
    settings: AppSettings;
}

const formatDate = (date: Date) => date.toISOString().split('T')[0];
const formatTime = (date: Date) => date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false });

const AppointmentBlock: React.FC<{ appointment: TimelineAppointment, onSelect: () => void, layout: { width: string; left: string; }, START_HOUR: number, HOUR_HEIGHT: number }> = ({ appointment, onSelect, layout, START_HOUR, HOUR_HEIGHT }) => {
    const startTime = new Date(appointment.startTime);
    const endTime = new Date(appointment.endTime);

    const startMinutes = startTime.getHours() * 60 + startTime.getMinutes();
    const endMinutes = endTime.getHours() * 60 + endTime.getMinutes();

    const top = ((startMinutes - (START_HOUR * 60)) / 60) * HOUR_HEIGHT;
    const height = ((endMinutes - startMinutes) / 60) * HOUR_HEIGHT;

    if (height <= 0) return null;

    const statusStyles: { [key in TimelineAppointmentStatus]: string } = {
        'Draft': 'border-timeline-waiting',
        'Approved': 'border-timeline-approved',
        'Cancelled': 'border-timeline-cancelled',
        'Completed': 'border-timeline-done'
    };
    const borderClass = statusStyles[appointment.status] || 'border-gray-400';

    const DetailRow: React.FC<{ label: string; value: string }> = ({ label, value }) => (
        <div className="flex justify-between items-baseline">
            <span className="font-semibold text-gray-400 text-xs uppercase tracking-wider">{label}</span>
            <span className="font-medium text-gray-100 text-sm truncate">{value}</span>
        </div>
    );

    return (
        <div
            className="absolute group"
            style={{
                top: `${top}px`,
                height: `${height}px`,
                minHeight: '30px',
                transition: 'left 0.2s, width 0.2s',
                ...layout
            }}
        >
            <div
                onClick={onSelect}
                className={`w-full h-full p-2 rounded-lg cursor-pointer shadow-md group-hover:shadow-xl transition-all duration-200 ease-in-out transform group-hover:scale-[1.01] bg-white border-l-4 ${borderClass}`}
            >
                <p className={`font-bold text-sm text-gray-800 truncate`}>{appointment.companyName}</p>
                <p className="text-xs text-gray-700 leading-tight truncate">{appointment.vehicleNumber}</p>
                <p className="text-xs text-gray-500 mt-0.5">{formatTime(startTime)} - {formatTime(endTime)}</p>
            </div>

            {/* The hover popup */}
            <div
                className="absolute z-40 bottom-full mb-2 w-72 p-3 bg-brand-dark text-white rounded-lg shadow-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none left-1/2 -translate-x-1/2"
                aria-hidden="true"
            >
                <h4 className="font-bold text-base border-b border-brand-light pb-2 mb-3">{appointment.companyName}</h4>
                <div className="space-y-2 text-sm">
                    <DetailRow label="ID" value={appointment.appointmentId || 'N/A'} />
                    <DetailRow label="Driver" value={appointment.driverName} />
                    <DetailRow label="Vehicle" value={`${appointment.vehicleNumber}`} />
                    <DetailRow label="Carrier" value={`${appointment.transporter}`} />
                    <DetailRow label="Purpose" value={appointment.purposeOfVisit} />
                    <DetailRow label="Load" value={`${appointment.quantity} of ${appointment.loadType}`} />
                    <DetailRow label="Status" value={appointment.status} />
                </div>
                 {/* Arrow pointing down */}
                 <div className="absolute left-1/2 -translate-x-1/2 top-full w-0 h-0 border-x-8 border-x-transparent border-t-8 border-t-brand-dark"></div>
            </div>
        </div>
    );
};

const LiveTimeTracker: React.FC<{ isVisible: boolean, START_HOUR: number, END_HOUR: number, SLOT_HEIGHT: number }> = ({ isVisible, START_HOUR, END_HOUR, SLOT_HEIGHT }) => {
    const [now, setNow] = React.useState(new Date());

    React.useEffect(() => {
        const timerId = setInterval(() => setNow(new Date()), 60000); // Update every minute
        return () => clearInterval(timerId);
    }, []);

    if (!isVisible) {
        return null;
    }

    const currentHour = now.getHours();
    const currentMinute = now.getMinutes();

    // Hide tracker if outside of business hours
    if (currentHour < START_HOUR || currentHour >= END_HOUR) {
        return null;
    }

    const minutesSinceStart = (currentHour - START_HOUR) * 60 + currentMinute;
    const topPosition = (minutesSinceStart / 30) * SLOT_HEIGHT;

    return (
        <div 
            className="absolute left-20 right-0 z-30 pointer-events-none" 
            style={{ top: `${topPosition}px`, transform: 'translateY(-1px)' }}
            aria-hidden="true"
        >
            <div className="relative h-0.5 bg-red-500">
                <div className="absolute -left-2 -top-[5px] w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-white shadow-md"></div>
                <span className="absolute -top-[11px] left-2 text-xs font-bold text-white bg-red-500 px-2 py-0.5 rounded-full shadow-md">
                    NOW
                </span>
            </div>
        </div>
    );
};


export const Appointments: React.FC<AppointmentsProps> = ({ appointments, docks, onOpenCreatePanel, onOpenEditPanel, onOpenSlotFinder, settings }) => {
    const { start: START_HOUR, end: END_HOUR } = settings.general.operationalHours;
    const HOUR_HEIGHT = 120; // Increased height
    const SLOT_HEIGHT = HOUR_HEIGHT / 2;
    const TOTAL_HOURS = END_HOUR - START_HOUR > 0 ? END_HOUR - START_HOUR : 1;

    const [currentDate, setCurrentDate] = React.useState(new Date());
    const [viewMode, setViewMode] = React.useState<'timeline' | 'list'>('timeline');
    const timelineContainerRef = React.useRef<HTMLDivElement>(null);
    const [searchQuery, setSearchQuery] = React.useState('');
    const [statusFilter, setStatusFilter] = React.useState<TimelineAppointmentStatus | 'all'>('all');
    const [typeFilter, setTypeFilter] = React.useState<'Inbound' | 'Outbound' | 'Transfer' | 'all'>('all');

    const isToday = React.useMemo(() => {
        return formatDate(currentDate) === formatDate(new Date());
    }, [currentDate]);

    const filteredAppointments = React.useMemo(() => {
        const todayStr = formatDate(currentDate);
        const query = searchQuery.toLowerCase();

        return appointments
            .filter(a => formatDate(new Date(a.startTime)) === todayStr)
            .filter(a => statusFilter === 'all' || a.status === statusFilter)
            .filter(a => typeFilter === 'all' || a.appointmentType === typeFilter)
            .filter(a => 
                !query ||
                a.appointmentId?.toLowerCase().includes(query) ||
                a.companyName.toLowerCase().includes(query) ||
                a.vehicleNumber.toLowerCase().includes(query) ||
                a.transporter.toLowerCase().includes(query) ||
                a.driverName.toLowerCase().includes(query)
            )
            .sort((a,b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime());
    }, [appointments, currentDate, searchQuery, statusFilter, typeFilter]);

    const laidOutAppointments = React.useMemo(() => {
        const appointmentsByDock: Record<string, TimelineAppointment[]> = {};
        for (const appt of filteredAppointments) {
            if (!appointmentsByDock[appt.dockId]) {
                appointmentsByDock[appt.dockId] = [];
            }
            appointmentsByDock[appt.dockId].push(appt);
        }
    
        const allLaidOut: (TimelineAppointment & { layout: { width: string; left: string } })[] = [];
    
        for (const dockId in appointmentsByDock) {
            const appointmentsForDock = appointmentsByDock[dockId];
            type NodeType = typeof appointmentsForDock[0] & { temp: { overlaps: Set<string> } };
            const nodes = appointmentsForDock.map(appt => ({ ...appt, temp: { overlaps: new Set<string>() } }));
    
            for (let i = 0; i < nodes.length; i++) {
                for (let j = i + 1; j < nodes.length; j++) {
                    const a = nodes[i];
                    const b = nodes[j];
                    const aStart = new Date(a.startTime).getTime();
                    const aEnd = new Date(a.endTime).getTime();
                    const bStart = new Date(b.startTime).getTime();
                    const bEnd = new Date(b.endTime).getTime();
    
                    if (aStart < bEnd && bStart < aEnd) {
                        a.temp.overlaps.add(b.id);
                        b.temp.overlaps.add(a.id);
                    }
                }
            }
    
            const visited = new Set<string>();
            const conflictGroups: NodeType[][] = [];
            for (const node of nodes) {
                if (!visited.has(node.id)) {
                    const group: NodeType[] = [];
                    const queue = [node];
                    visited.add(node.id);
                    while (queue.length > 0) {
                        const current = queue.shift()!;
                        group.push(current);
                        current.temp.overlaps.forEach(neighborId => {
                            if (!visited.has(neighborId)) {
                                visited.add(neighborId);
                                const neighborNode = nodes.find(n => n.id === neighborId);
                                if (neighborNode) queue.push(neighborNode);
                            }
                        });
                    }
                    conflictGroups.push(group);
                }
            }
    
            for (const group of conflictGroups) {
                group.sort((a, b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime());
                
                const columns: { appts: NodeType[] }[] = [];
                for (const appt of group) {
                    let placed = false;
                    const startTime = new Date(appt.startTime).getTime();
                    for (let i = 0; i < columns.length; i++) {
                        const col = columns[i];
                        const lastInCol = col.appts[col.appts.length - 1];
                        if (new Date(lastInCol.endTime).getTime() <= startTime) {
                            col.appts.push(appt);
                            (appt as any).columnIndex = i;
                            placed = true;
                            break;
                        }
                    }
                    if (!placed) {
                        const newColIndex = columns.length;
                        columns.push({ appts: [appt] });
                        (appt as any).columnIndex = newColIndex;
                    }
                }
    
                const numColumns = columns.length || 1;
                for (const appt of group) {
                    const columnIndex = (appt as any).columnIndex;
                    delete (appt as any).temp;
                    delete (appt as any).columnIndex;
                    allLaidOut.push({
                        ...appt,
                        layout: {
                            width: `calc(${100 / numColumns}% - 4px)`,
                            left: `calc(${(100 / numColumns) * columnIndex}% + 2px)`,
                        }
                    });
                }
            }
        }
    
        return allLaidOut;
    }, [filteredAppointments]);


    React.useEffect(() => {
        if (viewMode === 'timeline' && timelineContainerRef.current) {
            if (isToday) {
                const now = new Date();
                const currentHour = now.getHours();
                if (currentHour >= START_HOUR && currentHour < END_HOUR) {
                    const minutesSinceStart = (currentHour - START_HOUR) * 60 + now.getMinutes();
                    const trackerPosition = (minutesSinceStart / 30) * SLOT_HEIGHT;
                    const newScrollTop = trackerPosition - (timelineContainerRef.current.offsetHeight / 2);
                    timelineContainerRef.current.scrollTop = Math.max(0, newScrollTop);
                } else {
                    timelineContainerRef.current.scrollTop = 0;
                }
            } else {
                timelineContainerRef.current.scrollTop = 0;
            }
        }
    }, [currentDate, isToday, viewMode, START_HOUR, END_HOUR, SLOT_HEIGHT]);
    
    const openCreateModal = (date: Date, dockId: string, hour: number, minute: number) => {
        const time = new Date(date);
        time.setHours(hour, minute, 0, 0);
        onOpenCreatePanel({ time, dockId });
    }

    const changeDate = (amount: number) => {
        setCurrentDate(d => {
            const newDate = new Date(d);
            newDate.setDate(d.getDate() + amount);
            return newDate;
        });
    };
    
    const ViewToggle: React.FC = () => (
        <div className="flex items-center p-1 bg-gray-200 rounded-lg">
             <button
                onClick={() => setViewMode('timeline')}
                className={`flex items-center gap-2 px-3 py-1 text-sm font-semibold rounded-md transition-colors ${viewMode === 'timeline' ? 'bg-white text-primary-600 shadow' : 'text-gray-600 hover:bg-gray-100'}`}
            >
                {React.cloneElement(ICONS.toggleCalendar, {className: 'w-4 h-4'})}
                Timeline
            </button>
            <button
                onClick={() => setViewMode('list')}
                className={`flex items-center gap-2 px-3 py-1 text-sm font-semibold rounded-md transition-colors ${viewMode === 'list' ? 'bg-white text-primary-600 shadow' : 'text-gray-600 hover:bg-gray-100'}`}
            >
                <ListBulletIcon className="w-4 h-4" />
                List
            </button>
        </div>
    );

    const baseSelectClasses = "bg-white border border-gray-300 rounded-md px-4 py-2 text-sm text-gray-600 focus:outline-none focus:ring-2 focus:ring-primary-500 transition-colors";

    return (
        <div className="flex flex-col h-full bg-gray-50 text-gray-800">
            <div className="flex-shrink-0 p-4 border-b border-gray-200 space-y-4">
                <div className="flex justify-between items-center">
                    <h1 className="text-3xl font-bold text-gray-800">Appointments</h1>
                    <div className="flex items-center gap-2">
                        <button onClick={onOpenSlotFinder} className="flex items-center gap-2 px-3 py-2 bg-purple-100 text-purple-700 rounded-md shadow-sm hover:bg-purple-200 transition-colors">
                            <SparklesIcon className="w-5 h-5" />
                            <span className="text-sm font-semibold">Find Best Slot</span>
                        </button>
                        <button onClick={() => onOpenCreatePanel({time: currentDate, dockId: docks[0].id})} className="flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-md shadow-sm hover:bg-primary-700 transition-colors">
                            <PlusIcon className="w-5 h-5" />
                            <span className="text-sm font-semibold">New Appointment</span>
                        </button>
                    </div>
                </div>

                <div className="flex justify-between items-center flex-wrap gap-4">
                    <div className="flex items-center gap-4 flex-wrap">
                        {/* Search and Filters */}
                        <div className="relative">
                            <input
                                type="text"
                                placeholder="Search..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-48 pl-10 pr-4 py-2 border bg-white rounded-lg focus:outline-none focus:ring-primary-500 text-sm"
                            />
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <SearchIcon className="h-5 w-5 text-gray-400" />
                            </div>
                        </div>
                        <select value={statusFilter} onChange={e => setStatusFilter(e.target.value as any)} className={baseSelectClasses}>
                            <option value="all">All Statuses</option>
                            <option value="Draft">Draft</option>
                            <option value="Approved">Approved</option>
                            <option value="Completed">Completed</option>
                            <option value="Cancelled">Cancelled</option>
                        </select>
                        <select value={typeFilter} onChange={e => setTypeFilter(e.target.value as any)} className={baseSelectClasses}>
                            <option value="all">All Types</option>
                            <option value="Inbound">Inbound</option>
                            <option value="Outbound">Outbound</option>
                            <option value="Transfer">Transfer</option>
                        </select>
                    </div>

                    <div className="flex items-center gap-4 flex-wrap">
                        {/* Date Controls */}
                        <h2 className="text-lg font-semibold text-gray-700">{currentDate.toLocaleDateString('en-US', {weekday: 'long', month: 'long', day: 'numeric', year: 'numeric'})}</h2>
                        <div className="flex items-center gap-1">
                            <button onClick={() => changeDate(-1)} className="p-1.5 rounded-full text-gray-500 hover:bg-gray-200 transition-colors" aria-label="Previous day"><ChevronLeftIcon className="w-5 h-5" /></button>
                            <button onClick={() => changeDate(1)} className="p-1.5 rounded-full text-gray-500 hover:bg-gray-200 transition-colors" aria-label="Next day"><ChevronRightIcon className="w-5 h-5" /></button>
                        </div>
                        <button onClick={() => setCurrentDate(new Date())} className="px-4 py-2 text-sm font-semibold border border-gray-300 bg-white rounded-md hover:bg-gray-100">Today</button>
                        <ViewToggle />
                    </div>
                </div>
            </div>
            
            {viewMode === 'timeline' ? (
                <div ref={timelineContainerRef} className="flex-1 overflow-auto">
                    <div className="relative flex" style={{minWidth: `${docks.length * 200 + 80}px`}}>
                        <div className="w-20 text-sm text-right pr-2 sticky left-0 z-20 bg-gray-50/95 backdrop-blur-sm">
                            <div className="h-12" /> {/* Spacer for header */}
                            {Array.from({ length: TOTAL_HOURS * 2 }).map((_, i) => {
                                const hour = START_HOUR + Math.floor(i / 2);
                                const minute = (i % 2) * 30;
                                return (
                                    <div key={i} style={{ height: `${SLOT_HEIGHT}px` }} className="relative">
                                        <span className="absolute -top-2.5 right-2 text-gray-500 font-medium">
                                            {`${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`}
                                        </span>
                                    </div>
                                );
                            })}
                        </div>
                        <div className="flex-1 grid" style={{ gridTemplateColumns: `repeat(${docks.length}, minmax(0, 1fr))` }}>
                            {docks.map((dock) => (
                                <div key={dock.id} className="relative border-l border-gray-200">
                                    <div className="h-12 sticky top-0 bg-white/80 backdrop-blur-sm z-10 border-b border-l border-gray-200 -ml-px flex items-center justify-center p-2">
                                        <h3 className="font-semibold text-gray-700 text-center">{dock.name}</h3>
                                    </div>
                                    <div className="relative" style={{ height: `${TOTAL_HOURS * HOUR_HEIGHT}px` }}>
                                        {Array.from({ length: TOTAL_HOURS * 2 }).map((_, i) => {
                                            const isHour = i % 2 === 0;
                                            const hour = START_HOUR + Math.floor(i / 2);
                                            const minute = (i % 2) * 30;
                                            return (
                                                <div 
                                                    key={i} 
                                                    onClick={() => openCreateModal(currentDate, dock.id, hour, minute)}
                                                    className={`group relative flex items-center justify-center border-b ${isHour ? 'border-gray-200' : 'border-dashed border-gray-200/70'} hover:bg-primary-50 cursor-pointer transition-colors`}
                                                    style={{height: `${SLOT_HEIGHT}px`}}>
                                                    <PlusIcon className="w-5 h-5 text-primary-400 opacity-0 group-hover:opacity-100 transition-opacity" />
                                                </div>
                                            );
                                        })}
                                        {laidOutAppointments.filter(appt => appt.dockId === dock.id && new Date(appt.startTime).getHours() >= START_HOUR && new Date(appt.startTime).getHours() < END_HOUR).map(appt => (
                                            <AppointmentBlock key={appt.id} appointment={appt} onSelect={() => onOpenEditPanel(appt)} layout={appt.layout} START_HOUR={START_HOUR} HOUR_HEIGHT={HOUR_HEIGHT} />
                                        ))}
                                    </div>
                                </div>
                            ))}
                        </div>
                        <LiveTimeTracker isVisible={isToday} START_HOUR={START_HOUR} END_HOUR={END_HOUR} SLOT_HEIGHT={SLOT_HEIGHT} />
                    </div>
                </div>
            ) : (
                <div className="flex-1 overflow-auto p-4">
                    <AppointmentList 
                        appointments={filteredAppointments} 
                        onOpenEditPanel={onOpenEditPanel}
                    />
                </div>
            )}
        </div>
    );
};
