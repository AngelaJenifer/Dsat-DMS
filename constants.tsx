import React from 'react';
import { Dock, Vehicle, DockStatus, VehicleStatus, Operation, OperationType, OperationStatus, Customer, CustomerType, Document, DocumentType, DocumentStatus, Role, User, AppSettings, TimelineDock, TimelineAppointment, TimelineAppointmentStatus, ActivityLog, ActivityLogType, Warehouse, WarehouseType, DockType, DayOfWeek, TimeSlot } from './types.ts';
import {
    ChartBarIcon,
    AppointmentsIcon,
    LogInIcon,
    PlayCircleIcon,
    DocksIcon,
    BuildingOfficeIcon,
    SettingsIcon,
    InformationCircleIcon,
    ChevronDoubleLeftIcon,
    MenuIcon,
    SparklesIcon,
    XMarkIcon,
    AlertTriangleIcon,
    PencilIcon,
    TrashIcon,
    ArrowDownTrayIcon,
    SnowflakeIcon,
    ViewColumnsIcon,
    TruckIcon,
    CarriersIcon,
    KeyIcon,
} from './components/icons/Icons.tsx';

export const ICONS = {
  dashboard: <ChartBarIcon className="w-6 h-6" />,
  appointments: <AppointmentsIcon className="w-6 h-6" />,
  gate: <LogInIcon className="w-6 h-6" />,
  operations: <PlayCircleIcon className="w-5 h-5" />,
  docks: <DocksIcon className="w-6 h-6" />,
  truck: <TruckIcon className="w-5 h-5" />,
  customers: <BuildingOfficeIcon className="w-6 h-6" />,
  carriers: <CarriersIcon className="w-5 h-5" />,
  reports: <ChartBarIcon className="w-6 h-6" />,
  settings: <SettingsIcon className="w-6 h-6" />,
  help: <InformationCircleIcon className="w-6 h-6" />,
  chevronDoubleLeft: <ChevronDoubleLeftIcon className="w-5 h-5" />,
  menu: <MenuIcon className="w-6 h-6" />,
  sparkles: <SparklesIcon className="w-5 h-5" />,
  close: <XMarkIcon className="w-6 h-6" />,
  play: <PlayCircleIcon className="w-5 h-5" />,
  report: <AlertTriangleIcon className="h-6 w-6 text-red-500" />,
  info: <InformationCircleIcon className="w-5 h-5" />,
  edit: <PencilIcon className="w-5 h-5" />,
  delete: <TrashIcon className="w-5 h-5" />,
  download: <ArrowDownTrayIcon className="w-5 h-5" />,
  snowflake: <SnowflakeIcon className="w-5 h-5" />,
  toggleCalendar: <ViewColumnsIcon className="w-5 h-5" />,
  key: <KeyIcon className="w-5 h-5 text-gray-400" />,
};


const now = Date.now();
const minutes = (m: number) => m * 60 * 1000;

export const WAREHOUSES_DATA: Warehouse[] = [
    { 
        id: 'W01', 
        name: 'Metro Logistics Center', 
        address: '123 Industrial Way, Metropolis, USA',
        type: WarehouseType.Fulfillment,
        operatingHours: { start: '08:00', end: '20:00' },
        timezone: 'America/New_York (EST)',
        contactPerson: 'John Metro',
        contactInfo: 'j.metro@metro-logistics.com',
        dockCount: 20,
        isEnabled: true,
        zones: 'Bay A, Bay B',
    },
    { 
        id: 'W02', 
        name: 'Coastal Distribution Hub', 
        address: '456 Portside Drive, Coast City, USA',
        type: WarehouseType.Distribution,
        operatingHours: { start: '06:00', end: '22:00' },
        timezone: 'America/Los_Angeles (PST)',
        contactPerson: 'Jane Coast',
        contactInfo: '555-0102',
        dockCount: 20,
        isEnabled: true,
        zones: 'Bay C, Bay D',
    },
    { 
        id: 'W03', 
        name: 'Central Warehouse Complex', 
        address: '789 Heartland Blvd, Central City, USA',
        type: WarehouseType.CrossDock,
        operatingHours: { start: '00:00', end: '23:59' },
        timezone: 'America/Chicago (CST)',
        contactPerson: 'Sam Central',
        contactInfo: 's.central@cwcomplex.com',
        dockCount: 10,
        isEnabled: false,
        zones: 'Bay E',
    },
];

export const DOCKS_DEFINITION: Omit<Dock, 'id'>[] = (() => {
    const docks: Omit<Dock, 'id'>[] = [];
    
    for (let i = 1; i <= 50; i++) {
        let warehouseId: string;
        let location: string; // This is the Bay
        let isRefrigerated = false;

        if (i <= 10) { // W01, Bay A
            warehouseId = 'W01';
            location = 'Bay A';
        } else if (i <= 20) { // W01, Bay B
            warehouseId = 'W01';
            location = 'Bay B';
        } else if (i <= 30) { // W02, Bay C (Refrigerated)
            warehouseId = 'W02';
            location = 'Bay C';
            isRefrigerated = true;
        } else if (i <= 40) { // W02, Bay D
            warehouseId = 'W02';
            location = 'Bay D';
        } else { // W03, Bay E
            warehouseId = 'W03';
            location = 'Bay E';
        }

        const dockIdPart = `D${i.toString().padStart(2, '0')}`;
        const dockName = `${location} - ${dockIdPart}`;
        let status = DockStatus.Available;
        let notes: string | undefined = undefined;
        let maintenanceType: 'manual' | 'ai' | undefined = undefined;

        // Same random occupied/maintenance logic as before
        if ([2, 18, 25, 33, 41, 22, 35].includes(i)) {
            status = DockStatus.Occupied;
            notes = 'Vehicle present.';
        }
        if ([4, 14, 30, 48].includes(i)) {
            status = DockStatus.Maintenance;
            notes = 'Scheduled maintenance.';
            maintenanceType = 'manual';
        }

        let operationsSinceMaintenance = Math.floor(Math.random() * 40);
        if ([3, 11, 28].includes(i)) {
            operationsSinceMaintenance = 55 + Math.floor(Math.random() * 10);
        }

        const safetyTags: string[] = [];
        if (isRefrigerated) safetyTags.push('Cold Storage');
        if (i % 7 === 0) safetyTags.push('Hazmat Ready');

        docks.push({
            warehouseId,
            name: dockName,
            status,
            location,
            dockType: i % 3 === 0 ? DockType.Outbound : i % 2 === 0 ? DockType.Inbound : DockType.Both,
            operationalHours: { start: '06:00', end: '22:00' },
            capacity: i % 5 === 0 ? 2 : 1,
            compatibleVehicleTypes: isRefrigerated ? ['Reefer', 'Box Truck'] : ['Trailer', 'Box Truck'],
            dimensions: '12x14x60',
            safetyComplianceTags: safetyTags,
            lastMaintenance: `2024-0${Math.floor(i/10) + 1}-${(i % 28) + 1}`,
            notes,
            operationsSinceMaintenance,
            maintenanceType,
        });
    }
    return docks;
})();

export const DOCKS_DATA: Dock[] = DOCKS_DEFINITION.map((dock, index) => ({ ...dock, id: `D${(index + 1).toString().padStart(2, '0')}` }));

export const CUSTOMERS_DATA: Customer[] = [
  // Vendors
  {
    id: 'V01',
    name: 'Global Parts Inc.',
    contactPerson: 'David Chen',
    email: 'david.chen@globalparts.com',
    phone: '(555) 987-6543',
    address: '101 Industrial Park, Detroit, MI 48226',
    notes: 'Primary supplier for automotive components.',
    customerType: CustomerType.Vendor,
  },
  {
    id: 'V02',
    name: 'Fresh Produce Co.',
    contactPerson: 'Maria Rodriguez',
    email: 'maria.r@freshproduce.com',
    phone: '(555) 876-5432',
    address: '202 Farm Lane, Salinas, CA 93901',
    notes: 'Temperature-sensitive goods. Requires refrigerated docks.',
    customerType: CustomerType.Vendor,
  },
  {
    id: 'V03',
    name: 'BuildRight Materials',
    contactPerson: 'Steve Miller',
    email: 'steve.m@buildright.com',
    phone: '(555) 765-4321',
    address: '303 Construction Ave, Dallas, TX 75201',
    notes: 'Supplier of oversized construction materials.',
    customerType: CustomerType.Vendor,
  },
  { id: 'V04', name: 'Tuduu Logistics', contactPerson: 'Contact', email: 'contact@tuduu.com', phone: '555-222-0000', address: '123 Main St', notes: '', customerType: CustomerType.Vendor },
  { id: 'V05', name: 'Wave Carriers', contactPerson: 'Contact', email: 'contact@wave.com', phone: '555-333-0000', address: '123 Main St', notes: '', customerType: CustomerType.Vendor },
  { id: 'V06', name: 'Finsy Logistics', contactPerson: 'Contact', email: 'contact@finsy.com', phone: '555-444-0000', address: '123 Main St', notes: '', customerType: CustomerType.Vendor },
  { id: 'V07', name: 'Prilans Shipping', contactPerson: 'Contact', email: 'contact@prilans.com', phone: '555-555-0000', address: '123 Main St', notes: '', customerType: CustomerType.Vendor },
  { id: 'V08', name: 'PharmaCorp', contactPerson: 'Contact', email: 'contact@pharma.com', phone: '555-666-0000', address: '123 Main St', notes: '', customerType: CustomerType.Vendor },
  // Carriers
  { id: 'C01', name: 'QuickHaul', contactPerson: 'Jane Smith', email: 'jane.s@quickhaul.com', phone: '555-1234', address: '123 Freight Rd, Metropolis', notes: 'Primary carrier for dry goods.', customerType: CustomerType.Carrier },
  { id: 'C02', name: 'ColdCargo', contactPerson: 'Bob Johnson', email: 'bob.j@coldcargo.com', phone: '555-5678', address: '456 Reefer Ave, Coast City', notes: 'Specializes in refrigerated transport.', customerType: CustomerType.Carrier },
  { id: 'C03', name: 'HeavyLoad Movers', contactPerson: 'Carlos Ray', email: 'c.ray@heavyload.com', phone: '555-8765', address: '789 Industrial Blvd, Central City', notes: 'Handles oversized loads.', customerType: CustomerType.Carrier },
  { id: 'C04', name: 'BioTrans', contactPerson: 'Dr. Evelyn Reed', email: 'e.reed@biotrans.com', phone: '555-4321', address: '101 Pharma Ln, Metropolis', notes: 'Certified for medical and pharmaceutical transport.', customerType: CustomerType.Carrier },
  { id: 'C05', name: 'Wave Carriers', contactPerson: 'Contact', email: 'contact@wave.com', phone: '555-333-0000', address: '123 Main St', notes: '', customerType: CustomerType.Carrier },
  { id: 'C06', name: 'Finsy Logistics', contactPerson: 'Contact', email: 'contact@finsy.com', phone: '555-444-0000', address: '123 Main St', notes: '', customerType: CustomerType.Carrier },
  { id: 'C07', name: 'Prilans Shipping', contactPerson: 'Contact', email: 'contact@prilans.com', phone: '555-555-0000', address: '123 Main St', notes: '', customerType: CustomerType.Carrier },
];


const generateAppointments = (): TimelineAppointment[] => {
    const allAppointments: TimelineAppointment[] = [];
    const baseDate = new Date();
    const docks = DOCKS_DATA;
    const customers = CUSTOMERS_DATA;
    const carriers = customers.filter(c => c.customerType === CustomerType.Carrier);
    const vendors = customers.filter(c => c.customerType === CustomerType.Vendor);

    // Operational hours approx 8 AM to 8 PM (20:00)
    const START_HOUR = 8;
    const END_HOUR = 20;

    for (let dayOffset = -2; dayOffset <= 2; dayOffset++) {
        const currentDate = new Date(baseDate);
        currentDate.setDate(baseDate.getDate() + dayOffset);
        currentDate.setHours(0, 0, 0, 0); // Start of day

        for (const dock of docks) {
            let currentTime = new Date(currentDate);
            currentTime.setHours(START_HOUR, 0, 0, 0); // Start of operational hours

            const endOfDay = new Date(currentDate);
            endOfDay.setHours(END_HOUR, 0, 0, 0);

            while (currentTime < endOfDay) {
                // Add a random gap before the next appointment
                const gapMinutes = Math.floor(Math.random() * 20); // 0 to 19 minutes gap
                currentTime.setMinutes(currentTime.getMinutes() + gapMinutes);

                if (currentTime >= endOfDay) break;

                // Random duration: 60, 90, 120 minutes
                const durationMinutes = (Math.floor(Math.random() * 3) + 2) * 30;
                const endTime = new Date(currentTime.getTime() + durationMinutes * 60000);

                if (endTime > endOfDay) break; // Don't create appointments that go past operational hours

                const randomCarrier = carriers[Math.floor(Math.random() * carriers.length)];
                const randomVendor = vendors[Math.floor(Math.random() * vendors.length)];

                let status: TimelineAppointmentStatus;
                const now = new Date();

                if (dayOffset < 0) {
                    status = Math.random() > 0.05 ? 'Completed' : 'Cancelled'; // Past appointments can also be cancelled
                } else if (dayOffset === 0) {
                    if (endTime < now) {
                        status = 'Completed';
                    } else {
                        // For today's remaining appointments, mix it up
                        const rand = Math.random();
                        if (rand < 0.80) status = 'Approved';
                        else if (rand < 0.92) status = 'Draft';
                        else status = 'Cancelled';
                    }
                } else { // Future
                    const rand = Math.random();
                    if (rand < 0.9) status = 'Approved';
                    else if (rand < 0.97) status = 'Draft';
                    else status = 'Cancelled';
                }

                const appointmentType = Math.random() > 0.5 ? 'Inbound' : 'Outbound';
                const vehicleNumber = `TRK-${Math.floor(1000 + Math.random() * 9000)}`;
                
                const newAppointment: Omit<TimelineAppointment, 'id' | 'appointmentId'> = {
                    companyName: randomVendor.name,
                    purposeOfVisit: appointmentType === 'Inbound' ? 'Goods Delivery' : 'Goods Pickup',
                    loadType: 'Mixed Goods',
                    startTime: new Date(currentTime),
                    endTime: endTime,
                    expectedDuration: durationMinutes,
                    dockId: dock.id!,
                    status: status,
                    appointmentType: appointmentType,
                    vehicleNumber: `${vehicleNumber}`,
                    transporter: randomCarrier.name,
                    driverName: `Driver ${Math.floor(100 + Math.random() * 900)}`,
                    driverContact: '555-RANDOM',
                    vehicleType: 'Semi-Trailer',
                    quantity: '1 Full Load',
                    gatePassRequired: true,
                    securityClearanceStatus: 'Approved',
                    documentUploads: [],
                    vehicleRequirements: { isRefrigerated: dock.safetyComplianceTags.includes('Cold Storage') },
                };

                const id = `apt-${dock.id}-${newAppointment.startTime.getTime()}`;
                const appointmentId = `APT-${Math.floor(10000 + Math.random() * 90000)}`;

                allAppointments.push({ ...newAppointment, id, appointmentId } as TimelineAppointment);

                // Move to end of this appointment for the next one
                currentTime = endTime;
            }
        }
    }

    return allAppointments;
};

export const TIMELINE_APPOINTMENTS_DATA: TimelineAppointment[] = generateAppointments();

export const TIME_SLOTS_DATA: Record<DayOfWeek, TimeSlot[]> = {
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

export const VEHICLES_DATA: Vehicle[] = [
    // From appointments
    { id: 'TRK-001', driverName: 'John Smith', carrier: 'QuickHaul', vendorId: 'V01', appointmentTime: '09:00AM', assignedDockId: 'D02', status: VehicleStatus.Entered, entryTime: now - minutes(15) },
    { id: 'TRK-002', driverName: 'Maria Garcia', carrier: 'ColdCargo', vendorId: 'V02', appointmentTime: '10:30AM', assignedDockId: 'D05', status: VehicleStatus.Approved },
    { id: 'TRK-003', driverName: 'David Lee', carrier: 'HeavyLoad Movers', vendorId: 'V03', appointmentTime: '11:00AM', assignedDockId: 'D03', status: VehicleStatus.Approved },
    { id: 'TRK-004', driverName: 'Chen Wang', carrier: 'Wave Carriers', vendorId: 'V04', appointmentTime: '01:00PM', assignedDockId: 'D22', status: VehicleStatus.Entered, entryTime: now - minutes(5) },
    { id: 'TRK-005', driverName: 'Laura Wilson', carrier: 'BioTrans', vendorId: 'V08', appointmentTime: '02:00PM', assignedDockId: 'D26', status: VehicleStatus.Approved },
    { id: 'TRK-006', driverName: 'Peter Jones', carrier: 'QuickHaul', vendorId: 'V01', appointmentTime: '08:00AM', assignedDockId: 'D01', status: VehicleStatus.Exited, entryTime: now - minutes(90), exitTime: now - minutes(45) },
    { id: 'TRK-007', driverName: 'Sarah Kim', carrier: 'Finsy Logistics', vendorId: 'V06', appointmentTime: '03:00PM', assignedDockId: 'D07', status: VehicleStatus.Approved }, // Cancelled, but vehicle might still be "approved" if not updated
    { id: 'TRK-008', driverName: 'Mike Brown', carrier: 'Prilans Shipping', vendorId: 'V07', appointmentTime: '04:00PM', assignedDockId: 'D08', status: VehicleStatus.Approved },

    // Vehicles for other occupied docks from DOCKS_DEFINITION
    { id: 'TRK-103', driverName: 'Auto Gen 1', carrier: 'Finsy Logistics', vendorId: 'V06', appointmentTime: '10:00AM', assignedDockId: 'D18', status: VehicleStatus.Entered, entryTime: now - minutes(45) },
    { id: 'TRK-104', driverName: 'Auto Gen 2', carrier: 'Prilans Shipping', vendorId: 'V07', appointmentTime: '11:00AM', assignedDockId: 'D25', status: VehicleStatus.Entered, entryTime: now - minutes(20) },
    { id: 'TRK-105', driverName: 'Auto Gen 3', carrier: 'Wave Carriers', vendorId: 'V05', appointmentTime: '12:00PM', assignedDockId: 'D33', status: VehicleStatus.Entered, entryTime: now - minutes(30) },
    { id: 'TRK-106', driverName: 'Auto Gen 4', carrier: 'QuickHaul', vendorId: 'V01', appointmentTime: '01:00PM', assignedDockId: 'D41', status: VehicleStatus.Entered, entryTime: now - minutes(10) },
    { id: 'TRK-107', driverName: 'Auto Gen 5', carrier: 'ColdCargo', vendorId: 'V02', appointmentTime: '02:00PM', assignedDockId: 'D35', status: VehicleStatus.Entered, entryTime: now - minutes(25) },

    // Vehicles in yard
    { id: 'TRK-201', driverName: 'Yard Driver 1', carrier: 'QuickHaul', vendorId: 'V01', appointmentTime: '02:30PM', assignedDockId: 'D10', status: VehicleStatus.Yard },
    { id: 'TRK-202', driverName: 'Yard Driver 2', carrier: 'ColdCargo', vendorId: 'V02', appointmentTime: '03:30PM', assignedDockId: 'D12', status: VehicleStatus.Yard },
];

export const OPERATIONS_DATA: Operation[] = [
    { id: 'OP-001', vehicleId: 'TRK-001', dockId: 'D02', type: OperationType.Unloading, status: OperationStatus.InProgress, operator: 'System', startTime: now - minutes(15), estCompletionTime: now + minutes(45) },
    { id: 'OP-002', vehicleId: 'TRK-004', dockId: 'D22', type: OperationType.Unloading, status: OperationStatus.InProgress, operator: 'System', startTime: now - minutes(5), estCompletionTime: now + minutes(55) },
    { id: 'OP-003', vehicleId: 'TRK-103', dockId: 'D18', type: OperationType.Loading, status: OperationStatus.Delayed, operator: 'System', startTime: now - minutes(45), estCompletionTime: now + minutes(15), delayReason: 'Forklift malfunction' },
];

export const DOCUMENTS_DATA: Document[] = [
  { 
    id: 'doc1',
    documentId: 'DOC-00123',
    vehicleId: 'TRK-001',
    name: 'Bill of Lading - Fedex',
    linkedTo: 'BoL 4',
    type: DocumentType.BoL,
    uploadedBy: 'Gatekeeper-1',
    status: DocumentStatus.Pending,
    uploadDate: new Date(now - minutes(120)).toISOString(),
    fileUrl: '#'
  },
  { 
    id: 'doc2',
    documentId: 'DOC-00123',
    vehicleId: 'TRK-001',
    name: 'Delivery Invoice',
    linkedTo: 'Dock 3',
    type: DocumentType.Invoice,
    uploadedBy: 'Gatekeeper-2',
    status: DocumentStatus.Verified,
    uploadDate: new Date(now - minutes(115)).toISOString(),
    fileUrl: '#'
  },
  { 
    id: 'doc3',
    documentId: 'DOC-00123',
    vehicleId: 'TRK-002',
    name: 'Gate Pass',
    linkedTo: 'Dock 7',
    type: DocumentType.GatePass,
    uploadedBy: 'Carrier XYZ',
    status: DocumentStatus.Verified,
    uploadDate: new Date(now - minutes(90)).toISOString(),
    fileUrl: '#'
  },
  { 
    id: 'doc4',
    documentId: 'DOC-00123',
    vehicleId: 'TRK-002',
    name: 'Vehicle Permit',
    linkedTo: 'Carrier XYZ',
    type: DocumentType.Permit,
    uploadedBy: 'John Smith',
    status: DocumentStatus.Pending,
    uploadDate: new Date(now - minutes(60)).toISOString(),
    fileUrl: '#'
  },
  { 
    id: 'doc5',
    documentId: 'DOC-00124',
    vehicleId: 'TRK-003',
    name: 'Customs Form A-1',
    linkedTo: 'Shipment SH456',
    type: DocumentType.Other,
    uploadedBy: 'Admin',
    status: DocumentStatus.Verified,
    uploadDate: new Date(now - minutes(30)).toISOString(),
    fileUrl: '#'
  },
];


export const USERS_DATA: User[] = [
  { id: 'U01', name: 'John Doe', email: 'john.doe@abclogistics.com', role: Role.GateKeeper, avatarUrl: 'https://picsum.photos/seed/user1/40/40', assignedWarehouses: ['W01'], status: 'Active' },
  { id: 'U02', name: 'Jane Smith', email: 'jane.smith@abclogistics.com', role: Role.Manager, avatarUrl: 'https://picsum.photos/seed/user2/40/40', assignedWarehouses: ['W01', 'W02'], status: 'Active' },
  { id: 'U03', name: 'Admin User', email: 'admin@abclogistics.com', role: Role.Admin, avatarUrl: 'https://picsum.photos/seed/user3/40/40', assignedWarehouses: ['W01', 'W02', 'W03'], status: 'Active' },
  { id: 'U04', name: 'Mike Ross', email: 'mike.ross@abclogistics.com', role: Role.DockOperator, avatarUrl: 'https://picsum.photos/seed/user4/40/40', assignedWarehouses: ['W02'], status: 'Inactive' },
];

export const INITIAL_SETTINGS_DATA: AppSettings = {
  notifications: {
    vehicleDelays: true,
    maintenanceEvents: true,
    newAppointments: false,
  },
  general: {
    defaultOperationDuration: 60, // in minutes
    operationalHours: {
      start: 8,
      end: 20,
    },
  },
  companyDetails: {
      name: 'ABC Logistics',
      address: '123 Freight Rd, Metropolis, USA',
      contactEmail: 'contact@abclogistics.com',
      contactPhone: '(555) 111-2222',
  },
};

export const TIMELINE_DOCKS_DATA: TimelineDock[] = DOCKS_DATA.map(d => ({ id: d.id!, name: d.name }));

export const INITIAL_ACTIVITY_LOG_DATA: ActivityLog[] = [
    { id: 'act-1', message: 'Vehicle TRK-001 checked in to Dock D02.', type: ActivityLogType.CheckIn, timestamp: now - minutes(15) },
    { id: 'act-2', message: 'Vehicle TRK-004 checked in to Dock D22.', type: ActivityLogType.CheckIn, timestamp: now - minutes(5) },
    { id: 'act-3', message: 'Delay reported for vehicle TRK-103: Forklift malfunction', type: ActivityLogType.Delay, timestamp: now - minutes(10) },
    { id: 'act-4', message: 'Dock D04 is scheduled for maintenance.', type: ActivityLogType.Maintenance, timestamp: now - minutes(30) },
    { id: 'act-5', message: 'Appointment for TRK-005 at 02:00PM approved.', type: ActivityLogType.NewAppointment, timestamp: now - minutes(60) },
];
