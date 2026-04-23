import { useState, useEffect } from 'react'
import { Plus, TrendingUp, Edit2, Trash2 } from 'lucide-react'
import { budgetAPI, categoryAPI, transactionAPI } from '../utils/api'

export default function Budgets() {
  const [budgets, setBudgets] = useState([])
  const [categories, setCategories] = useState([])
  const [transactions, setTransactions] = useState([])
  const [loading, setLoading] = useState(true)
  const [showAddBudget, setShowAddBudget] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      setLoading(true)
      const [budgetData, catData, transData] = await Promise.all([
        budgetAPI.getAll(),
        categoryAPI.getAll(),
        transactionAPI.getAll()
      ])
      setBudgets(budgetData.results || [])
      setCategories(catData.results || [])
      setTransactions(transData.results || [])
    } catch (err) {
      console.error('Error fetching data:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleAddBudget = async (e) => {
    e.preventDefault()
    setError('')
    
    const formData = new FormData(e.target)
    const categoryId = formData.get('category')
    const limitAmount = formData.get('limit')
    
    try {
      await budgetAPI.create({
        category: parseInt(categoryId),
        limit_amount: limitAmount,
        month: new Date().toISOString().slice(0, 7) + '-01' // First day of current month
      })
      setShowAddBudget(false)
      fetchData()
    } catch (err) {
      setError(err.message || 'Failed to create budget')
    }
  }

  const calculateSpent = (categoryId) => {
    const currentMonth = new Date().toISOString().slice(0, 7)
    return transactions
      .filter(t => 
        t.category === categoryId && 
        t.date.startsWith(currentMonth) &&
        parseFloat(t.amount) < 0
      )
      .reduce((sum, t) => sum + Math.abs(parseFloat(t.amount)), 0)
  }

  const getProgressColor = (percentage) => {
    if (percentage >= 90) return 'bg-red-500'
    if (percentage >= 70) return 'bg-yellow-500'
    return 'bg-emerald-500'
  }

  const getProgressTextColor = (percentage) => {
    if (percentage >= 90) return 'text-red-600'
    if (percentage >= 70) return 'text-yellow-600'
    return 'text-emerald-600'
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-slate-600">Loading budgets...</div>
      </div>
    )
  }

  const currentMonth = new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' })

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-semibold text-slate-800">Budget Management</h2>
          <p className="text-slate-500 mt-1">Track your spending limits for {currentMonth}</p>
        </div>
        <button
          onClick={() => setShowAddBudget(true)}
          className="flex items-center px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors text-sm font-medium"
        >
          <Plus className="h-4 w-4 mr-2" />
          Add Budget
        </button>
      </div>

      {/* Budget Cards */}
      {budgets.length === 0 ? (
        <div className="bg-white rounded-lg shadow-sm p-12 text-center">
          <p className="text-slate-500 mb-4">No budgets set yet</p>
          <button
            onClick={() => setShowAddBudget(true)}
            className="inline-flex items-center px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors text-sm font-medium"
          >
            <Plus className="h-4 w-4 mr-2" />
            Create Your First Budget
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {budgets.map((budget) => {
            const spent = calculateSpent(budget.category)
            const limit = parseFloat(budget.limit_amount)
            const percentage = (spent / limit) * 100
            const remaining = limit - spent
            const category = categories.find(c => c.id === budget.category)

            return (
              <div key={budget.id} className="bg-white rounded-lg shadow-sm p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-slate-800">
                    {category?.name || 'Unknown'}
                  </h3>
                  <span className={`text-sm font-medium ${getProgressTextColor(percentage)}`}>
                    {percentage.toFixed(0)}% used
                  </span>
                </div>

                {/* Progress Bar */}
                <div className="mb-4">
                  <div className="w-full bg-gray-200 rounded-full h-3">
                    <div
                      className={`h-3 rounded-full transition-all ${getProgressColor(percentage)}`}
                      style={{ width: `${Math.min(percentage, 100)}%` }}
                    />
                  </div>
                </div>

                {/* Stats */}
                <div className="flex items-center justify-between text-sm">
                  <div>
                    <p className="text-slate-500">Spent</p>
                    <p className="text-lg font-bold text-slate-800">₹{spent.toLocaleString()}</p>
                  </div>
                  <div className="text-center">
                    <p className="text-slate-500">Remaining</p>
                    <p className={`text-lg font-bold ${remaining >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>
                      ₹{Math.abs(remaining).toLocaleString()}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-slate-500">Limit</p>
                    <p className="text-lg font-bold text-slate-800">₹{limit.toLocaleString()}</p>
                  </div>
                </div>

                {/* Alert */}
                {percentage >= 90 && (
                  <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                    <p className="text-sm text-red-700 font-medium">⚠️ Budget limit exceeded!</p>
                  </div>
                )}
                {percentage >= 70 && percentage < 90 && (
                  <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                    <p className="text-sm text-yellow-700 font-medium">⚡ Approaching budget limit</p>
                  </div>
                )}
              </div>
            )
          })}
        </div>
      )}

      {/* Overall Summary */}
      {budgets.length > 0 && (
        <>
          {/* Uncategorized Spending Card */}
          <div className="bg-slate-50 rounded-lg border border-slate-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-lg font-semibold text-slate-700">Uncategorized Spending</h3>
                <p className="text-sm text-slate-500 mt-1">Expenses without assigned categories</p>
              </div>
              <div className="text-right">
                <p className="text-sm text-slate-500">Amount</p>
                <p className="text-2xl font-bold text-slate-700">
                  ₹{transactions
                    .filter(t => !t.category && parseFloat(t.amount) < 0 && t.date.startsWith(new Date().toISOString().slice(0, 7)))
                    .reduce((sum, t) => sum + Math.abs(parseFloat(t.amount)), 0)
                    .toLocaleString()}
                </p>
              </div>
            </div>
          </div>

          {/* Overall Budget Health */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h3 className="text-lg font-semibold text-slate-800 mb-4">Overall Budget Health</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center">
                <p className="text-sm text-slate-500 mb-2">Total Budget</p>
                <p className="text-2xl font-bold text-slate-800">
                  ₹{budgets.reduce((sum, b) => sum + parseFloat(b.limit_amount), 0).toLocaleString()}
                </p>
              </div>
              <div className="text-center">
                <p className="text-sm text-slate-500 mb-2">Budgeted Spending</p>
                <p className="text-2xl font-bold text-red-600">
                  ₹{budgets.reduce((sum, b) => sum + calculateSpent(b.category), 0).toLocaleString()}
                </p>
              </div>
              <div className="text-center">
                <p className="text-sm text-slate-500 mb-2">Budget Remaining</p>
                <p className="text-2xl font-bold text-emerald-600">
                  ₹{budgets.reduce((sum, b) => sum + (parseFloat(b.limit_amount) - calculateSpent(b.category)), 0).toLocaleString()}
                </p>
              </div>
            </div>
            
            {/* Total App Expenses Summary */}
            <div className="mt-6 pt-6 border-t border-slate-200">
              <div className="bg-indigo-50 rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-indigo-900">Total App Expenses (This Month)</p>
                    <p className="text-xs text-indigo-600 mt-1">
                      Budgeted (₹{budgets.reduce((sum, b) => sum + calculateSpent(b.category), 0).toLocaleString()}) + 
                      Uncategorized (₹{transactions
                        .filter(t => !t.category && parseFloat(t.amount) < 0 && t.date.startsWith(new Date().toISOString().slice(0, 7)))
                        .reduce((sum, t) => sum + Math.abs(parseFloat(t.amount)), 0)
                        .toLocaleString()})
                    </p>
                  </div>
                  <p className="text-3xl font-bold text-indigo-900">
                    ₹{(
                      budgets.reduce((sum, b) => sum + calculateSpent(b.category), 0) +
                      transactions
                        .filter(t => !t.category && parseFloat(t.amount) < 0 && t.date.startsWith(new Date().toISOString().slice(0, 7)))
                        .reduce((sum, t) => sum + Math.abs(parseFloat(t.amount)), 0)
                    ).toLocaleString()}
                  </p>
                </div>
                <p className="text-xs text-indigo-700 mt-2">
                  ✓ This matches your Dashboard "Total Expenses" exactly
                </p>
              </div>
            </div>
          </div>
        </>
      )}

      {/* Add Budget Modal */}
      {showAddBudget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="fixed inset-0 bg-gray-600 bg-opacity-50" onClick={() => setShowAddBudget(false)} />
          <div className="relative bg-white rounded-lg shadow-lg w-full max-w-md mx-4 p-6">
            <h3 className="text-xl font-semibold text-slate-800 mb-4">Add New Budget</h3>
            
            {error && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
                {error}
              </div>
            )}

            <form onSubmit={handleAddBudget} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Category</label>
                <select 
                  name="category"
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                  required
                >
                  <option value="">Select category</option>
                  {categories.filter(c => c.type === 'expense').map(cat => (
                    <option key={cat.id} value={cat.id}>{cat.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Budget Limit (₹)</label>
                <input
                  type="number"
                  name="limit"
                  placeholder="5000"
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                  required
                  min="1"
                  step="0.01"
                />
              </div>
              <div className="flex space-x-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowAddBudget(false)}
                  className="flex-1 px-4 py-2 border border-slate-300 text-slate-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors font-medium"
                >
                  Create Budget
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
