







export enum CustomerType {
    Vendor = 'Vendor',
    Carrier = 'Carrier',
}

export interface Customer {
  id: string;
  name: string;
  contactPerson: string;
  email: string;
  phone: string;
  address: string;
  notes: string;
  customerType: CustomerType;
  totalAppointments?: number;
  lastAppointmentDate?: string;
}

export enum WarehouseType {
    Fulfillment = 'Fulfillment',
    Distribution = 'Distribution',
    CrossDock = 'Cross-Dock',
    ColdStorage = 'Cold Storage',
    Other = 'Other',
}

export interface Warehouse {
  id: string;
  name: string; // from "Warehouse ID / Name"
  address: string; // from "Location / Address"
  type: WarehouseType;
  operatingHours: { start: string; end: string }; // e.g., "08:00" to "20:00"
  timezone: string;
  contactPerson: string;
  contactInfo: string; // email or phone
  dockCount: number;
  isEnabled: boolean;
  zones?: string;
}

export enum Page {
  Dashboard = 'Dashboard',
  DockScheduler = 'Dock Scheduler',
  Customers = 'Customers',
  GateManagement = 'Gate Management',
  Operations = 'Operations',
  Reports = 'Reports',
  Settings = 'Settings',
  Help = 'Help & Support',
  DockManagement = 'Dock Management',
}

export enum DockStatus {
  Available = 'available',
  Occupied = 'occupied',
  Maintenance = 'maintenance',
}

export enum DockType {
    Inbound = 'Inbound',
    Outbound = 'Outbound',
    Both = 'Both',
}

export interface Dock {
  id?: string;
  warehouseId: string;
  name: string;
  status: DockStatus;
  location: string;
  capacity: number;
  lastMaintenance: string;
  notes?: string;
  operationsSinceMaintenance?: number;
  maintenanceType?: 'manual' | 'ai';
  // New detailed fields
  dockType: DockType;
  operationalHours: { start: string; end: string };
  compatibleVehicleTypes: string[];
  dimensions?: string; // e.g., "12x14x60"
  safetyComplianceTags: string[]; // e.g., ["Cold Storage", "Hazmat Ready"]
}

export enum VehicleStatus {
  Approved = 'approved',
  Entered = 'entered',
  Yard = 'yard',
  Exited = 'exited',
}

export interface Vehicle {
  id: string;
  driverName: string;
  carrier: string;
  vendorId: string;
  appointmentTime: string;
  assignedDockId: string;
  status: VehicleStatus;
  entryTime?: number;
  exitTime?: number;
}

export enum OperationStatus {
  InProgress = 'In Progress',
  Completed = 'Completed',
  Delayed = 'Delayed',
}

export enum OperationType {
  Loading = 'Loading',
  Unloading = 'Unloading',
  Inspection = 'Inspection',
}

export interface Operation {
  id: string;
  vehicleId: string;
  dockId: string;
  type: OperationType;
  status: OperationStatus;
  operator: string;
  startTime: number; // Use timestamp for easier calculations
  estCompletionTime: number;
  actualCompletionTime?: number;
  delayReason?: string;
}

export enum DocumentType {
  BoL = 'BoL',
  Invoice = 'Invoice',
  GatePass = 'Gate Pass',
  Permit = 'Permit',
  Other = 'Other',
}

export enum DocumentStatus {
  Verified = 'Verified',
  Pending = 'Pending',
}

export interface Document {
  id: string;
  documentId: string;
  name: string;
  type: DocumentType;
  vehicleId: string;
  uploadDate: string; // ISO Date string
  status: DocumentStatus;
  fileUrl: string; // A mock URL
  linkedTo: string;
  uploadedBy: string;
  notes?: string;
  extractedText?: string;
  verificationNotes?: string;
}

export interface ExtractedDocumentInfo {
    vehicleId?: string;
    carrier?: string;
    companyName?: string;
    confidence: number;
    notes: string;
}


export enum Role {
  Admin = 'Admin',
  Manager = 'Manager',
  GateKeeper = 'Gate Keeper',
  DockOperator = 'Dock Operator',
}

export interface User {
  id: string;
  name: string; // Full Name
  email: string;
  username?: string;
  role: Role;
  avatarUrl: string;
  assignedWarehouses: string[];
  status: 'Active' | 'Inactive';
  remarks?: string;
}

export interface AppSettings {
  notifications: {
    vehicleDelays: boolean;
    maintenanceEvents: boolean;
    newAppointments: boolean;
  };
  general: {
    defaultOperationDuration: number; // in minutes
    operationalHours: {
      start: number;
      end: number;
    };
  };
  companyDetails: {
      name: string;
      address: string;
      contactEmail: string;
      contactPhone: string;
  };
}

// From new Dashboard
export type TimeFilter = 'daily' | 'weekly' | 'monthly';
export type DockActivityStatus = 'Loading' | 'Unloading' | 'Completed' | 'Idle';
export interface Kpi {
  title: string;
  value: string;
  subtext: string;
  icon: React.FC<any>;
  iconBgColor: string;
}
export interface DockActivity {
    id: string;
    dockName: string;
    vehicleNumber: string;
    carrier: string;
    startTime: string;
    endTime: string;
    status: DockActivityStatus;
}
export interface DashboardData {
  kpis: Kpi[];
  dockActivities: DockActivity[];
  idleTimePerDock: { name: string; hours: number }[];
  loadUnloadTrend: { name: string; loading: number; unloading: number }[];
  onTimeVsLateData: { name: string; value: number }[];
  handlingRatio: { manual: number; automated: number };
}

// From new Appointments
export type TimelineAppointmentStatus = 'Draft' | 'Approved' | 'Cancelled' | 'Completed';
export interface TimelineDock {
    id: string;
    name: string;
}
export interface TimelineAppointment {
    id: string;
    appointmentId: string;
    companyName: string;
    purposeOfVisit: string;
    loadType: string;
    startTime: Date;
    endTime: Date;
    expectedDuration: number;
    dockId: string;
    status: TimelineAppointmentStatus;
    appointmentType: 'Inbound' | 'Outbound' | 'Transfer';
    vehicleNumber: string;
    transporter: string;
    driverName: string;
    driverContact: string;
    vehicleType: string;
    quantity: string;
    productCategory?: string;
    loadId?: string;
    gatePassRequired: boolean;
    documentUploads: { name: string, size: number }[];
    securityClearanceStatus: 'Approved' | 'Pending';
    specialInstructions?: string;
    contactPerson?: string;
    vehicleRequirements?: {
      isRefrigerated?: boolean;
    };
    actualCompletionTime?: Date;
}

// For new Reports page
export interface CarrierPerformance {
    name: string;
    totalAppointments: number;
    onTimePercentage: number;
    avgTurnaroundTime: number; // in minutes
}

export interface DockUtilization {
    hour: string;
    occupiedDocks: number;
}

export interface AppointmentVolume {
    date: string;
    count: number;
}

export interface ReportData {
    carrierPerformance: CarrierPerformance[];
    dockUtilization: DockUtilization[];
    appointmentVolume: AppointmentVolume[];
    totalCompleted: number;
    totalDelayed: number;
    overallAvgTurnaround: number;
}

// For Activity Feed
export enum ActivityLogType {
    CheckIn = 'CheckIn',
    CheckOut = 'CheckOut',
    Yard = 'Yard',
    Maintenance = 'Maintenance',
    Available = 'Available',
    Complete = 'Complete',
    Delay = 'Delay',
    NewAppointment = 'NewAppointment',
    AiInfo = 'AiInfo',
}

export interface ActivityLog {
    id: string;
    message: string;
    timestamp: number;
    type: ActivityLogType;
}

// For Role Management
export type AccessLevel = 'Full' | 'Some' | 'None';

export interface PermissionsState {
  [module: string]: {
    accessLevel: AccessLevel;
    granular: {
      [key: string]: boolean;
    };
  };
}

// For Time Slot Configuration
export type DayOfWeek = 'MONDAY' | 'TUESDAY' | 'WEDNESDAY' | 'THURSDAY' | 'FRIDAY' | 'SATURDAY' | 'SUNDAY';

export interface TimeSlot {
    id: number;
    from: string;
    to: string;
}

export type TimeSlotsData = Record<DayOfWeek, TimeSlot[]>;