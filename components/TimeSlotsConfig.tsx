import React, { useState, useMemo, useRef, useCallback, useEffect } from 'react';
import { Warehouse, Dock } from '../types.ts';
import { InformationCircleIcon, PlusIcon, TrashIcon, ChevronLeftIcon, ChevronRightIcon, ClockIcon } from './icons/Icons.tsx';

interface TimeSlotsConfigProps {
    warehouses: Warehouse[];
    docks: Dock[];
}

type DayOfWeek = 'MONDAY' | 'TUESDAY' | 'WEDNESDAY' | 'THURSDAY' | 'FRIDAY' | 'SATURDAY' | 'SUNDAY';

interface TimeSlot {
    id: number;
    from: string;
    to: string;
}

const initialSlots: Record<DayOfWeek, TimeSlot[]> = {
    MONDAY: [
        { id: 1, from: '06:00', to: '10:00' },
        { id: 2, from: '11:00', to: '16:00' },
    ],
    TUESDAY: [
        { id: 1, from: '06:00', to: '10:00' },
        { id: 2, from: '11:00', to: '16:00' },
    ],
    WEDNESDAY: [
        { id: 1, from: '06:00', to: '10:00' },
        { id: 2, from: '11:00', to: '16:00' },
    ],
    THURSDAY: [
        { id: 1, from: '06:00', to: '10:00' },
        { id: 2, from: '11:00', to: '16:00' },
    ],
    FRIDAY: [
        { id: 1, from: '06:00', to: '10:00' },
        { id: 2, from: '11:00', to: '16:00' },
    ],
    SATURDAY: [],
    SUNDAY: [],
};

const TimeSlotsConfig: React.FC<TimeSlotsConfigProps> = ({ warehouses, docks }) => {
    const [selectedDockId, setSelectedDockId] = useState<string | undefined>(docks.length > 0 ? docks[0].id : undefined);
    const [activeTab, setActiveTab] = useState<'weekdays' | 'dates'>('weekdays');
    const [slots, setSlots] = useState(initialSlots);
    const [dateSlots, setDateSlots] = useState<Record<string, TimeSlot[]>>({});
    
    const scrollContainerRef = useRef<HTMLDivElement>(null);
    const [canScrollLeft, setCanScrollLeft] = useState(false);
    const [canScrollRight, setCanScrollRight] = useState(false);
    
    const dateScrollContainerRef = useRef<HTMLDivElement>(null);
    const [canDateScrollLeft, setCanDateScrollLeft] = useState(false);
    const [canDateScrollRight, setCanDateScrollRight] = useState(false);

    const dockOptions = useMemo(() => {
        const warehouseMap = new Map(warehouses.map(wh => [wh.id, wh.name]));
        return docks.map(dock => ({
            id: dock.id!,
            label: `${warehouseMap.get(dock.warehouseId) || 'Warehouse'}: ${dock.name}`
        }));
    }, [warehouses, docks]);

    const days: DayOfWeek[] = ['MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY'];

    const handleAddSlot = (day: DayOfWeek) => {
        setSlots(prev => ({
            ...prev,
            [day]: [...prev[day], { id: Date.now(), from: '09:00', to: '17:00' }]
        }));
    };

    const handleDeleteSlot = (day: DayOfWeek, id: number) => {
        setSlots(prev => ({
            ...prev,
            [day]: prev[day].filter(slot => slot.id !== id)
        }));
    };
    
    const handleSlotChange = (day: DayOfWeek, id: number, part: 'from' | 'to', value: string) => {
        setSlots(prev => ({
            ...prev,
            [day]: prev[day].map(slot => slot.id === id ? { ...slot, [part]: value } : slot)
        }));
    };
    
    const handleAddDate = () => {
        let dateToAdd = new Date();
        dateToAdd.setDate(dateToAdd.getDate() + 1);
        let dateString = dateToAdd.toISOString().split('T')[0];

        while (dateSlots[dateString]) {
            dateToAdd.setDate(dateToAdd.getDate() + 1);
            dateString = dateToAdd.toISOString().split('T')[0];
        }

        setDateSlots(prev => ({
            ...prev,
            [dateString]: [{ id: Date.now(), from: '09:00', to: '17:00' }]
        }));
    };

    const handleDeleteDate = (date: string) => {
        setDateSlots(prev => {
            const newState = { ...prev };
            delete newState[date];
            return newState;
        });
    };

    const handleDateChange = (oldDate: string, newDate: string) => {
        if (oldDate === newDate || dateSlots[newDate]) return;
        setDateSlots(prev => {
            const newState = { ...prev };
            newState[newDate] = newState[oldDate];
            delete newState[oldDate];
            return newState;
        });
    };

    const handleAddDateSlot = (date: string) => {
         setDateSlots(prev => ({
            ...prev,
            [date]: [...prev[date], { id: Date.now(), from: '09:00', to: '17:00' }]
        }));
    };

    const handleDeleteDateSlot = (date: string, id: number) => {
        setDateSlots(prev => ({
            ...prev,
            [date]: prev[date].filter(slot => slot.id !== id)
        }));
    };

    const handleDateSlotChange = (date: string, id: number, part: 'from' | 'to', value: string) => {
        setDateSlots(prev => ({
            ...prev,
            [date]: prev[date].map(slot => slot.id === id ? { ...slot, [part]: value } : slot)
        }));
    };


    const checkScrollability = useCallback(() => {
        const el = scrollContainerRef.current;
        if (el) {
            const hasOverflow = el.scrollWidth > el.clientWidth;
            setCanScrollLeft(el.scrollLeft > 5);
            setCanScrollRight(hasOverflow && el.scrollLeft < el.scrollWidth - el.clientWidth - 5);
        }
    }, []);

    useEffect(() => {
        const el = scrollContainerRef.current;
        if (el) {
            const timer = setTimeout(() => checkScrollability(), 100); 
            const handleScroll = () => checkScrollability();
            el.addEventListener('scroll', handleScroll, { passive: true });
            window.addEventListener('resize', checkScrollability);

            const resizeObserver = new ResizeObserver(checkScrollability);
            resizeObserver.observe(el);

            return () => {
                clearTimeout(timer);
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
    
    const checkDateScrollability = useCallback(() => {
        const el = dateScrollContainerRef.current;
        if (el) {
            const hasOverflow = el.scrollWidth > el.clientWidth;
            setCanDateScrollLeft(el.scrollLeft > 5);
            setCanDateScrollRight(hasOverflow && el.scrollLeft < el.scrollWidth - el.clientWidth - 5);
        }
    }, []);

    useEffect(() => {
        const el = dateScrollContainerRef.current;
        if (el) {
            const timer = setTimeout(() => checkDateScrollability(), 100);
            const handleScroll = () => checkDateScrollability();
            el.addEventListener('scroll', handleScroll, { passive: true });
            window.addEventListener('resize', checkDateScrollability);

            const resizeObserver = new ResizeObserver(checkDateScrollability);
            resizeObserver.observe(el);

            return () => {
                clearTimeout(timer);
                el.removeEventListener('scroll', handleScroll);
                window.removeEventListener('resize', checkDateScrollability);
                resizeObserver.disconnect();
            };
        }
    }, [checkDateScrollability, dateSlots]);

    const scrollDates = (direction: 'left' | 'right') => {
        const el = dateScrollContainerRef.current;
        if (el) {
            const scrollAmount = el.clientWidth * 0.8;
            el.scrollBy({
                left: direction === 'left' ? -scrollAmount : scrollAmount,
                behavior: 'smooth',
            });
        }
    };


    const TabButton: React.FC<{ label: string; name: 'weekdays' | 'dates' }> = ({ label, name }) => (
        <button
            onClick={() => setActiveTab(name)}
            className={`py-3 px-1 text-sm font-semibold transition-colors focus:outline-none ${
                activeTab === name
                ? 'text-brand-accent border-b-2 border-brand-accent'
                : 'text-gray-500 hover:text-gray-700'
            }`}
        >
            {label}
        </button>
    );

    const baseInputClasses = "w-full px-2 py-1 h-9 text-sm font-mono bg-gray-100 border-gray-200 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 text-gray-800";

    if (docks.length === 0) {
        return <div className="p-4">No docks have been configured. Please add a dock first.</div>;
    }

    return (
        <div className="h-full flex flex-col bg-white">
            <div className="flex-shrink-0 p-6 bg-white border-b flex flex-wrap justify-between items-center gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-gray-800">Time Slot Configuration</h1>
                    <p className="text-gray-500 mt-1">Manage booking availability for individual docks.</p>
                </div>
                <div>
                    <label className="text-sm font-medium text-gray-700 flex items-center gap-1 mb-1">
                        Choose Dock
                        <InformationCircleIcon className="w-4 h-4 text-gray-400" />
                    </label>
                    <select
                        value={selectedDockId}
                        onChange={e => setSelectedDockId(e.target.value)}
                        className="block w-72 p-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-brand-accent text-sm font-semibold text-gray-800 bg-white"
                    >
                        {dockOptions.map(option => <option key={option.id} value={option.id}>{option.label}</option>)}
                    </select>
                </div>
            </div>
            
            <div className="flex-shrink-0 border-b border-gray-200 px-6 bg-white">
                <nav className="-mb-px flex space-x-6">
                    <TabButton label="SLOTS FOR WEEKDAYS" name="weekdays" />
                    <TabButton label="SLOTS FOR SPECIFIC DATES" name="dates" />
                </nav>
            </div>

            <div className="flex-grow overflow-auto p-6 bg-white">
            {activeTab === 'weekdays' && (
                <div className="relative group/scroll-container">
                    <div ref={scrollContainerRef} className="overflow-x-auto scrollbar-hide pb-4">
                        <div className="flex space-x-6">
                            {days.map(day => (
                                <div key={day} className="w-80 flex-shrink-0 bg-white rounded-lg shadow-md border border-gray-200 flex flex-col">
                                    <div className="bg-primary-50 text-primary-800 p-3 rounded-t-lg">
                                        <h3 className="font-bold text-sm uppercase tracking-wider">{day}</h3>
                                    </div>
                                    <div className="bg-gray-50 text-gray-500 text-xs font-semibold grid grid-cols-5 gap-2 px-3 py-1 border-y border-gray-200">
                                        <span className="col-span-2">From</span>
                                        <span className="col-span-2">To</span>
                                    </div>
                                    <div className="p-3 space-y-1.5 flex-grow min-h-[200px]">
                                        {slots[day].length > 0 ? slots[day].map(slot => (
                                            <div key={slot.id} className="grid grid-cols-5 gap-2 items-center group">
                                                <div className="col-span-2">
                                                    <input
                                                        type="time"
                                                        value={slot.from}
                                                        onChange={e => handleSlotChange(day, slot.id, 'from', e.target.value)}
                                                        className={baseInputClasses}
                                                        style={{ colorScheme: 'light' }}
                                                    />
                                                </div>
                                                <div className="col-span-2">
                                                    <input
                                                        type="time"
                                                        value={slot.to}
                                                        onChange={e => handleSlotChange(day, slot.id, 'to', e.target.value)}
                                                        className={baseInputClasses}
                                                        style={{ colorScheme: 'light' }}
                                                    />
                                                </div>
                                                <div className="flex justify-end">
                                                    <button
                                                        onClick={() => handleDeleteSlot(day, slot.id)}
                                                        className="p-2 rounded-full text-gray-400 opacity-0 group-hover:opacity-100 hover:bg-red-100 hover:text-red-600 transition-all"
                                                        aria-label="Delete slot"
                                                    >
                                                        <TrashIcon className="w-5 h-5" />
                                                    </button>
                                                </div>
                                            </div>
                                        )) : <p className="text-center text-sm text-gray-400 pt-8">No slots defined.</p>}
                                    </div>
                                    <div className="p-3 border-t border-gray-200 mt-auto">
                                        <button
                                            onClick={() => handleAddSlot(day)}
                                            className="w-full flex justify-center items-center"
                                            aria-label={`Add slot for ${day}`}
                                        >
                                            <div className="w-8 h-8 rounded-full bg-gray-200 hover:bg-gray-300 transition-colors flex items-center justify-center">
                                                <PlusIcon className="w-5 h-5 text-gray-600" />
                                            </div>
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                    <button
                        onClick={() => scroll('left')}
                        className={`absolute left-0 top-1/2 -translate-y-1/2 z-10 bg-white/80 backdrop-blur-sm rounded-full p-2 shadow-md hover:bg-white focus:outline-none transition-all duration-300 opacity-0 group-hover/scroll-container:opacity-100 disabled:opacity-0 disabled:cursor-not-allowed`}
                        aria-label="Scroll left"
                        disabled={!canScrollLeft}
                    >
                        <ChevronLeftIcon className="w-6 h-6 text-gray-700" />
                    </button>
                    <button
                        onClick={() => scroll('right')}
                        className={`absolute right-0 top-1/2 -translate-y-1/2 z-10 bg-white/80 backdrop-blur-sm rounded-full p-2 shadow-md hover:bg-white focus:outline-none transition-all duration-300 opacity-0 group-hover/scroll-container:opacity-100 disabled:opacity-0 disabled:cursor-not-allowed`}
                        aria-label="Scroll right"
                        disabled={!canScrollRight}
                    >
                        <ChevronRightIcon className="w-6 h-6 text-gray-700" />
                    </button>
                </div>
            )}
            
            {activeTab === 'dates' && (
                 <div className="relative group/scroll-container-dates">
                    <div ref={dateScrollContainerRef} className="overflow-x-auto scrollbar-hide pb-4">
                        <div className="flex space-x-6">
                            {Object.entries(dateSlots).sort(([dateA], [dateB]) => new Date(dateA).getTime() - new Date(dateB).getTime()).map(([date, slotsForDate]) => (
                                <div key={date} className="w-80 flex-shrink-0 bg-white rounded-lg shadow-md border border-gray-200 flex flex-col">
                                    <div className="bg-primary-50 text-primary-800 p-3 rounded-t-lg flex justify-between items-center">
                                        <input
                                            type="date"
                                            value={date}
                                            onChange={e => handleDateChange(date, e.target.value)}
                                            className="font-bold text-sm uppercase tracking-wider bg-transparent border-none focus:ring-0 p-0"
                                        />
                                        <button
                                            onClick={() => handleDeleteDate(date)}
                                            className="p-1 rounded-full text-primary-600 hover:bg-red-100 hover:text-red-600 transition-all"
                                            aria-label="Delete all slots for this date"
                                        >
                                            <TrashIcon className="w-4 h-4" />
                                        </button>
                                    </div>
                                    <div className="bg-gray-50 text-gray-500 text-xs font-semibold grid grid-cols-5 gap-2 px-3 py-1 border-y border-gray-200">
                                        <span className="col-span-2">From</span>
                                        <span className="col-span-2">To</span>
                                    </div>
                                    <div className="p-3 space-y-1.5 flex-grow min-h-[200px]">
                                        {slotsForDate.length > 0 ? slotsForDate.map(slot => (
                                            <div key={slot.id} className="grid grid-cols-5 gap-2 items-center group">
                                                <div className="col-span-2">
                                                    <input
                                                        type="time"
                                                        value={slot.from}
                                                        onChange={e => handleDateSlotChange(date, slot.id, 'from', e.target.value)}
                                                        className={baseInputClasses}
                                                        style={{ colorScheme: 'light' }}
                                                    />
                                                </div>
                                                <div className="col-span-2">
                                                    <input
                                                        type="time"
                                                        value={slot.to}
                                                        onChange={e => handleDateSlotChange(date, slot.id, 'to', e.target.value)}
                                                        className={baseInputClasses}
                                                        style={{ colorScheme: 'light' }}
                                                    />
                                                </div>
                                                <div className="flex justify-end">
                                                    <button
                                                        onClick={() => handleDeleteDateSlot(date, slot.id)}
                                                        className="p-2 rounded-full text-gray-400 opacity-0 group-hover:opacity-100 hover:bg-red-100 hover:text-red-600 transition-all"
                                                        aria-label="Delete slot"
                                                    >
                                                        <TrashIcon className="w-5 h-5" />
                                                    </button>
                                                </div>
                                            </div>
                                        )) : <p className="text-center text-sm text-gray-400 pt-8">No slots defined (Dock is closed).</p>}
                                    </div>
                                    <div className="p-3 border-t border-gray-200 mt-auto">
                                        <button
                                            onClick={() => handleAddDateSlot(date)}
                                            className="w-full flex justify-center items-center"
                                            aria-label={`Add slot for ${date}`}
                                        >
                                            <div className="w-8 h-8 rounded-full bg-gray-200 hover:bg-gray-300 transition-colors flex items-center justify-center">
                                                <PlusIcon className="w-5 h-5 text-gray-600" />
                                            </div>
                                        </button>
                                    </div>
                                </div>
                            ))}
                            
                            <div className="w-80 flex-shrink-0">
                                <button
                                    onClick={handleAddDate}
                                    className="w-full h-full min-h-[380px] bg-white rounded-lg shadow-md border-2 border-dashed border-gray-300 flex flex-col items-center justify-center text-gray-400 hover:border-brand-accent hover:text-brand-accent hover:bg-indigo-50/50 transition-all duration-300 group"
                                >
                                    <ClockIcon className="w-12 h-12 text-gray-300 group-hover:text-brand-accent transition-colors" />
                                    <span className="mt-4 font-bold text-lg">Add Time Slot</span>
                                    <span className="text-sm">for a specific date</span>
                                </button>
                            </div>
                        </div>
                    </div>
                     <button
                        onClick={() => scrollDates('left')}
                        className={`absolute left-0 top-1/2 -translate-y-1/2 z-10 bg-white/80 backdrop-blur-sm rounded-full p-2 shadow-md hover:bg-white focus:outline-none transition-all duration-300 opacity-0 group-hover/scroll-container-dates:opacity-100 disabled:opacity-0 disabled:cursor-not-allowed`}
                        aria-label="Scroll left"
                        disabled={!canDateScrollLeft}
                    >
                        <ChevronLeftIcon className="w-6 h-6 text-gray-700" />
                    </button>
                    <button
                        onClick={() => scrollDates('right')}
                        className={`absolute right-0 top-1/2 -translate-y-1/2 z-10 bg-white/80 backdrop-blur-sm rounded-full p-2 shadow-md hover:bg-white focus:outline-none transition-all duration-300 opacity-0 group-hover/scroll-container-dates:opacity-100 disabled:opacity-0 disabled:cursor-not-allowed`}
                        aria-label="Scroll right"
                        disabled={!canDateScrollRight}
                    >
                        <ChevronRightIcon className="w-6 h-6 text-gray-700" />
                    </button>
                </div>
            )}
            </div>
        </div>
    );
};

export default TimeSlotsConfig;