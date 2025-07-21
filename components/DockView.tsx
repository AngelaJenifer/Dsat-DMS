



import React, { useMemo, useState, useEffect } from 'react';
import { Dock, Vehicle, Operation, DockStatus, VehicleStatus, OperationStatus, TimelineAppointment } from '../types.ts';
import { ICONS } from '../constants.tsx';
import { Squares2X2Icon } from './icons/Icons.tsx';

// --- Visual Sub-components for the SVG layout ---

const Tooltip: React.FC<{ data: string[], x: number, y: number, rotation?: number }> = ({ data, x, y, rotation = 0 }) => (
    <g transform={`translate(${x}, ${y}) rotate(${-rotation})`}>
        <foreignObject x={-100} y={-60} width="200" height="120" style={{ pointerEvents: 'none', overflow: 'visible' }}>
            <div className="bg-brand-dark bg-opacity-90 text-white text-xs rounded-lg shadow-xl p-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300 backdrop-blur-sm">
                {data.map((line, i) => <p key={i} className="whitespace-nowrap font-medium">{line}</p>)}
            </div>
        </foreignObject>
    </g>
);

const DockBay: React.FC<{ dock: Dock, vehicles: Vehicle[], x: number, y: number, rotation?: number, onClick: () => void }> = ({ dock, vehicles, x, y, rotation = 0, onClick }) => {
    const statusColors = {
        [DockStatus.Available]: '#10b981', // status-green
        [DockStatus.Occupied]: '#f59e0b', // status-yellow
        [DockStatus.Maintenance]: '#ef4444', // status-red
    };
    const color = statusColors[dock.status];
    const tooltipData = [`Dock: ${dock.name}`];
    if (vehicles.length > 0) tooltipData.push(`Vehicles: ${vehicles.map(v => v.id).join(', ')}`);
    if (dock.safetyComplianceTags?.includes('Cold Storage')) tooltipData.push("Type: Refrigerated");
    tooltipData.push(`Status: ${dock.status.charAt(0).toUpperCase() + dock.status.slice(1)}`);
    if (dock.notes) tooltipData.push(`Notes: ${dock.notes}`);

    return (
        <g className="group cursor-pointer" transform={`translate(${x}, ${y}) rotate(${rotation})`} onClick={onClick}>
            {/* Dock Door */}
            <rect x="-25" y="-30" width="50" height="30" fill="#374151" />
            <rect x="-22" y="-27" width="44" height="24" fill={dock.status === 'maintenance' ? "url(#hatch)" : "#4b5563"} />
            
            {dock.safetyComplianceTags?.includes('Cold Storage') && (
                <g transform="translate(-15, -23)">
                     <rect x="-2" y="-2" width="16" height="16" fill="rgba(255,255,255,0.1)" rx="2"/>
                     {React.cloneElement(ICONS.snowflake, { className: "w-4 h-4 text-cyan-300"})}
                </g>
            )}

            {/* Dock Bumper */}
            <rect x="-25" y="0" width="50" height="8" fill="#eab308" />
            <rect x="-25" y="8" width="50" height="5" fill="#4b5563" />

            {/* Status Light */}
            <circle cx="20" cy="-20" r="4" fill={color} stroke="white" strokeWidth="1">
                 <animate attributeName="r" values="4;5;4" dur="1.5s" repeatCount="indefinite" />
            </circle>
            
            {/* Tooltip position adjusted for rotation */}
            <Tooltip data={tooltipData} x={0} y={-40} rotation={rotation} />
        </g>
    );
};

const Truck: React.FC<{ vehicle: Vehicle, operation?: Operation }> = ({ vehicle, operation }) => {
    const isDelayed = operation?.status === "Delayed";
    const color = isDelayed ? '#ef4444' : '#6366f1'; // status-red, primary-500

    const [progress, setProgress] = useState(0);
    useEffect(() => {
        if (!operation || (operation.status !== OperationStatus.InProgress && operation.status !== OperationStatus.Delayed)) {
            setProgress(0);
            return;
        };

        const interval = setInterval(() => {
            if(!operation) return;
            const elapsed = Date.now() - operation.startTime;
            const total = operation.estCompletionTime - operation.startTime;
            const value = Math.min(Math.round((elapsed / total) * 100), 100);
            setProgress(value < 0 ? 0 : value);
        }, 2000);
        return () => clearInterval(interval);
    }, [operation]);

    return (
        <g>
            {/* Truck body */}
            <path d="M -20,10 L 20,10 L 20,-25 L -5,-25 L -5,-10 L -20,-10 Z" fill="#e5e7eb" stroke="#9ca3af" strokeWidth="1"/>
            {/* Truck cab */}
            <path d="M -5,-25 L 12,-25 L 20, -15 L 20,10 L -5,10 Z" fill={color} stroke="#1f2937" strokeWidth="1"/>
            {/* Wheels */}
            <circle cx="-12" cy="10" r="5" fill="#1f2937" />
            <circle cx="12" cy="10" r="5" fill="#1f2937" />
            {/* Vehicle ID */}
            <text x="0" y="0" textAnchor="middle" dominantBaseline="middle" fontSize="9px" fill="white" fontWeight="bold">{vehicle.id}</text>
            
            {/* Progress Bar */}
            {progress > 0 && (
                <g transform="translate(0, -35)">
                    <rect x="-20" y="0" width="40" height="5" fill="#d1d5db" rx="2" />
                    <rect x="-20" y="0" width={progress * 0.4} height="5" fill={isDelayed ? '#ef4444' : '#10b981'} rx="2" />
                </g>
            )}
        </g>
    );
}

const AnimatedVehicle: React.FC<{ vehicle: Vehicle, startPos: { x: number, y: number }, endPos: { x: number, y: number, rotation: number }, operation?: Operation, onClick: () => void }> = ({ vehicle, startPos, endPos, operation, onClick }) => {
    const tooltipData = [
        `ID: ${vehicle.id}`,
        `Carrier: ${vehicle.carrier}`,
        `Driver: ${vehicle.driverName}`,
        `Status: ${operation?.status || vehicle.status}`
    ];
     if (operation?.status === 'Delayed' && operation.delayReason) {
        tooltipData.push(`Reason: ${operation.delayReason}`);
    }

    const uniqueId = `truck-path-${vehicle.id.replace(/[^a-zA-Z0-9]/g, '')}`;

    const path = `M ${startPos.x} ${startPos.y} L ${endPos.x} ${startPos.y} L ${endPos.x} ${endPos.y}`;

    return (
        <g className="group cursor-pointer" onClick={onClick}>
            <path id={uniqueId} d={path} className="hidden" />
            <g>
                <animateMotion dur="4s" fill="freeze" rotate="auto">
                    <mpath href={`#${uniqueId}`} />
                </animateMotion>
                <Truck vehicle={vehicle} operation={operation} />
            </g>
            {/* This invisible rect makes the tooltip hover area larger and more reliable after animation */}
            <rect x="-25" y="-30" width="50" height="50" fill="transparent" transform={`translate(${endPos.x}, ${endPos.y})`} />
            <g transform={`translate(${endPos.x}, ${endPos.y}) rotate(${endPos.rotation})`} style={{pointerEvents: 'none'}}>
                <Tooltip data={tooltipData} x={0} y={-40} rotation={endPos.rotation} />
            </g>
        </g>
    );
};

const HighlightIndicator: React.FC<{ x: number, y: number }> = ({ x, y }) => (
    <circle
        cx={x}
        cy={y}
        r="40"
        fill="none"
        stroke="#f59e0b"
        strokeWidth="3"
        strokeOpacity="0.8"
    >
        <animate attributeName="r" from="30" to="50" dur="1.2s" repeatCount="indefinite" />
        <animate attributeName="stroke-opacity" from="0.8" to="0" dur="1.2s" repeatCount="indefinite" />
    </circle>
);


// --- Card View Components ---
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
            <div className="flex justify-between items-center mt-1">
                <p className="font-bold text-gray-800 flex items-center">
                    <span className="text-brand-accent">{ICONS.play}</span>
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
        </div>
    );
};

const DockCard: React.FC<{
    dock: Dock;
    vehicle?: Vehicle;
    operation?: Operation;
    onClick: () => void;
}> = ({ dock, vehicle, operation, onClick }) => {
    const statusStyles = {
        [DockStatus.Available]: { bg: 'bg-green-50', border: 'border-green-400' },
        [DockStatus.Occupied]: { bg: 'bg-yellow-50', border: 'border-yellow-400' },
        [DockStatus.Maintenance]: { bg: 'bg-red-50', border: 'border-red-400' },
    };

    return (
        <div onClick={onClick} className={`rounded-xl shadow-md p-4 flex flex-col cursor-pointer transition-all duration-300 hover:shadow-lg hover:-translate-y-1 ${statusStyles[dock.status].bg} border-l-4 ${statusStyles[dock.status].border}`}>
            <div className="flex justify-between items-start">
                <h3 className="font-bold text-lg text-gray-800 flex items-center gap-2">
                    {dock.name}
                    {dock.safetyComplianceTags?.includes('Cold Storage') && <span title="Refrigerated">{ICONS.snowflake}</span>}
                </h3>
                <span className="text-xs font-bold px-2 py-1 rounded-full uppercase tracking-wider">{dock.status}</span>
            </div>
            <div className="flex-grow my-4">
                {dock.status === DockStatus.Occupied && vehicle && (
                     <div className="p-3 bg-white rounded-lg space-y-3 shadow-inner">
                         <div>
                             <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Vehicle Details</p>
                             <div className="flex items-center mt-1">
                                 <div className="text-brand-accent">{ICONS.truck}</div>
                                 <div className="ml-2">
                                     <p className="font-bold text-gray-800">{vehicle.id}</p>
                                     <p className="text-sm text-gray-600">{vehicle.carrier}</p>
                                 </div>
                             </div>
                         </div>
                         {operation && <OperationProgress operation={operation} />}
                     </div>
                )}
                {dock.status === DockStatus.Maintenance && (
                    <div className="text-sm text-gray-700 bg-white/50 p-3 rounded-lg">
                        <p className="font-semibold">Notes:</p>
                        <p className="italic">{dock.notes}</p>
                    </div>
                )}
                {dock.status === DockStatus.Available && (
                    <div className="text-center text-gray-500 py-4">
                        <p className="font-semibold text-green-700">Ready for next assignment</p>
                    </div>
                )}
            </div>
        </div>
    )
}


interface DockViewProps {
    docks: Dock[]; vehicles: Vehicle[]; operations: Operation[];
    onSelectItem: (item: Vehicle | Dock) => void;
}
export const DockView: React.FC<DockViewProps> = ({ docks, vehicles, operations, onSelectItem }) => {
    const VIEWBOX_WIDTH = 1800;
    const VIEWBOX_HEIGHT = 900;
    
    const DOCK_WIDTH = 50;
    const DOCK_SPACING = 40;

    const [viewMode, setViewMode] = useState<'layout' | 'card'>('layout');
    const [searchQuery, setSearchQuery] = useState('');
    const [foundDockId, setFoundDockId] = useState<string | null>(null);

    const bayGroups = useMemo(() => {
        return docks.reduce((acc, dock) => {
            const bay = dock.location || 'Unknown';
            if (!acc[bay]) acc[bay] = [];
            acc[bay].push(dock);
            return acc;
        }, {} as Record<string, Dock[]>);
    }, [docks]);

    const dockLayouts = useMemo(() => {
        const layouts: { [key: string]: { x: number; y: number; rotation: number } } = {};
        
        const topBays = ['Bay A', 'Bay B'];
        const bottomBays = ['Bay C', 'Bay D'];
        const sideBays = ['Bay E'];
        const reeferBays = ['Refrigerated Bay (F)'];
        
        let currentX_top = 350;
        topBays.forEach(bayName => {
            (bayGroups[bayName] || []).forEach((dock) => {
                if (dock.id) layouts[dock.id] = { x: currentX_top, y: 150, rotation: 0 };
                currentX_top += DOCK_WIDTH + DOCK_SPACING;
            });
            currentX_top += 50;
        });

        let currentX_bottom = 350;
        bottomBays.forEach(bayName => {
            (bayGroups[bayName] || []).forEach((dock) => {
                if (dock.id) layouts[dock.id] = { x: currentX_bottom, y: 750, rotation: 180 };
                currentX_bottom += DOCK_WIDTH + DOCK_SPACING;
            });
            currentX_bottom += 50;
        });

        let currentY_side = 250;
        sideBays.forEach(bayName => {
            (bayGroups[bayName] || []).forEach((dock) => {
                if (dock.id) layouts[dock.id] = { x: 1650, y: currentY_side, rotation: -90 };
                currentY_side += DOCK_WIDTH + DOCK_SPACING;
            });
        });

        let currentY_reefer = 450;
        reeferBays.forEach(bayName => {
            (bayGroups[bayName] || []).forEach((dock) => {
                if (dock.id) layouts[dock.id] = { x: 200, y: currentY_reefer, rotation: 90 };
                currentY_reefer += DOCK_WIDTH + DOCK_SPACING;
            });
        });


        return layouts;
    }, [bayGroups]);
    
    const vehiclesAtDocks = useMemo(() => {
        const map = new Map<string, Vehicle[]>();
        vehicles
            .filter(v => v.status === VehicleStatus.Entered && dockLayouts[v.assignedDockId])
            .forEach(v => {
                if (!map.has(v.assignedDockId)) {
                    map.set(v.assignedDockId, []);
                }
                map.get(v.assignedDockId)!.push(v);
            });
        return map;
    }, [vehicles, dockLayouts]);

    const vehicleData = useMemo(() => {
        const yardParkingSpots: { x: number; y: number; rotation: number }[] = [];
        for (let i = 0; i < 10; i++) {
            yardParkingSpots.push({ x: 150 + (i % 2) * 80, y: 100 + Math.floor(i / 2) * 50, rotation: 90 });
        }
        const occupiedSpots = new Set<string>();

        return vehicles.map(vehicle => {
            let pos;
            const operation = operations.find(op => op.vehicleId === vehicle.id && op.status !== OperationStatus.Completed);
            
            if (vehicle.status === VehicleStatus.Entered && dockLayouts[vehicle.assignedDockId]) {
                const basePos = dockLayouts[vehicle.assignedDockId];
                const dockVehicles = vehiclesAtDocks.get(vehicle.assignedDockId) || [];
                const vehicleIndex = dockVehicles.findIndex(v => v.id === vehicle.id);
                const totalVehicles = dockVehicles.length;
                const vehicleOffset = 45; // width of truck + spacing

                // Calculate offset from center
                const offset = (vehicleIndex - (totalVehicles - 1) / 2) * vehicleOffset;

                let newX = basePos.x;
                let newY = basePos.y;
                
                // Adjust position based on rotation to spread them side-by-side
                if (basePos.rotation === 0 || basePos.rotation === 180) { // Top or bottom docks
                    newX += basePos.rotation === 0 ? offset : -offset;
                    newY += basePos.rotation === 0 ? 50 : -50;
                } else { // Side docks
                    newX += basePos.rotation === -90 || basePos.rotation === 90 ? (basePos.rotation === 90 ? -50 : 50) : 0;
                    newY += basePos.rotation === -90 || basePos.rotation === 90 ? offset : 0;
                }
                
                pos = { x: newX, y: newY, rotation: basePos.rotation };

            } else if (vehicle.status === VehicleStatus.Yard) {
                const spotIndex = parseInt(vehicle.id.replace(/[^0-9]/g, '') || '0', 10) % yardParkingSpots.length;
                let finalIndex = spotIndex;
                while (occupiedSpots.has(`Y${finalIndex}`) && occupiedSpots.size < yardParkingSpots.length) {
                    finalIndex = (finalIndex + 1) % yardParkingSpots.length;
                    if(finalIndex === spotIndex) break; 
                }
                occupiedSpots.add(`Y${finalIndex}`);
                pos = yardParkingSpots[finalIndex];
            }
            
            if (!pos) return null;
            
            return { vehicle, operation, startPos: { x: VIEWBOX_WIDTH / 2, y: VIEWBOX_HEIGHT - 20 }, endPos: pos };
        }).filter((v): v is NonNullable<typeof v> => v !== null);
    }, [vehicles, operations, dockLayouts, vehiclesAtDocks]);

    const filteredDocksForCards = useMemo(() => {
        if (!searchQuery) return docks;
        return docks.filter(dock => 
            dock.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
            dock.location.toLowerCase().includes(searchQuery.toLowerCase())
        );
    }, [docks, searchQuery]);
    
    const groupedFilteredDocks = useMemo(() => {
        return filteredDocksForCards.reduce((acc, dock) => {
            const location = dock.location || 'Uncategorized';
            if (!acc[location]) {
                acc[location] = [];
            }
            acc[location].push(dock);
            return acc;
        }, {} as Record<string, Dock[]>);
    }, [filteredDocksForCards]);
    
    const locations = useMemo(() => Object.keys(groupedFilteredDocks).sort(), [groupedFilteredDocks]);

    const handleSearchSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const query = searchQuery.trim().toUpperCase();
        if (!query) {
            setFoundDockId(null);
            return;
        }
        const found = docks.find(d => d.name.toUpperCase() === query || d.location.toUpperCase().includes(query));
        if (found) {
            setFoundDockId(found.id || null);
            setViewMode('layout'); // Switch to layout view to highlight
        } else {
            setFoundDockId(null);
            alert(`Dock or Bay "${searchQuery}" not found.`);
        }
    };

    const handleClearSearch = () => {
        setSearchQuery('');
        setFoundDockId(null);
    };

    return (
        <div className="p-4 sm:p-6 lg:p-8 bg-gray-100 h-full flex flex-col">
            <div className="flex-shrink-0 mb-6 flex justify-between items-center flex-wrap gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-gray-800">Live Yard & Dock View</h1>
                    <p className="text-gray-500">A visual overview of all yard and dock operations.</p>
                </div>
                <div className="flex items-center gap-4">
                    <form onSubmit={handleSearchSubmit} className="flex items-center gap-2">
                        <input
                            type="text"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            placeholder="Search docks or bays..."
                            className="w-48 px-3 py-2 border bg-white border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-brand-accent"
                        />
                        {foundDockId && (
                            <button type="button" onClick={handleClearSearch} className="bg-gray-200 text-gray-700 font-bold py-2 px-3 rounded-lg hover:bg-gray-300 text-xs">Clear</button>
                        )}
                    </form>
                    <div className="flex items-center p-1 bg-gray-200 rounded-lg">
                        <button onClick={() => setViewMode('layout')} className={`flex items-center gap-2 px-3 py-1 text-sm font-semibold rounded-md transition-colors ${viewMode === 'layout' ? 'bg-white text-brand-accent shadow' : 'text-gray-600 hover:bg-gray-100'}`} title="Layout View">
                            {ICONS.toggleCalendar}
                        </button>
                        <button onClick={() => setViewMode('card')} className={`flex items-center gap-2 px-3 py-1 text-sm font-semibold rounded-md transition-colors ${viewMode === 'card' ? 'bg-white text-brand-accent shadow' : 'text-gray-600 hover:bg-gray-100'}`} title="Card View">
                           <Squares2X2Icon className="w-5 h-5" />
                        </button>
                    </div>
                </div>
            </div>

            {viewMode === 'layout' ? (
                <div className="flex-grow bg-white rounded-xl shadow-md p-2 flex items-center justify-center overflow-auto">
                    <svg viewBox={`0 0 ${VIEWBOX_WIDTH} ${VIEWBOX_HEIGHT}`} className="max-w-full max-h-full font-sans">
                        <defs>
                            <pattern id="hatch" patternUnits="userSpaceOnUse" width="8" height="8">
                                <path d="M-2,2 l4,-4 M0,8 l8,-8 M6,10 l4,-4" stroke="#f59e0b" strokeWidth="1.5" />
                            </pattern>
                        </defs>
                        <rect x="0" y="0" width={VIEWBOX_WIDTH} height={VIEWBOX_HEIGHT} fill="#6b7280" />
                        <rect x="50" y="50" width="200" height="300" fill="rgba(0,0,0,0.1)" rx="10" />
                        <text x={150} y="30" textAnchor="middle" fontSize="18" fontWeight="bold" fill="white" opacity="0.7">VEHICLE PARKING YARD</text>
                        <rect x="300" y="50" width="1250" height="100" fill="#d1d5db" rx="5"/>
                        <text x={925} y="105" textAnchor="middle" fontSize="24" fontWeight="bold" fill="#374151" opacity="0.5">WAREHOUSE NORTH (BAYS A, B)</text>
                        <rect x="300" y="750" width="1250" height="100" fill="#d1d5db" rx="5"/>
                        <text x={925} y="805" textAnchor="middle" fontSize="24" fontWeight="bold" fill="#374151" opacity="0.5">WAREHOUSE SOUTH (BAYS C, D)</text>
                        <rect x="1650" y="200" width="100" height="500" fill="#d1d5db" rx="5"/>
                        <text x={1700} y={450} textAnchor="middle" fontSize="24" fontWeight="bold" fill="#374151" opacity="0.5" transform="rotate(-90, 1700, 450)">EAST (BAY E)</text>
                        <rect x="50" y="400" width="100" height="450" fill="#d1d5db" rx="5"/>
                        <text x={100} y={625} textAnchor="middle" fontSize="24" fontWeight="bold" fill="#374151" opacity="0.5" transform="rotate(-90, 100, 625)">REEFER BAY (F)</text>

                        {docks.map(dock => {
                            const layout = dock.id ? dockLayouts[dock.id] : null;
                            if (!layout) return null;
                            const dockVehicles = vehiclesAtDocks.get(dock.id!) || [];
                            return <DockBay key={dock.id} dock={dock} vehicles={dockVehicles} x={layout.x} y={layout.y} rotation={layout.rotation} onClick={() => onSelectItem(dock)} />
                        })}
                        {vehicleData.map(data => (
                            <AnimatedVehicle key={data.vehicle.id} vehicle={data.vehicle} operation={data.operation} startPos={data.startPos} endPos={data.endPos} onClick={() => onSelectItem(data.vehicle)} />
                        ))}
                        {foundDockId && dockLayouts[foundDockId] && (
                            <HighlightIndicator x={dockLayouts[foundDockId].x} y={dockLayouts[foundDockId].y} />
                        )}
                    </svg>
                </div>
            ) : (
                <div className="flex-grow overflow-y-auto pr-2 space-y-8">
                     {locations.length > 0 ? (
                        locations.map(location => (
                            <div key={location}>
                                <h2 className="text-2xl font-bold text-gray-700 mb-4 pb-2 border-b-2 border-gray-200">{location}</h2>
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                                    {groupedFilteredDocks[location].map(dock => {
                                        const vehicle = vehicles.find(v => v.assignedDockId === dock.id && v.status === VehicleStatus.Entered);
                                        const operation = vehicle ? operations.find(op => op.vehicleId === vehicle.id && op.status !== OperationStatus.Completed) : undefined;
                                        return (
                                            <DockCard 
                                                key={dock.id} 
                                                dock={dock} 
                                                vehicle={vehicle} 
                                                operation={operation} 
                                                onClick={() => onSelectItem(dock)}
                                            />
                                        )
                                    })}
                                </div>
                            </div>
                        ))
                    ) : (
                        <div className="text-center bg-white p-10 rounded-xl shadow-md mt-6">
                            <h3 className="text-xl font-semibold text-gray-700">No Docks Found</h3>
                            <p className="text-gray-500 mt-2">Your search for "{searchQuery}" did not match any docks or bays.</p>
                        </div>
                    )}
                </div>
            )}

        </div>
    );
};