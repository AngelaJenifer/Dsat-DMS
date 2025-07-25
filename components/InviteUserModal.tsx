import React, { useState, useEffect, useMemo } from 'react';
import { Role, User, Warehouse } from '../types.ts';
import { ICONS } from '../constants.tsx';

interface CreateUserModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (userData: Partial<User> & { password?: string }) => void;
  userToEdit: User | null;
  warehouses: Warehouse[];
}

const CreateUserModal: React.FC<CreateUserModalProps> = ({ isOpen, onClose, onSave, userToEdit, warehouses }) => {
  const isEditing = !!userToEdit;
  
  const initialFormState = {
    name: '',
    email: '',
    username: '',
    password: '',
    role: Role.GateKeeper,
    assignedWarehouses: [] as string[],
    status: 'Active' as 'Active' | 'Inactive',
    remarks: '',
  };

  const [formData, setFormData] = useState(initialFormState);
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordError, setPasswordError] = useState('');

  useEffect(() => {
    if (isOpen) {
      if (isEditing && userToEdit) {
        setFormData({
          name: userToEdit.name,
          email: userToEdit.email,
          username: userToEdit.username || '',
          password: '', // Clear password for security
          role: userToEdit.role,
          assignedWarehouses: userToEdit.assignedWarehouses || [],
          status: userToEdit.status,
          remarks: userToEdit.remarks || '',
        });
        setConfirmPassword('');
      } else {
        setFormData(initialFormState);
        setConfirmPassword('');
      }
      setPasswordError('');
    }
  }, [isOpen, userToEdit, isEditing]);
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };
  
  const handleMultiSelectChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const { name, options } = e.target;
    const values = Array.from(options)
        .filter(option => option.selected)
        .map(option => option.value);
    setFormData(prev => ({ ...prev, [name]: values }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Password validation
    if (formData.password || !isEditing) { // Validate if password is being set or changed
        if (formData.password !== confirmPassword) {
            setPasswordError('Passwords do not match.');
            return;
        }
        if (formData.password.length < 8) {
            setPasswordError('Password must be at least 8 characters long.');
            return;
        }
    }
    
    setPasswordError('');
    
    const dataToSave = {
      ...formData,
      id: userToEdit?.id, // Pass id if editing
    };

    if (isEditing && !formData.password) {
      // @ts-ignore
      delete dataToSave.password;
    }

    onSave(dataToSave);
  };
  
  if (!isOpen) return null;
  
  const baseInputClasses = "mt-1 w-full px-3 py-2 border bg-gray-50 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-accent text-sm text-gray-900";
  const multiSelectClasses = `${baseInputClasses} h-24`;

  return (
    <>
      <div 
        className={`fixed inset-0 bg-black/60 z-40 transition-opacity ${isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`} 
        onClick={onClose} 
      />
      <div 
        className={`fixed top-0 right-0 h-full w-full max-w-3xl bg-white shadow-xl z-50 transform transition-transform duration-300 ease-in-out ${isOpen ? 'translate-x-0' : 'translate-x-full'}`}
        onClick={e => e.stopPropagation()}
      >
        <div className="flex flex-col h-full">
          <form onSubmit={handleSubmit} className="flex flex-col h-full">
            <div className="flex justify-between items-center p-6 border-b border-gray-200 flex-shrink-0">
              <h2 className="text-2xl font-bold text-gray-800">{isEditing ? 'Edit User' : 'Create New User'}</h2>
              <button type="button" onClick={onClose} className="p-1 rounded-full text-gray-400 hover:bg-gray-100 transition-colors">
                {ICONS.close}
              </button>
            </div>
            
            <div className="flex-grow overflow-y-auto p-6 space-y-4 bg-gray-50/50">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="name" className="block text-sm font-medium text-gray-700">Full Name <span className="text-red-500">*</span></label>
                    <input type="text" name="name" id="name" value={formData.name} onChange={handleChange} className={baseInputClasses} required />
                  </div>
                  <div>
                    <label htmlFor="email" className="block text-sm font-medium text-gray-700">Email Address <span className="text-red-500">*</span></label>
                    <input type="email" name="email" id="email" value={formData.email} onChange={handleChange} className={baseInputClasses} required />
                  </div>
                </div>
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                   <div>
                      <label htmlFor="username" className="block text-sm font-medium text-gray-700">Username <span className="text-gray-400 text-xs">(Optional)</span></label>
                      <input type="text" name="username" id="username" value={formData.username || ''} onChange={handleChange} className={baseInputClasses} placeholder="Use if different from email" />
                   </div>
                   <div>
                      <label htmlFor="role" className="block text-sm font-medium text-gray-700">Role <span className="text-red-500">*</span></label>
                      <select name="role" id="role" value={formData.role} onChange={handleChange} className={baseInputClasses} required>
                         {Object.values(Role).map(role => <option key={role} value={role}>{role}</option>)}
                      </select>
                    </div>
                 </div>
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label htmlFor="password" className="block text-sm font-medium text-gray-700">Password {isEditing && <span className="text-gray-400 text-xs">(Optional: leave blank to keep current)</span>}</label>
                      <input type="password" name="password" id="password" value={formData.password} onChange={handleChange} className={baseInputClasses} required={!isEditing} />
                    </div>
                    <div>
                      <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700">Confirm Password</label>
                      <input type="password" name="confirmPassword" id="confirmPassword" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} className={baseInputClasses} required={!isEditing} />
                    </div>
                     {passwordError && <p className="text-red-500 text-xs mt-1 md:col-span-2">{passwordError}</p>}
                 </div>
                 
                 <div className="grid grid-cols-1">
                      <div>
                          <label htmlFor="assignedWarehouses" className="block text-sm font-medium text-gray-700">Assigned Warehouses <span className="text-red-500">*</span></label>
                          <select name="assignedWarehouses" id="assignedWarehouses" value={formData.assignedWarehouses} onChange={handleMultiSelectChange} className={multiSelectClasses} multiple required>
                              {warehouses.map(w => <option key={w.id} value={w.id}>{w.name}</option>)}
                          </select>
                      </div>
                 </div>

                  <div className="grid grid-cols-1">
                      <div>
                          <label htmlFor="status" className="block text-sm font-medium text-gray-700">Status <span className="text-red-500">*</span></label>
                           <div className="mt-2 flex items-center">
                              <input type="radio" id="statusActive" name="status" value="Active" checked={formData.status === 'Active'} onChange={handleChange} className="h-4 w-4 text-brand-accent focus:ring-brand-accent border-gray-300" />
                              <label htmlFor="statusActive" className="ml-2 text-sm text-gray-700">Active</label>
                              <input type="radio" id="statusInactive" name="status" value="Inactive" checked={formData.status === 'Inactive'} onChange={handleChange} className="ml-6 h-4 w-4 text-brand-accent focus:ring-brand-accent border-gray-300" />
                              <label htmlFor="statusInactive" className="ml-2 text-sm text-gray-700">Inactive</label>
                           </div>
                      </div>
                  </div>

                  <div>
                      <label htmlFor="remarks" className="block text-sm font-medium text-gray-700">Remarks / Notes <span className="text-gray-400 text-xs">(Optional)</span></label>
                      <textarea name="remarks" id="remarks" value={formData.remarks} onChange={handleChange} rows={3} className={baseInputClasses} />
                  </div>
            </div>
            
            <div className="p-4 flex justify-end space-x-4 flex-shrink-0 bg-white border-t border-gray-200">
              <button
                type="button"
                onClick={onClose}
                className="bg-gray-200 text-gray-700 font-bold py-2 px-6 rounded-lg hover:bg-gray-300 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="bg-primary-600 text-white font-bold py-2 px-6 rounded-lg shadow-lg hover:bg-primary-700 focus:outline-none transition-transform transform hover:scale-105"
              >
                {isEditing ? 'Save Changes' : 'Create User'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </>
  );
};

export default CreateUserModal;