import React, { useState, useEffect } from 'react';
import { XCircleIcon, UserIcon } from './icons/Icons.tsx';

// Define constants for modules and permissions
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

type AccessLevel = 'Full' | 'Some' | 'None';

export interface PermissionsState {
  [module: string]: {
    accessLevel: AccessLevel;
    granular: {
      [key: string]: boolean;
    };
  };
}

interface AddRolePanelProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (roleData: { roleName: string; roleDescription: string; permissions: PermissionsState; }) => void;
}

const AddRolePanel: React.FC<AddRolePanelProps> = ({ isOpen, onClose, onSave }) => {
  const [roleName, setRoleName] = useState('');
  const [roleDescription, setRoleDescription] = useState('');
  const [permissions, setPermissions] = useState<PermissionsState>({});

  useEffect(() => {
    if (isOpen) {
      // Reset form when panel is opened
      setRoleName('');
      setRoleDescription('');
      const initialPermissions: PermissionsState = {};
      MODULES.forEach(module => {
        initialPermissions[module] = {
          accessLevel: 'None',
          granular: GRANULAR_PERMISSIONS.reduce((acc, p) => ({ ...acc, [p.id]: false }), {})
        };
      });
      setPermissions(initialPermissions);
    }
  }, [isOpen]);

  const handleAccessLevelChange = (module: string, level: AccessLevel) => {
    setPermissions(prev => {
        const newPermissions = JSON.parse(JSON.stringify(prev));
        newPermissions[module].accessLevel = level;

        // If not 'Some', set all granular permissions based on 'Full' or 'None'
        if (level !== 'Some') {
            const allChecked = level === 'Full';
            GRANULAR_PERMISSIONS.forEach(p => {
                newPermissions[module].granular[p.id] = allChecked;
            });
        }
        // If 'Some' is selected, we do nothing to the granular permissions, preserving the user's choices.

        return newPermissions;
    });
  };
  
  const handleGranularPermissionChange = (module: string, permissionId: string, isChecked: boolean) => {
    setPermissions(prev => {
        const newPermissions = JSON.parse(JSON.stringify(prev));
        newPermissions[module].granular[permissionId] = isChecked;
        return newPermissions;
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!roleName.trim()) {
        alert('Please provide a Role Name.');
        return;
    }
    onSave({ roleName, roleDescription, permissions });
  };

  const baseInputClasses = "mt-1 w-full px-3 py-2 border bg-gray-100 border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-accent text-sm";

  return (
    <>
        <div className={`fixed inset-0 bg-black/30 z-40 transition-opacity ${isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`} onClick={onClose} />
        <div className={`fixed top-0 right-0 h-full w-full md:w-[40%] bg-white shadow-xl z-50 transform transition-transform duration-300 ease-in-out ${isOpen ? 'translate-x-0' : 'translate-x-full'}`}>
            <form onSubmit={handleSubmit} className="flex flex-col h-full">
                <div className="p-5 border-b border-gray-200">
                    <div className="flex justify-between items-center">
                       <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2"><UserIcon className="w-6 h-6" /> Add New Role</h2>
                       <button type="button" onClick={onClose} className="p-1 rounded-full text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition-colors"><XCircleIcon className="w-6 h-6"/></button>
                    </div>
                     <p className="text-sm text-gray-500 mt-1">
                        Define a new role and configure its permissions.
                     </p>
                </div>

                <div className="flex-grow p-5 space-y-6 overflow-y-auto bg-gray-50/50">
                    <div className="bg-white p-4 rounded-lg border border-gray-200">
                        <h3 className="font-bold text-lg text-gray-700 mb-4">Role Details</h3>
                        <div className="space-y-4">
                            <div>
                                <label htmlFor="roleName" className="block text-sm font-medium text-gray-700">Role Name <span className="text-red-500">*</span></label>
                                <input type="text" name="roleName" id="roleName" value={roleName} onChange={(e) => setRoleName(e.target.value)} className={baseInputClasses} required />
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
                            {/* Header */}
                            <div className="grid grid-cols-10 items-center px-4 py-2 bg-gray-100 text-xs font-bold text-gray-600 uppercase tracking-wider border-b">
                                <span className="col-span-4">Module</span>
                                <span className="text-center col-span-2">Full</span>
                                <span className="text-center col-span-2">Some</span>
                                <span className="text-center col-span-2">None</span>
                            </div>
                            {/* Rows */}
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
                                                        <input
                                                            type="radio"
                                                            id={`${moduleName}-${level}`}
                                                            name={moduleName}
                                                            value={level}
                                                            checked={currentPermission?.accessLevel === level}
                                                            onChange={() => handleAccessLevelChange(moduleName, level)}
                                                            className="h-4 w-4 text-brand-accent focus:ring-brand-accent focus:ring-offset-1 border-gray-300"
                                                        />
                                                        <label htmlFor={`${moduleName}-${level}`} className="ml-2 text-sm text-gray-600 cursor-pointer">{level}</label>
                                                    </div>
                                                ))}
                                            </div>
                                            
                                            {/* Accordion Content */}
                                            <div className={`transition-all duration-300 ease-in-out overflow-hidden ${isSomeSelected ? 'max-h-96' : 'max-h-0'}`}>
                                                <div className="py-3 px-8 bg-indigo-50 border-t border-indigo-200">
                                                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-2 lg:grid-cols-3 gap-x-4 gap-y-2">
                                                        {GRANULAR_PERMISSIONS.map(p => (
                                                            <div key={p.id} className="flex items-center">
                                                                <input
                                                                    type="checkbox"
                                                                    id={`${moduleName}-${p.id}`}
                                                                    checked={currentPermission?.granular[p.id] || false}
                                                                    onChange={(e) => handleGranularPermissionChange(moduleName, p.id, e.target.checked)}
                                                                    className="h-4 w-4 text-brand-accent focus:ring-brand-accent border-gray-300 rounded"
                                                                />
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

                <div className="flex-shrink-0 flex justify-end items-center p-4 border-t border-gray-200 bg-white gap-2">
                   <button type="button" onClick={onClose} className="px-4 py-2 rounded-lg text-sm font-semibold text-gray-700 bg-gray-100 hover:bg-gray-200 transition-colors">Cancel</button>
                   <button type="submit" className="px-5 py-2 rounded-lg text-sm font-semibold text-white bg-brand-accent hover:bg-brand-accent/90 transition-colors">
                    Save Role
                   </button>
                </div>
            </form>
        </div>
    </>
  );
};

export default AddRolePanel;
