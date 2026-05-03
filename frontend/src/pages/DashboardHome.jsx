import { useState, useEffect } from 'react'
import { LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import { TrendingUp, TrendingDown, Plus, Award, AlertTriangle, Wallet, CreditCard, DollarSign, Sparkles } from 'lucide-react'
import QuickAddModal from '../components/QuickAddModal'
import LoadingSkeleton from '../components/LoadingSkeleton'
import StatsCard from '../components/StatsCard'
import Toast from '../components/Toast'
import { dashboardAPI, transactionAPI, analyticsAPI } from '../utils/api'

export default function DashboardHome() {
  const [showQuickAdd, setShowQuickAdd] = useState(false)
  const [timeFilter, setTimeFilter] = useState('month')
  const [stats, setStats] = useState(null)
  const [transactions, setTransactions] = useState([])
  const [analyticsData, setAnalyticsData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [toast, setToast] = useState(null)

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
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <LoadingSkeleton type="card" />
          <LoadingSkeleton type="card" />
          <LoadingSkeleton type="card" />
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <LoadingSkeleton type="chart" />
          </div>
          <LoadingSkeleton type="chart" />
        </div>
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
    <div className="space-y-6 animate-fade-in">
      {/* Toast Notification */}
      {toast && (
        <Toast 
          message={toast.message} 
          type={toast.type} 
          onClose={() => setToast(null)} 
        />
      )}

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold text-slate-800">Dashboard Overview</h2>
          <p className="text-slate-500 mt-1">Track your income, expenses, and financial trends</p>
        </div>
        <button
          onClick={() => setShowQuickAdd(true)}
          className="hidden md:flex items-center px-6 py-3 bg-indigo-600 text-white rounded-xl font-medium hover:bg-indigo-700 transition-all duration-200 shadow-soft hover:shadow-soft-lg"
        >
          <Plus className="w-5 h-5 mr-2" />
          Quick Add
        </button>
      </div>

      {/* Summary Cards with Enhanced Design */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatsCard
          title="Current Balance"
          value={totalBalance}
          subtitle="Remaining from monthly budget"
          icon={Wallet}
          color="indigo"
          animate={true}
        />
        <StatsCard
          title="Monthly Budget"
          value={stats?.starting_balance || 0}
          subtitle="Set in Settings"
          icon={DollarSign}
          color="blue"
          animate={true}
        />
        <StatsCard
          title="Total Expenses"
          value={monthlyExpenses}
          subtitle={monthlyIncome > 0 ? `Income: ₹${monthlyIncome.toLocaleString()}` : 'This month'}
          icon={CreditCard}
          color="red"
          animate={true}
        />
      </div>

      {/* Best/Worst Month Cards */}
      {analyticsData?.best_month && analyticsData?.worst_month && analyticsData.best_month.month !== analyticsData.worst_month.month && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="group bg-emerald-50 rounded-2xl shadow-soft hover:shadow-soft-lg transition-all duration-300 p-6 border border-emerald-100">
            <div className="flex items-center mb-3">
              <div className="w-12 h-12 bg-emerald-500 rounded-xl flex items-center justify-center mr-3 group-hover:scale-110 transition-transform duration-200">
                <Award className="h-6 w-6 text-white" />
              </div>
              <h3 className="text-lg font-semibold text-emerald-900">Best Month (Lowest Spending)</h3>
            </div>
            <p className="text-4xl font-bold text-emerald-700 mt-2">
              ₹{analyticsData.best_month.savings.toLocaleString()}
            </p>
            <p className="text-sm text-emerald-600 mt-2 font-medium">
              {new Date(analyticsData.best_month.month + '-01').toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
            </p>
          </div>

          <div className="group bg-red-50 rounded-2xl shadow-soft hover:shadow-soft-lg transition-all duration-300 p-6 border border-red-100">
            <div className="flex items-center mb-3">
              <div className="w-12 h-12 bg-red-500 rounded-xl flex items-center justify-center mr-3 group-hover:scale-110 transition-transform duration-200">
                <AlertTriangle className="h-6 w-6 text-white" />
              </div>
              <h3 className="text-lg font-semibold text-red-900">Worst Month (Highest Spending)</h3>
            </div>
            <p className="text-4xl font-bold text-red-700 mt-2">
              ₹{analyticsData.worst_month.savings.toLocaleString()}
            </p>
            <p className="text-sm text-red-600 mt-2 font-medium">
              {new Date(analyticsData.worst_month.month + '-01').toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
            </p>
          </div>
        </div>
      )}

      {/* Charts Row with Enhanced Design */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Spending Trends Chart */}
        <div className="lg:col-span-2 bg-white rounded-2xl shadow-soft hover:shadow-soft-lg transition-all duration-300 p-6 border border-slate-100">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-lg font-semibold text-slate-800">Spending Trends</h3>
              <p className="text-sm text-slate-500 mt-1">Track your financial patterns</p>
            </div>
            <div className="flex space-x-2">
              {['week', 'month', 'year', 'all'].map((filter) => (
                <button
                  key={filter}
                  onClick={() => setTimeFilter(filter)}
                  className={`px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200 ${
                    timeFilter === filter
                      ? 'bg-indigo-600 text-white shadow-soft'
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
                <defs>
                  <linearGradient id="colorNet" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                  </linearGradient>
                </defs>
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
                  contentStyle={{ 
                    backgroundColor: 'rgba(255, 255, 255, 0.95)', 
                    border: 'none', 
                    borderRadius: '12px', 
                    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' 
                  }}
                />
                <Line type="monotone" dataKey="net" stroke="#6366f1" strokeWidth={3} fill="url(#colorNet)" name="Net" dot={{ fill: '#6366f1', r: 4 }} />
                <Line type="monotone" dataKey="income" stroke="#10b981" strokeWidth={2} name="Income" dot={{ fill: '#10b981', r: 3 }} />
                <Line type="monotone" dataKey="expenses" stroke="#ef4444" strokeWidth={2} name="Expenses" dot={{ fill: '#ef4444', r: 3 }} />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-[300px] flex items-center justify-center text-slate-500">
              No spending data available for selected period
            </div>
          )}
        </div>

        {/* Category Breakdown */}
        <div className="bg-white rounded-2xl shadow-soft hover:shadow-soft-lg transition-all duration-300 p-6 border border-slate-100">
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-slate-800">Expenses by Category</h3>
            <p className="text-sm text-slate-500 mt-1">Current month breakdown</p>
          </div>
          {categoryData.length > 0 ? (
            <>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <defs>
                    {categoryData.map((entry, index) => (
                      <linearGradient key={`gradient-${index}`} id={`gradient-${index}`} x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor={entry.color} stopOpacity={1}/>
                        <stop offset="100%" stopColor={entry.color} stopOpacity={0.7}/>
                      </linearGradient>
                    ))}
                  </defs>
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
                      <Cell key={`cell-${index}`} fill={`url(#gradient-${index})`} />
                    ))}
                  </Pie>
                  <Tooltip 
                    formatter={(value) => `₹${value.toLocaleString()}`}
                    contentStyle={{ 
                      backgroundColor: 'rgba(255, 255, 255, 0.95)', 
                      border: 'none', 
                      borderRadius: '12px', 
                      boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' 
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
              <div className="mt-6 space-y-3">
                {categoryData.map((cat) => (
                  <div key={cat.name} className="flex items-center justify-between text-sm group hover:bg-slate-50 p-2 rounded-lg transition-colors">
                    <div className="flex items-center">
                      <div className="w-3 h-3 rounded-full mr-3 group-hover:scale-125 transition-transform" style={{ backgroundColor: cat.color }}></div>
                      <span className="text-slate-600 font-medium">{cat.name}</span>
                    </div>
                    <span className="font-semibold text-slate-800">₹{cat.value.toLocaleString()}</span>
                  </div>
                ))}
                <div className="pt-3 mt-3 border-t border-slate-200">
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
        <div className="lg:col-span-3 bg-white rounded-2xl shadow-soft hover:shadow-soft-lg transition-all duration-300 p-6 border border-slate-100">
          <h3 className="text-lg font-semibold text-slate-800 mb-4">Recent Activity</h3>
          <div className="space-y-2">
            {transactions.length === 0 ? (
              <div className="text-center py-12">
                <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-3">
                  <TrendingUp className="w-8 h-8 text-slate-400" />
                </div>
                <p className="text-slate-500 font-medium">No transactions yet</p>
                <p className="text-sm text-slate-400 mt-1">Start by adding your first expense</p>
              </div>
            ) : (
              transactions.map((transaction) => (
                <div key={transaction.id} className="group flex items-center justify-between py-3 px-4 hover:bg-slate-50 rounded-xl transition-all duration-200">
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-slate-800 truncate group-hover:text-slate-900">{transaction.description}</p>
                    <p className="text-xs text-slate-500 mt-1">
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
        <div className="bg-gradient-to-br from-indigo-600 to-indigo-700 rounded-2xl shadow-soft hover:shadow-soft-lg transition-all duration-300 p-6 text-white flex flex-col">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-lg">Quick Add</h3>
            <div className="bg-white bg-opacity-20 rounded-xl p-2 backdrop-blur-sm">
              <Plus className="w-5 h-5" />
            </div>
          </div>
          <p className="text-indigo-100 text-sm mb-6 flex-grow">
            Add cash expenses instantly without leaving the dashboard
          </p>
          <button
            onClick={() => setShowQuickAdd(true)}
            className="w-full bg-white text-indigo-600 py-3 rounded-xl font-medium hover:bg-opacity-90 transition-all duration-200 flex items-center justify-center shadow-sm hover:shadow-md"
          >
            <Plus className="w-5 h-5 mr-2" />
            Add Expense
          </button>
          <div className="mt-4 pt-4 border-t border-white border-opacity-20">
            <div className="flex items-center justify-between text-sm">
              <span className="text-indigo-100">This month</span>
              <span className="font-semibold">{transactions.length} transactions</span>
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
