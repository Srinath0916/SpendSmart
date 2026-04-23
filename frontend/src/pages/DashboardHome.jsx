import { useState, useEffect } from 'react'
import { LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import { TrendingUp, TrendingDown, Plus, Award, AlertTriangle } from 'lucide-react'
import QuickAddModal from '../components/QuickAddModal'
import { dashboardAPI, transactionAPI, analyticsAPI } from '../utils/api'

export default function DashboardHome() {
  const [showQuickAdd, setShowQuickAdd] = useState(false)
  const [timeFilter, setTimeFilter] = useState('month')
  const [stats, setStats] = useState(null)
  const [transactions, setTransactions] = useState([])
  const [analyticsData, setAnalyticsData] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchData()
  }, [])

  useEffect(() => {
    fetchAnalytics()
  }, [timeFilter])

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

  const fetchAnalytics = async () => {
    try {
      const data = await analyticsAPI.getData(timeFilter)
      setAnalyticsData(data)
    } catch (error) {
      console.error('Error fetching analytics:', error)
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

  // Calculate category breakdown from transactions
  const categoryTotals = {}
  let uncategorizedTotal = 0
  
  transactions.forEach(t => {
    const amount = Math.abs(parseFloat(t.amount))
    if (parseFloat(t.amount) < 0) { // Only expenses
      if (t.category_name) {
        const catName = t.category_name
        categoryTotals[catName] = (categoryTotals[catName] || 0) + amount
      } else {
        uncategorizedTotal += amount
      }
    }
  })

  // Add uncategorized to the totals
  if (uncategorizedTotal > 0) {
    categoryTotals['Uncategorized'] = uncategorizedTotal
  }

  const categoryData = []
  const colors = ['#f59e0b', '#3b82f6', '#8b5cf6', '#10b981', '#ef4444', '#6366f1', '#94a3b8']
  Object.entries(categoryTotals).forEach(([name, value], index) => {
    categoryData.push({
      name,
      value: Math.round(value),
      color: name === 'Uncategorized' ? '#94a3b8' : colors[index % colors.length]
    })
  })

  // Verify pie chart total matches expenses
  const pieChartTotal = categoryData.reduce((sum, cat) => sum + cat.value, 0)

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-semibold text-slate-800">Dashboard Overview</h2>
        <p className="text-slate-500 mt-1">Track your income, expenses, and financial trends</p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-lg shadow-sm p-6">
          <p className="text-sm font-medium text-slate-500">Current Balance</p>
          <p className="text-3xl font-bold text-slate-800 mt-2">₹{totalBalance.toLocaleString()}</p>
          <p className="text-xs text-slate-400 mt-1">Remaining from monthly budget</p>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-6">
          <p className="text-sm font-medium text-slate-500">Monthly Budget</p>
          <div className="flex items-baseline mt-2">
            <p className="text-3xl font-bold text-indigo-600">₹{stats?.starting_balance?.toLocaleString() || 0}</p>
          </div>
          <p className="text-xs text-slate-400 mt-1">Set in Settings</p>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-6">
          <p className="text-sm font-medium text-slate-500">Total Expenses</p>
          <div className="flex items-baseline mt-2">
            <p className="text-3xl font-bold text-red-600">₹{monthlyExpenses.toLocaleString()}</p>
            <TrendingDown className="ml-2 h-5 w-5 text-red-600" />
          </div>
          <p className="text-xs text-slate-400 mt-1">
            {monthlyIncome > 0 ? `Income: ₹${monthlyIncome.toLocaleString()} (tracked separately)` : 'This month'}
          </p>
        </div>
      </div>

      {/* Best/Worst Month Cards */}
      {analyticsData?.best_month && analyticsData?.worst_month && analyticsData.best_month.month !== analyticsData.worst_month.month && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-gradient-to-br from-emerald-50 to-emerald-100 rounded-lg shadow-sm p-6 border border-emerald-200">
            <div className="flex items-center mb-2">
              <Award className="h-5 w-5 text-emerald-600 mr-2" />
              <h3 className="text-lg font-semibold text-emerald-800">Best Savings Month</h3>
            </div>
            <p className="text-3xl font-bold text-emerald-700 mt-2">
              ₹{analyticsData.best_month.savings.toLocaleString()}
            </p>
            <p className="text-sm text-emerald-600 mt-1">
              {new Date(analyticsData.best_month.month + '-01').toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
            </p>
          </div>

          <div className="bg-gradient-to-br from-red-50 to-red-100 rounded-lg shadow-sm p-6 border border-red-200">
            <div className="flex items-center mb-2">
              <AlertTriangle className="h-5 w-5 text-red-600 mr-2" />
              <h3 className="text-lg font-semibold text-red-800">Highest Spending Month</h3>
            </div>
            <p className="text-3xl font-bold text-red-700 mt-2">
              ₹{Math.abs(analyticsData.worst_month.savings).toLocaleString()}
            </p>
            <p className="text-sm text-red-600 mt-1">
              {new Date(analyticsData.worst_month.month + '-01').toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
            </p>
          </div>
        </div>
      )}

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Spending Trends Chart */}
        <div className="lg:col-span-2 bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-slate-800">Spending Trends</h3>
            <div className="flex space-x-2">
              {['week', 'month', 'year', 'all'].map((filter) => (
                <button
                  key={filter}
                  onClick={() => setTimeFilter(filter)}
                  className={`px-3 py-1 rounded-lg text-sm font-medium transition-colors ${
                    timeFilter === filter
                      ? 'bg-indigo-600 text-white'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  {filter === 'week' ? '1W' : filter === 'month' ? '1M' : filter === 'year' ? '1Y' : 'All'}
                </button>
              ))}
            </div>
          </div>
          {analyticsData?.chart_data && analyticsData.chart_data.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={analyticsData.chart_data}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis 
                  dataKey="date" 
                  stroke="#64748b"
                  tick={{ fontSize: 12 }}
                  tickFormatter={(value) => new Date(value).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                />
                <YAxis stroke="#64748b" tick={{ fontSize: 12 }} />
                <Tooltip 
                  formatter={(value) => `₹${value.toLocaleString()}`}
                  labelFormatter={(label) => new Date(label).toLocaleDateString()}
                />
                <Line type="monotone" dataKey="net" stroke="#6366f1" strokeWidth={2} name="Net" />
                <Line type="monotone" dataKey="income" stroke="#10b981" strokeWidth={2} name="Income" />
                <Line type="monotone" dataKey="expenses" stroke="#ef4444" strokeWidth={2} name="Expenses" />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-[300px] flex items-center justify-center text-slate-500">
              No spending data available for selected period
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
                  <Tooltip formatter={(value) => `₹${value}`} />
                </PieChart>
              </ResponsiveContainer>
              <div className="mt-4 space-y-2">
                {categoryData.map((cat) => (
                  <div key={cat.name} className="flex items-center justify-between text-sm">
                    <div className="flex items-center">
                      <div className="w-3 h-3 rounded-full mr-2" style={{ backgroundColor: cat.color }}></div>
                      <span className="text-slate-600">{cat.name}</span>
                    </div>
                    <span className="font-semibold text-slate-800">₹{cat.value.toLocaleString()}</span>
                  </div>
                ))}
                <div className="pt-2 mt-2 border-t border-slate-200">
                  <div className="flex items-center justify-between text-sm font-semibold">
                    <span className="text-slate-700">Total</span>
                    <span className="text-slate-800">₹{pieChartTotal.toLocaleString()}</span>
                  </div>
                </div>
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
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Recent Transactions */}
        <div className="lg:col-span-3 bg-white rounded-lg shadow-sm p-6">
          <h3 className="text-lg font-semibold text-slate-800 mb-4">Recent Activity</h3>
          <div className="space-y-2">
            {transactions.length === 0 ? (
              <p className="text-slate-500 text-center py-8">No transactions yet</p>
            ) : (
              transactions.map((transaction) => (
                <div key={transaction.id} className="flex items-center justify-between py-2.5 px-3 hover:bg-slate-50 rounded-lg transition-colors">
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-slate-800 truncate">{transaction.description}</p>
                    <p className="text-xs text-slate-500 mt-0.5">
                      {transaction.date} • {transaction.category_name || 'Uncategorized'}
                    </p>
                  </div>
                  <p className={`font-semibold ml-4 ${parseFloat(transaction.amount) >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>
                    {parseFloat(transaction.amount) >= 0 ? '+' : ''}₹{Math.abs(parseFloat(transaction.amount)).toLocaleString()}
                  </p>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Quick Add Card */}
        <div className="bg-gradient-to-br from-indigo-600 to-indigo-700 rounded-lg shadow-sm p-5 text-white flex flex-col">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-semibold">Quick Add</h3>
            <div className="bg-white bg-opacity-20 rounded-full p-1.5">
              <Plus className="w-4 h-4" />
            </div>
          </div>
          <p className="text-indigo-100 text-xs mb-4 flex-grow">
            Add cash expenses instantly
          </p>
          <button
            onClick={() => setShowQuickAdd(true)}
            className="w-full bg-white text-indigo-600 py-2 rounded-lg font-medium hover:bg-indigo-50 transition-colors flex items-center justify-center text-sm"
          >
            <Plus className="w-4 h-4 mr-1.5" />
            Add Expense
          </button>
          <div className="mt-3 pt-3 border-t border-indigo-500 border-opacity-30">
            <div className="flex items-center justify-between text-xs">
              <span className="text-indigo-200">This month</span>
              <span className="font-semibold">{transactions.length} expenses</span>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Add Modal */}
      {showQuickAdd && (
        <QuickAddModal onClose={() => {
          setShowQuickAdd(false)
          fetchData()
          fetchAnalytics()
        }} />
      )}
    </div>
  )
}
