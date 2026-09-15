import React, { useState, useEffect, useCallback } from 'react';
import Navbar from '../components/Navbar';
import StatsCards from '../components/StatsCards';
import EmployeeTable from '../components/EmployeeTable';
import EmployeeModal from '../components/EmployeeModal';
import EmployeeDetailModal from '../components/EmployeeDetailModal';
import ConfirmModal from '../components/ConfirmModal';
import Toast from '../components/Toast';
import api from '../services/api';
import { Search, UserPlus, Download, RefreshCw, Filter } from 'lucide-react';

export default function Dashboard() {
  const [employees, setEmployees] = useState([]);
  const [stats, setStats] = useState({ total: 0, active: 0, totalPayroll: 0, departmentsCount: 0 });
  const [loading, setLoading] = useState(true);

  // Search & Filters State
  const [search, setSearch] = useState('');
  const [department, setDepartment] = useState('All');
  const [status, setStatus] = useState('All');
  const [sortBy, setSortBy] = useState('created_at');
  const [sortOrder, setSortOrder] = useState('DESC');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;

  // Modals State
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState(null);
  const [viewingEmployee, setViewingEmployee] = useState(null);
  const [deletingEmployee, setDeletingEmployee] = useState(null);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  // Toast Notification State
  const [toast, setToast] = useState({ message: '', type: 'success' });

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
  };

  const fetchEmployees = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.get('/employees', {
        params: {
          search,
          department: department !== 'All' ? department : undefined,
          status: status !== 'All' ? status : undefined,
          sortBy,
          sortOrder
        }
      });
      if (res.data.success) {
        setEmployees(res.data.data);
        setStats(res.data.stats);
      }
    } catch (err) {
      showToast('Failed to load employee records.', 'error');
    } finally {
      setLoading(false);
    }
  }, [search, department, status, sortBy, sortOrder]);

  useEffect(() => {
    fetchEmployees();
  }, [fetchEmployees]);

  // Handle Create or Update
  const handleSaveEmployee = async (formData) => {
    setIsSubmitting(true);
    try {
      if (editingEmployee) {
        // Update existing
        const res = await api.put(`/employees/${editingEmployee.id}`, formData);
        if (res.data.success) {
          showToast(`Employee "${formData.first_name} ${formData.last_name}" updated successfully.`);
          setEditingEmployee(null);
          fetchEmployees();
        }
      } else {
        // Create new
        const res = await api.post('/employees', formData);
        if (res.data.success) {
          showToast(`Employee "${formData.first_name} ${formData.last_name}" added successfully.`);
          setIsAddModalOpen(false);
          fetchEmployees();
        }
      }
    } catch (err) {
      const msg = err.response?.data?.message || 'Operation failed. Please try again.';
      showToast(msg, 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle Delete
  const handleConfirmDelete = async () => {
    if (!deletingEmployee) return;
    setIsDeleting(true);
    try {
      const res = await api.delete(`/employees/${deletingEmployee.id}`);
      if (res.data.success) {
        showToast(`Employee "${deletingEmployee.first_name} ${deletingEmployee.last_name}" removed.`);
        setDeletingEmployee(null);
        fetchEmployees();
      }
    } catch (err) {
      showToast('Failed to delete employee.', 'error');
    } finally {
      setIsDeleting(false);
    }
  };

  // Handle CSV Export
  const handleExportCSV = () => {
    if (employees.length === 0) {
      showToast('No employee records available to export.', 'error');
      return;
    }

    const headers = ['ID', 'First Name', 'Last Name', 'Email', 'Phone', 'Department', 'Designation', 'Joining Date', 'Salary ($)', 'Status', 'Address'];
    const rows = employees.map(emp => [
      emp.id,
      `"${emp.first_name}"`,
      `"${emp.last_name}"`,
      `"${emp.email}"`,
      `"${emp.phone}"`,
      `"${emp.department}"`,
      `"${emp.designation}"`,
      `"${emp.joining_date}"`,
      emp.salary,
      `"${emp.status}"`,
      `"${emp.address ? emp.address.replace(/"/g, '""') : ''}"`
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `employees_export_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    showToast('Employee dataset exported to CSV.');
  };

  // Pagination Logic
  const totalPages = Math.ceil(employees.length / itemsPerPage) || 1;
  const paginatedEmployees = employees.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <Navbar />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {/* Dashboard Header & Actions */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
          <div>
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Employee Directory</h1>
            <p className="text-xs text-slate-500 mt-1">Manage workforce records, view stats, and perform CRUD operations.</p>
          </div>

          <div className="flex items-center space-x-3">
            <button
              onClick={handleExportCSV}
              className="inline-flex items-center space-x-2 px-3.5 py-2.5 rounded-xl border border-slate-300 bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold shadow-sm transition-colors"
            >
              <Download className="w-4 h-4 text-slate-500" />
              <span>Export CSV</span>
            </button>

            <button
              onClick={() => setIsAddModalOpen(true)}
              className="inline-flex items-center space-x-2 px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold shadow-md shadow-indigo-600/20 transition-all duration-200"
            >
              <UserPlus className="w-4 h-4" />
              <span>Add Employee</span>
            </button>
          </div>
        </div>

        {/* Metric Analytics Cards */}
        <StatsCards stats={stats} />

        {/* Search & Filter Bar */}
        <div className="bg-white rounded-2xl p-4 mb-6 border border-slate-200/80 shadow-sm flex flex-col md:flex-row gap-4 items-center justify-between">
          
          {/* Search input */}
          <div className="relative w-full md:w-80">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
            <input
              type="text"
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setCurrentPage(1);
              }}
              placeholder="Search by name, email, role..."
              className="w-full pl-10 pr-4 py-2 text-sm rounded-xl border border-slate-200 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 bg-slate-50/50"
            />
          </div>

          {/* Dropdown Filters */}
          <div className="flex items-center space-x-3 w-full md:w-auto flex-wrap sm:flex-nowrap">
            <div className="flex items-center space-x-1.5 text-xs text-slate-500 font-semibold">
              <Filter className="w-4 h-4 text-indigo-500" />
              <span>Filter:</span>
            </div>

            <select
              value={department}
              onChange={(e) => {
                setDepartment(e.target.value);
                setCurrentPage(1);
              }}
              className="px-3 py-2 text-xs rounded-xl border border-slate-200 bg-white font-medium text-slate-700 focus:outline-none focus:border-indigo-500"
            >
              <option value="All">All Departments</option>
              <option value="Engineering">Engineering</option>
              <option value="Sales">Sales</option>
              <option value="Marketing">Marketing</option>
              <option value="Human Resources">Human Resources</option>
              <option value="Finance">Finance</option>
              <option value="Management">Management</option>
              <option value="Executive">Executive</option>
            </select>

            <select
              value={status}
              onChange={(e) => {
                setStatus(e.target.value);
                setCurrentPage(1);
              }}
              className="px-3 py-2 text-xs rounded-xl border border-slate-200 bg-white font-medium text-slate-700 focus:outline-none focus:border-indigo-500"
            >
              <option value="All">All Statuses</option>
              <option value="Active">Active</option>
              <option value="On Leave">On Leave</option>
              <option value="Terminated">Terminated</option>
            </select>

            <button
              onClick={fetchEmployees}
              title="Refresh Data"
              className="p-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-500 transition-colors"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
          </div>

        </div>

        {/* Employee Data Table */}
        <EmployeeTable
          employees={paginatedEmployees}
          loading={loading}
          onView={(emp) => setViewingEmployee(emp)}
          onEdit={(emp) => setEditingEmployee(emp)}
          onDelete={(emp) => setDeletingEmployee(emp)}
          sortBy={sortBy}
          sortOrder={sortOrder}
          onSortChange={(col, order) => {
            setSortBy(col);
            setSortOrder(order);
          }}
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={(page) => setCurrentPage(page)}
        />

      </main>

      {/* Add / Edit Modal */}
      {(isAddModalOpen || editingEmployee) && (
        <EmployeeModal
          isOpen={true}
          onClose={() => {
            setIsAddModalOpen(false);
            setEditingEmployee(null);
          }}
          onSave={handleSaveEmployee}
          employee={editingEmployee}
          isSubmitting={isSubmitting}
        />
      )}

      {/* View Detail Modal */}
      {viewingEmployee && (
        <EmployeeDetailModal
          isOpen={true}
          employee={viewingEmployee}
          onClose={() => setViewingEmployee(null)}
          onEdit={(emp) => {
            setViewingEmployee(null);
            setEditingEmployee(emp);
          }}
        />
      )}

      {/* Delete Confirmation Modal */}
      {deletingEmployee && (
        <ConfirmModal
          isOpen={true}
          title="Delete Employee Record"
          message={`Are you sure you want to permanently remove "${deletingEmployee.first_name} ${deletingEmployee.last_name}" from the system? This action cannot be undone.`}
          onConfirm={handleConfirmDelete}
          onCancel={() => setDeletingEmployee(null)}
          isDeleting={isDeleting}
        />
      )}

      {/* Toast Feedback Notifications */}
      <Toast
        message={toast.message}
        type={toast.type}
        onClose={() => setToast({ message: '', type: 'success' })}
      />

    </div>
  );
}
