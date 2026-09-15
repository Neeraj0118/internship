import React, { useState, useEffect } from 'react';
import { X, UserPlus, Save, AlertCircle } from 'lucide-react';

export default function EmployeeModal({ isOpen, onClose, onSave, employee = null, isSubmitting = false }) {
  const isEditMode = Boolean(employee);

  const initialFormState = {
    first_name: '',
    last_name: '',
    email: '',
    phone: '',
    department: 'Engineering',
    designation: '',
    joining_date: new Date().toISOString().split('T')[0],
    salary: '',
    status: 'Active',
    address: ''
  };

  const [formData, setFormData] = useState(initialFormState);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (employee) {
      setFormData({
        first_name: employee.first_name || '',
        last_name: employee.last_name || '',
        email: employee.email || '',
        phone: employee.phone || '',
        department: employee.department || 'Engineering',
        designation: employee.designation || '',
        joining_date: employee.joining_date || new Date().toISOString().split('T')[0],
        salary: employee.salary !== undefined ? String(employee.salary) : '',
        status: employee.status || 'Active',
        address: employee.address || ''
      });
    } else {
      setFormData(initialFormState);
    }
    setErrors({});
  }, [employee, isOpen]);

  if (!isOpen) return null;

  const validate = () => {
    const newErrors = {};
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!formData.first_name.trim()) newErrors.first_name = 'First name is required.';
    if (!formData.last_name.trim()) newErrors.last_name = 'Last name is required.';
    
    if (!formData.email.trim()) {
      newErrors.email = 'Email address is required.';
    } else if (!emailRegex.test(formData.email.trim())) {
      newErrors.email = 'Please enter a valid email address (e.g. name@company.com).';
    }

    if (!formData.phone.trim()) {
      newErrors.phone = 'Phone number is required.';
    } else if (formData.phone.trim().length < 7) {
      newErrors.phone = 'Phone number must be at least 7 characters.';
    }

    if (!formData.department.trim()) newErrors.department = 'Department is required.';
    if (!formData.designation.trim()) newErrors.designation = 'Designation is required.';
    if (!formData.joining_date) newErrors.joining_date = 'Joining date is required.';

    if (!formData.salary) {
      newErrors.salary = 'Salary is required.';
    } else if (isNaN(Number(formData.salary)) || Number(formData.salary) < 0) {
      newErrors.salary = 'Salary must be a positive number.';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: null }));
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (validate()) {
      onSave(formData);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="relative bg-white rounded-2xl max-w-2xl w-full p-6 sm:p-8 shadow-2xl border border-slate-100 animate-in fade-in zoom-in duration-200">
        
        {/* Modal Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-100">
          <div className="flex items-center space-x-3">
            <div className="p-2.5 rounded-xl bg-indigo-50 text-indigo-600 font-semibold">
              {isEditMode ? <Save className="w-5 h-5" /> : <UserPlus className="w-5 h-5" />}
            </div>
            <div>
              <h2 className="text-xl font-bold text-slate-900">
                {isEditMode ? 'Edit Employee Record' : 'Add New Employee'}
              </h2>
              <p className="text-xs text-slate-500">
                {isEditMode ? 'Update employee details with valid data.' : 'Fill in the details below to add a new employee.'}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 p-1.5 rounded-lg hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* First Name */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                First Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="first_name"
                value={formData.first_name}
                onChange={handleChange}
                placeholder="e.g. John"
                className={`w-full px-3.5 py-2.5 rounded-xl border ${errors.first_name ? 'border-red-400 bg-red-50/30' : 'border-slate-300 focus:border-indigo-500'} text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 transition-all`}
              />
              {errors.first_name && <p className="text-xs text-red-500 mt-1 flex items-center gap-1"><AlertCircle className="w-3 h-3" /> {errors.first_name}</p>}
            </div>

            {/* Last Name */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                Last Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="last_name"
                value={formData.last_name}
                onChange={handleChange}
                placeholder="e.g. Doe"
                className={`w-full px-3.5 py-2.5 rounded-xl border ${errors.last_name ? 'border-red-400 bg-red-50/30' : 'border-slate-300 focus:border-indigo-500'} text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 transition-all`}
              />
              {errors.last_name && <p className="text-xs text-red-500 mt-1 flex items-center gap-1"><AlertCircle className="w-3 h-3" /> {errors.last_name}</p>}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Email */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                Email Address <span className="text-red-500">*</span>
              </label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="e.g. john.doe@company.com"
                className={`w-full px-3.5 py-2.5 rounded-xl border ${errors.email ? 'border-red-400 bg-red-50/30' : 'border-slate-300 focus:border-indigo-500'} text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 transition-all`}
              />
              {errors.email && <p className="text-xs text-red-500 mt-1 flex items-center gap-1"><AlertCircle className="w-3 h-3" /> {errors.email}</p>}
            </div>

            {/* Phone */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                Phone Number <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                placeholder="e.g. +1 555-0199"
                className={`w-full px-3.5 py-2.5 rounded-xl border ${errors.phone ? 'border-red-400 bg-red-50/30' : 'border-slate-300 focus:border-indigo-500'} text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 transition-all`}
              />
              {errors.phone && <p className="text-xs text-red-500 mt-1 flex items-center gap-1"><AlertCircle className="w-3 h-3" /> {errors.phone}</p>}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Department */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                Department <span className="text-red-500">*</span>
              </label>
              <select
                name="department"
                value={formData.department}
                onChange={handleChange}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:border-indigo-500 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 bg-white transition-all"
              >
                <option value="Engineering">Engineering</option>
                <option value="Sales">Sales</option>
                <option value="Marketing">Marketing</option>
                <option value="Human Resources">Human Resources</option>
                <option value="Finance">Finance</option>
                <option value="Management">Management</option>
                <option value="Executive">Executive</option>
                <option value="Operations">Operations</option>
              </select>
            </div>

            {/* Designation */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                Designation <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="designation"
                value={formData.designation}
                onChange={handleChange}
                placeholder="e.g. Software Engineer"
                className={`w-full px-3.5 py-2.5 rounded-xl border ${errors.designation ? 'border-red-400 bg-red-50/30' : 'border-slate-300 focus:border-indigo-500'} text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 transition-all`}
              />
              {errors.designation && <p className="text-xs text-red-500 mt-1 flex items-center gap-1"><AlertCircle className="w-3 h-3" /> {errors.designation}</p>}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {/* Joining Date */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                Joining Date <span className="text-red-500">*</span>
              </label>
              <input
                type="date"
                name="joining_date"
                value={formData.joining_date}
                onChange={handleChange}
                className={`w-full px-3.5 py-2.5 rounded-xl border ${errors.joining_date ? 'border-red-400 bg-red-50/30' : 'border-slate-300 focus:border-indigo-500'} text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 transition-all`}
              />
              {errors.joining_date && <p className="text-xs text-red-500 mt-1 flex items-center gap-1"><AlertCircle className="w-3 h-3" /> {errors.joining_date}</p>}
            </div>

            {/* Salary */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                Salary ($/yr) <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                name="salary"
                value={formData.salary}
                onChange={handleChange}
                placeholder="e.g. 75000"
                min="0"
                step="1000"
                className={`w-full px-3.5 py-2.5 rounded-xl border ${errors.salary ? 'border-red-400 bg-red-50/30' : 'border-slate-300 focus:border-indigo-500'} text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 transition-all`}
              />
              {errors.salary && <p className="text-xs text-red-500 mt-1 flex items-center gap-1"><AlertCircle className="w-3 h-3" /> {errors.salary}</p>}
            </div>

            {/* Status */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                Status
              </label>
              <select
                name="status"
                value={formData.status}
                onChange={handleChange}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:border-indigo-500 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 bg-white transition-all"
              >
                <option value="Active">Active</option>
                <option value="On Leave">On Leave</option>
                <option value="Terminated">Terminated</option>
              </select>
            </div>
          </div>

          {/* Address */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
              Address
            </label>
            <textarea
              name="address"
              value={formData.address}
              onChange={handleChange}
              rows="2"
              placeholder="e.g. 123 Main Street, Suite 400..."
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:border-indigo-500 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 transition-all"
            ></textarea>
          </div>

          {/* Form Buttons */}
          <div className="mt-6 flex items-center justify-end space-x-3 pt-4 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="px-4 py-2.5 text-sm font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-5 py-2.5 text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-md shadow-indigo-600/20 transition-colors flex items-center gap-2"
            >
              {isSubmitting ? (
                <>
                  <svg className="animate-spin h-4 w-4 text-white" viewBox="0 0 24 24" fill="none">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"></path>
                  </svg>
                  Saving...
                </>
              ) : (
                isEditMode ? 'Update Record' : 'Create Employee'
              )}
            </button>
          </div>

        </form>

      </div>
    </div>
  );
}
