import React, { useState, useMemo } from 'react';
import { Vehicle, VehicleStatus, Dock } from '../types.ts';
import { exportToCsv, formatDurationFromMs } from '../utils.ts';
import { SearchIcon, ArrowUpTrayIcon } from './icons/Icons.tsx';

interface CheckInOutLogProps {
  vehicles: Vehicle[];
  docks: Dock[];
  onBack: () => void;
}

const CheckInOutLog: React.FC<CheckInOutLogProps> = ({ vehicles, docks, onBack }) => {
    const [searchQuery, setSearchQuery] = useState('');

    const logData = useMemo(() => {
        return vehicles
            .filter(v => v.status === VehicleStatus.Exited)
            .map(v => {
                const turnaroundMs = (v.exitTime && v.entryTime) ? v.exitTime - v.entryTime : NaN;
                const dock = docks.find(d => d.id === v.assignedDockId);
                return {
                    ...v,
                    turnaroundTime: formatDurationFromMs(turnaroundMs),
                    dockName: dock ? dock.name : v.assignedDockId,
                };
            })
            .sort((a, b) => (b.exitTime || 0) - (a.exitTime || 0));
    }, [vehicles, docks]);

    const filteredLogData = useMemo(() => {
        if (!searchQuery) return logData;
        const query = searchQuery.toLowerCase();
        return logData.filter(v => 
            v.id.toLowerCase().includes(query) ||
            v.carrier.toLowerCase().includes(query) ||
            v.driverName.toLowerCase().includes(query) ||
            v.dockName.toLowerCase().includes(query)
        );
    }, [logData, searchQuery]);

    const handleExport = () => {
        const dataToExport = filteredLogData.map(v => ({
            'Vehicle ID': v.id,
            'Carrier': v.carrier,
            'Driver Name': v.driverName,
            'Dock': v.dockName,
            'Entry Time': v.entryTime ? new Date(v.entryTime).toLocaleString() : 'N/A',
            'Exit Time': v.exitTime ? new Date(v.exitTime).toLocaleString() : 'N/A',
            'Turnaround Time': v.turnaroundTime,
        }));
        exportToCsv(`check-in-out-log-${new Date().toISOString().split('T')[0]}.csv`, dataToExport);
    };

    return (
        <div className="p-8 h-full flex flex-col bg-gray-50">
            <div className="flex-shrink-0 mb-6">
                <button onClick={onBack} className="text-brand-accent font-semibold mb-4 text-sm hover:underline">&larr; Back to all reports</button>
                <div className="flex justify-between items-center">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-800">Check-In / Check-Out Log</h1>
                        <p className="text-gray-500 mt-1">A historical record of all vehicles that have exited the facility.</p>
                    </div>
                    <button 
                        onClick={handleExport}
                        className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-md shadow-sm hover:bg-green-700 transition-colors"
                    >
                        <ArrowUpTrayIcon className="w-5 h-5" />
                        <span className="text-sm font-semibold">Export CSV</span>
                    </button>
                </div>
            </div>

            <div className="relative mb-6">
                <input
                    type="text"
                    placeholder="Search log by vehicle ID, carrier, driver, or dock..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 border bg-white rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-accent text-gray-900"
                />
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <SearchIcon className="h-5 w-5 text-gray-400" />
                </div>
            </div>

            <div className="flex-grow bg-white rounded-xl shadow-md overflow-hidden">
                <div className="overflow-auto h-full">
                    <table className="w-full min-w-max text-sm text-left">
                        <thead className="text-xs text-gray-600 uppercase bg-gray-50 border-b sticky top-0">
                            <tr>
                                <th scope="col" className="px-6 py-3 font-semibold">Vehicle ID</th>
                                <th scope="col" className="px-6 py-3 font-semibold">Carrier</th>
                                <th scope="col" className="px-6 py-3 font-semibold">Driver</th>
                                <th scope="col" className="px-6 py-3 font-semibold">Dock</th>
                                <th scope="col" className="px-6 py-3 font-semibold">Entry Time</th>
                                <th scope="col" className="px-6 py-3 font-semibold">Exit Time</th>
                                <th scope="col" className="px-6 py-3 font-semibold">Turnaround</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y">
                            {filteredLogData.map(vehicle => (
                                <tr key={vehicle.id} className="hover:bg-gray-50 transition-colors">
                                    <td className="px-6 py-4 font-semibold text-gray-800">{vehicle.id}</td>
                                    <td className="px-6 py-4 text-gray-600">{vehicle.carrier}</td>
                                    <td className="px-6 py-4 text-gray-600">{vehicle.driverName}</td>
                                    <td className="px-6 py-4 text-gray-600">{vehicle.dockName}</td>
                                    <td className="px-6 py-4 text-gray-600">{vehicle.entryTime ? new Date(vehicle.entryTime).toLocaleString() : 'N/A'}</td>
                                    <td className="px-6 py-4 text-gray-600">{vehicle.exitTime ? new Date(vehicle.exitTime).toLocaleString() : 'N/A'}</td>
                                    <td className="px-6 py-4 font-semibold text-gray-800">{vehicle.turnaroundTime}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                     {filteredLogData.length === 0 && (
                        <div className="text-center py-16">
                            <h3 className="text-lg font-semibold text-gray-700">No Records Found</h3>
                            <p className="text-gray-500 mt-2">
                                {logData.length > 0 ? "Your search did not match any records." : "There are no checked-out vehicles to display."}
                            </p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default CheckInOutLog;