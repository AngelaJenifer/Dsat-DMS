import React, { useState, useMemo, useEffect } from 'react';
import { Operation, OperationStatus, Vehicle, VehicleStatus } from '../types.ts';
import ReportDelayModal from './ReportDelayModal.tsx';
import { PlusIcon } from './icons/Icons.tsx';

interface OperationsProps {
  operations: Operation[];
  vehicles: Vehicle[];
  onStartOperationSimple: (vehicleId: string) => void;
  onCompleteOperation: (operationId: string) => void;
  onReportDelay: (operationId: string, reason: string) => void;
  onOpenStartOperationModal: () => void;
}

const formatTime = (timestamp: number) => new Date(timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
const formatDuration = (start: number, end: number) => `${Math.round((end - start) / 60000)}m`;

const OperationProgressBar: React.FC<{operation: Operation}> = ({operation}) => {
    const [progress, setProgress] = useState(0);
    
    useEffect(() => {
      const calculateProgress = () => {
          const elapsed = Date.now() - operation.startTime;
          const total = operation.estCompletionTime - operation.startTime;
          const calculatedProgress = Math.min(Math.round((elapsed / total) * 100), 100);
          setProgress(calculatedProgress > 0 ? calculatedProgress : 0);
      };
      
      calculateProgress();
      const interval = setInterval(calculateProgress, 2000);
      return () => clearInterval(interval);
    }, [operation]);

    const isDelayed = operation.status === OperationStatus.Delayed;

    return (
        <div className="mt-3">
            <div className="flex justify-between text-xs text-gray-500 mb-1">
                <span>Started: {formatTime(operation.startTime)}</span>
                <span>ETA: {formatTime(operation.estCompletionTime)}</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2.5">
              <div className={`h-2.5 rounded-full ${isDelayed ? 'bg-red-500' : 'bg-blue-500'}`} style={{ width: `${progress}%` }}></div>
            </div>
        </div>
    );
};


const Operations: React.FC<OperationsProps> = ({ operations, vehicles, onStartOperationSimple, onCompleteOperation, onReportDelay, onOpenStartOperationModal }) => {
  const [delayModalOp, setDelayModalOp] = useState<Operation | null>(null);
  
  const activeOperations = useMemo(() => operations.filter(op => op.status === OperationStatus.InProgress || op.status === OperationStatus.Delayed), [operations]);

  const vehiclesAwaitingOperation = useMemo(() => {
    const activeOpVehicleIds = new Set(activeOperations.map(op => op.vehicleId));
    return vehicles.filter(v => v.status === VehicleStatus.Entered && !activeOpVehicleIds.has(v.id));
  }, [vehicles, activeOperations]);
  
  const completedToday = useMemo(() => {
    const todayStr = new Date().toDateString();
    return operations
      .filter(op => op.status === OperationStatus.Completed && op.actualCompletionTime && new Date(op.actualCompletionTime).toDateString() === todayStr)
      .sort((a, b) => b.actualCompletionTime! - a.actualCompletionTime!);
  }, [operations]);
  
  const getVehicleById = (vehicleId: string) => vehicles.find(v => v.id === vehicleId);

  const handleReportDelaySubmit = (operationId: string, reason: string) => {
    onReportDelay(operationId, reason);
    setDelayModalOp(null);
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 flex flex-col h-full bg-gray-50">
      <div className="flex-shrink-0 mb-6">
        <div className="flex justify-between items-center">
            <div>
                <h1 className="text-3xl font-bold text-gray-800">Dock Operations</h1>
                <p className="text-gray-500">Monitor and manage loading/unloading operations.</p>
            </div>
            <button 
                onClick={onOpenStartOperationModal}
                className="bg-brand-accent text-white font-bold py-3 px-5 rounded-lg shadow-lg hover:bg-brand-accent/90 transition-transform transform hover:scale-105 flex items-center gap-2"
            >
                <PlusIcon className="w-5 h-5" />
                Start New Operation
            </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 flex-grow min-h-0">
        
        {/* Column 1: Awaiting Operation */}
        <div className="bg-white p-6 rounded-xl shadow-md flex flex-col h-full">
            <h2 className="text-xl font-bold text-gray-700 mb-4 flex-shrink-0">Awaiting Operation ({vehiclesAwaitingOperation.length})</h2>
            <div className="flex-grow space-y-4 overflow-y-auto pr-2">
              {vehiclesAwaitingOperation.map(vehicle => (
                  <div key={vehicle.id} className="p-4 border rounded-lg hover:bg-gray-50 transition-colors duration-200">
                    <p className="font-bold text-gray-800">{vehicle.id} <span className="font-normal text-gray-600">({vehicle.carrier})</span></p>
                    <p className="text-sm text-gray-500 mt-1">At Dock: <span className="font-semibold">{vehicle.assignedDockId}</span></p>
                    <div className="mt-4 pt-4 border-t flex justify-end">
                        <button onClick={() => onStartOperationSimple(vehicle.id)} className="bg-status-green text-white font-bold py-2 px-4 rounded-lg shadow hover:bg-status-green/90 transition-transform transform hover:scale-105">
                            Start Operation
                        </button>
                    </div>
                  </div>
              ))}
              {vehiclesAwaitingOperation.length === 0 && <p className="text-center text-gray-500 py-4">No vehicles are currently awaiting an operation.</p>}
            </div>
        </div>

        {/* Column 2: Active Operations */}
        <div className="bg-white p-6 rounded-xl shadow-md flex flex-col h-full">
            <h2 className="text-xl font-bold text-gray-700 mb-4 flex-shrink-0">Active Operations ({activeOperations.length})</h2>
            <div className="flex-grow space-y-4 overflow-y-auto pr-2">
              {activeOperations.map(op => {
                  const vehicle = getVehicleById(op.vehicleId);
                  const isDelayed = op.status === OperationStatus.Delayed;
                  return (
                     <div key={op.id} className={`p-4 rounded-lg border-l-4 ${isDelayed ? 'border-red-400 bg-red-50/50' : 'border-blue-400 bg-blue-50/50'}`}>
                        <p className="font-bold text-gray-800">{vehicle?.id} at {op.dockId}</p>
                        <p className="text-sm text-gray-600 font-semibold">{op.type}</p>
                        {isDelayed && <p className="text-xs text-red-600 mt-1 italic">{op.delayReason}</p>}
                        
                        <OperationProgressBar operation={op} />

                        <div className="mt-4 pt-4 border-t flex justify-end gap-2">
                             <button onClick={() => setDelayModalOp(op)} className="text-sm bg-yellow-400 text-white font-bold py-2 px-3 rounded-lg shadow hover:bg-yellow-500 transition-colors">
                                Report Delay
                            </button>
                             <button onClick={() => onCompleteOperation(op.id)} className="text-sm bg-status-green text-white font-bold py-2 px-3 rounded-lg shadow hover:bg-status-green/90 transition-colors">
                                Complete
                            </button>
                        </div>
                     </div>
                  );
              })}
              {activeOperations.length === 0 && <p className="text-center text-gray-500 py-4">No operations are currently active.</p>}
            </div>
        </div>

        {/* Column 3: Completed Today */}
        <div className="bg-white p-6 rounded-xl shadow-md flex flex-col h-full">
            <h2 className="text-xl font-bold text-gray-700 mb-4 flex-shrink-0">Completed Today ({completedToday.length})</h2>
            <div className="flex-grow space-y-3 overflow-y-auto pr-2">
              {completedToday.map(op => {
                  const vehicle = getVehicleById(op.vehicleId);
                  return (
                    <div key={op.id} className="p-3 border-l-4 border-green-500 bg-green-50/50 rounded-r-lg">
                        <p className="font-semibold text-gray-700">{vehicle?.id} - {op.type}</p>
                        <p className="text-sm text-gray-500">
                            Completed at {formatTime(op.actualCompletionTime!)} from Dock {op.dockId}
                        </p>
                        <p className="text-xs text-gray-500 mt-1">
                            Duration: <span className="font-semibold">{formatDuration(op.startTime, op.actualCompletionTime!)}</span>
                        </p>
                    </div>
                  );
              })}
              {completedToday.length === 0 && <p className="text-center text-gray-500 py-4">No operations have been completed today.</p>}
            </div>
        </div>

      </div>

      <ReportDelayModal
        operation={delayModalOp}
        onClose={() => setDelayModalOp(null)}
        onSubmit={handleReportDelaySubmit}
      />
    </div>
  );
};

export default Operations;
