import React from 'react';
import { X, Mail, Phone, MapPin, Calendar, DollarSign, Building } from 'lucide-react';

export default function EmployeeDetailModal({ isOpen, employee, onClose, onEdit }) {
  if (!isOpen || !employee) return null;

  const getStatusBadge = (status) => {
    switch (status) {
      case 'Active':
        return 'bg-emerald-50 text-emerald-700 border-emerald-200';
      case 'On Leave':
        return 'bg-amber-50 text-amber-700 border-amber-200';
      case 'Terminated':
        return 'bg-red-50 text-red-700 border-red-200';
      default:
        return 'bg-slate-50 text-slate-700 border-slate-200';
    }
  };

  const formattedSalary = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0
  }).format(employee.salary || 0);

  const formattedDate = employee.joining_date
    ? new Date(employee.joining_date).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      })
    : 'N/A';

  const initials = `${employee.first_name?.[0] || ''}${employee.last_name?.[0] || ''}`.toUpperCase();

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="relative bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-100 animate-in fade-in zoom-in duration-200">
        
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 p-1.5 rounded-lg hover:bg-slate-100 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header Profile Banner */}
        <div className="flex items-center space-x-4 border-b border-slate-100 pb-5">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-indigo-600 to-indigo-800 text-white flex items-center justify-center text-xl font-bold shadow-md shadow-indigo-600/30">
            {initials}
          </div>
          <div>
            <h2 className="text-xl font-bold text-slate-900">
              {employee.first_name} {employee.last_name}
            </h2>
            <p className="text-sm text-indigo-600 font-medium">{employee.designation}</p>
            <span className={`inline-block mt-1 text-xs font-semibold px-2.5 py-0.5 rounded-full border ${getStatusBadge(employee.status)}`}>
              {employee.status}
            </span>
          </div>
        </div>

        {/* Detail Grid */}
        <div className="mt-5 space-y-4 text-sm text-slate-600">
          <div className="grid grid-cols-2 gap-4">
            <div className="flex items-center space-x-3 bg-slate-50 p-3 rounded-xl border border-slate-100">
              <Mail className="w-5 h-5 text-indigo-500" />
              <div>
                <p className="text-xs text-slate-400 font-medium">Email Address</p>
                <p className="font-semibold text-slate-800 truncate">{employee.email}</p>
              </div>
            </div>

            <div className="flex items-center space-x-3 bg-slate-50 p-3 rounded-xl border border-slate-100">
              <Phone className="w-5 h-5 text-indigo-500" />
              <div>
                <p className="text-xs text-slate-400 font-medium">Phone Number</p>
                <p className="font-semibold text-slate-800">{employee.phone}</p>
              </div>
            </div>

            <div className="flex items-center space-x-3 bg-slate-50 p-3 rounded-xl border border-slate-100">
              <Building className="w-5 h-5 text-indigo-500" />
              <div>
                <p className="text-xs text-slate-400 font-medium">Department</p>
                <p className="font-semibold text-slate-800">{employee.department}</p>
              </div>
            </div>

            <div className="flex items-center space-x-3 bg-slate-50 p-3 rounded-xl border border-slate-100">
              <DollarSign className="w-5 h-5 text-emerald-500" />
              <div>
                <p className="text-xs text-slate-400 font-medium">Annual Salary</p>
                <p className="font-semibold text-slate-800">{formattedSalary}</p>
              </div>
            </div>

            <div className="flex items-center space-x-3 bg-slate-50 p-3 rounded-xl border border-slate-100 col-span-2">
              <Calendar className="w-5 h-5 text-indigo-500" />
              <div>
                <p className="text-xs text-slate-400 font-medium">Joining Date</p>
                <p className="font-semibold text-slate-800">{formattedDate}</p>
              </div>
            </div>
          </div>

          {employee.address && (
            <div className="flex items-start space-x-3 bg-slate-50 p-3 rounded-xl border border-slate-100">
              <MapPin className="w-5 h-5 text-indigo-500 mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-xs text-slate-400 font-medium">Residential Address</p>
                <p className="font-medium text-slate-800 leading-snug">{employee.address}</p>
              </div>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="mt-6 flex items-center justify-end space-x-3 pt-4 border-t border-slate-100">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors"
          >
            Close
          </button>
          <button
            type="button"
            onClick={() => {
              onClose();
              onEdit(employee);
            }}
            className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow-md shadow-indigo-600/20 transition-colors"
          >
            Edit Profile
          </button>
        </div>

      </div>
    </div>
  );
}
