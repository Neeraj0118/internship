import React from 'react';
import { Eye, Edit2, Trash2, ArrowUpDown, ChevronLeft, ChevronRight, User } from 'lucide-react';

export default function EmployeeTable({
  employees,
  loading,
  onView,
  onEdit,
  onDelete,
  sortBy,
  sortOrder,
  onSortChange,
  currentPage,
  totalPages,
  onPageChange
}) {

  const getStatusBadge = (status) => {
    switch (status) {
      case 'Active':
        return 'bg-emerald-50 text-emerald-700 border-emerald-200/80';
      case 'On Leave':
        return 'bg-amber-50 text-amber-700 border-amber-200/80';
      case 'Terminated':
        return 'bg-red-50 text-red-700 border-red-200/80';
      default:
        return 'bg-slate-50 text-slate-700 border-slate-200/80';
    }
  };

  const formatCurrency = (val) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      maximumFractionDigits: 0
    }).format(val || 0);
  };

  const handleHeaderClick = (columnKey) => {
    if (sortBy === columnKey) {
      onSortChange(columnKey, sortOrder === 'ASC' ? 'DESC' : 'ASC');
    } else {
      onSortChange(columnKey, 'ASC');
    }
  };

  if (loading) {
    return (
      <div className="bg-white rounded-2xl p-12 text-center border border-slate-200/80 shadow-sm">
        <div className="inline-flex items-center justify-center p-4 bg-indigo-50 rounded-2xl text-indigo-600 mb-3 animate-pulse">
          <User className="w-8 h-8" />
        </div>
        <h3 className="text-base font-semibold text-slate-700">Loading Employee Records...</h3>
        <p className="text-xs text-slate-400 mt-1">Fetching latest data from backend server</p>
      </div>
    );
  }

  if (employees.length === 0) {
    return (
      <div className="bg-white rounded-2xl p-12 text-center border border-slate-200/80 shadow-sm">
        <div className="inline-flex items-center justify-center p-4 bg-slate-100 rounded-2xl text-slate-400 mb-3">
          <User className="w-8 h-8" />
        </div>
        <h3 className="text-base font-semibold text-slate-700">No Employee Records Found</h3>
        <p className="text-xs text-slate-400 mt-1">Try adjusting your search criteria or add a new employee.</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-200/80 overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-50/80 border-b border-slate-200 text-xs font-semibold text-slate-500 uppercase tracking-wider">
              <th className="py-3.5 px-4 cursor-pointer hover:text-indigo-600 transition-colors" onClick={() => handleHeaderClick('first_name')}>
                <div className="flex items-center space-x-1">
                  <span>Employee Name</span>
                  <ArrowUpDown className="w-3.5 h-3.5 text-slate-400" />
                </div>
              </th>
              <th className="py-3.5 px-4 cursor-pointer hover:text-indigo-600 transition-colors" onClick={() => handleHeaderClick('email')}>
                <div className="flex items-center space-x-1">
                  <span>Contact</span>
                  <ArrowUpDown className="w-3.5 h-3.5 text-slate-400" />
                </div>
              </th>
              <th className="py-3.5 px-4 cursor-pointer hover:text-indigo-600 transition-colors" onClick={() => handleHeaderClick('department')}>
                <div className="flex items-center space-x-1">
                  <span>Department</span>
                  <ArrowUpDown className="w-3.5 h-3.5 text-slate-400" />
                </div>
              </th>
              <th className="py-3.5 px-4 cursor-pointer hover:text-indigo-600 transition-colors" onClick={() => handleHeaderClick('designation')}>
                <div className="flex items-center space-x-1">
                  <span>Designation</span>
                  <ArrowUpDown className="w-3.5 h-3.5 text-slate-400" />
                </div>
              </th>
              <th className="py-3.5 px-4 cursor-pointer hover:text-indigo-600 transition-colors" onClick={() => handleHeaderClick('salary')}>
                <div className="flex items-center space-x-1">
                  <span>Salary</span>
                  <ArrowUpDown className="w-3.5 h-3.5 text-slate-400" />
                </div>
              </th>
              <th className="py-3.5 px-4 cursor-pointer hover:text-indigo-600 transition-colors" onClick={() => handleHeaderClick('status')}>
                <div className="flex items-center space-x-1">
                  <span>Status</span>
                  <ArrowUpDown className="w-3.5 h-3.5 text-slate-400" />
                </div>
              </th>
              <th className="py-3.5 px-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 text-sm">
            {employees.map((emp) => {
              const initials = `${emp.first_name?.[0] || ''}${emp.last_name?.[0] || ''}`.toUpperCase();
              return (
                <tr key={emp.id} className="hover:bg-slate-50/60 transition-colors group">
                  {/* Name & Avatar */}
                  <td className="py-3.5 px-4">
                    <div className="flex items-center space-x-3">
                      <div className="w-9 h-9 rounded-full bg-indigo-100 text-indigo-700 font-bold text-xs flex items-center justify-center flex-shrink-0">
                        {initials}
                      </div>
                      <div>
                        <div className="font-semibold text-slate-900 group-hover:text-indigo-600 transition-colors">
                          {emp.first_name} {emp.last_name}
                        </div>
                        <div className="text-xs text-slate-400">ID: #{emp.id}</div>
                      </div>
                    </div>
                  </td>

                  {/* Contact */}
                  <td className="py-3.5 px-4">
                    <div className="text-slate-800 font-medium">{emp.email}</div>
                    <div className="text-xs text-slate-400">{emp.phone}</div>
                  </td>

                  {/* Department */}
                  <td className="py-3.5 px-4">
                    <span className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-medium bg-slate-100 text-slate-700">
                      {emp.department}
                    </span>
                  </td>

                  {/* Designation */}
                  <td className="py-3.5 px-4 text-slate-700 font-medium">
                    {emp.designation}
                  </td>

                  {/* Salary */}
                  <td className="py-3.5 px-4 font-semibold text-slate-900">
                    {formatCurrency(emp.salary)}
                  </td>

                  {/* Status */}
                  <td className="py-3.5 px-4">
                    <span className={`inline-block text-xs font-semibold px-2.5 py-0.5 rounded-full border ${getStatusBadge(emp.status)}`}>
                      {emp.status}
                    </span>
                  </td>

                  {/* Action Buttons */}
                  <td className="py-3.5 px-4 text-right">
                    <div className="flex items-center justify-end space-x-1">
                      <button
                        onClick={() => onView(emp)}
                        title="View Profile"
                        className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                      >
                        <Eye className="w-4 h-4" />
                      </button>

                      <button
                        onClick={() => onEdit(emp)}
                        title="Edit Record"
                        className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>

                      <button
                        onClick={() => onDelete(emp)}
                        title="Delete Record"
                        className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="px-4 py-3 bg-slate-50/60 border-t border-slate-200/80 flex items-center justify-between text-xs text-slate-500">
          <div>
            Showing Page <span className="font-semibold text-slate-700">{currentPage}</span> of{' '}
            <span className="font-semibold text-slate-700">{totalPages}</span>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={() => onPageChange(currentPage - 1)}
              disabled={currentPage === 1}
              className="p-1.5 rounded-lg border border-slate-300 hover:bg-white disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>

            <button
              onClick={() => onPageChange(currentPage + 1)}
              disabled={currentPage === totalPages}
              className="p-1.5 rounded-lg border border-slate-300 hover:bg-white disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
