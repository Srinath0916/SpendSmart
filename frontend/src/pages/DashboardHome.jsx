import { useState, useEffect } from 'react'
import { LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import { TrendingUp, TrendingDown, Plus, Calendar } from 'lucide-react'
import QuickAddModal from '../components/QuickAddModal'
import { dashboardAPI, transactionAPI } from '../utils/api'

export default function DashboardHome() {
  const [showQuickAdd, setShowQuickAdd] = useState(false)
  const [dateFilter, setDateFilter] = useState('week')
  const [stats, setStats] = useState(null)
  const [transactions, setTransactions] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      setLoading(true)
      const [statsData, transData] = await Promise.all([
        dashboardAPI.getQuickStats(),
        transactionAPI.getAll()
      ])
      setStats(statsData)
      setTransactions(transData.results?.slice(0, 5) || [])
    } catch (error) {
      console.error('Error fetching dashboard data:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-slate-600">Loading dashboard...</div>
      </div>
    )
  }

  const totalBalance = stats?.total_balance || 0
  const monthlyIncome = stats?.monthly_income || 0
  const monthlyExpenses = stats?.monthly_expenses || 0

  // Generate spending trends from actual transactions
  const spendingTrends = []
  const categoryData = []

  // Calculate category breakdown from transactions
  const categoryTotals = {}
  transactions.forEach(t => {
    const amount = Math.abs(parseFloat(t.amount))
    const catName = t.category_name || 'Uncategorized'
    if (parseFloat(t.amount) < 0) { // Only expenses
      categoryTotals[catName] = (categoryTotals[catName] || 0) + amount
    }
  })

  // Convert to chart data
  const colors = ['#f59e0b', '#3b82f6', '#8b5cf6', '#10b981', '#ef4444', '#6366f1']
  Object.entries(categoryTotals).forEach(([name, value], index) => {
    categoryData.push({
      name,
      value: Math.round(value),
      color: colors[index % colors.length]
    })
  })

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
          <p className="text-3xl font-bold text-slate-800 mt-2">₹{totalBalance.toLocaleString()}</p>
          <p className="text-xs text-slate-400 mt-1">As of today</p>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-6">
          <p className="text-sm font-medium text-slate-500">Monthly Income</p>
          <div className="flex items-baseline mt-2">
            <p className="text-3xl font-bold text-emerald-600">₹{monthlyIncome.toLocaleString()}</p>
            <TrendingUp className="ml-2 h-5 w-5 text-emerald-600" />
          </div>
          <p className="text-xs text-slate-400 mt-1">April 2026</p>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-6">
          <p className="text-sm font-medium text-slate-500">Monthly Expenses</p>
          <div className="flex items-baseline mt-2">
            <p className="text-3xl font-bold text-red-600">₹{monthlyExpenses.toLocaleString()}</p>
            <TrendingDown className="ml-2 h-5 w-5 text-red-600" />
          </div>
          <p className="text-xs text-slate-400 mt-1">April 2026</p>
        </div>
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Spending Trends Chart */}
        <div className="lg:col-span-2 bg-white rounded-lg shadow-sm p-6">
          <h3 className="text-lg font-semibold text-slate-800 mb-4">Spending Trends</h3>
          {spendingTrends.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={spendingTrends}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis dataKey="day" stroke="#64748b" />
                <YAxis stroke="#64748b" />
                <Tooltip />
                <Line type="monotone" dataKey="amount" stroke="#6366f1" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-[300px] flex items-center justify-center text-slate-500">
              No spending data available for chart
            </div>
          )}
        </div>

        {/* Category Breakdown */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h3 className="text-lg font-semibold text-slate-800 mb-4">Expenses by Category</h3>
          {categoryData.length > 0 ? (
            <>
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
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
              <div className="mt-4 space-y-2">
                {categoryData.map((cat) => (
                  <div key={cat.name} className="flex items-center justify-between text-sm">
                    <div className="flex items-center">
                      <div className="w-3 h-3 rounded-full mr-2" style={{ backgroundColor: cat.color }}></div>
                      <span className="text-slate-600">{cat.name}</span>
                    </div>
                    <span className="font-semibold text-slate-800">₹{cat.value}</span>
                  </div>
                ))}
              </div>
            </>
          ) : (
            <div className="h-[300px] flex items-center justify-center text-slate-500">
              No category data available
            </div>
          )}
        </div>
      </div>

      {/* Recent Activity & Quick Add */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Transactions */}
        <div className="lg:col-span-2 bg-white rounded-lg shadow-sm p-6">
          <h3 className="text-lg font-semibold text-slate-800 mb-4">Recent Activity</h3>
          <div className="space-y-3">
            {transactions.length === 0 ? (
              <p className="text-slate-500 text-center py-4">No transactions yet</p>
            ) : (
              transactions.map((transaction) => (
                <div key={transaction.id} className="flex items-center justify-between py-3 border-b border-slate-100 last:border-0">
                  <div className="flex-1">
                    <p className="font-medium text-slate-800">{transaction.description}</p>
                    <p className="text-xs text-slate-500 mt-1">
                      {transaction.date} • {transaction.category_name || 'Uncategorized'} • {transaction.source.toUpperCase()}
                    </p>
                  </div>
                  <p className={`font-semibold ${parseFloat(transaction.amount) >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>
                    {parseFloat(transaction.amount) >= 0 ? '+' : ''}₹{Math.abs(parseFloat(transaction.amount)).toLocaleString()}
                  </p>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Quick Add Card */}
        <div className="bg-gradient-to-br from-indigo-600 to-indigo-700 rounded-lg shadow-sm p-6 text-white">
          <h3 className="text-lg font-semibold mb-2">Quick Add Expense</h3>
          <p className="text-indigo-100 text-sm mb-6">
            Manually add a cash transaction that won't appear in your bank statement
          </p>
          <button
            onClick={() => setShowQuickAdd(true)}
            className="w-full bg-white text-indigo-600 py-3 rounded-lg font-semibold hover:bg-indigo-50 transition-colors flex items-center justify-center"
          >
            <Plus className="w-5 h-5 mr-2" />
            Add Transaction
          </button>
        </div>
      </div>

      {/* Quick Add Modal */}
      {showQuickAdd && (
        <QuickAddModal onClose={() => {
          setShowQuickAdd(false)
          fetchData() // Refresh data after adding
        }} />
      )}
    </div>
  )
}
