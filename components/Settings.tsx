import React, { useState, useMemo } from 'react';
import { User, AppSettings, Role } from '../types.ts';
import { ICONS } from '../constants.tsx';
import ConfirmationModal from './ConfirmationModal.tsx';
import { SettingsIcon, UserIcon, PhotoIcon } from './icons/Icons.tsx';

interface SettingsProps {
    users: User[];
    settings: AppSettings;
    onDeleteUser: (userId: string) => void;
    onSettingsChange: (settings: AppSettings) => void;
    onInviteClick: () => void;
}

const ToggleSwitch: React.FC<{ checked: boolean; onChange: () => void }> = ({ checked, onChange }) => (
    <label className="relative inline-flex items-center cursor-pointer">
        <input type="checkbox" checked={checked} onChange={onChange} className="sr-only peer" />
        <div className="w-11 h-6 bg-gray-200 rounded-full peer peer-focus:ring-2 peer-focus:ring-brand-accent/50 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-brand-accent"></div>
    </label>
);

const Settings: React.FC<SettingsProps> = ({ users, settings, onDeleteUser, onSettingsChange, onInviteClick }) => {
    const [activeTab, setActiveTab] = useState<'general' | 'users'>('general');
    
    // Assuming the first user is the logged-in user for this example
    const currentUser = users[0] || { name: 'Current User', email: 'user@example.com', avatarUrl: '' };
    
    // Local state for form data to make fields editable
    const [profileData, setProfileData] = useState({
        name: currentUser.name,
        email: currentUser.email,
        phone: '(555) 010-1234', // Mock phone number
    });

    const [companyData, setCompanyData] = useState(settings.companyDetails || {
        name: '', address: '', contactEmail: '', contactPhone: ''
    });
    
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


    const handleProfileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setProfileData({ ...profileData, [e.target.name]: e.target.value });
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
    
    const tabs = [
        { id: 'general', label: 'General', icon: <SettingsIcon className="w-5 h-5" /> },
        { id: 'users', label: 'Users & Roles', icon: <UserIcon className="w-5 h-5" /> },
    ];
    
    const baseInputClasses = "mt-1 w-full px-3 py-2 border bg-gray-50 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-accent text-sm";


    return (
        <div className="p-8 h-full flex flex-col bg-gray-50">
            <div className="flex-shrink-0">
                <h1 className="text-3xl font-bold text-gray-800">Settings</h1>
                <p className="text-gray-500 mt-1">Manage users, notifications, and application preferences.</p>
            </div>
            <div className="flex-grow flex mt-6 gap-8 min-h-0">
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
                <main className="flex-1 overflow-y-auto pr-2">
                    {activeTab === 'general' && (
                         <div className="space-y-8">
                            <div className="bg-white p-6 rounded-xl shadow-md">
                                <h2 className="text-xl font-bold text-gray-700 mb-6">User Profile</h2>
                                <div className="flex items-start gap-6">
                                    <div className="flex-shrink-0 text-center">
                                        <img src={currentUser.avatarUrl} alt="User Avatar" className="w-24 h-24 rounded-full object-cover ring-4 ring-gray-100" />
                                        <button className="mt-2 text-xs text-brand-accent font-semibold hover:underline">Upload Photo</button>
                                    </div>
                                    <div className="flex-grow space-y-4">
                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                            <div>
                                                <label htmlFor="name" className="block text-sm font-medium text-gray-700">Full Name</label>
                                                <input type="text" name="name" id="name" value={profileData.name} onChange={handleProfileChange} className={baseInputClasses} />
                                            </div>
                                            <div>
                                                <label htmlFor="email" className="block text-sm font-medium text-gray-700">Email Address</label>
                                                <input type="email" name="email" id="email" value={profileData.email} onChange={handleProfileChange} className={baseInputClasses} />
                                            </div>
                                        </div>
                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                            <div>
                                                <label htmlFor="phone" className="block text-sm font-medium text-gray-700">Phone</label>
                                                <input type="tel" name="phone" id="phone" value={profileData.phone} onChange={handleProfileChange} className={baseInputClasses} />
                                            </div>
                                        </div>
                                        <button className="text-brand-accent font-semibold text-sm hover:underline mt-2">Change Password</button>
                                    </div>
                                </div>
                                <div className="mt-6 flex justify-end">
                                    <button className="bg-brand-accent text-white font-bold py-2 px-4 rounded-lg shadow hover:bg-brand-accent/90 text-sm">Save Profile</button>
                                </div>
                            </div>
                            
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
                                    <button onClick={handleCompanySave} className="bg-brand-accent text-white font-bold py-2 px-4 rounded-lg shadow hover:bg-brand-accent/90 text-sm">Save Company Details</button>
                                </div>
                            </div>

                            <div className="bg-white p-6 rounded-xl shadow-md">
                                <h2 className="text-xl font-bold text-gray-700 mb-4">Notification Preferences</h2>
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

                    {activeTab === 'users' && (
                        <div className="bg-white p-6 rounded-xl shadow-md">
                            <div className="flex justify-between items-center mb-4">
                                <h2 className="text-xl font-bold text-gray-700">Role Management</h2>
                                <button onClick={onInviteClick} className="bg-brand-accent text-white font-bold py-2 px-4 rounded-lg shadow hover:bg-brand-accent/90 transition-transform transform hover:scale-105 text-sm">
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
                                                        <button className="text-gray-400 hover:text-brand-accent" title="Edit">{ICONS.edit}</button>
                                                        <button className="text-gray-400 hover:text-status-red" title="Delete">{ICONS.delete}</button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}
                </main>
            </div>
        </div>
    );
};

export default Settings;