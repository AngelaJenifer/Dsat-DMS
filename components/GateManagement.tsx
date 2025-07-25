import React, { useMemo, useState, useEffect } from 'react';
import { Dock, Vehicle, DockStatus, VehicleStatus, Customer, TimelineAppointment } from '../types.ts';
import { parseAppointmentTime } from '../utils.ts';
import { ICONS } from '../constants.tsx';
import { SparklesIcon, TruckIcon, BuildingOfficeIcon, ClockIcon, SnowflakeIcon, CarriersIcon } from './icons/Icons.tsx';

interface GateManagementProps {
  automationMode: 'Manual' | 'Automatic';
  docks: Dock[];
  vehicles: Vehicle[];
  vendors: Customer[];
  timelineAppointments: TimelineAppointment[];
  onCheckIn: (vehicleId: string) => void;
  onAssignToYard: (vehicleId: string) => void;
  onAssignFromYard: (vehicleId: string) => void;
  onCheckOut: (vehicleId: string) => void;
  onSetDockAvailable: (dockId: string) => void;
  onOpenSpotAppointmentModal: () => void;
  onSelectItem: (vehicle: Vehicle) => void;
  onSimulateArrival: (vehicleId: string) => void;
}

const getStatusBadge = (status: VehicleStatus) => {
  const styles: { [key in VehicleStatus]: string } = {
    [VehicleStatus.Approved]: 'bg-blue-100 text-blue-800',
    [VehicleStatus.Entered]: 'bg-green-100 text-green-800',
    [VehicleStatus.Yard]: 'bg-yellow-100 text-yellow-800',
    [VehicleStatus.Exited]: 'bg-gray-100 text-gray-800',
  };
  return <span className={`px-2 py-1 text-xs font-semibold rounded-full ${styles[status]}`}>{status.charAt(0).toUpperCase() + status.slice(1)}</span>;
};

const getDockStatusBadge = (status: DockStatus) => {
  const styles: { [key in DockStatus]: string } = {
    [DockStatus.Available]: 'bg-status-green/20 text-status-green',
    [DockStatus.Occupied]: 'bg-status-yellow/20 text-status-yellow',
    [DockStatus.Maintenance]: 'bg-status-red/20 text-status-red',
  };
  return <span className={`px-2 py-1 text-xs font-bold rounded-full ${styles[status]}`}>{status.charAt(0).toUpperCase() + status.slice(1)}</span>;
};

const ManualGateManagement: React.FC<GateManagementProps> = ({ docks, vehicles, onCheckIn, onAssignToYard, onSetDockAvailable, onSelectItem }) => {
    const [searchQuery, setSearchQuery] = useState('');
    const [currentTime, setCurrentTime] = useState(new Date());

    useEffect(() => {
        const timerId = setInterval(() => setCurrentTime(new Date()), 1000);
        return () => clearInterval(timerId);
    }, []);

    const approvedVehicles = useMemo(() => {
        const now = currentTime;
        const fourHoursFromNow = new Date(now.getTime() + 4 * 60 * 60 * 1000);

        return vehicles
        .filter(v => {
            if (v.status !== VehicleStatus.Approved) {
            return false;
            }
            try {
            const appointmentDate = parseAppointmentTime(v.appointmentTime);
            return appointmentDate >= now && appointmentDate <= fourHoursFromNow;
            } catch {
            return false;
            }
        })
        .sort((a, b) => parseAppointmentTime(a.appointmentTime).getTime() - parseAppointmentTime(b.appointmentTime).getTime());
    }, [vehicles, currentTime]);
    
    const filteredApprovedVehicles = useMemo(() => {
        if (!searchQuery) return approvedVehicles;
        return approvedVehicles.filter(v => {
        const query = searchQuery.toLowerCase();
        return (
            v.id.toLowerCase().includes(query) ||
            v.carrier.toLowerCase().includes(query) ||
            v.driverName.toLowerCase().includes(query)
        );
        });
    }, [approvedVehicles, searchQuery]);

    const getDockById = (dockId: string) => docks.find(d => d.id === dockId);

    return (
        <div className="bg-white p-6 rounded-xl shadow-md flex flex-col h-full">
          <h2 className="text-xl font-bold text-gray-700 mb-4 flex-shrink-0">Upcoming Arrivals</h2>
          <div className="relative mb-4 flex-shrink-0">
            <input
              type="text"
              placeholder="Search by ID, carrier, or driver..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border bg-white rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-accent"
            />
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <svg className="h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" />
              </svg>
            </div>
          </div>
          <div className="flex-grow space-y-4 overflow-y-auto pr-2">
            {filteredApprovedVehicles.map(vehicle => {
                const dock = getDockById(vehicle.assignedDockId);
                const isDockAvailable = dock?.status === DockStatus.Available;
                const dockName = dock?.name || vehicle.assignedDockId;
                
                return (
                  <div key={vehicle.id} className="p-4 border rounded-lg flex flex-col md:flex-row items-start justify-between hover:bg-gray-50 transition-all duration-300 space-y-4 md:space-y-0 cursor-pointer" onClick={() => onSelectItem(vehicle)}>
                    <div className="flex items-center space-x-4 flex-grow">
                      <div className="w-12 h-12 bg-gray-200 rounded-lg flex items-center justify-center font-bold text-gray-600 flex-shrink-0">
                        {vehicle.carrier.substring(0, 3).toUpperCase()}
                      </div>
                      <div>
                        <p className="font-bold text-gray-800">{vehicle.id} - {vehicle.carrier}</p>
                        <p className="text-sm text-gray-500">{vehicle.driverName} &bull; Appt: {vehicle.appointmentTime} &bull; Dock: {dockName}</p>
                      </div>
                    </div>
                    <div className="flex items-center justify-end space-x-4 w-full md:w-auto flex-wrap gap-x-4 gap-y-2" onClick={e => e.stopPropagation()}>
                      <div className="flex items-center space-x-2">
                          {dock ? getDockStatusBadge(dock.status) : <span className="text-xs font-semibold text-gray-500">Unknown Dock</span>}
                          {dock?.status === DockStatus.Maintenance && (
                              <button
                                  onClick={() => onSetDockAvailable(dock.id!)}
                                  className="text-xs bg-indigo-100 text-indigo-700 font-semibold py-1 px-2 rounded-full hover:bg-indigo-200 transition-colors whitespace-nowrap"
                                  title={`Mark ${dock.name} as available`}
                              >
                                  Set Available
                              </button>
                          )}
                      </div>
                        {isDockAvailable ? (
                            <button onClick={() => onCheckIn(vehicle.id)} className="bg-status-green text-white font-bold py-2 px-4 rounded-lg shadow hover:bg-status-green/90 transition-transform transform hover:scale-105 whitespace-nowrap">
                                Check In
                            </button>
                        ) : (
                            <button onClick={() => onAssignToYard(vehicle.id)} className="bg-status-yellow text-white font-bold py-2 px-4 rounded-lg shadow hover:bg-status-yellow/90 transition-transform transform hover:scale-105 whitespace-nowrap">
                                Assign to Yard
                            </button>
                        )}
                    </div>
                  </div>
                );
              })}
              {approvedVehicles.length > 0 && filteredApprovedVehicles.length === 0 && (
                <p className="text-center text-gray-500 py-4">No vehicles match your search query.</p>
              )}
              {approvedVehicles.length === 0 && <p className="text-center text-gray-500 py-4">No approved arrivals in the next 4 hours.</p>}
          </div>
        </div>
    );
};

const AutomaticGateManagement: React.FC<GateManagementProps> = ({ vehicles, onSimulateArrival, onSelectItem }) => {
    const [isSimulating, setIsSimulating] = useState(false);
    
    const pendingArrivals = useMemo(() => {
        return vehicles
            .filter(v => v.status === VehicleStatus.Approved)
            .sort((a, b) => parseAppointmentTime(a.appointmentTime).getTime() - parseAppointmentTime(b.appointmentTime).getTime());
    }, [vehicles]);
    
    const nextVehicleToArrive = pendingArrivals.length > 0 ? pendingArrivals[0] : null;

    const handleSimulate = () => {
        if (!nextVehicleToArrive) {
            alert("No more pending arrivals to simulate.");
            return;
        }
        setIsSimulating(true);
        onSimulateArrival(nextVehicleToArrive.id); 
        setTimeout(() => setIsSimulating(false), 500);
    };

    return (
        <div className="bg-white p-6 rounded-xl shadow-md flex flex-col h-full border-l-4 border-brand-accent">
            <div className="flex-shrink-0">
                <div className="flex items-center gap-3 mb-2">
                    <SparklesIcon className="w-6 h-6 text-brand-accent" />
                    <h2 className="text-xl font-bold text-gray-700">Automation Simulation</h2>
                </div>
                <p className="text-sm text-gray-600 mb-4">
                    This panel simulates an automated gate system (e.g., ANPR camera). Click the button to simulate the next approved vehicle arriving at the gate, triggering the automated assignment logic.
                </p>
                <button
                    onClick={handleSimulate}
                    disabled={!nextVehicleToArrive || isSimulating}
                    className="w-full flex items-center justify-center bg-primary-600 text-white font-bold py-3 px-5 rounded-lg shadow-lg hover:bg-primary-700 transition-transform transform hover:scale-105 disabled:bg-gray-400 disabled:cursor-not-allowed disabled:scale-100 mb-6"
                >
                    {isSimulating ? (
                        <>
                            <span className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-3"></span>
                            Simulating...
                        </>
                    ) : `Simulate Vehicle Arrival`}
                </button>
                <div className="border-t pt-4">
                    <h3 className="font-semibold text-gray-700">Vehicles pending arrival: {pendingArrivals.length}</h3>
                </div>
            </div>

            <div className="flex-grow space-y-2 overflow-y-auto pr-2 mt-4">
                {pendingArrivals.map((vehicle, index) => (
                    <div 
                        key={vehicle.id} 
                        className={`p-3 border rounded-lg hover:bg-gray-50 transition-colors duration-200 cursor-pointer ${index === 0 ? 'bg-indigo-50/50 border-indigo-200' : 'border-transparent'}`} 
                        onClick={() => onSelectItem(vehicle)}
                    >
                        <p className="font-semibold text-gray-800 truncate">{vehicle.id} <span className="font-normal text-gray-600">({vehicle.carrier})</span></p>
                        <p className="text-sm text-gray-500 truncate">scheduled for {vehicle.appointmentTime}</p>
                    </div>
                ))}
                {pendingArrivals.length === 0 && (
                    <div className="flex items-center justify-center h-full">
                        <p className="text-center text-gray-500 py-4">No pending arrivals for today.</p>
                    </div>
                )}
            </div>
        </div>
    );
};


const GateManagement: React.FC<GateManagementProps> = (props) => {
  const { automationMode, vehicles, vendors, timelineAppointments, onCheckOut, onSelectItem, onOpenSpotAppointmentModal, onAssignFromYard } = props;
  const [currentTime, setCurrentTime] = useState(new Date());
  
  const getDockName = (dockId: string) => props.docks.find(d => d.id === dockId)?.name || dockId;

  const availableDocks = useMemo(() => props.docks.filter(d => d.status === DockStatus.Available), [props.docks]);

  useEffect(() => {
    const timerId = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timerId);
  }, []);
  
  const yardVehicles = useMemo(() => vehicles.filter(v => v.status === VehicleStatus.Yard), [vehicles]);
  const enteredVehicles = useMemo(() => vehicles.filter(v => v.status === VehicleStatus.Entered).sort((a,b) => (a.entryTime && b.entryTime) ? b.entryTime - a.entryTime : 0), [vehicles]);
  
  const checkedOutToday = useMemo(() => {
    const todayStr = currentTime.toDateString();
    return vehicles
        .filter(v => v.status === VehicleStatus.Exited && v.exitTime && new Date(v.exitTime).toDateString() === todayStr)
        .sort((a,b) => (b.exitTime || 0) - (a.exitTime || 0));
  }, [vehicles, currentTime]);
  
  const InfoRow: React.FC<{ icon: React.ReactNode; label: string; value: string | React.ReactNode; }> = ({ icon, label, value }) => (
    <div className="flex items-center text-sm text-gray-600">
        <div className="w-5 h-5 text-gray-400 mr-2 flex-shrink-0">{icon}</div>
        <span className="font-medium mr-1">{label}:</span>
        <span className="font-semibold text-gray-800 truncate">{value}</span>
    </div>
  );

  return (
    <div className="p-4 sm:p-6 lg:p-8 flex flex-col h-full">
      <div className="flex-shrink-0">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6">
            <div>
                <h1 className="text-3xl font-bold text-gray-800">Gate Management</h1>
                <p className="text-gray-500">Manage vehicle entry and exit processes. Mode: <span className="font-bold text-brand-accent">{automationMode}</span></p>
            </div>
            <div className="flex items-center gap-4 mt-4 sm:mt-0">
                <div className="text-right">
                    <div className="text-2xl font-bold text-gray-800">{currentTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}</div>
                    <div className="text-gray-500">{currentTime.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}</div>
                </div>
                 <button
                    onClick={onOpenSpotAppointmentModal}
                    className="bg-primary-600 text-white font-bold py-3 px-5 rounded-lg shadow-lg hover:bg-primary-700 transition-transform transform hover:scale-105"
                >
                    + Spot Appointment
                </button>
            </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 flex-grow min-h-0">
        
        {automationMode === 'Automatic' ? <AutomaticGateManagement {...props} /> : <ManualGateManagement {...props} />}
        
        {/* Column 2: Vehicles in Yard */}
        <div className="bg-white p-6 rounded-xl shadow-md flex flex-col h-full">
            <h2 className="text-xl font-bold text-gray-700 mb-4 flex-shrink-0">Vehicles in Yard ({yardVehicles.length})</h2>
            <div className="flex-grow space-y-4 overflow-y-auto pr-2">
              {yardVehicles.map(vehicle => {
                  const appointment = timelineAppointments.find(a => a.vehicleNumber === vehicle.id);
                  const vendor = vendors.find(v => v.id === vehicle.vendorId);
                  return (
                    <div key={vehicle.id} className="p-4 border border-yellow-300 rounded-lg bg-yellow-50/50 hover:bg-yellow-50 transition-colors duration-200 cursor-pointer" onClick={() => onSelectItem(vehicle)}>
                        <div className="flex justify-between items-start">
                            <p className="font-bold text-gray-800">{vehicle.id} - {vehicle.carrier}</p>
                            {appointment?.vehicleRequirements?.isRefrigerated && (
                                <span title="Requires Refrigerated Dock" className="text-cyan-500 bg-cyan-100 p-1 rounded-full"><SnowflakeIcon className="w-4 h-4"/></span>
                            )}
                        </div>
                        <p className="text-sm text-gray-500 mb-3">{vehicle.driverName}</p>
                        <div className="space-y-2">
                             <InfoRow icon={<BuildingOfficeIcon />} label="Vendor" value={vendor?.name || 'N/A'} />
                             <InfoRow icon={<ClockIcon />} label="Appt. Time" value={vehicle.appointmentTime} />
                             <InfoRow icon={<CarriersIcon />} label="Load" value={appointment?.loadType || 'N/A'} />
                             <InfoRow icon={<TruckIcon />} label="Waiting for" value={getDockName(vehicle.assignedDockId)} />
                        </div>

                      {automationMode === 'Manual' && (
                        <div className="mt-4 pt-4 border-t border-yellow-200 flex justify-end" onClick={e => e.stopPropagation()}>
                            <button
                                onClick={() => onAssignFromYard(vehicle.id)}
                                disabled={availableDocks.length === 0}
                                className="bg-blue-500 text-white font-bold py-2 px-4 rounded-lg shadow hover:bg-blue-600 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
                            >
                                Assign to Available Dock
                            </button>
                        </div>
                      )}
                    </div>
                  );
                })}
                {yardVehicles.length === 0 && <p className="text-center text-gray-500 py-4">The yard is currently empty.</p>}
            </div>
        </div>

        {/* Column 3: Vehicles at Docks */}
        <div className="bg-white p-6 rounded-xl shadow-md flex flex-col h-full">
            <h2 className="text-xl font-bold text-gray-700 mb-4 flex-shrink-0">Vehicles at Docks</h2>
            <div className="flex-grow space-y-3 overflow-y-auto pr-2">
                {enteredVehicles.map(vehicle => (
                    <div key={vehicle.id} className={`p-3 border-l-4 rounded-r-lg flex flex-col sm:flex-row items-start sm:items-center justify-between border-status-green space-y-2 sm:space-y-0 cursor-pointer hover:bg-gray-50`} onClick={() => onSelectItem(vehicle)}>
                        <div className="flex-grow">
                            <p className="font-semibold text-gray-700">{vehicle.id} - {vehicle.driverName}</p>
                            <p className="text-sm text-gray-500">
                                Entered at {vehicle.entryTime ? new Date(vehicle.entryTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'N/A'} to {getDockName(vehicle.assignedDockId)}
                            </p>
                        </div>
                        <button onClick={(e) => { e.stopPropagation(); onCheckOut(vehicle.id); }} className="bg-red-500 text-white font-bold py-2 px-3 rounded-lg shadow hover:bg-red-600 transition-colors text-sm self-end sm:self-center flex-shrink-0">
                            Check Out
                        </button>
                    </div>
                ))}
                {enteredVehicles.length === 0 && <p className="text-center text-gray-500 py-4">No vehicles are currently at the docks.</p>}
            </div>
        </div>
        
        {/* Column 4: Today's Check-Outs */}
        <div className="bg-white p-6 rounded-xl shadow-md flex flex-col h-full">
            <h2 className="text-xl font-bold text-gray-700 mb-4 flex-shrink-0">Today's Check-Outs ({checkedOutToday.length})</h2>
            <div className="flex-grow space-y-3 overflow-y-auto pr-2">
                {checkedOutToday.map(vehicle => (
                    <div key={vehicle.id} className={`p-3 border-l-4 rounded-r-lg bg-gray-50 border-gray-300 cursor-pointer hover:bg-gray-100`} onClick={() => onSelectItem(vehicle)}>
                        <p className="font-semibold text-gray-700">{vehicle.id} - {vehicle.carrier}</p>
                        <p className="text-sm text-gray-500">
                            Exited at {vehicle.exitTime ? new Date(vehicle.exitTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'N/A'} from {getDockName(vehicle.assignedDockId)}
                        </p>
                    </div>
                ))}
                {checkedOutToday.length === 0 && <p className="text-center text-gray-500 py-4">No vehicles have checked out today.</p>}
            </div>
        </div>

      </div>
    </div>
  );
};

export default GateManagement;
