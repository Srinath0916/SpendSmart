import { useState } from 'react'
import { Plus, TrendingUp } from 'lucide-react'

// Mock budgets data
const mockBudgets = [
  { id: 1, category: 'Food', limit: 5000, spent: 3590, month: 'February 2024' },
  { id: 2, category: 'Travel', limit: 3000, spent: 1680, month: 'February 2024' },
  { id: 3, category: 'Entertainment', limit: 2000, spent: 199, month: 'February 2024' },
  { id: 4, category: 'Shopping', limit: 4000, spent: 350, month: 'February 2024' },
]

export default function Budgets() {
  const [budgets] = useState(mockBudgets)
  const [showAddBudget, setShowAddBudget] = useState(false)

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

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-semibold text-slate-800">Budget Management</h2>
          <p className="text-slate-500 mt-1">Track your spending limits for February 2024</p>
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
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {budgets.map((budget) => {
          const percentage = (budget.spent / budget.limit) * 100
          const remaining = budget.limit - budget.spent

          return (
            <div key={budget.id} className="bg-white rounded-lg shadow-sm p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-slate-800">{budget.category}</h3>
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
                  <p className="text-lg font-bold text-slate-800">₹{budget.spent.toLocaleString()}</p>
                </div>
                <div className="text-center">
                  <p className="text-slate-500">Remaining</p>
                  <p className={`text-lg font-bold ${remaining >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>
                    ₹{Math.abs(remaining).toLocaleString()}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-slate-500">Limit</p>
                  <p className="text-lg font-bold text-slate-800">₹{budget.limit.toLocaleString()}</p>
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

      {/* Overall Summary */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <h3 className="text-lg font-semibold text-slate-800 mb-4">Overall Budget Health</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="text-center">
            <p className="text-sm text-slate-500 mb-2">Total Budget</p>
            <p className="text-2xl font-bold text-slate-800">
              ₹{budgets.reduce((sum, b) => sum + b.limit, 0).toLocaleString()}
            </p>
          </div>
          <div className="text-center">
            <p className="text-sm text-slate-500 mb-2">Total Spent</p>
            <p className="text-2xl font-bold text-red-600">
              ₹{budgets.reduce((sum, b) => sum + b.spent, 0).toLocaleString()}
            </p>
          </div>
          <div className="text-center">
            <p className="text-sm text-slate-500 mb-2">Total Remaining</p>
            <p className="text-2xl font-bold text-emerald-600">
              ₹{budgets.reduce((sum, b) => sum + (b.limit - b.spent), 0).toLocaleString()}
            </p>
          </div>
        </div>
      </div>

      {/* Add Budget Modal */}
      {showAddBudget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="fixed inset-0 bg-gray-600 bg-opacity-50" onClick={() => setShowAddBudget(false)} />
          <div className="relative bg-white rounded-lg shadow-lg w-full max-w-md mx-4 p-6">
            <h3 className="text-xl font-semibold text-slate-800 mb-4">Add New Budget</h3>
            <form className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Category</label>
                <select className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none">
                  <option>Food</option>
                  <option>Travel</option>
                  <option>Entertainment</option>
                  <option>Shopping</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Budget Limit (₹)</label>
                <input
                  type="number"
                  placeholder="5000"
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
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
