import { useState } from 'react'
import { LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import { TrendingUp, TrendingDown, Plus, Calendar } from 'lucide-react'
import QuickAddModal from '../components/QuickAddModal'

// Mock data
const spendingTrends = [
  { day: 'Mon', amount: 450 },
  { day: 'Tue', amount: 320 },
  { day: 'Wed', amount: 680 },
  { day: 'Thu', amount: 290 },
  { day: 'Fri', amount: 820 },
  { day: 'Sat', amount: 1200 },
  { day: 'Sun', amount: 540 },
]

const categoryData = [
  { name: 'Food', value: 2200, color: '#f59e0b' },
  { name: 'Travel', value: 1100, color: '#3b82f6' },
  { name: 'Rent', value: 2200, color: '#8b5cf6' },
]

const recentTransactions = [
  { id: 1, date: '2024-02-20', description: 'Zomato Order', category: 'Food', amount: -450, source: 'UPI' },
  { id: 2, date: '2024-02-19', description: 'Uber Ride', category: 'Travel', amount: -180, source: 'Bank' },
  { id: 3, date: '2024-02-19', description: 'Grocery Shopping', category: 'Food', amount: -820, source: 'Cash' },
  { id: 4, date: '2024-02-18', description: 'Salary Credit', category: 'Income', amount: 30000, source: 'Bank' },
  { id: 5, date: '2024-02-17', description: 'Coffee', category: 'Food', amount: -120, source: 'Cash' },
]

export default function DashboardHome() {
  const [showQuickAdd, setShowQuickAdd] = useState(false)
  const [dateFilter, setDateFilter] = useState('week')

  return (
    <div className="space-y-6">
      {/* Date Filter */}
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-semibold text-slate-800">Dashboard Overview</h2>
        <div className="flex items-center space-x-2">
          <Calendar className="h-5 w-5 text-slate-400" />
          <select
            value={dateFilter}
            onChange={(e) => setDateFilter(e.target.value)}
            className="px-4 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none"
          >
            <option value="week">This Week</option>
            <option value="month">This Month</option>
            <option value="custom">Custom Range</option>
          </select>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-lg shadow-sm p-6">
          <p className="text-sm font-medium text-slate-500">Total Balance</p>
          <p className="text-3xl font-bold text-slate-800 mt-2">₹24,500</p>
          <p className="text-xs text-slate-400 mt-1">As of today</p>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-6">
          <p className="text-sm font-medium text-slate-500">Monthly Income</p>
          <div className="flex items-baseline mt-2">
            <p className="text-3xl font-bold text-emerald-600">₹30,000</p>
            <TrendingUp className="ml-2 h-5 w-5 text-emerald-600" />
          </div>
          <p className="text-xs text-slate-400 mt-1">February 2024</p>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-6">
          <p className="text-sm font-medium text-slate-500">Monthly Expenses</p>
          <div className="flex items-baseline mt-2">
            <p className="text-3xl font-bold text-red-600">₹5,500</p>
            <TrendingDown className="ml-2 h-5 w-5 text-red-600" />
          </div>
          <p className="text-xs text-slate-400 mt-1">February 2024</p>
        </div>
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        {/* Line Chart */}
        <div className="lg:col-span-3 bg-white rounded-lg shadow-sm p-6">
          <h3 className="text-lg font-semibold text-slate-800 mb-4">Spending Trends</h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={spendingTrends}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis dataKey="day" stroke="#64748b" style={{ fontSize: '12px' }} />
              <YAxis stroke="#64748b" style={{ fontSize: '12px' }} />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: '#fff', 
                  border: '1px solid #e2e8f0',
                  borderRadius: '8px',
                  fontSize: '14px'
                }} 
              />
              <Line type="monotone" dataKey="amount" stroke="#4f46e5" strokeWidth={2} dot={{ fill: '#4f46e5' }} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Pie Chart */}
        <div className="lg:col-span-2 bg-white rounded-lg shadow-sm p-6">
          <h3 className="text-lg font-semibold text-slate-800 mb-4">Expenses by Category</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={categoryData}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={100}
                paddingAngle={5}
                dataKey="value"
              >
                {categoryData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: '#fff', 
                  border: '1px solid #e2e8f0',
                  borderRadius: '8px',
                  fontSize: '14px'
                }} 
              />
            </PieChart>
          </ResponsiveContainer>
          <div className="mt-4 space-y-2">
            {categoryData.map((item) => (
              <div key={item.name} className="flex items-center justify-between text-sm">
                <div className="flex items-center">
                  <div className="w-3 h-3 rounded-full mr-2" style={{ backgroundColor: item.color }} />
                  <span className="text-slate-700">{item.name}</span>
                </div>
                <span className="font-medium text-slate-800">₹{item.value}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="bg-white rounded-lg shadow-sm">
        <div className="p-6 border-b border-gray-200 flex items-center justify-between">
          <h3 className="text-lg font-semibold text-slate-800">Recent Transactions</h3>
          <button
            onClick={() => setShowQuickAdd(true)}
            className="flex items-center px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors text-sm font-medium"
          >
            <Plus className="h-4 w-4 mr-2" />
            Quick Add Expense
          </button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Date</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Description</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Category</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Amount</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Source</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {recentTransactions.map((transaction) => (
                <tr key={transaction.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-700">{transaction.date}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-800 font-medium">{transaction.description}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600">{transaction.category}</td>
                  <td className={`px-6 py-4 whitespace-nowrap text-sm font-semibold ${
                    transaction.amount > 0 ? 'text-emerald-600' : 'text-red-600'
                  }`}>
                    {transaction.amount > 0 ? '+' : ''}₹{Math.abs(transaction.amount)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="px-2 py-1 text-xs font-medium rounded-full bg-slate-100 text-slate-700">
                      {transaction.source}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Quick Add Modal */}
      {showQuickAdd && <QuickAddModal onClose={() => setShowQuickAdd(false)} />}
    </div>
  )
}
