import React from 'react';
import { Users, UserCheck, DollarSign, Building2 } from 'lucide-react';

export default function StatsCards({ stats }) {
  const formattedPayroll = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0
  }).format(stats?.totalPayroll || 0);

  const cardItems = [
    {
      title: 'Total Employees',
      value: stats?.total || 0,
      icon: Users,
      color: 'from-blue-500 to-indigo-600',
      bgColor: 'bg-blue-50 text-blue-600',
      subtext: 'Registered workforce'
    },
    {
      title: 'Active Employees',
      value: stats?.active || 0,
      icon: UserCheck,
      color: 'from-emerald-500 to-teal-600',
      bgColor: 'bg-emerald-50 text-emerald-600',
      subtext: `${stats?.total ? Math.round((stats.active / stats.total) * 100) : 0}% active rate`
    },
    {
      title: 'Total Payroll',
      value: formattedPayroll,
      icon: DollarSign,
      color: 'from-violet-500 to-purple-600',
      bgColor: 'bg-violet-50 text-violet-600',
      subtext: 'Monthly salary expenditure'
    },
    {
      title: 'Departments',
      value: stats?.departmentsCount || 0,
      icon: Building2,
      color: 'from-amber-500 to-orange-600',
      bgColor: 'bg-amber-50 text-amber-600',
      subtext: 'Operational units'
    }
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      {cardItems.map((item, index) => {
        const Icon = item.icon;
        return (
          <div
            key={index}
            className="bg-white rounded-xl p-5 shadow-sm border border-slate-200/80 hover:shadow-md transition-shadow duration-200 flex items-center justify-between"
          >
            <div>
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">{item.title}</p>
              <h3 className="text-2xl font-bold text-slate-900 mt-1">{item.value}</h3>
              <p className="text-xs text-slate-400 mt-1">{item.subtext}</p>
            </div>
            <div className={`p-3 rounded-xl ${item.bgColor} shadow-sm`}>
              <Icon className="w-6 h-6" />
            </div>
          </div>
        );
      })}
    </div>
  );
}
