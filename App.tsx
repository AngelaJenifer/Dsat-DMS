


import React, { useState, useMemo, useEffect, useCallback } from 'react';
import Sidebar from './components/Sidebar.tsx';
import Header from './components/Header.tsx';
import Dashboard from './components/Dashboard.tsx';
import { Appointments } from './components/Appointments.tsx';
import GateManagement from './components/GateManagement.tsx';
import Operations from './components/Operations.tsx';
import Docks from './components/Docks.tsx';
import Carriers from './components/Carriers.tsx';
import Vendors from './components/Vendors.tsx';
import Help from './components/Help.tsx';
import Documents from './components/Documents.tsx';
import Settings from './components/Settings.tsx';
import Reports from './components/Reports.tsx';
import Configurations from './components/Configurations.tsx';
import AddRolePanel, { PermissionsState } from './components/AddRolePanel.tsx';
import GatePassModal from './components/GatePassModal.tsx';
import SpotAppointmentModal from './components/SpotAppointmentModal.tsx';
import ActivityFeed from './components/ActivityFeed.tsx';
import DetailPanel from './components/DetailPanel.tsx';
import AppointmentModal from './components/AppointmentModal.tsx';
import OptimalSlotFinderModal from './components/OptimalSlotFinderModal.tsx';
import WarehousePanel from './components/WarehouseModal.tsx';
import DockModal from './components/DockModal.tsx';
import StartOperationModal from './components/StartOperationModal.tsx';
import AIAssistantModal from './components/AIAssistantModal.tsx';
import { Page, Dock, Vehicle, DockStatus, VehicleStatus, Operation, OperationStatus, OperationType, Carrier, Vendor, Document, User, AppSettings, Role, DashboardData, DockActivityStatus, TimelineAppointment, ReportData, ActivityLog, ActivityLogType, DocumentStatus, TimelineDock, Warehouse, WarehouseType, DockType } from './types.ts';
import { DOCKS_DATA, VEHICLES_DATA, OPERATIONS_DATA, CARRIERS_DATA, VENDORS_DATA, DOCUMENTS_DATA, USERS_DATA, INITIAL_SETTINGS_DATA, TIMELINE_APPOINTMENTS_DATA, TIMELINE_DOCKS_DATA, INITIAL_ACTIVITY_LOG_DATA, WAREHOUSES_DATA } from './constants.tsx';
import { AppointmentsIcon, CheckCircleIcon, ClockIcon, TruckIcon, XCircleIcon, AlertTriangleIcon, DocksIcon } from './components/icons/Icons.tsx';
import { parseAppointmentTime } from './utils.ts';
import { getReportSummary } from './services/geminiService.ts';

const MAX_LOG_ENTRIES = 20;

const App: React.FC = () => {
  const [activePage, setActivePage] = useState<Page>(Page.Dashboard);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  
  // Master Data State
  const [warehouses, setWarehouses] = useState<Warehouse[]>(WAREHOUSES_DATA);
  const [docks, setDocks] = useState<Dock[]>(DOCKS_DATA);
  const [vehicles, setVehicles] = useState<Vehicle[]>(VEHICLES_DATA);
  const [operations, setOperations] = useState<Operation[]>(OPERATIONS_DATA);
  const [carriers, setCarriers] = useState<Carrier[]>(CARRIERS_DATA);
  const [vendors, setVendors] = useState<Vendor[]>(VENDORS_DATA);
  const [documents, setDocuments] = useState<Document[]>(DOCUMENTS_DATA);
  const [timelineAppointments, setTimelineAppointments] = useState<TimelineAppointment[]>(TIMELINE_APPOINTMENTS_DATA);
  const [users, setUsers] = useState<User[]>(USERS_DATA);
  const [appSettings, setAppSettings] = useState<AppSettings>(INITIAL_SETTINGS_DATA);
  const [activityLog, setActivityLog] = useState<ActivityLog[]>(INITIAL_ACTIVITY_LOG_DATA);

  // UI / Contextual State
  const [selectedWarehouseId, setSelectedWarehouseId] = useState<string>(warehouses[0]?.id || '');
  const [gatePassVehicle, setGatePassVehicle] = useState<Vehicle | null>(null);
  const [isAddRolePanelOpen, setIsAddRolePanelOpen] = useState(false);
  const [isSpotAppointmentModalOpen, setIsSpotAppointmentModalOpen] = useState(false);
  const [isStartOperationModalOpen, setIsStartOperationModalOpen] = useState(false);
  const [selectedDetailItem, setSelectedDetailItem] = useState<Vehicle | Dock | null>(null);
  const [appointmentPanelState, setAppointmentPanelState] = useState<{ isOpen: boolean; appointment: TimelineAppointment | null; createData?: { time: Date, dockId: string } }>({ isOpen: false, appointment: null });
  const [isAIAssistantOpen, setIsAIAssistantOpen] = useState(false);
  const [warehousePanelState, setWarehousePanelState] = useState<{ isOpen: boolean; warehouse: Warehouse | null; }>({ isOpen: false, warehouse: null });
  const [dockPanelState, setDockPanelState] = useState<{ isOpen: boolean; dock: Dock | null; warehouseId?: string }>({ isOpen: false, dock: null });

  // --- AUTOMATION STATE ---
  const [automationMode, setAutomationMode] = useState<'Manual' | 'Automatic'>('Manual');
  const [reportSummary, setReportSummary] = useState({ text: '', isLoading: false });
  const [isFindingSlot, setIsFindingSlot] = useState(false);
  const [isSlotFinderModalOpen, setIsSlotFinderModalOpen] = useState(false);
  const [recentlyUpdatedDocks, setRecentlyUpdatedDocks] = useState<string[]>([]);
  
  const addActivity = useCallback((message: string, type: ActivityLogType) => {
    setActivityLog(prev => {
        const newEntry: ActivityLog = { id: `act-${Date.now()}`, message, type, timestamp: Date.now() };
        const updatedLog = [newEntry, ...prev];
        return updatedLog.slice(0, MAX_LOG_ENTRIES);
    });
  }, []);

  // --- DATA FILTERING LOGIC based on selectedWarehouseId ---
  const {
      filteredDocks,
      filteredVehicles,
      filteredOperations,
      filteredTimelineAppointments,
      filteredTimelineDocks,
      filteredDocuments
  } = useMemo(() => {
      const currentDocks = docks.filter(d => d.warehouseId === selectedWarehouseId);
      const currentDockIds = new Set(currentDocks.map(d => d.id));
      
      const currentAppointments = timelineAppointments.filter(a => currentDockIds.has(a.dockId));
      const currentOperations = operations.filter(o => currentDockIds.has(o.dockId));
      const currentVehicles = vehicles.filter(v => currentDockIds.has(v.assignedDockId));
      const currentVehicleIds = new Set(currentVehicles.map(v => v.id));
      const currentDocuments = documents.filter(d => currentVehicleIds.has(d.vehicleId));
      
      const currentTimelineDocks = TIMELINE_DOCKS_DATA.filter(d => currentDockIds.has(d.id));

      return {
          filteredDocks: currentDocks,
          filteredVehicles: currentVehicles,
          filteredOperations: currentOperations,
          filteredTimelineAppointments: currentAppointments,
          filteredTimelineDocks: currentTimelineDocks,
          filteredDocuments: currentDocuments
      };
  }, [selectedWarehouseId, docks, vehicles, operations, timelineAppointments, documents]);

  const toggleSidebar = useCallback(() => {
    setIsSidebarOpen(prev => !prev);
  }, []);

  const handleWarehouseChange = (id: string) => {
    setSelectedWarehouseId(id);
    setSelectedDetailItem(null); // Close detail panel on context switch
  };

  const handleAutomatedCheckOut = useCallback((vehicleId: string, dockId: string) => {
    setOperations(prev => prev.map(op => op.vehicleId === vehicleId && op.status !== OperationStatus.Completed ? { ...op, status: OperationStatus.Completed, actualCompletionTime: Date.now() } : op));
    setVehicles(prev => prev.map(v => v.id === vehicleId ? { ...v, status: VehicleStatus.Exited, exitTime: Date.now() } : v));
    setDocks(prev => prev.map(d => d.id === dockId ? { ...d, status: DockStatus.Available, notes: 'Operation completed automatically' } : d));
    addActivity(`AUTO: Vehicle ${vehicleId} operation completed. Checked out from ${dockId}.`, ActivityLogType.CheckOut);
  }, [addActivity]);

  const handleToggleAutomationMode = () => {
    setAutomationMode(prev => prev === 'Manual' ? 'Automatic' : 'Manual');
  };

  const handleSelectItem = (item: Vehicle | Dock) => {
    setSelectedDetailItem(item);
  };

  const handleCloseDetailPanel = () => setSelectedDetailItem(null);
  
  // Handlers for Appointment Panel
  const handleOpenAppointmentPanelForEdit = (appointment: TimelineAppointment) => {
    setAppointmentPanelState({ isOpen: true, appointment, createData: undefined });
  };
  
  const handleOpenAppointmentPanelForCreate = (createData?: { time: Date, dockId: string }) => {
    const dockId = createData?.dockId || filteredTimelineDocks[0]?.id;
    if (!dockId) {
        alert("No docks available in this warehouse to create an appointment.");
        return;
    }
    const data = { dockId, time: createData?.time || new Date()};
    setAppointmentPanelState({ isOpen: true, appointment: null, createData: data });
  };

  const handleBookAppointmentForDock = (dockId: string) => {
    handleCloseDetailPanel();
    const createTime = new Date();
    createTime.setMinutes(Math.ceil(createTime.getMinutes() / 30) * 30, 0, 0);
    setTimeout(() => {
        handleOpenAppointmentPanelForCreate({ dockId, time: createTime });
    }, 150);
  };

  const handleCloseAppointmentPanel = () => setAppointmentPanelState({ isOpen: false, appointment: null });

  // --- AUTOMATION LOGIC ---
  const assignVehicleFromYardToDock = useCallback((vehicleId: string, dockId: string) => {
    setVehicles(prev => prev.map(v => v.id === vehicleId ? { ...v, status: VehicleStatus.Entered, assignedDockId: dockId, entryTime: Date.now() } : v));
    setDocks(prev => prev.map(d => d.id === dockId ? { ...d, status: DockStatus.Occupied, notes: `Vehicle ${vehicleId} assigned from yard.` } : d));
    addActivity(`Vehicle ${vehicleId} from yard assigned to ${dockId}.`, ActivityLogType.CheckIn);
  }, [addActivity]);
  
  useEffect(() => {
    if (automationMode !== 'Automatic') return;
    const availableDocksList = filteredDocks.filter(d => d.status === DockStatus.Available);
    const yardVehiclesList = filteredVehicles
        .filter(v => v.status === VehicleStatus.Yard)
        .sort((a,b) => parseAppointmentTime(a.appointmentTime).getTime() - parseAppointmentTime(b.appointmentTime).getTime());
    if (availableDocksList.length === 0 || yardVehiclesList.length === 0) return;
    const vehicleToAssign = yardVehiclesList[0];
    const appointment = filteredTimelineAppointments.find(a => a.vehicleNumber === vehicleToAssign.id);
    const requiresRefrigerated = appointment?.vehicleRequirements?.isRefrigerated || false;
    let suitableDock = availableDocksList.find(d => d.id === vehicleToAssign.assignedDockId);
    if (!suitableDock) {
        suitableDock = availableDocksList.find(d => {
            const dockIsRefrigerated = d.safetyComplianceTags?.includes('Cold Storage') || false;
            if (requiresRefrigerated && !dockIsRefrigerated) return false;
            return true;
        });
    }
    if (suitableDock) {
        addActivity(`AUTO: Dock ${suitableDock.name} is available. Assigning ${vehicleToAssign.id} from yard.`, ActivityLogType.AiInfo);
        assignVehicleFromYardToDock(vehicleToAssign.id, suitableDock.id!);
    }
  }, [automationMode, filteredDocks, filteredVehicles, filteredTimelineAppointments, assignVehicleFromYardToDock, addActivity]);

  const handleRunPredictiveMaintenance = () => {
    const USAGE_THRESHOLD = 50; // Operations before maintenance is recommended
    const updatedDockIds: string[] = [];
    setDocks(prevDocks => {
      const newDocks = prevDocks.map((dock): Dock => {
        if (dock.id && filteredDocks.some(fd => fd.id === dock.id) && dock.operationsSinceMaintenance && dock.operationsSinceMaintenance > USAGE_THRESHOLD && dock.status === DockStatus.Available) {
          addActivity(`AI found dock ${dock.name} is due for maintenance based on usage.`, ActivityLogType.AiInfo);
          updatedDockIds.push(dock.id);
          return { ...dock, status: DockStatus.Maintenance, notes: `Preventative maintenance recommended by AI due to high usage (${dock.operationsSinceMaintenance} ops).`, maintenanceType: 'ai' };
        }
        return dock;
      });
      return newDocks;
    });

    if (updatedDockIds.length > 0) {
      setRecentlyUpdatedDocks(updatedDockIds);
      setTimeout(() => {
        setRecentlyUpdatedDocks([]);
      }, 3000); // Highlight for 3 seconds
    }
  };

  const reportsData = useMemo((): ReportData => {
    const carrierPerformance = CARRIERS_DATA.slice(0,10).map(c => ({
        name: c.name,
        totalAppointments: Math.floor(Math.random() * 50) + 10,
        onTimePercentage: Math.floor(Math.random() * 20) + 80,
        avgTurnaroundTime: Math.floor(Math.random() * 30) + 45,
    })).sort((a,b) => b.onTimePercentage - a.onTimePercentage);
    const dockUtilization = Array.from({length: 10}).map((_, i) => ({
        hour: `${i+9}:00`,
        occupiedDocks: Math.floor(Math.random() * (filteredDocks.length * 0.8))
    }));
    const appointmentVolume = Array.from({length: 30}).map((_, i) => {
        const d = new Date();
        d.setDate(d.getDate() - (29-i));
        return {
            date: d.toLocaleDateString('en-US', {month: 'short', day: 'numeric'}),
            count: Math.floor(Math.random() * (20 * (filteredDocks.length/50))) + (5 * (filteredDocks.length/50))
        }
    });
    return {
        carrierPerformance,
        dockUtilization,
        appointmentVolume,
        totalCompleted: filteredOperations.filter(op => op.status === 'Completed').length,
        totalDelayed: filteredOperations.filter(op => op.status === 'Delayed').length,
        overallAvgTurnaround: 42,
    }
  }, [filteredOperations, filteredDocks]);

  const handleGenerateReportSummary = async () => {
      setReportSummary({ text: '', isLoading: true });
      try {
          const summary = await getReportSummary(reportsData);
          setReportSummary({ text: summary, isLoading: false });
      } catch (e) {
          console.error(e);
          const errorMessage = e instanceof Error ? e.message : 'An unknown error occurred.';
          setReportSummary({ text: `**Error Generating Summary**\n- ${errorMessage}`, isLoading: false });
      }
  };

  const handleFindOptimalSlot = (requirements: { duration: number; isRefrigerated: boolean; }) => {
      setIsFindingSlot(true);
      addActivity(`AI is searching for the best slot...`, ActivityLogType.AiInfo);
      setTimeout(() => {
          const today = new Date();
          let foundSlot = false;
          for (let hour = 9; hour < 18; hour++) {
              for (let minute = 0; minute < 60; minute += 30) {
                  const checkTime = new Date(today.setHours(hour, minute, 0, 0));
                  const checkEndTime = new Date(checkTime.getTime() + requirements.duration * 60000);
                  for (const dock of filteredTimelineDocks) {
                      const dockDetails = filteredDocks.find(d => d.id === dock.id);
                      if (requirements.isRefrigerated && !dockDetails?.safetyComplianceTags?.includes('Cold Storage')) continue;
                      const isOccupied = filteredTimelineAppointments.some(appt => 
                          appt.dockId === dock.id && new Date(appt.startTime) < checkEndTime && new Date(appt.endTime) > checkTime
                      );
                      if (!isOccupied) {
                          addActivity(`AI suggests booking Dock ${dock.id} at ${checkTime.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}. Opening panel.`, ActivityLogType.AiInfo);
                          handleOpenAppointmentPanelForCreate({ dockId: dock.id, time: checkTime });
                          foundSlot = true;
                          break;
                      }
                  }
                  if (foundSlot) break;
              }
              if (foundSlot) break;
          }
          if (!foundSlot) alert("AI could not find a suitable slot. Please adjust requirements or check the schedule manually.");
          setIsFindingSlot(false);
          setIsSlotFinderModalOpen(false);
      }, 1500);
  };

  const handleAutomatedCheckIn = (vehicleId: string) => {
    const vehicle = filteredVehicles.find(v => v.id === vehicleId);
    if (!vehicle) {
        addActivity(`Simulation failed: Vehicle ${vehicleId} not found.`, ActivityLogType.Delay);
        return;
    }

    const assignedDock = filteredDocks.find(d => d.id === vehicle.assignedDockId);
    if (assignedDock && assignedDock.status === DockStatus.Available) {
        addActivity(`AUTO: Vehicle ${vehicleId} checked in to its scheduled dock: ${assignedDock.name}.`, ActivityLogType.CheckIn);
        setVehicles(prev => prev.map(v => v.id === vehicleId ? { ...v, status: VehicleStatus.Entered, assignedDockId: assignedDock.id!, entryTime: Date.now() } : v));
        setDocks(prev => prev.map(d => d.id === assignedDock.id ? { ...d, status: DockStatus.Occupied, notes: `Vehicle ${vehicleId} auto-assigned.` } : d));
    } else {
        handleAssignToYard(vehicleId, true);
        addActivity(`AUTO: Dock ${vehicle.assignedDockId} for ${vehicleId} is busy. Sent to yard.`, ActivityLogType.Yard);
    }
  }

  const handleSimulateArrival = (vehicleId: string) => {
    const vehicle = filteredVehicles.find(v => v.id === vehicleId);
    if (!vehicle) {
        addActivity(`Simulation failed: Vehicle ${vehicleId} not found.`, ActivityLogType.Delay);
        return;
    }
    handleAutomatedCheckIn(vehicleId);
  };
  
  // --- MANUAL ACTIONS ---
  const handleCheckIn = (vehicleId: string) => {
    const vehicle = filteredVehicles.find(v => v.id === vehicleId);
    if (!vehicle) return;
    let updatedVehicle: Vehicle | null = null;
    setVehicles(prevVehicles =>
      prevVehicles.map(v => {
        if (v.id === vehicleId) {
            updatedVehicle = { ...v, status: VehicleStatus.Entered, entryTime: Date.now() };
            return updatedVehicle;
        }
        return v;
      })
    );
    if (updatedVehicle) {
        setGatePassVehicle(updatedVehicle);
        addActivity(`Vehicle ${vehicle.id} checked in to Dock ${vehicle.assignedDockId}.`, ActivityLogType.CheckIn);
    }
    setDocks(prevDocks =>
      prevDocks.map(d => d.id === vehicle.assignedDockId ? { ...d, status: DockStatus.Occupied, notes: `Vehicle ${vehicleId} checked in.` } : d)
    );
  };

  const handleAssignToYard = (vehicleId: string, isAuto: boolean = false) => {
    setVehicles(prevVehicles =>
      prevVehicles.map(v => v.id === vehicleId ? { ...v, status: VehicleStatus.Yard } : v)
    );
    addActivity(`${isAuto ? 'AUTO: ' : ''}Vehicle ${vehicleId} assigned to yard.`, ActivityLogType.Yard);
  };
  
  const handleAssignFromYard = (vehicleId: string) => {
    const vehicle = filteredVehicles.find(v => v.id === vehicleId);
    if (!vehicle || vehicle.status !== VehicleStatus.Yard) return;
    const appointment = filteredTimelineAppointments.find(a => a.vehicleNumber === vehicleId);
    const requiredProps = appointment?.vehicleRequirements;
    const suitableDock = filteredDocks.find(d => {
        if (d.status !== DockStatus.Available) return false;
        if (requiredProps?.isRefrigerated && !d.safetyComplianceTags?.includes('Cold Storage')) return false;
        return true;
    });
    if (suitableDock) {
        assignVehicleFromYardToDock(vehicleId, suitableDock.id!);
    } else {
        alert("No suitable dock is currently available for this vehicle.");
    }
  };

  const handleCheckOut = (vehicleId: string) => {
    const vehicle = vehicles.find(v => v.id === vehicleId);
    if (!vehicle) return;
    setVehicles(prevVehicles =>
      prevVehicles.map(v => v.id === vehicleId ? { ...v, status: VehicleStatus.Exited, exitTime: Date.now() } : v)
    );
    setDocks(prevDocks =>
      prevDocks.map(d => d.id === vehicle.assignedDockId ? { ...d, status: DockStatus.Available, notes: undefined } : d)
    );
    addActivity(`Vehicle ${vehicle.id} checked out from Dock ${vehicle.assignedDockId}.`, ActivityLogType.CheckOut);
    handleCloseDetailPanel();
  };

  const handleStartOperationSimple = (vehicleId: string) => {
    const vehicle = vehicles.find(v => v.id === vehicleId);
    if (!vehicle) return;

    const appointment = timelineAppointments.find(a => a.vehicleNumber === vehicleId);
    const now = Date.now();
    const newOperation: Operation = {
      id: `OP-${Date.now()}`,
      vehicleId,
      dockId: vehicle.assignedDockId,
      type: appointment?.appointmentType === 'Inbound' ? OperationType.Unloading : OperationType.Loading,
      status: OperationStatus.InProgress,
      operator: 'System Admin',
      startTime: now,
      estCompletionTime: now + (appointment?.expectedDuration || appSettings.general.defaultOperationDuration) * 60 * 1000,
    };
    setOperations(prev => [...prev, newOperation]);
    addActivity(`Operation for vehicle ${vehicleId} started at dock ${vehicle.assignedDockId}.`, ActivityLogType.CheckIn);
  };
  
  const handleStartOperationFromModal = (vehicleId: string, operationType: OperationType, durationMinutes: number) => {
    const vehicle = vehicles.find(v => v.id === vehicleId);
    if (!vehicle) return;

    const now = Date.now();
    const newOperation: Operation = {
      id: `OP-Modal-${Date.now()}`,
      vehicleId,
      dockId: vehicle.assignedDockId,
      type: operationType,
      status: OperationStatus.InProgress,
      operator: 'System Admin',
      startTime: now,
      estCompletionTime: now + durationMinutes * 60 * 1000,
    };
    setOperations(prev => [...prev, newOperation]);
    addActivity(`Operation for vehicle ${vehicleId} started at dock ${vehicle.assignedDockId}.`, ActivityLogType.CheckIn);
    setIsStartOperationModalOpen(false);
  };
  
  const handleCompleteOperation = (operationId: string) => {
    const op = operations.find(o => o.id === operationId);
    if (!op) return;

    setOperations(prev => prev.map(o => o.id === operationId ? { ...o, status: OperationStatus.Completed, actualCompletionTime: Date.now() } : o));
    setDocks(prev => prev.map(d => d.id === op.dockId ? { ...d, status: DockStatus.Available, notes: undefined } : d));
    setVehicles(prev => prev.map(v => v.id === op.vehicleId ? { ...v, status: VehicleStatus.Exited, exitTime: Date.now() } : v));
    addActivity(`Operation for vehicle ${op.vehicleId} completed.`, ActivityLogType.Complete);
    handleCloseDetailPanel();
  };

  const handleReportDelay = (operationId: string, reason: string) => {
    setOperations(prev => prev.map(op => op.id === operationId ? { ...op, status: OperationStatus.Delayed, delayReason: reason } : op));
    const op = operations.find(o => o.id === operationId);
    if(op) {
        addActivity(`Delay reported for vehicle ${op.vehicleId}: ${reason}`, ActivityLogType.Delay);
    }
  };
  
  const handleSetDockMaintenance = (dockId: string, notes: string) => {
      setDocks(docks.map(d => d.id === dockId ? { ...d, status: DockStatus.Maintenance, notes: notes } : d));
  };
  
  const handleClearDockMaintenance = (dockId: string) => {
      setDocks(docks.map(d => d.id === dockId && d.status === DockStatus.Maintenance ? { ...d, status: DockStatus.Available, notes: undefined, maintenanceType: undefined } : d));
  };

  const handleSaveDock = (dockData: Dock) => {
    setDocks(prev => {
        const isUpdating = dockData.id && prev.some(d => d.id === dockData.id);
        if (isUpdating) {
            return prev.map(d => d.id === dockData.id ? { ...d, ...dockData } as Dock : d);
        } else {
            const newDock: Dock = {
                lastMaintenance: new Date().toISOString().split('T')[0],
                operationsSinceMaintenance: 0,
                ...dockData,
                id: `D${(Math.random() * 1000).toFixed(0)}`, // Simple unique ID
            };
            return [...prev, newDock];
        }
    });
    addActivity(`Dock ${dockData.name} was ${dockData.id ? 'updated' : 'created'}.`, ActivityLogType.Maintenance);
    handleCloseDockPanel();
  };
  
  const handleDeleteDock = (dockId: string) => {
      const dockName = docks.find(d => d.id === dockId)?.name;
      setDocks(prev => prev.filter(d => d.id !== dockId));
      addActivity(`Dock ${dockName || dockId} was deleted.`, ActivityLogType.Maintenance);
  };

  const handleSaveCarrier = (carrierData: Omit<Carrier, 'id'> & { id?: string }) => {
    setCarriers(prev => {
        if(carrierData.id) {
            return prev.map(c => c.id === carrierData.id ? { ...c, ...carrierData } : c);
        } else {
            const newCarrier: Carrier = { ...carrierData, id: `C${prev.length + 1}`};
            return [...prev, newCarrier];
        }
    });
     addActivity(`Carrier ${carrierData.name} was ${carrierData.id ? 'updated' : 'created'}.`, ActivityLogType.NewAppointment);
  };

  const handleDeleteCarrier = (carrierId: string) => {
    const carrierName = carriers.find(c => c.id === carrierId)?.name;
    setCarriers(prev => prev.filter(c => c.id !== carrierId));
    addActivity(`Carrier ${carrierName || carrierId} was deleted.`, ActivityLogType.NewAppointment);
  };

  const handleSaveVendor = (vendorData: Omit<Vendor, 'id'> & { id?: string }) => {
    setVendors(prev => {
        if(vendorData.id) {
            return prev.map(v => v.id === vendorData.id ? { ...v, ...vendorData } : v);
        } else {
            const newVendor: Vendor = { ...vendorData, id: `V${prev.length + 1}`};
            return [...prev, newVendor];
        }
    });
    addActivity(`Vendor ${vendorData.name} was ${vendorData.id ? 'updated' : 'created'}.`, ActivityLogType.NewAppointment);
  };
  
  const handleDeleteVendor = (vendorId: string) => {
      const vendorName = vendors.find(v => v.id === vendorId)?.name;
      setVendors(prev => prev.filter(v => v.id !== vendorId));
      addActivity(`Vendor ${vendorName || vendorId} was deleted.`, ActivityLogType.NewAppointment);
  };
  
  const handleSaveDocument = (docData: Omit<Document, 'id'> & { id?: string }) => {
    setDocuments(prev => {
        if(docData.id) {
            return prev.map(d => d.id === docData.id ? { ...d, ...docData } as Document : d);
        } else {
            const newDoc: Document = { ...docData, id: `DOC-${Date.now()}` } as Document;
            return [...prev, newDoc];
        }
    });
    addActivity(`Document ${docData.name} was ${docData.id ? 'updated' : 'uploaded'}.`, ActivityLogType.NewAppointment);
  };
  
  const handleDeleteDocument = (docId: string) => {
      const docName = documents.find(d => d.id === docId)?.name;
      setDocuments(prev => prev.filter(d => d.id !== docId));
      addActivity(`Document ${docName || docId} was deleted.`, ActivityLogType.NewAppointment);
  };
  
  const handleSaveRole = (roleData: { roleName: string; roleDescription: string; permissions: PermissionsState; }) => {
      console.log("New Role Saved:", roleData);
      addActivity(`A new role "${roleData.roleName}" was configured.`, ActivityLogType.Maintenance);
      setIsAddRolePanelOpen(false);
  };
  
  const handleDeleteUser = (userId: string) => {
      const userName = users.find(u => u.id === userId)?.name;
      setUsers(prev => prev.filter(u => u.id !== userId));
      addActivity(`User ${userName || userId} was deleted.`, ActivityLogType.NewAppointment);
  };
  
  const handleSettingsChange = (newSettings: AppSettings) => {
      setAppSettings(newSettings);
      addActivity('Application settings were updated.', ActivityLogType.Maintenance);
  };
  
  const handleSubmitSupportRequest = (data: {name: string, email: string, subject: string, message: string}) => {
      console.log("Support Request:", data);
      alert(`Thank you, ${data.name}. Your request about "${data.subject}" has been submitted.`);
      addActivity(`Support request submitted by ${data.name}.`, ActivityLogType.Maintenance);
  };

  const handleSaveAppointment = (apptData: TimelineAppointment) => {
    setTimelineAppointments(prev => {
        if (prev.find(a => a.id === apptData.id)) {
            return prev.map(a => a.id === apptData.id ? apptData : a);
        } else {
            const newId = `apt-manual-${Date.now()}`;
            const newAppt = { ...apptData, id: newId, appointmentId: `APT-${Math.floor(Math.random() * 10000)}` };
            return [...prev, newAppt];
        }
    });
    addActivity(`Appointment for ${apptData.companyName} was ${apptData.id.startsWith('apt-manual') ? 'created' : 'updated'}.`, ActivityLogType.NewAppointment);
  };
  
  const handleDeleteAppointment = (appointmentId: string) => {
      const appt = timelineAppointments.find(a => a.id === appointmentId);
      setTimelineAppointments(prev => prev.filter(a => a.id !== appointmentId));
      addActivity(`Appointment ${appt?.appointmentId} for ${appt?.companyName} was deleted.`, ActivityLogType.NewAppointment);
  }
  
  const handleCreateSpotAppointment = (data: { vehicleId: string; driverName: string; carrier: string; vendorId: string; assignedDockId: string; checkIn: boolean }) => {
    const newAppointment: TimelineAppointment = {
        id: `apt-spot-${Date.now()}`,
        appointmentId: `WALK-IN-${data.vehicleId}`,
        companyName: vendors.find(v => v.id === data.vendorId)?.name || 'Unknown Vendor',
        purposeOfVisit: 'Walk-in/Spot',
        loadType: 'Mixed',
        startTime: new Date(),
        endTime: new Date(Date.now() + 30 * 60 * 1000), // 30 min duration
        expectedDuration: 30,
        dockId: data.assignedDockId,
        status: 'Approved',
        appointmentType: 'Inbound', // Assuming inbound for walk-ins
        vehicleNumber: data.vehicleId,
        transporter: data.carrier,
        driverName: data.driverName,
        driverContact: 'N/A',
        vehicleType: 'Unknown',
        quantity: 'N/A',
        gatePassRequired: true,
        documentUploads: [],
        securityClearanceStatus: 'Approved'
    };
    
    const newVehicle: Vehicle = {
        id: data.vehicleId,
        driverName: data.driverName,
        carrier: data.carrier,
        vendorId: data.vendorId,
        appointmentTime: newAppointment.startTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        assignedDockId: data.assignedDockId,
        status: VehicleStatus.Approved,
    };
    
    setTimelineAppointments(prev => [...prev, newAppointment]);
    setVehicles(prev => [...prev, newVehicle]);
    
    if (data.checkIn) {
        handleCheckIn(data.vehicleId);
    } else {
        handleAssignToYard(data.vehicleId);
    }
    
    setIsSpotAppointmentModalOpen(false);
  };

  const handleCloseDockPanel = () => setDockPanelState({ isOpen: false, dock: null });
  const handleCloseWarehousePanel = () => setWarehousePanelState({ isOpen: false, warehouse: null });

  const handleSaveWarehouse = (warehouseData: Omit<Warehouse, 'id'> & { id?: string }) => {
      setWarehouses(prev => {
          if(warehouseData.id) {
              return prev.map(w => w.id === warehouseData.id ? { ...w, ...warehouseData } as Warehouse : w);
          } else {
              const newWarehouse: Warehouse = {
                  ...warehouseData,
                  id: `W${(prev.length + 1).toString().padStart(2, '0')}`
              } as Warehouse;

              // Also create docks if dockCount is specified
              if (newWarehouse.dockCount > 0) {
                  const newDocks: Dock[] = Array.from({ length: newWarehouse.dockCount }).map((_, i) => ({
                      warehouseId: newWarehouse.id,
                      name: `D${(i + 1).toString().padStart(2, '0')}`,
                      status: DockStatus.Available,
                      location: 'Default Bay',
                      capacity: 1,
                      lastMaintenance: new Date().toISOString().split('T')[0],
                      dockType: DockType.Both,
                      operationalHours: { start: '06:00', end: '22:00' },
                      compatibleVehicleTypes: ['Trailer', 'Box Truck'],
                      safetyComplianceTags: [],
                      id: `${newWarehouse.id}-D${(i + 1).toString().padStart(2, '0')}`
                  }));
                  setDocks(d => [...d, ...newDocks]);
              }
              return [...prev, newWarehouse];
          }
      });
      addActivity(`Warehouse ${warehouseData.name} was ${warehouseData.id ? 'updated' : 'created'}.`, ActivityLogType.Maintenance);
      handleCloseWarehousePanel();
  };

  const handleDeleteWarehouse = (warehouseId: string) => {
      const whName = warehouses.find(w => w.id === warehouseId)?.name;
      setWarehouses(prev => prev.filter(w => w.id !== warehouseId));
      setDocks(prev => prev.filter(d => d.warehouseId !== warehouseId));
      if (selectedWarehouseId === warehouseId) {
          setSelectedWarehouseId(warehouses[0]?.id || '');
      }
      addActivity(`Warehouse ${whName || warehouseId} was deleted.`, ActivityLogType.Maintenance);
  };

  const dashboardData = useMemo((): DashboardData => {
      const today = new Date();
      const todaysAppointments = filteredTimelineAppointments.filter(a => new Date(a.startTime).toDateString() === today.toDateString());
      const completedToday = todaysAppointments.filter(a => a.status === 'Completed');
      const cancelledToday = filteredTimelineAppointments.filter(a => new Date(a.startTime).toDateString() === today.toDateString() && a.status === 'Cancelled');
      const pendingToday = todaysAppointments.filter(a => a.status === 'Draft');
      const activeDocks = filteredDocks.filter(d => d.status === DockStatus.Occupied);
      const delayedVehicles = filteredOperations.filter(op => op.status === OperationStatus.Delayed);

      return {
      kpis: [
        { 
            title: "Today's Appointments", 
            value: `${todaysAppointments.length}`, 
            subtext: 'Inbound & outbound combined', 
            icon: AppointmentsIcon,
            iconBgColor: 'bg-blue-400' 
        },
        { 
            title: 'On-Time Arrivals', 
            value: '91%', 
            subtext: 'Compared to scheduled slots', 
            icon: CheckCircleIcon, 
            iconBgColor: 'bg-green-400' 
        },
        { 
            title: 'Average Turnaround Time', 
            value: '41 min', 
            subtext: 'Last 24 hours', 
            icon: ClockIcon, 
            iconBgColor: 'bg-yellow-400' 
        },
        { 
            title: 'Appointments Completed', 
            value: `${completedToday.length}/${todaysAppointments.length}`, 
            subtext: 'Out of total booked slots', 
            icon: TruckIcon, 
            iconBgColor: 'bg-purple-400'
        },
        { 
            title: 'Cancellations', 
            value: `${cancelledToday.length}`,
            subtext: 'By clients or internal team', 
            icon: XCircleIcon, 
            iconBgColor: 'bg-gray-400' 
        },
        { 
            title: 'Pending Approvals', 
            value: `${pendingToday.length}`, 
            subtext: 'Requires action', 
            icon: AlertTriangleIcon, 
            iconBgColor: 'bg-purple-400' 
        },
        { 
            title: 'Active Docks', 
            value: `${activeDocks.length}`, 
            subtext: 'Real-time dock engagement', 
            icon: DocksIcon, 
            iconBgColor: 'bg-cyan-400' 
        },
        { 
            title: 'Delayed Vehicles', 
            value: `${delayedVehicles.length}`, 
            subtext: 'Beyond scheduled time window', 
            icon: AlertTriangleIcon, 
            iconBgColor: 'bg-red-400' 
        },
      ],
      dockActivities: filteredOperations.slice(0, 5).map(op => {
          const vehicle = filteredVehicles.find(v => v.id === op.vehicleId);
          return {
              id: op.id,
              dockName: op.dockId,
              vehicleNumber: op.vehicleId,
              carrier: vehicle?.carrier || 'Unknown',
              startTime: new Date(op.startTime).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}),
              endTime: new Date(op.estCompletionTime).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}),
              status: op.status as DockActivityStatus,
          };
      }),
      idleTimePerDock: [], // Placeholder
      loadUnloadTrend: Array.from({length: 7}).map((_, i) => {
          const d = new Date();
          d.setDate(d.getDate() - (6-i));
          return {
              name: d.toLocaleDateString('en-US', {weekday: 'short'}),
              loading: Math.floor(Math.random() * 15) + 5,
              unloading: Math.floor(Math.random() * 15) + 8,
          }
      }),
      onTimeVsLateData: [{ name: 'On-Time', value: 85 }, { name: 'Late', value: 15 }], // Placeholder
      handlingRatio: { manual: 60, automated: 40 }, // Placeholder
  }
}, [filteredVehicles, filteredOperations, filteredDocks, filteredTimelineAppointments]);

  const renderPage = () => {
    switch (activePage) {
      case Page.Dashboard:
        return <Dashboard data={dashboardData} docks={filteredDocks} vehicles={filteredVehicles} operations={filteredOperations} timelineAppointments={filteredTimelineAppointments} onSelectItem={handleSelectItem} />;
      case Page.Appointments:
        return <Appointments 
            appointments={filteredTimelineAppointments} 
            docks={filteredTimelineDocks} 
            onOpenCreatePanel={handleOpenAppointmentPanelForCreate} 
            onOpenEditPanel={handleOpenAppointmentPanelForEdit}
            onOpenSlotFinder={() => setIsSlotFinderModalOpen(true)}
            settings={appSettings}
            />;
      case Page.GateManagement:
        return <GateManagement 
            automationMode={automationMode}
            docks={filteredDocks}
            vehicles={filteredVehicles}
            vendors={vendors}
            timelineAppointments={filteredTimelineAppointments}
            onCheckIn={handleCheckIn}
            onAssignToYard={handleAssignToYard}
            onAssignFromYard={handleAssignFromYard}
            onCheckOut={handleCheckOut}
            onSetDockAvailable={handleClearDockMaintenance}
            onOpenSpotAppointmentModal={() => setIsSpotAppointmentModalOpen(true)}
            onSelectItem={handleSelectItem}
            onSimulateArrival={handleSimulateArrival}
            />;
      case Page.Operations:
        return <Operations 
            operations={filteredOperations}
            vehicles={filteredVehicles.filter(v => v.status === VehicleStatus.Entered)}
            onStartOperationSimple={handleStartOperationSimple}
            onCompleteOperation={handleCompleteOperation}
            onReportDelay={handleReportDelay}
            onOpenStartOperationModal={() => setIsStartOperationModalOpen(true)}
            />;
      case Page.Docks:
        return <Docks 
            docks={filteredDocks}
            vehicles={filteredVehicles}
            operations={filteredOperations}
            timelineAppointments={filteredTimelineAppointments}
            automationMode={automationMode}
            recentlyUpdatedDocks={recentlyUpdatedDocks}
            onRunPredictiveMaintenance={handleRunPredictiveMaintenance}
            onSetMaintenance={handleSetDockMaintenance}
            onClearMaintenance={handleClearDockMaintenance}
            onSelectItem={handleSelectItem}
            onBookAppointment={handleBookAppointmentForDock}
            />;
      case Page.Carriers:
        return <Carriers carriers={carriers} vehicles={vehicles} onSave={handleSaveCarrier} onDelete={handleDeleteCarrier} />;
      case Page.Vendors:
        return <Vendors vendors={vendors} vehicles={vehicles} onSave={handleSaveVendor} onDelete={handleDeleteVendor}/>;
      case Page.Documents:
        return <Documents 
                    documents={filteredDocuments} 
                    vehicles={filteredVehicles}
                    docks={filteredDocks}
                    carriers={carriers}
                    vendors={vendors}
                    onSave={handleSaveDocument} 
                    onDelete={handleDeleteDocument}
                />;
      case Page.Reports:
        return <Reports />;
      case Page.Settings:
        return <Settings 
            users={users} 
            settings={appSettings} 
            onDeleteUser={handleDeleteUser}
            onSettingsChange={handleSettingsChange}
            onInviteClick={() => setIsAddRolePanelOpen(true)}
        />;
      case Page.Help:
        return <Help onSubmitSupportRequest={handleSubmitSupportRequest} />;
      case Page.Configurations:
        return <Configurations 
            warehouses={warehouses}
            docks={docks}
            onSaveWarehouse={handleSaveWarehouse}
            onDeleteWarehouse={handleDeleteWarehouse}
            onOpenWarehousePanel={(wh) => setWarehousePanelState({isOpen: true, warehouse: wh})}
            onSaveDock={handleSaveDock}
            onDeleteDock={handleDeleteDock}
            onOpenDockPanel={(dock, whId) => setDockPanelState({isOpen: true, dock, warehouseId: whId})}
            />;
      default:
        return <Dashboard data={dashboardData} docks={filteredDocks} vehicles={filteredVehicles} operations={filteredOperations} timelineAppointments={filteredTimelineAppointments} onSelectItem={handleSelectItem} />;
    }
  };

  return (
    <div className="flex h-screen bg-gray-100 font-sans">
      <Sidebar isOpen={isSidebarOpen} onToggle={toggleSidebar} activePage={activePage} setActivePage={setActivePage} />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header 
            onToggleSidebar={toggleSidebar} 
            automationMode={automationMode}
            onToggleAutomationMode={handleToggleAutomationMode}
            warehouses={warehouses}
            selectedWarehouseId={selectedWarehouseId}
            onWarehouseChange={handleWarehouseChange}
            onOpenAIAssistant={() => setIsAIAssistantOpen(true)}
            />
        <main className="flex-1 overflow-y-auto bg-gray-50 text-gray-800">
          {renderPage()}
        </main>
      </div>
      <GatePassModal vehicle={gatePassVehicle} onClose={() => setGatePassVehicle(null)} />
      <AddRolePanel
          isOpen={isAddRolePanelOpen}
          onClose={() => setIsAddRolePanelOpen(false)}
          onSave={handleSaveRole}
      />
      <SpotAppointmentModal 
        isOpen={isSpotAppointmentModalOpen} 
        onClose={() => setIsSpotAppointmentModalOpen(false)}
        availableDocks={filteredDocks.filter(d => d.status === DockStatus.Available)}
        carriers={carriers}
        vendors={vendors}
        onCreateAppointment={handleCreateSpotAppointment}
        />
       <StartOperationModal
          isOpen={isStartOperationModalOpen}
          onClose={() => setIsStartOperationModalOpen(false)}
          vehicles={filteredVehicles.filter(v => v.status === VehicleStatus.Entered && !operations.some(op => op.vehicleId === v.id && op.status !== OperationStatus.Completed))}
          onStartOperation={handleStartOperationFromModal}
        />
      <ActivityFeed log={activityLog} />
      <DetailPanel
        item={selectedDetailItem}
        vehicles={filteredVehicles}
        operations={filteredOperations}
        vendors={vendors}
        documents={filteredDocuments}
        timelineAppointments={filteredTimelineAppointments}
        onClose={handleCloseDetailPanel}
        onCheckOut={handleCheckOut}
        onReportDelay={handleReportDelay}
        onStartOperation={() => {}}
        onBookAppointment={handleBookAppointmentForDock}
      />
       <AppointmentModal
        isOpen={appointmentPanelState.isOpen}
        onClose={handleCloseAppointmentPanel}
        appointment={appointmentPanelState.appointment}
        createData={appointmentPanelState.createData}
        docks={filteredTimelineDocks}
        onSave={(appt) => {
            handleSaveAppointment(appt);
            handleCloseAppointmentPanel();
        }}
        onDelete={(id) => {
            handleDeleteAppointment(id);
            handleCloseAppointmentPanel();
        }}
      />
       <OptimalSlotFinderModal
        isOpen={isSlotFinderModalOpen}
        onClose={() => setIsSlotFinderModalOpen(false)}
        onFindSlot={handleFindOptimalSlot}
        isFinding={isFindingSlot}
      />
      <AIAssistantModal
        isOpen={isAIAssistantOpen}
        onClose={() => setIsAIAssistantOpen(false)}
        contextData={{ activePage, selectedWarehouseId, dashboardData }}
        systemInstruction="You are a logistics dashboard assistant. Answer questions based on the provided JSON data context. Be concise and helpful."
        quickActions={['Summarize KPIs', 'Which docks are available?', 'Any delays?']}
       />
      <WarehousePanel
        isOpen={warehousePanelState.isOpen}
        onClose={handleCloseWarehousePanel}
        onSave={handleSaveWarehouse}
        onDelete={handleDeleteWarehouse}
        warehouse={warehousePanelState.warehouse}
      />
      <DockModal
        isOpen={dockPanelState.isOpen}
        onClose={handleCloseDockPanel}
        onSave={handleSaveDock}
        onDelete={handleDeleteDock}
        dock={dockPanelState.dock}
        warehouses={warehouses}
        currentWarehouseId={dockPanelState.warehouseId || selectedWarehouseId}
      />
    </div>
  );
};

export default App;