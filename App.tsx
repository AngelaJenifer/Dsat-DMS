import React, { useState, useMemo, useEffect, useCallback } from 'react';
import Sidebar from './components/Sidebar.tsx';
import Header from './components/Header.tsx';
import Dashboard from './components/Dashboard.tsx';
import GateManagement from './components/GateManagement.tsx';
import Operations from './components/Operations.tsx';
import Customers from './components/Customers.tsx';
import Help from './components/Help.tsx';
import Settings from './components/Settings.tsx';
import Reports from './components/Reports.tsx';
import Configurations from './components/Configurations.tsx';
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
import CreateUserModal from './components/InviteUserModal.tsx';
import CustomerPanel from './components/CustomerPanel.tsx';
import { DockScheduler } from './components/DockScheduler.tsx';
import { Page, Dock, Vehicle, DockStatus, VehicleStatus, Operation, OperationStatus, OperationType, Customer, Document, User, AppSettings, Role, DashboardData, DockActivityStatus, TimelineAppointment, ReportData, ActivityLog, ActivityLogType, DocumentStatus, TimelineDock, Warehouse, WarehouseType, DockType, CustomerType, PermissionsState, TimeSlotsData } from './types.ts';
import { DOCKS_DATA, VEHICLES_DATA, OPERATIONS_DATA, CUSTOMERS_DATA, DOCUMENTS_DATA, USERS_DATA, INITIAL_SETTINGS_DATA, TIMELINE_APPOINTMENTS_DATA, TIMELINE_DOCKS_DATA, INITIAL_ACTIVITY_LOG_DATA, WAREHOUSES_DATA, TIME_SLOTS_DATA } from './constants.tsx';
import { AppointmentsIcon, CheckCircleIcon, ClockIcon, TruckIcon, XCircleIcon, AlertTriangleIcon, DocksIcon, Squares2X2Icon } from './components/icons/Icons.tsx';
import { parseAppointmentTime, formatDate } from './utils.ts';
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
  const [customers, setCustomers] = useState<Customer[]>(CUSTOMERS_DATA);
  const [documents, setDocuments] = useState<Document[]>(DOCUMENTS_DATA);
  const [timelineAppointments, setTimelineAppointments] = useState<TimelineAppointment[]>(TIMELINE_APPOINTMENTS_DATA);
  const [users, setUsers] = useState<User[]>(USERS_DATA);
  const [appSettings, setAppSettings] = useState<AppSettings>(INITIAL_SETTINGS_DATA);
  const [activityLog, setActivityLog] = useState<ActivityLog[]>(INITIAL_ACTIVITY_LOG_DATA);
  const [timeSlots, setTimeSlots] = useState<TimeSlotsData>(TIME_SLOTS_DATA);

  // UI / Contextual State
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedWarehouseId, setSelectedWarehouseId] = useState<string>(warehouses[0]?.id || '');
  const [gatePassVehicle, setGatePassVehicle] = useState<Vehicle | null>(null);
  const [isSpotAppointmentModalOpen, setIsSpotAppointmentModalOpen] = useState(false);
  const [isStartOperationModalOpen, setIsStartOperationModalOpen] = useState(false);
  const [selectedDetailItem, setSelectedDetailItem] = useState<Vehicle | Dock | null>(null);
  const [appointmentPanelState, setAppointmentPanelState] = useState<{ isOpen: boolean; appointment: TimelineAppointment | null; createData?: { time: Date, dockId: string } }>({ isOpen: false, appointment: null });
  const [isAIAssistantOpen, setIsAIAssistantOpen] = useState(false);
  const [warehousePanelState, setWarehousePanelState] = useState<{ isOpen: boolean; warehouse: Warehouse | null; }>({ isOpen: false, warehouse: null });
  const [dockPanelState, setDockPanelState] = useState<{ isOpen: boolean; dock: Dock | null; warehouseId?: string }>({ isOpen: false, dock: null });
  const [isUserModalOpen, setIsUserModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [customerPanelState, setCustomerPanelState] = useState<{ isOpen: boolean; customer: Customer | null }>({ isOpen: false, customer: null });


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
  } = useMemo(() => {
      const currentDocks = docks.filter(d => d.warehouseId === selectedWarehouseId);
      const currentDockIds = new Set(currentDocks.map(d => d.id));
      
      const currentAppointments = timelineAppointments.filter(a => currentDockIds.has(a.dockId));
      const currentOperations = operations.filter(o => currentDockIds.has(o.dockId));
      const currentVehicles = vehicles.filter(v => currentDockIds.has(v.assignedDockId));
      
      const currentTimelineDocks = TIMELINE_DOCKS_DATA.filter(d => currentDockIds.has(d.id));

      return {
          filteredDocks: currentDocks,
          filteredVehicles: currentVehicles,
          filteredOperations: currentOperations,
          filteredTimelineAppointments: currentAppointments,
          filteredTimelineDocks: currentTimelineDocks,
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
    const completionTime = Date.now();
    setOperations(prev => prev.map(op => op.vehicleId === vehicleId && op.status !== OperationStatus.Completed ? { ...op, status: OperationStatus.Completed, actualCompletionTime: completionTime } : op));
    setVehicles(prev => prev.map(v => v.id === vehicleId ? { ...v, status: VehicleStatus.Exited, exitTime: completionTime } : v));
    setDocks(prev => prev.map(d => d.id === dockId ? { ...d, status: DockStatus.Available, notes: 'Operation completed automatically' } : d));
    
    setTimelineAppointments(prev => prev.map(appt => {
        if (appt.vehicleNumber === vehicleId && formatDate(new Date(appt.startTime)) === formatDate(new Date(completionTime))) {
            return {
                ...appt,
                status: 'Completed',
                actualCompletionTime: new Date(completionTime),
            };
        }
        return appt;
    }));

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
    const carriers = customers.filter(c => c.customerType === CustomerType.Carrier);
    const carrierPerformance = carriers.slice(0,10).map(c => ({
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
  }, [filteredOperations, filteredDocks, customers]);

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
    const vehicleToUpdate = vehicles.find(v => v.id === vehicleId);
    if (!vehicleToUpdate) {
      console.error(`Check-in failed: Vehicle ${vehicleId} not found.`);
      return;
    }

    const updatedVehicle = { ...vehicleToUpdate, status: VehicleStatus.Entered, entryTime: Date.now() };

    setVehicles(prev => prev.map(v => v.id === vehicleId ? updatedVehicle : v));
    setDocks(prev => prev.map(d => d.id === updatedVehicle.assignedDockId ? { ...d, status: DockStatus.Occupied, notes: `Vehicle ${vehicleId} checked in.` } : d));
    
    setGatePassVehicle(updatedVehicle);
    addActivity(`Vehicle ${updatedVehicle.id} checked in to Dock ${updatedVehicle.assignedDockId}.`, ActivityLogType.CheckIn);
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

    const completionTime = Date.now();
    setOperations(prev => prev.map(o => o.id === operationId ? { ...o, status: OperationStatus.Completed, actualCompletionTime: completionTime } : o));
    setDocks(prev => prev.map(d => d.id === op.dockId ? { ...d, status: DockStatus.Available, notes: undefined } : d));
    setVehicles(prev => prev.map(v => v.id === op.vehicleId ? { ...v, status: VehicleStatus.Exited, exitTime: completionTime } : v));
    
    setTimelineAppointments(prev => prev.map(appt => {
        if (appt.vehicleNumber === op.vehicleId && formatDate(new Date(appt.startTime)) === formatDate(new Date(completionTime))) {
            return {
                ...appt,
                status: 'Completed',
                actualCompletionTime: new Date(completionTime),
            };
        }
        return appt;
    }));

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

  const handleOpenCustomerPanel = (customer: Customer | null = null) => {
    setCustomerPanelState({ isOpen: true, customer });
  };
  const handleCloseCustomerPanel = () => {
    setCustomerPanelState({ isOpen: false, customer: null });
  };

  const handleSaveCustomer = (customerData: Omit<Customer, 'id'> & { id?: string }) => {
    setCustomers(prev => {
        const isEditing = !!customerData.id;
        if (isEditing) {
            return prev.map(c => c.id === customerData.id ? { ...c, ...customerData } as Customer : c);
        } else {
            const prefix = customerData.customerType === CustomerType.Carrier ? 'C' : 'V';
            const newCustomer: Customer = { 
                ...customerData,
                id: `${prefix}${Date.now()}` 
            } as Customer;
            return [...prev, newCustomer];
        }
    });
    addActivity(`${customerData.customerType} ${customerData.name} was ${customerData.id ? 'updated' : 'created'}.`, ActivityLogType.NewAppointment);
    handleCloseCustomerPanel();
  };

  const handleDeleteCustomer = (customerId: string) => {
    const customer = customers.find(c => c.id === customerId);
    if (!customer) return;
    setCustomers(prev => prev.filter(c => c.id !== customerId));
    addActivity(`${customer.customerType} ${customer.name} was deleted.`, ActivityLogType.NewAppointment);
  };
  
  const handleSaveRole = (roleData: { roleName: string; roleDescription: string; permissions: PermissionsState; isEditing?: boolean; }) => {
      if (roleData.isEditing) {
          console.log("Role Updated:", roleData);
          addActivity(`Role '${roleData.roleName}' was updated.`, ActivityLogType.Maintenance);
      } else {
          console.log("New Role Saved:", roleData);
          addActivity(`A new role '${roleData.roleName}' was configured.`, ActivityLogType.Maintenance);
      }
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
    handleCloseAppointmentPanel();
  };
  
  const handleDeleteAppointment = (appointmentId: string) => {
      const appt = timelineAppointments.find(a => a.id === appointmentId);
      setTimelineAppointments(prev => prev.filter(a => a.id !== appointmentId));
      addActivity(`Appointment ${appt?.appointmentId} for ${appt?.companyName} was deleted.`, ActivityLogType.NewAppointment);
  }
  
  const handleCreateSpotAppointment = (data: { vehicleId: string; driverName: string; customerId: string; assignedDockId: string; checkIn: boolean }) => {
    const customer = customers.find(c => c.id === data.customerId);
    if (!customer) {
        alert("Selected customer not found.");
        return;
    }

    const now = new Date();
    const newAppointment: TimelineAppointment = {
        id: `apt-spot-${now.getTime()}`,
        appointmentId: `WALK-IN-${data.vehicleId}`,
        companyName: customer.name,
        purposeOfVisit: 'Walk-in/Spot',
        loadType: 'Mixed',
        startTime: now,
        endTime: new Date(now.getTime() + 30 * 60 * 1000), // 30 min duration
        expectedDuration: 30,
        dockId: data.assignedDockId,
        status: 'Approved',
        appointmentType: 'Inbound', // Assuming inbound for walk-ins
        vehicleNumber: data.vehicleId,
        transporter: customer.name,
        driverName: data.driverName,
        driverContact: 'N/A',
        vehicleType: 'Unknown',
        quantity: 'N/A',
        gatePassRequired: true,
        documentUploads: [],
        securityClearanceStatus: 'Approved'
    };
    
    const vehicleStatus = data.checkIn ? VehicleStatus.Entered : VehicleStatus.Yard;
    const entryTimestamp = data.checkIn ? now.getTime() : undefined;

    const newVehicle: Vehicle = {
        id: data.vehicleId,
        driverName: data.driverName,
        carrier: customer.name,
        vendorId: customer.id,
        appointmentTime: newAppointment.startTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        assignedDockId: data.assignedDockId,
        status: vehicleStatus,
        entryTime: entryTimestamp,
    };
    
    setTimelineAppointments(prev => [...prev, newAppointment]);
    setVehicles(prev => [...prev, newVehicle]);
    
    if (data.checkIn) {
        setDocks(prevDocks =>
          prevDocks.map(d => d.id === data.assignedDockId ? { ...d, status: DockStatus.Occupied, notes: `Vehicle ${data.vehicleId} checked in.` } : d)
        );
        setGatePassVehicle(newVehicle);
        addActivity(`Vehicle ${newVehicle.id} checked in to Dock ${data.assignedDockId}.`, ActivityLogType.CheckIn);
    } else {
        addActivity(`Vehicle ${newVehicle.id} assigned to yard.`, ActivityLogType.Yard);
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

  const handleOpenUserModal = (user: User | null = null) => {
    setEditingUser(user);
    setIsUserModalOpen(true);
  };

  const handleCloseUserModal = () => {
    setIsUserModalOpen(false);
    setEditingUser(null);
  };

  const handleSaveUser = (userData: Partial<User> & { password?: string }) => {
    // We don't use the password here, but in a real app it would be sent to a backend
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { password, ...restOfUserData } = userData;
  
    if (restOfUserData.id) { // Editing existing user
        setUsers(prevUsers => 
            prevUsers.map(user => 
                user.id === restOfUserData.id ? { ...user, ...restOfUserData } as User : user
            )
        );
        addActivity(`User ${restOfUserData.name} was updated.`, ActivityLogType.Maintenance);
    } else { // Creating new user
        const newUser: User = {
            id: `U${users.length + 1}-${Math.random().toString(16).slice(2)}`,
            avatarUrl: `https://picsum.photos/seed/user${users.length + 1}/40/40`,
            ...restOfUserData,
        } as User;
        setUsers(prev => [...prev, newUser]);
        addActivity(`User ${newUser.name} was created with role ${newUser.role}.`, ActivityLogType.Maintenance);
    }
    
    handleCloseUserModal();
  };


  const dashboardData = useMemo((): DashboardData => {
      const today = new Date();
      const todaysAppointments = filteredTimelineAppointments.filter(a => new Date(a.startTime).toDateString() === today.toDateString());
      const completedToday = todaysAppointments.filter(a => a.status === 'Completed');
      const cancelledToday = filteredTimelineAppointments.filter(a => new Date(a.startTime).toDateString() === today.toDateString() && a.status === 'Cancelled');
      const activeDocks = filteredDocks.filter(d => d.status === DockStatus.Occupied);
      const delayedVehicles = filteredOperations.filter(op => op.status === OperationStatus.Delayed);
      const yardVehicles = filteredVehicles.filter(v => v.status === VehicleStatus.Yard);

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
                title: 'Cancelled Appointments', 
                value: `${cancelledToday.length}`, 
                subtext: "Today's cancellations", 
                icon: XCircleIcon, 
                iconBgColor: 'bg-red-400'
            },
            {
                title: 'Active Docks',
                value: `${activeDocks.length} / ${filteredDocks.length}`,
                subtext: 'Docks currently occupied',
                icon: DocksIcon,
                iconBgColor: 'bg-cyan-400'
            },
            {
                title: 'Vehicles in Yard',
                value: `${yardVehicles.length}`,
                subtext: 'Awaiting dock assignment',
                icon: Squares2X2Icon,
                iconBgColor: 'bg-indigo-400'
            },
            {
                title: 'Delayed Operations',
                value: `${delayedVehicles.length}`,
                subtext: 'Operations currently delayed',
                icon: AlertTriangleIcon,
                iconBgColor: 'bg-orange-400'
            }
          ],
          dockActivities: filteredOperations
              .filter(op => op.status === OperationStatus.InProgress || op.status === OperationStatus.Delayed)
              .slice(0, 5)
              .map(op => {
                  const vehicle = vehicles.find(v => v.id === op.vehicleId);
                  const dock = filteredDocks.find(d => d.id === op.dockId);
                  return {
                      id: op.id,
                      dockName: dock ? dock.name : op.dockId,
                      vehicleNumber: op.vehicleId,
                      carrier: vehicle?.carrier || 'Unknown',
                      startTime: new Date(op.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                      endTime: new Date(op.estCompletionTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                      status: op.type as DockActivityStatus,
                  };
              }),
          idleTimePerDock: filteredDocks.slice(0, 5).map(d => ({ name: d.name, hours: d.status === DockStatus.Available ? Math.floor(Math.random() * 4) + 1 : 0 })),
          loadUnloadTrend: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map(day => ({
              name: day,
              loading: Math.floor(Math.random() * 30) + 10,
              unloading: Math.floor(Math.random() * 30) + 10,
          })),
          onTimeVsLateData: [
              { name: 'On-Time', value: 128 },
              { name: 'Late', value: 14 },
          ],
          handlingRatio: { manual: 65, automated: 35 },
      };
  }, [filteredTimelineAppointments, filteredDocks, filteredOperations, vehicles, filteredVehicles]);
  
  const carriers = useMemo(() => customers.filter(c => c.customerType === CustomerType.Carrier), [customers]);
  const vendors = useMemo(() => customers.filter(c => c.customerType === CustomerType.Vendor), [customers]);

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
            <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-100">
                {activePage === Page.Dashboard && <Dashboard data={dashboardData} docks={filteredDocks} vehicles={filteredVehicles} operations={filteredOperations} timelineAppointments={filteredTimelineAppointments} onSelectItem={handleSelectItem} />}
                {activePage === Page.DockScheduler && <DockScheduler appointments={filteredTimelineAppointments} docks={filteredDocks} onOpenCreatePanel={handleOpenAppointmentPanelForCreate} onOpenEditPanel={handleOpenAppointmentPanelForEdit} onOpenSlotFinder={() => setIsSlotFinderModalOpen(true)} settings={appSettings} automationMode={automationMode} recentlyUpdatedDocks={recentlyUpdatedDocks} onRunPredictiveMaintenance={handleRunPredictiveMaintenance} onSetMaintenance={handleSetDockMaintenance} onClearMaintenance={handleClearDockMaintenance} onSelectItem={handleSelectItem} onBookAppointment={handleBookAppointmentForDock} currentDate={currentDate} onDateChange={setCurrentDate} timeSlots={timeSlots} />}
                {activePage === Page.GateManagement && <GateManagement automationMode={automationMode} docks={filteredDocks} vehicles={vehicles} vendors={vendors} timelineAppointments={filteredTimelineAppointments} onCheckIn={handleCheckIn} onAssignToYard={handleAssignToYard} onAssignFromYard={handleAssignFromYard} onCheckOut={handleCheckOut} onSetDockAvailable={handleClearDockMaintenance} onOpenSpotAppointmentModal={() => setIsSpotAppointmentModalOpen(true)} onSelectItem={handleSelectItem} onSimulateArrival={handleSimulateArrival} />}
                {activePage === Page.Operations && <Operations operations={filteredOperations} vehicles={filteredVehicles} docks={filteredDocks} onStartOperationSimple={handleStartOperationSimple} onCompleteOperation={handleCompleteOperation} onReportDelay={handleReportDelay} onOpenStartOperationModal={() => setIsStartOperationModalOpen(true)} />}
                {activePage === Page.Customers && <Customers customers={customers} onDelete={handleDeleteCustomer} onOpenPanel={handleOpenCustomerPanel} />}
                {activePage === Page.Reports && <Reports vehicles={vehicles} docks={docks} />}
                {activePage === Page.Settings && <Settings users={users} settings={appSettings} onDeleteUser={handleDeleteUser} onSettingsChange={handleSettingsChange} onSaveRole={handleSaveRole} onOpenUserModal={handleOpenUserModal} />}
                {activePage === Page.Help && <Help onSubmitSupportRequest={handleSubmitSupportRequest} />}
                {activePage === Page.DockManagement && <Configurations warehouses={warehouses} docks={docks} onSaveWarehouse={handleSaveWarehouse} onSaveDock={handleSaveDock} onDeleteWarehouse={handleDeleteWarehouse} onDeleteDock={handleDeleteDock} onOpenWarehousePanel={(wh) => setWarehousePanelState({isOpen: true, warehouse: wh})} onOpenDockPanel={(dock, whId) => setDockPanelState({isOpen: true, dock, warehouseId: whId})} timeSlots={timeSlots} onSaveTimeSlots={setTimeSlots} />}
            </main>
        </div>
        
        {/* Modals and Panels */}
        <ActivityFeed log={activityLog} />
        <DetailPanel item={selectedDetailItem} vehicles={vehicles} operations={operations} vendors={vendors} documents={documents} docks={docks} timelineAppointments={timelineAppointments} onClose={handleCloseDetailPanel} onCheckOut={handleCheckOut} onReportDelay={handleReportDelay} onStartOperation={handleStartOperationFromModal} onBookAppointment={handleBookAppointmentForDock} currentDate={currentDate} />
        <GatePassModal vehicle={gatePassVehicle} onClose={() => setGatePassVehicle(null)} />
        <SpotAppointmentModal isOpen={isSpotAppointmentModalOpen} onClose={() => setIsSpotAppointmentModalOpen(false)} availableDocks={filteredDocks.filter(d => d.status === DockStatus.Available)} customers={customers} onCreateAppointment={handleCreateSpotAppointment} />
        <AppointmentModal isOpen={appointmentPanelState.isOpen} onClose={handleCloseAppointmentPanel} appointment={appointmentPanelState.appointment} onSave={handleSaveAppointment} onDelete={handleDeleteAppointment} createData={appointmentPanelState.createData} docks={filteredTimelineDocks} />
        <OptimalSlotFinderModal isOpen={isSlotFinderModalOpen} onClose={() => setIsSlotFinderModalOpen(false)} onFindSlot={handleFindOptimalSlot} isFinding={isFindingSlot} />
        <WarehousePanel isOpen={warehousePanelState.isOpen} onClose={handleCloseWarehousePanel} onSave={handleSaveWarehouse} onDelete={handleDeleteWarehouse} warehouse={warehousePanelState.warehouse} />
        <DockModal isOpen={dockPanelState.isOpen} onClose={handleCloseDockPanel} onSave={handleSaveDock} onDelete={handleDeleteDock} dock={dockPanelState.dock} warehouses={warehouses} currentWarehouseId={dockPanelState.warehouseId || selectedWarehouseId} />
        <StartOperationModal isOpen={isStartOperationModalOpen} onClose={() => setIsStartOperationModalOpen(false)} vehicles={filteredVehicles.filter(v => v.status === VehicleStatus.Entered)} onStartOperation={handleStartOperationFromModal} />
        <CreateUserModal 
            isOpen={isUserModalOpen} 
            onClose={handleCloseUserModal} 
            onSave={handleSaveUser}
            userToEdit={editingUser}
            warehouses={warehouses}
        />
        <CustomerPanel 
            isOpen={customerPanelState.isOpen}
            onClose={handleCloseCustomerPanel}
            onSave={handleSaveCustomer}
            customer={customerPanelState.customer}
        />
        <AIAssistantModal 
            isOpen={isAIAssistantOpen} 
            onClose={() => setIsAIAssistantOpen(false)}
            contextData={{docks: filteredDocks, vehicles: filteredVehicles, operations: filteredOperations, appointments: filteredTimelineAppointments}}
            systemInstruction="You are a helpful logistics coordinator AI. Analyze the provided data to answer questions about dock status, vehicle locations, and operational efficiency."
            quickActions={["Which docks are available?", "Summarize any delays.", "When is the next appointment?"]}
        />
    </div>
  );
};

export default App;