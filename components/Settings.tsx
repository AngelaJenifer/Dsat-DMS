import React, { useState, useMemo, useEffect } from 'react';
import { User, AppSettings, Role, PermissionsState, AccessLevel } from '../types.ts';
import { ICONS } from '../constants.tsx';
import ConfirmationModal from './ConfirmationModal.tsx';
import { SettingsIcon, UserIcon, CarriersIcon, BellIcon, BuildingOfficeIcon, AppointmentsIcon } from './icons/Icons.tsx';

// --- ROLE FORM COMPONENT AND CONSTANTS ---
const MODULES = [
  'Appointments',
  'Dock Management',
  'Yard Management',
  'Reports',
  'User Management',
  'Configurations'
];

const GRANULAR_PERMISSIONS = [
  { id: 'view', label: 'View' },
  { id: 'add', label: 'Add / Create' },
  { id: 'edit', label: 'Edit / Update' },
  { id: 'delete', label: 'Delete' },
  { id: 'export', label: 'Export / Download' },
];

const RoleForm: React.FC<{
  editingRole: { name: string; description: string; } | null;
  onSave: (roleData: { roleName: string; roleDescription: string; permissions: PermissionsState; isEditing?: boolean; }) => void;
  onCancel: () => void;
}> = ({ editingRole, onSave, onCancel }) => {
  const isEditing = !!editingRole;
  const [roleName, setRoleName] = useState('');
  const [roleDescription, setRoleDescription] = useState('');
  const [permissions, setPermissions] = useState<PermissionsState>({});

  useEffect(() => {
    setRoleName(isEditing ? editingRole.name : '');
    setRoleDescription(isEditing ? editingRole.description : '');
    
    const initialPermissions: PermissionsState = {};
    MODULES.forEach(module => {
      initialPermissions[module] = {
        accessLevel: 'None',
        granular: GRANULAR_PERMISSIONS.reduce((acc, p) => ({ ...acc, [p.id]: false }), {})
      };
    });
    setPermissions(initialPermissions);
  }, [editingRole, isEditing]);

  const handleAccessLevelChange = (module: string, level: AccessLevel) => {
    setPermissions(prev => {
        const newPermissions = JSON.parse(JSON.stringify(prev));
        newPermissions[module].accessLevel = level;
        if (level !== 'Some') {
            const allChecked = level === 'Full';
            GRANULAR_PERMISSIONS.forEach(p => {
                newPermissions[module].granular[p.id] = allChecked;
            });
        }
        return newPermissions;
    });
  };
  
  const handleGranularPermissionChange = (module: string, permissionId: string, isChecked: boolean) => {
    setPermissions(prev => {
        const newPermissions = JSON.parse(JSON.stringify(prev));
        newPermissions[module].granular[permissionId] = isChecked;
        
        // Update access level to 'Some' if any granular permission is changed
        newPermissions[module].accessLevel = 'Some';

        return newPermissions;
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!roleName.trim()) {
        alert('Please provide a Role Name.');
        return;
    }
    onSave({ roleName, roleDescription, permissions, isEditing });
  };

  const baseInputClasses = "mt-1 w-full px-3 py-2 border bg-gray-100 border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-accent text-sm text-gray-900 placeholder:text-gray-500 disabled:bg-gray-200 disabled:text-gray-500";
  
  return (
    <div className="bg-white p-6 rounded-xl shadow-md">
      <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold text-gray-700">{isEditing ? `Edit Role: ${editingRole.name}` : 'Add New Role'}</h2>
          <button type="button" onClick={onCancel} className="text-sm font-semibold text-gray-600 hover:text-brand-accent">
            &larr; Back to Role List
          </button>
      </div>
      
      <form onSubmit={handleSubmit}>
        <div className="space-y-6">
            <div className="bg-white p-4 rounded-lg border border-gray-200">
                <h3 className="font-bold text-lg text-gray-700 mb-4">Role Details</h3>
                <div className="space-y-4">
                    <div>
                        <label htmlFor="roleName" className="block text-sm font-medium text-gray-700">Role Name <span className="text-red-500">*</span></label>
                        <input type="text" name="roleName" id="roleName" value={roleName} onChange={(e) => setRoleName(e.target.value)} className={baseInputClasses} disabled={isEditing} required />
                    </div>
                    <div>
                        <label htmlFor="roleDescription" className="block text-sm font-medium text-gray-700">Role Description</label>
                        <textarea name="roleDescription" id="roleDescription" value={roleDescription} onChange={(e) => setRoleDescription(e.target.value)} className={baseInputClasses} rows={3}></textarea>
                    </div>
                </div>
            </div>

            <div className="space-y-4">
                <h3 className="font-bold text-lg text-gray-700">Permissions Assignment</h3>
                <div className="border border-gray-200 rounded-lg overflow-hidden bg-white">
                    <div className="grid grid-cols-10 items-center px-4 py-2 bg-gray-100 text-xs font-bold text-gray-600 uppercase tracking-wider border-b">
                        <span className="col-span-4">Module</span>
                        <span className="text-center col-span-2">Full</span>
                        <span className="text-center col-span-2">Some</span>
                        <span className="text-center col-span-2">None</span>
                    </div>
                    <div className="divide-y divide-gray-200">
                        {MODULES.map(moduleName => {
                            const currentPermission = permissions[moduleName];
                            const isSomeSelected = currentPermission?.accessLevel === 'Some';
                            return (
                                <div key={moduleName}>
                                    <div className="grid grid-cols-10 items-center px-4 py-3 bg-white hover:bg-gray-50/50">
                                        <div className="font-semibold text-gray-800 col-span-4">{moduleName}</div>
                                        {(['Full', 'Some', 'None'] as AccessLevel[]).map(level => (
                                            <div key={level} className="flex items-center justify-center col-span-2">
                                                <input type="radio" id={`${moduleName}-${level}`} name={moduleName} value={level} checked={currentPermission?.accessLevel === level} onChange={() => handleAccessLevelChange(moduleName, level)} className="h-4 w-4 text-brand-accent focus:ring-brand-accent focus:ring-offset-1 border-gray-300" />
                                                <label htmlFor={`${moduleName}-${level}`} className="ml-2 text-sm text-gray-600 cursor-pointer">{level}</label>
                                            </div>
                                        ))}
                                    </div>
                                    <div className={`transition-all duration-300 ease-in-out overflow-hidden ${isSomeSelected ? 'max-h-96' : 'max-h-0'}`}>
                                        <div className="py-3 px-8 bg-indigo-50 border-t border-indigo-200">
                                            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-2 lg:grid-cols-3 gap-x-4 gap-y-2">
                                                {GRANULAR_PERMISSIONS.map(p => (
                                                    <div key={p.id} className="flex items-center">
                                                        <input type="checkbox" id={`${moduleName}-${p.id}`} checked={currentPermission?.granular[p.id] || false} onChange={(e) => handleGranularPermissionChange(moduleName, p.id, e.target.checked)} className="h-4 w-4 text-brand-accent focus:ring-brand-accent border-gray-300 rounded" />
                                                        <label htmlFor={`${moduleName}-${p.id}`} className="ml-2 text-sm text-gray-700">{p.label}</label>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>
        </div>
        <div className="mt-8 flex justify-end space-x-4">
            <button type="button" onClick={onCancel} className="bg-gray-200 text-gray-700 font-bold py-2 px-6 rounded-lg hover:bg-gray-300 transition-colors">
                Cancel
            </button>
            <button type="submit" className="bg-primary-600 text-white font-bold py-2 px-6 rounded-lg shadow-lg hover:bg-primary-700 focus:outline-none transition-transform transform hover:scale-105">
                {isEditing ? 'Save Changes' : 'Save Role'}
            </button>
        </div>
      </form>
    </div>
  );
};


// --- SETTINGS PAGE COMPONENT ---
interface SettingsProps {
    users: User[];
    settings: AppSettings;
    onDeleteUser: (userId: string) => void;
    onSettingsChange: (settings: AppSettings) => void;
    onSaveRole: (roleData: { roleName: string; roleDescription: string; permissions: PermissionsState; isEditing?: boolean; }) => void;
    onOpenUserModal: (user?: User | null) => void;
}

const ToggleSwitch: React.FC<{ checked: boolean; onChange: () => void }> = ({ checked, onChange }) => (
    <label className="relative inline-flex items-center cursor-pointer">
        <input type="checkbox" checked={checked} onChange={onChange} className="sr-only peer" />
        <div className="w-11 h-6 bg-gray-200 rounded-full peer peer-focus:ring-2 peer-focus:ring-brand-accent/50 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-brand-accent"></div>
    </label>
);

const Settings: React.FC<SettingsProps> = ({ users, settings, onDeleteUser, onSettingsChange, onSaveRole, onOpenUserModal }) => {
    const [activeSubTab, setActiveSubTab] = useState<'profile' | 'company' | 'users' | 'roles'>('profile');
    const [userToDelete, setUserToDelete] = useState<User | null>(null);
    const [activeRoleSubTab, setActiveRoleSubTab] = useState<'permissions' | 'notifications'>('permissions');
    const [roleView, setRoleView] = useState<'list' | 'form'>('list');
    const [editingRole, setEditingRole] = useState<any | null>(null);
    
    const currentUser = users[0] || { name: 'Current User', email: 'user@example.com', avatarUrl: '' };
    
    const [profileData, setProfileData] = useState({
        name: currentUser.name,
        email: currentUser.email,
        address1: '123 Industrial Way',
        address2: 'Suite 456',
        city: 'Metropolis',
        state: 'USA',
        zip: '12345',
        country: 'United States',
        phone: '(555) 010-1234',
        dob: '1990-05-15',
        language: 'English (US)',
        timezone: '(GMT-05:00) Eastern Time',
        dateFormat: 'MM/DD/YYYY',
        timeFormat: '12-hour',
    });

    const [passwordData, setPasswordData] = useState({
        currentPassword: '',
        newPassword: '',
        confirmNewPassword: '',
    });

    const [companyData, setCompanyData] = useState(settings.companyDetails || {
        name: '', address: '', contactEmail: '', contactPhone: ''
    });

    const [roleNotifications, setRoleNotifications] = useState<Record<Role, AppSettings['notifications']>>({
        [Role.Admin]: { vehicleDelays: true, maintenanceEvents: true, newAppointments: true },
        [Role.Manager]: { vehicleDelays: true, maintenanceEvents: false, newAppointments: true },
        [Role.GateKeeper]: { vehicleDelays: true, maintenanceEvents: false, newAppointments: false },
        [Role.DockOperator]: { vehicleDelays: false, maintenanceEvents: true, newAppointments: false },
    });

    const handleRoleNotificationChange = (role: Role, key: keyof AppSettings['notifications']) => {
        setRoleNotifications(prev => ({
            ...prev,
            [role]: {
                ...prev[role],
                [key]: !prev[role][key],
            }
        }));
    };
    
    const roleDescriptions: Record<Role, string> = {
        [Role.Admin]: "Has full access to all system features, settings, and user management.",
        [Role.Manager]: "Can manage appointments, docks, and operations, but has limited access to system settings.",
        [Role.GateKeeper]: "Responsible for vehicle check-in/check-out and gate management.",
        [Role.DockOperator]: "Manages dock status, vehicle operations at the dock, and views related appointments and documents."
    };

    const rolesData = useMemo(() => {
        const usersByRole = users.reduce((acc, user) => {
            acc[user.role] = (acc[user.role] || 0) + 1;
            return acc;
        }, {} as Record<Role, number>);

        return Object.values(Role).map((roleName, index) => ({
            name: roleName,
            description: roleDescriptions[roleName],
            userCount: usersByRole[roleName] || 0,
            createdAt: `2023-0${index + 2}-1${index}`,
            lastUpdatedAt: `2024-0${index + 5}-0${index + 1}`,
        }));
    }, [users]);
    
    const handleOpenRoleForm = (role: any | null = null) => {
        setEditingRole(role);
        setRoleView('form');
    };

    const handleCancelRoleForm = () => {
        setRoleView('list');
        setEditingRole(null);
    };

    const handleSaveRoleAndSwitchView = (roleData: { roleName: string; roleDescription: string; permissions: PermissionsState; isEditing?: boolean; }) => {
        onSaveRole(roleData);
        handleCancelRoleForm();
    };

    const handleProfileChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        setProfileData({ ...profileData, [e.target.name]: e.target.value });
    };

     const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setPasswordData({ ...passwordData, [e.target.name]: e.target.value });
    };

    const handleCompanyChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        setCompanyData({ ...companyData, [e.target.name]: e.target.value });
    };

    const handleCompanySave = () => {
        onSettingsChange({ ...settings, companyDetails: companyData });
        alert('Company details saved!'); // Placeholder for a better notification
    };

    const handleNotificationChange = (key: keyof AppSettings['notifications']) => {
        onSettingsChange({
            ...settings,
            notifications: {
                ...settings.notifications,
                [key]: !settings.notifications[key],
            },
        });
    };

    const handleConfirmDeleteUser = () => {
        if (userToDelete) {
            onDeleteUser(userToDelete.id);
            setUserToDelete(null);
        }
    };
    
    const SubmenuHeader: React.FC<{ children: React.ReactNode }> = ({ children }) => (
        <h3 className="px-4 pt-6 pb-2 text-xs font-bold text-gray-500 uppercase tracking-wider">
            {children}
        </h3>
    );

    const SubmenuButton: React.FC<{
      label: string;
      icon: React.ReactNode;
      isActive: boolean;
      onClick: () => void;
    }> = ({ label, icon, isActive, onClick }) => (
        <button
            onClick={onClick}
            className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-semibold text-left transition-colors ${
                isActive
                ? 'bg-brand-accent/10 text-brand-accent'
                : 'text-gray-600 hover:bg-gray-200/50'
            }`}
        >
            {icon}
            <span>{label}</span>
        </button>
    );

    const baseInputClasses = "mt-1 w-full px-3 py-2 border bg-gray-50 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-accent text-sm text-gray-900";
    const profileInputClasses = "w-full px-3 py-2 border bg-white border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-accent text-sm text-gray-800";
    
    const FormField: React.FC<{ label: string; children: React.ReactNode; className?: string }> = ({ label, children, className }) => (
        <div className={className}>
            <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
            {children}
        </div>
    );


    return (
        <div className="p-8 h-full flex flex-col bg-gray-50">
            <div className="flex-shrink-0">
                <h1 className="text-3xl font-bold text-gray-800">Settings</h1>
                <p className="text-gray-500 mt-1">Manage users, notifications, and application preferences.</p>
            </div>
            <div className="flex-grow flex mt-6 gap-8 min-h-0">
                <aside className="w-64 flex-shrink-0">
                    <nav className="space-y-1">
                        <SubmenuHeader>General Settings</SubmenuHeader>
                        <SubmenuButton label="User Profile" icon={<UserIcon className="w-5 h-5"/>} isActive={activeSubTab === 'profile'} onClick={() => setActiveSubTab('profile')} />
                        <SubmenuButton label="Company" icon={<BuildingOfficeIcon className="w-5 h-5"/>} isActive={activeSubTab === 'company'} onClick={() => setActiveSubTab('company')} />
                        
                        <SubmenuHeader>User Permission & Access</SubmenuHeader>
                        <SubmenuButton label="Users" icon={<UserIcon className="w-5 h-5" />} isActive={activeSubTab === 'users'} onClick={() => setActiveSubTab('users')} />
                        <SubmenuButton label="Roles" icon={<CarriersIcon className="w-5 h-5" />} isActive={activeSubTab === 'roles'} onClick={() => setActiveSubTab('roles')} />
                    </nav>
                </aside>

                <main className="flex-1 overflow-y-auto pr-2">
                    {activeSubTab === 'profile' && (
                        <div className="bg-white p-6 rounded-xl shadow-md">
                            {/* Personal Information */}
                            <div>
                                <h2 className="text-xl font-bold text-gray-700 mb-4">Personal Information</h2>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <FormField label="Address Line 1" className="md:col-span-2">
                                        <input type="text" name="address1" value={profileData.address1} onChange={handleProfileChange} className={profileInputClasses} />
                                    </FormField>
                                    <FormField label="Address Line 2" className="md:col-span-2">
                                        <input type="text" name="address2" value={profileData.address2} onChange={handleProfileChange} className={profileInputClasses} />
                                    </FormField>
                                    <FormField label="City">
                                        <input type="text" name="city" value={profileData.city} onChange={handleProfileChange} className={profileInputClasses} />
                                    </FormField>
                                    <FormField label="State / Province">
                                        <input type="text" name="state" value={profileData.state} onChange={handleProfileChange} className={profileInputClasses} />
                                    </FormField>
                                    <FormField label="Zip / Postal Code">
                                        <input type="text" name="zip" value={profileData.zip} onChange={handleProfileChange} className={profileInputClasses} />
                                    </FormField>
                                    <FormField label="Country">
                                        <select name="country" value={profileData.country} onChange={handleProfileChange} className={profileInputClasses}>
                                            <option>United States</option>
                                            <option>Canada</option>
                                            <option>Mexico</option>
                                        </select>
                                    </FormField>
                                    <FormField label="Phone Number">
                                        <input type="tel" name="phone" value={profileData.phone} onChange={handleProfileChange} className={profileInputClasses} />
                                    </FormField>
                                    <FormField label="Date of Birth">
                                        <div className="relative">
                                            <input type="date" name="dob" value={profileData.dob} onChange={handleProfileChange} className={`${profileInputClasses} pr-10`} />
                                             <span className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                                                <AppointmentsIcon className="w-5 h-5 text-gray-400" />
                                            </span>
                                        </div>
                                    </FormField>
                                </div>
                            </div>
                            
                            <hr className="my-6" />

                            {/* Regional Settings */}
                            <div>
                                <h2 className="text-xl font-bold text-gray-700 mb-4">Regional Settings</h2>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <FormField label="Language">
                                         <select name="language" value={profileData.language} onChange={handleProfileChange} className={profileInputClasses}>
                                            <option>English (US)</option>
                                            <option>Español</option>
                                        </select>
                                    </FormField>
                                    <FormField label="Timezone">
                                         <select name="timezone" value={profileData.timezone} onChange={handleProfileChange} className={profileInputClasses}>
                                            <option>(GMT-05:00) Eastern Time</option>
                                            <option>(GMT-06:00) Central Time</option>
                                            <option>(GMT-07:00) Mountain Time</option>
                                            <option>(GMT-08:00) Pacific Time</option>
                                        </select>
                                    </FormField>
                                    <FormField label="Date Format">
                                         <select name="dateFormat" value={profileData.dateFormat} onChange={handleProfileChange} className={profileInputClasses}>
                                            <option>MM/DD/YYYY</option>
                                            <option>DD/MM/YYYY</option>
                                            <option>YYYY-MM-DD</option>
                                        </select>
                                    </FormField>
                                    <FormField label="Time Format">
                                         <select name="timeFormat" value={profileData.timeFormat} onChange={handleProfileChange} className={profileInputClasses}>
                                            <option>12-hour</option>
                                            <option>24-hour</option>
                                        </select>
                                    </FormField>
                                </div>
                            </div>
                            
                            <hr className="my-6" />

                            {/* Change Password */}
                            <div>
                                <h2 className="text-xl font-bold text-gray-700 mb-4">Change Password</h2>
                                <div className="space-y-6">
                                    <FormField label="Current Password">
                                        <div className="relative">
                                            <span className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                                                {ICONS.key}
                                            </span>
                                            <input type="password" name="currentPassword" value={passwordData.currentPassword} onChange={handlePasswordChange} className={`${profileInputClasses} pl-10 max-w-sm`} />
                                        </div>
                                    </FormField>
                                    <FormField label="New Password">
                                         <div className="relative">
                                            <span className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                                                {ICONS.key}
                                            </span>
                                            <input type="password" name="newPassword" value={passwordData.newPassword} onChange={handlePasswordChange} className={`${profileInputClasses} pl-10 max-w-sm`} />
                                        </div>
                                    </FormField>
                                    <FormField label="Confirm New Password">
                                         <div className="relative">
                                            <span className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                                                {ICONS.key}
                                            </span>
                                            <input type="password" name="confirmNewPassword" value={passwordData.confirmNewPassword} onChange={handlePasswordChange} className={`${profileInputClasses} pl-10 max-w-sm`} />
                                        </div>
                                    </FormField>
                                </div>
                            </div>

                            {/* Action Buttons */}
                            <div className="flex justify-end pt-6 border-t mt-6">
                                <button className="bg-primary-600 text-white font-bold py-2 px-6 rounded-lg shadow hover:bg-primary-700 text-sm">Save Changes</button>
                            </div>
                        </div>
                    )}
                    {activeSubTab === 'company' && (
                         <div className="space-y-8">
                            <div className="bg-white p-6 rounded-xl shadow-md">
                                <h2 className="text-xl font-bold text-gray-700 mb-6">Company Details</h2>
                                <div className="space-y-4">
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                        <div>
                                            <label htmlFor="companyName" className="block text-sm font-medium text-gray-700">Company Name <span className="text-red-500">*</span></label>
                                            <input type="text" name="name" id="companyName" value={companyData.name} onChange={handleCompanyChange} className={baseInputClasses} required />
                                        </div>
                                        <div>
                                            <label htmlFor="companyPhone" className="block text-sm font-medium text-gray-700">Contact Phone <span className="text-red-500">*</span></label>
                                            <input type="tel" name="contactPhone" id="companyPhone" value={companyData.contactPhone} onChange={handleCompanyChange} className={baseInputClasses} required />
                                        </div>
                                    </div>
                                    <div>
                                        <label htmlFor="companyAddress" className="block text-sm font-medium text-gray-700">Company Address <span className="text-red-500">*</span></label>
                                        <textarea name="address" id="companyAddress" value={companyData.address} onChange={handleCompanyChange} className={baseInputClasses} rows={3} required />
                                    </div>
                                    <div>
                                        <label htmlFor="companyEmail" className="block text-sm font-medium text-gray-700">Contact Email <span className="text-red-500">*</span></label>
                                        <input type="email" name="contactEmail" id="companyEmail" value={companyData.contactEmail} onChange={handleCompanyChange} className={baseInputClasses} required />
                                    </div>
                                </div>
                                <div className="mt-6 flex justify-end">
                                    <button onClick={handleCompanySave} className="bg-primary-600 text-white font-bold py-2 px-4 rounded-lg shadow hover:bg-primary-700 text-sm">Save Company Details</button>
                                </div>
                            </div>
                            <div className="bg-white p-6 rounded-xl shadow-md">
                                <h2 className="text-xl font-bold text-gray-700 mb-4">General Notification Preferences</h2>
                                <div className="space-y-4 divide-y divide-gray-200">
                                    <div className="flex justify-between items-center pt-4 first:pt-0">
                                        <div>
                                            <h3 className="font-semibold text-gray-800">Vehicle Delays</h3>
                                            <p className="text-xs text-gray-500">Get notified when a vehicle operation is delayed.</p>
                                        </div>
                                        <ToggleSwitch checked={settings.notifications.vehicleDelays} onChange={() => handleNotificationChange('vehicleDelays')} />
                                    </div>
                                    <div className="flex justify-between items-center pt-4 first:pt-0">
                                        <div>
                                            <h3 className="font-semibold text-gray-800">Maintenance Events</h3>
                                            <p className="text-xs text-gray-500">Receive alerts for scheduled or AI-recommended maintenance.</p>
                                        </div>
                                        <ToggleSwitch checked={settings.notifications.maintenanceEvents} onChange={() => handleNotificationChange('maintenanceEvents')} />
                                    </div>
                                    <div className="flex justify-between items-center pt-4 first:pt-0">
                                        <div>
                                            <h3 className="font-semibold text-gray-800">New Appointments</h3>
                                            <p className="text-xs text-gray-500">Get a notification when a new appointment is booked.</p>
                                        </div>
                                        <ToggleSwitch checked={settings.notifications.newAppointments} onChange={() => handleNotificationChange('newAppointments')} />
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                    {activeSubTab === 'users' && (
                         <div className="bg-white p-6 rounded-xl shadow-md">
                            <div className="flex justify-between items-center mb-4">
                                <h2 className="text-xl font-bold text-gray-700">User Management</h2>
                                <button onClick={() => onOpenUserModal()} className="bg-primary-600 text-white font-bold py-2 px-4 rounded-lg shadow hover:bg-primary-700 transition-transform transform hover:scale-105 text-sm">
                                    + Create User
                                </button>
                            </div>
                             <div className="overflow-x-auto">
                                <table className="w-full text-left text-sm">
                                    <thead className="text-xs text-gray-500 uppercase bg-gray-50 border-b">
                                        <tr>
                                            <th className="py-3 px-4">User</th>
                                            <th className="py-3 px-4">Email</th>
                                            <th className="py-3 px-4">Role</th>
                                            <th className="py-3 px-4 text-center">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {users.map(user => (
                                            <tr key={user.id} className="border-b hover:bg-gray-50">
                                                <td className="py-3 px-4">
                                                    <div className="flex items-center gap-3">
                                                        <img src={user.avatarUrl} alt={user.name} className="w-8 h-8 rounded-full" />
                                                        <span className="font-semibold text-gray-800">{user.name}</span>
                                                    </div>
                                                </td>
                                                <td className="py-3 px-4 text-gray-600">{user.email}</td>
                                                <td className="py-3 px-4 text-gray-600">{user.role}</td>
                                                <td className="py-3 px-4">
                                                    <div className="flex items-center justify-center space-x-4">
                                                        <button onClick={() => onOpenUserModal(user)} className="text-gray-400 hover:text-brand-accent" title="Edit">{ICONS.edit}</button>
                                                        <button onClick={() => setUserToDelete(user)} className="text-gray-400 hover:text-status-red" title="Delete">{ICONS.delete}</button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}
                    {activeSubTab === 'roles' && (
                       <div>
                            <div className="mb-6 border-b border-gray-200">
                                <nav className="-mb-px flex space-x-6" aria-label="Tabs">
                                    <button
                                        onClick={() => setActiveRoleSubTab('permissions')}
                                        className={`flex items-center gap-2 py-3 px-1 text-sm font-semibold transition-colors focus:outline-none ${
                                            activeRoleSubTab === 'permissions'
                                            ? 'text-brand-accent border-b-2 border-brand-accent'
                                            : 'text-gray-500 hover:text-gray-700'
                                        }`}
                                    >
                                        <CarriersIcon className="w-5 h-5" />
                                        Permissions
                                    </button>
                                    <button
                                        onClick={() => setActiveRoleSubTab('notifications')}
                                        className={`flex items-center gap-2 py-3 px-1 text-sm font-semibold transition-colors focus:outline-none ${
                                            activeRoleSubTab === 'notifications'
                                            ? 'text-brand-accent border-b-2 border-brand-accent'
                                            : 'text-gray-500 hover:text-gray-700'
                                        }`}
                                    >
                                        <BellIcon className="w-5 h-5" />
                                        Notifications
                                    </button>
                                </nav>
                            </div>

                            {activeRoleSubTab === 'permissions' && (
                                roleView === 'list' ? (
                                    <div className="bg-white p-6 rounded-xl shadow-md">
                                        <div className="flex justify-between items-center mb-4">
                                            <h2 className="text-xl font-bold text-gray-700">Role Management</h2>
                                            <button onClick={() => handleOpenRoleForm(null)} className="bg-primary-600 text-white font-bold py-2 px-4 rounded-lg shadow hover:bg-primary-700 transition-transform transform hover:scale-105 text-sm">
                                                + Add Role
                                            </button>
                                        </div>
                                        <div className="overflow-x-auto">
                                            <table className="w-full text-left text-sm">
                                                <thead className="text-xs text-gray-500 uppercase bg-gray-50 border-b">
                                                    <tr>
                                                        <th className="py-3 px-4">Role</th>
                                                        <th className="py-3 px-4 text-center">No. of Users</th>
                                                        <th className="py-3 px-4">Created at</th>
                                                        <th className="py-3 px-4">Last Updated</th>
                                                        <th className="py-3 px-4 text-center">Actions</th>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {rolesData.map(role => (
                                                        <tr key={role.name} className="border-b hover:bg-gray-50">
                                                            <td className="py-3 px-4">
                                                                <div className="font-semibold text-gray-800">{role.name}</div>
                                                                <div className="text-xs text-gray-500">{role.description}</div>
                                                            </td>
                                                            <td className="py-3 px-4 text-gray-800 font-semibold text-center">{role.userCount}</td>
                                                            <td className="py-3 px-4 text-gray-600">{role.createdAt}</td>
                                                            <td className="py-3 px-4 text-gray-600">{role.lastUpdatedAt}</td>
                                                            <td className="py-3 px-4">
                                                                <div className="flex items-center justify-center space-x-4">
                                                                    <button onClick={() => handleOpenRoleForm(role)} className="text-gray-400 hover:text-brand-accent" title="Edit">{ICONS.edit}</button>
                                                                    <button className="text-gray-400 hover:text-status-red" title="Delete">{ICONS.delete}</button>
                                                                </div>
                                                            </td>
                                                        </tr>
                                                    ))}
                                                </tbody>
                                            </table>
                                        </div>
                                    </div>
                                ) : (
                                    <RoleForm
                                      editingRole={editingRole}
                                      onSave={handleSaveRoleAndSwitchView}
                                      onCancel={handleCancelRoleForm}
                                    />
                                )
                            )}
                             {activeRoleSubTab === 'notifications' && (
                                <div className="bg-white p-6 rounded-xl shadow-md">
                                    <h2 className="text-xl font-bold text-gray-700 mb-4">Role-Based Notifications</h2>
                                    <p className="text-sm text-gray-500 mb-6">Configure which notifications each role will receive. These settings can be overridden by individual user preferences.</p>
                                    <div className="space-y-6">
                                        {rolesData.map(role => (
                                            <div key={role.name} className="p-4 border border-gray-200 rounded-lg bg-gray-50/50">
                                                <h3 className="font-bold text-gray-800">{role.name}</h3>
                                                <p className="text-xs text-gray-500 mb-4">{role.description}</p>
                                                <div className="space-y-4 divide-y divide-gray-200">
                                                    <div className="flex justify-between items-center pt-4 first:pt-0">
                                                        <div>
                                                            <h4 className="font-semibold text-gray-800">Vehicle Delays</h4>
                                                            <p className="text-xs text-gray-500">Notify when an operation is delayed.</p>
                                                        </div>
                                                        <ToggleSwitch checked={roleNotifications[role.name as Role]?.vehicleDelays || false} onChange={() => handleRoleNotificationChange(role.name as Role, 'vehicleDelays')} />
                                                    </div>
                                                    <div className="flex justify-between items-center pt-4 first:pt-0">
                                                        <div>
                                                            <h4 className="font-semibold text-gray-800">Maintenance Events</h4>
                                                            <p className="text-xs text-gray-500">Alerts for scheduled or AI-recommended maintenance.</p>
                                                        </div>
                                                        <ToggleSwitch checked={roleNotifications[role.name as Role]?.maintenanceEvents || false} onChange={() => handleRoleNotificationChange(role.name as Role, 'maintenanceEvents')} />
                                                    </div>
                                                     <div className="flex justify-between items-center pt-4 first:pt-0">
                                                        <div>
                                                            <h4 className="font-semibold text-gray-800">New Appointments</h4>
                                                            <p className="text-xs text-gray-500">Notify when a new appointment is booked.</p>
                                                        </div>
                                                        <ToggleSwitch checked={roleNotifications[role.name as Role]?.newAppointments || false} onChange={() => handleRoleNotificationChange(role.name as Role, 'newAppointments')} />
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                       </div>
                    )}
                </main>
            </div>
            <ConfirmationModal
                isOpen={!!userToDelete}
                onClose={() => setUserToDelete(null)}
                onConfirm={handleConfirmDeleteUser}
                title="Delete User"
                message={`Are you sure you want to permanently delete the user ${userToDelete?.name}? This action cannot be undone.`}
            />
        </div>
    );
};

export default Settings;