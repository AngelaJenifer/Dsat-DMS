import React, { useState, useMemo } from 'react';
import { 
    TruckIcon, 
    AppointmentsIcon, 
    PlayCircleIcon,
    ChartBarIcon,
    StarIcon,
    SearchIcon,
    UserIcon,
    DocksIcon
} from './icons/Icons.tsx';

// Data for all available reports, tailored for a dock management system
const ALL_REPORTS = [
    // Appointments Summary
    { id: 'appt_summary', title: 'Appointments Summary', description: 'Total appointments by day, week, or month.', category: 'Appointments Summary' },
    { id: 'appt_warehouse_breakdown', title: 'Warehouse Breakdown', description: 'Appointment breakdown by warehouse.', category: 'Appointments Summary' },
    { id: 'appt_op_type_breakdown', title: 'Operation Type Breakdown', description: 'Appointment breakdown by operation type (Inbound/Outbound).', category: 'Appointments Summary' },
    { id: 'appt_dock_usage_breakdown', title: 'Dock Usage Breakdown', description: 'Appointment breakdown by individual dock usage.', category: 'Appointments Summary' },
    
    // Dock Utilization
    { id: 'dock_usage_idle', title: 'Dock Usage vs. Idle Time', description: 'Total usage time versus idle time per dock.', category: 'Dock Utilization' },
    { id: 'dock_peak_activity', title: 'Peak Dock Activity', description: 'Analysis of peak dock activity hours.', category: 'Dock Utilization' },
    { id: 'dock_vehicle_dwell', title: 'Vehicle Dwell Time', description: 'Average time spent per vehicle at the dock.', category: 'Dock Utilization' },
    
    // Vehicle Movement
    { id: 'vehicle_check_in_out', title: 'Check-In / Check-Out Log', description: 'Detailed logs of all vehicle check-ins and check-outs.', category: 'Vehicle Movement' },
    { id: 'vehicle_yard_transfers', title: 'Yard to Dock Transfers', description: 'Logs of all vehicle movements from the yard to a dock.', category: 'Vehicle Movement' },
    { id: 'vehicle_delay_reassignment', title: 'Delay & Reassignment Report', description: 'Analysis of delayed vehicles or dock reassignments.', category: 'Vehicle Movement' },
    
    // Driver Performance & Carrier Insights
    { id: 'driver_on_time', title: 'On-Time Arrival Performance', description: 'Number and percentage of on-time arrivals by carrier.', category: 'Driver Performance & Carrier Insights' },
    { id: 'driver_repeat_delays', title: 'Repeat Delay Analysis', description: 'Identify repeat delays by driver or carrier.', category: 'Driver Performance & Carrier Insights' },
    { id: 'driver_behavior', title: 'Driver Behavior Report', description: 'Analysis of driver check-in and check-out behavior patterns.', category: 'Driver Performance & Carrier Insights' },
    
    // Operation Trends
    { id: 'ops_volume_trends', title: 'Operation Volume Trends', description: 'Total Inbound, Outbound, and Transfer operations per week/month.', category: 'Operation Trends' },
    { id: 'ops_top_docks', title: 'Top Used Docks', description: 'Report on the most frequently used docks.', category: 'Operation Trends' },
    { id: 'ops_handled_goods', title: 'Handled Goods Analysis', description: 'Analysis of the most frequently handled goods types.', category: 'Operation Trends' },
];


const Reports: React.FC = () => {
    const [selectedCategory, setSelectedCategory] = useState('All Reports');
    const [searchTerm, setSearchTerm] = useState('');

    const categories = useMemo(() => {
        const counts = ALL_REPORTS.reduce((acc, report) => {
            acc[report.category] = (acc[report.category] || 0) + 1;
            return acc;
        }, {} as Record<string, number>);
        
        const categoryList = [
            { name: 'Saved', count: 0, icon: <StarIcon className="w-5 h-5 text-gray-400" /> },
            { name: 'Appointments Summary', count: counts['Appointments Summary'] || 0, icon: <AppointmentsIcon className="w-5 h-5 text-gray-400" /> },
            { name: 'Dock Utilization', count: counts['Dock Utilization'] || 0, icon: <DocksIcon className="w-5 h-5 text-gray-400" /> },
            { name: 'Vehicle Movement', count: counts['Vehicle Movement'] || 0, icon: <TruckIcon className="w-5 h-5 text-gray-400" /> },
            { name: 'Driver Performance & Carrier Insights', count: counts['Driver Performance & Carrier Insights'] || 0, icon: <UserIcon className="w-5 h-5 text-gray-400" /> },
            { name: 'Operation Trends', count: counts['Operation Trends'] || 0, icon: <ChartBarIcon className="w-5 h-5 text-gray-400" /> },
        ];

        return [
            { name: 'All Reports', count: ALL_REPORTS.length, icon: <ChartBarIcon className="w-5 h-5 text-gray-400" /> },
            ...categoryList
        ];
    }, []);

    const filteredReports = useMemo(() => {
        return ALL_REPORTS.filter(report => {
            const categoryMatch = selectedCategory === 'All Reports' || report.category === selectedCategory;
            const searchMatch = searchTerm === '' ||
                report.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                report.description.toLowerCase().includes(searchTerm.toLowerCase());
            return categoryMatch && searchMatch;
        });
    }, [selectedCategory, searchTerm]);

    return (
        <div className="p-8 h-full flex flex-col bg-gray-50">
            {/* Page Header */}
            <div className="flex-shrink-0 mb-6">
                <h1 className="text-3xl font-bold text-gray-800">Reports</h1>
                <p className="text-gray-500 mt-1">
                    Track and analyze operations, vehicle movements, dock performance, and more — all in one place.
                </p>
            </div>

            {/* Main content area */}
            <div className="flex-grow flex gap-8 min-h-0">
                {/* Sidebar */}
                <aside className="w-full max-w-xs flex-shrink-0">
                    <div className="bg-white p-6 rounded-xl shadow-md h-full overflow-y-auto scrollbar-hide">
                        <div className="relative mb-6">
                            <input
                                type="text"
                                placeholder="Search report here..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full pl-10 pr-4 py-2 border bg-white rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-accent text-sm"
                            />
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                               <SearchIcon className="h-5 w-5 text-gray-400" />
                            </div>
                        </div>
                        
                        <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-3">Report Types</h2>
                        <nav>
                            <ul>
                                {categories.map(cat => (
                                    <li key={cat.name}>
                                        <button
                                            onClick={() => setSelectedCategory(cat.name)}
                                            className={`w-full flex justify-between items-center p-3 my-1 rounded-lg text-left transition-colors duration-200 ${selectedCategory === cat.name ? 'bg-indigo-50 text-brand-accent' : 'text-gray-600 hover:bg-gray-100'}`}
                                        >
                                            <div className="flex items-center gap-3">
                                                {cat.icon}
                                                <span className="font-semibold">{cat.name}</span>
                                            </div>
                                            <span className={`px-2 py-0.5 text-xs font-bold rounded-full ${selectedCategory === cat.name ? 'bg-brand-accent text-white' : 'bg-gray-200 text-gray-600'}`}>
                                                {cat.count}
                                            </span>
                                        </button>
                                    </li>
                                ))}
                            </ul>
                        </nav>
                    </div>
                </aside>
                
                {/* Main content */}
                <main className="flex-1 overflow-y-auto pr-2 scrollbar-hide">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {filteredReports.length > 0 ? filteredReports.map(report => (
                            <div key={report.id} className="bg-white p-6 rounded-xl shadow-md flex flex-col justify-between hover:shadow-lg hover:-translate-y-1 transition-all min-h-56">
                                <div>
                                    <h3 className="font-bold text-gray-800">{report.title}</h3>
                                    <p className="text-sm text-gray-500 mt-2 line-clamp-3">{report.description}</p>
                                </div>
                                <div className="flex justify-between items-center mt-4">
                                    <span className="bg-gray-100 text-gray-600 text-xs font-semibold px-2.5 py-1 rounded-full">{report.category}</span>
                                    <button className="text-sm font-semibold text-brand-accent border border-brand-accent/50 rounded-md px-4 py-1.5 hover:bg-indigo-50 transition-colors">
                                        View Report
                                    </button>
                                </div>
                            </div>
                        )) : (
                            <div className="col-span-full text-center py-16">
                                <SearchIcon className="mx-auto h-12 w-12 text-gray-400" />
                                <h3 className="mt-2 text-sm font-semibold text-gray-900">No reports found</h3>
                                <p className="mt-1 text-sm text-gray-500">Your search and filter criteria did not match any reports.</p>
                            </div>
                        )}
                    </div>
                </main>
            </div>
        </div>
    );
};

export default Reports;