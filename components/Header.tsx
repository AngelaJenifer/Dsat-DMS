import React from 'react';
import { ICONS } from '../constants.tsx';
import { Warehouse } from '../types.ts';
import { ChevronUpDownIcon } from './icons/Icons.tsx';

interface HeaderProps {
    onToggleSidebar: () => void;
    automationMode: 'Manual' | 'Automatic';
    onToggleAutomationMode: () => void;
    warehouses: Warehouse[];
    selectedWarehouseId: string;
    onWarehouseChange: (id: string) => void;
    onOpenAIAssistant: () => void;
}

const AutomationToggle: React.FC<{ mode: 'Manual' | 'Automatic', onToggle: () => void }> = ({ mode, onToggle }) => (
  <div className="flex items-center space-x-2">
    <span className={`text-sm font-semibold ${mode === 'Manual' ? 'text-gray-400' : 'text-brand-accent'}`}>
        {mode === 'Manual' ? 'Manual' : 'Automatic'}
    </span>
    <label htmlFor="automation-toggle" className="relative inline-flex items-center cursor-pointer">
      <input type="checkbox" id="automation-toggle" className="sr-only peer" checked={mode === 'Automatic'} onChange={onToggle} />
      <div className="w-11 h-6 bg-gray-200 rounded-full peer peer-focus:ring-2 peer-focus:ring-brand-accent/50 peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-brand-accent"></div>
    </label>
     <span className={`text-xs font-semibold ${mode === 'Manual' ? 'text-gray-700' : 'text-gray-400'}`}>
        Mode
    </span>
  </div>
);

const WarehouseSelector: React.FC<Pick<HeaderProps, 'warehouses' | 'selectedWarehouseId' | 'onWarehouseChange'>> = ({ warehouses, selectedWarehouseId, onWarehouseChange }) => {
    const selectedWarehouse = warehouses.find(w => w.id === selectedWarehouseId);

    return (
        <div className="relative">
            <select
                value={selectedWarehouseId}
                onChange={e => onWarehouseChange(e.target.value)}
                className="appearance-none w-full max-w-xs bg-white border border-gray-300 rounded-lg pl-4 pr-10 py-2 text-gray-800 font-semibold focus:outline-none focus:ring-2 focus:ring-brand-accent"
                aria-label="Select Warehouse"
            >
                {warehouses.map(w => (
                    <option key={w.id} value={w.id}>{w.name}</option>
                ))}
            </select>
            <div className="absolute inset-y-0 right-0 flex items-center px-2 pointer-events-none">
                <ChevronUpDownIcon className="w-5 h-5 text-gray-400" />
            </div>
        </div>
    );
};


const Header: React.FC<HeaderProps> = ({ onToggleSidebar, automationMode, onToggleAutomationMode, warehouses, selectedWarehouseId, onWarehouseChange, onOpenAIAssistant }) => {
  return (
    <header className="bg-white shadow-sm p-4 flex justify-between items-center z-10 flex-shrink-0">
      <div className="flex items-center">
         <button onClick={onToggleSidebar} className="p-2 rounded-full text-gray-500 hover:bg-gray-100 mr-4" aria-label="Toggle sidebar">
            {ICONS.menu}
        </button>
        <WarehouseSelector warehouses={warehouses} selectedWarehouseId={selectedWarehouseId} onWarehouseChange={onWarehouseChange} />
      </div>
      <div className="flex items-center space-x-6">
        <AutomationToggle mode={automationMode} onToggle={onToggleAutomationMode} />
        <button onClick={onOpenAIAssistant} className="flex items-center space-x-2 bg-white text-brand-accent font-bold py-2 px-4 rounded-lg shadow-sm border border-brand-accent/30 hover:bg-indigo-50 transition-transform transform hover:scale-105">
            {ICONS.sparkles}
            <span>Ask AI</span>
        </button>
        {/* Actions */}
        <button className="p-2 rounded-full text-gray-500 hover:bg-gray-100 hover:text-gray-700">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
          </svg>
        </button>
        {/* User Profile */}
        <div className="flex items-center space-x-2">
            <img src="https://picsum.photos/seed/user/40/40" alt="User" className="w-10 h-10 rounded-full" />
            <div>
                <div className="font-semibold text-gray-800">John Doe</div>
                <div className="text-xs text-gray-500">Gate Keeper</div>
            </div>
        </div>
      </div>
    </header>
  );
};

export default Header;