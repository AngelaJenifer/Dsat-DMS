import React, { useState, useMemo, useRef } from 'react';
import { BuildingOfficeIcon, PlayCircleIcon, ClockIcon, TrashIcon, ChevronDownIcon, PencilIcon, PlusIcon } from './icons/Icons.tsx';
import { Warehouse, Dock } from '../types.ts';
import DockModal from './DockModal.tsx';
import TimeSlotsConfig from './TimeSlotsConfig.tsx';


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
}


const WarehouseAndDocksConfig: React.FC<Omit<ConfigurationsProps, 'onSaveWarehouse' | 'onSaveDock' >> = ({
    warehouses,
    docks,
    onDeleteWarehouse,
    onDeleteDock,
    onOpenWarehousePanel,
    onOpenDockPanel,
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
                                                <button 
                                                    onClick={(e) => { e.stopPropagation(); handleDeleteDockClick(dock.id!); }} 
                                                    className="absolute -top-1.5 -right-1.5 p-1 rounded-full bg-red-100 text-red-600 opacity-0 group-hover:opacity-100 hover:bg-red-200 transition-all"
                                                    title={`Remove ${dock.name}`}
                                                >
                                                    <TrashIcon className="w-4 h-4" />
                                                </button>
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

const PlaceholderContent: React.FC<{title: string, description: string, icon: React.ReactNode}> = ({title, description, icon}) => (
     <div className="h-full flex flex-col items-center justify-center text-center p-6">
        <div className="w-16 h-16 text-gray-300 mb-4">
            {icon}
        </div>
        <h2 className="text-2xl font-bold text-gray-700">{title}</h2>
        <p className="mt-2 max-w-md text-gray-500">{description}</p>
        <p className="mt-4 text-sm text-gray-400">This section is currently under development. Settings and options will appear here in a future update.</p>
    </div>
);

const OperationsConfig: React.FC = () => (
   <PlaceholderContent 
        title="Operations Configuration" 
        description="Configure default operation times, types, and automation rules for check-in, check-out, and yard management."
        icon={<PlayCircleIcon className="w-full h-full" />}
    />
);


const Configurations: React.FC<ConfigurationsProps> = (props) => {
  const [activeTab, setActiveTab] = useState<'warehouse' | 'operations' | 'timeslots'>('warehouse');

  const tabs = [
    { id: 'warehouse', label: 'Warehouse & Docks', icon: <BuildingOfficeIcon className="w-5 h-5" /> },
    //{ id: 'operations', label: 'Operations', icon: <PlayCircleIcon className="w-5 h-5" /> },
    { id: 'timeslots', label: 'Time Slots', icon: <ClockIcon className="w-5 h-5" /> },
  ];

  const renderContent = () => {
    switch (activeTab) {
      case 'warehouse':
        return <WarehouseAndDocksConfig {...props} />;
      case 'operations':
        return <OperationsConfig />;
      case 'timeslots':
        return <TimeSlotsConfig warehouses={props.warehouses} docks={props.docks} />;
      default:
        return <WarehouseAndDocksConfig {...props} />;
    }
  };

  return (
    <div className="p-8 h-full flex flex-col bg-gray-50">
        <div className="flex-shrink-0">
             <h1 className="text-3xl font-bold text-gray-800">Configurations</h1>
             <p className="text-gray-500 mt-1">Adjust system-wide settings for various modules.</p>
        </div>
        <div className="flex-grow flex mt-6 gap-8">
            <aside className="w-64 flex-shrink-0">
                <nav className="space-y-1">
                    {tabs.map(tab => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id as any)}
                            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-semibold text-left transition-colors ${
                                activeTab === tab.id
                                ? 'bg-brand-accent text-white shadow'
                                : 'text-gray-600 hover:bg-gray-200'
                            }`}
                        >
                            {tab.icon}
                            <span>{tab.label}</span>
                        </button>
                    ))}
                </nav>
            </aside>
            <main className="flex-1 bg-white rounded-xl shadow-sm overflow-hidden">
                {renderContent()}
            </main>
        </div>
    </div>
  );
};

export default Configurations;