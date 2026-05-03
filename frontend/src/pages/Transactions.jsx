import { useState, useEffect } from 'react'
import { Download, Plus, Trash2, AlertCircle } from 'lucide-react'
import { transactionAPI, categoryAPI } from '../utils/api'
import QuickAddModal from '../components/QuickAddModal'

export default function Transactions() {
  const [transactions, setTransactions] = useState([])
  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(true)
  const [filterCategory, setFilterCategory] = useState('all')
  const [filterSource, setFilterSource] = useState('all')
  const [showQuickAdd, setShowQuickAdd] = useState(false)
  const [selectedIds, setSelectedIds] = useState([])
  const [bulkDeleteMode, setBulkDeleteMode] = useState(false)

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      setLoading(true)
      const [transData, catData] = await Promise.all([
        transactionAPI.getAll(),
        categoryAPI.getAll()
      ])
      setTransactions(transData.results || [])
      setCategories(catData.results || [])
    } catch (error) {
      console.error('Error fetching data:', error)
    } finally {
      setLoading(false)
    }
  }

  // Get current month for filtering
  const currentMonth = new Date().toISOString().slice(0, 7) // "2026-04"
  
  // Filter transactions by current month AND user filters
  const currentMonthTransactions = transactions.filter(t => t.date.startsWith(currentMonth))
  
  const filteredTransactions = currentMonthTransactions.filter(t => {
    if (filterCategory !== 'all' && t.category !== parseInt(filterCategory)) return false
    if (filterSource !== 'all' && t.source !== filterSource) return false
    return true
  })

  // Calculate totals from CURRENT MONTH only
  const totalIncome = currentMonthTransactions.filter(t => parseFloat(t.amount) > 0).reduce((sum, t) => sum + parseFloat(t.amount), 0)
  const totalExpense = currentMonthTransactions.filter(t => parseFloat(t.amount) < 0).reduce((sum, t) => sum + Math.abs(parseFloat(t.amount)), 0)

  const handleExport = () => {
    // Create CSV content
    const csvContent = [
      ['Date', 'Description', 'Category', 'Source', 'Amount', 'Status'],
      ...filteredTransactions.map(t => [
        t.date,
        t.description,
        t.category_name || 'Uncategorized',
        t.source,
        t.amount,
        t.status
      ])
    ].map(row => row.join(',')).join('\n')

    // Create download
    const blob = new Blob([csvContent], { type: 'text/csv' })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `transactions_${new Date().toISOString().slice(0, 10)}.csv`
    a.click()
    window.URL.revokeObjectURL(url)
  }

  const handleDelete = async (id, description) => {
    if (confirm(`Are you sure you want to delete "${description}"?`)) {
      try {
        await transactionAPI.delete(id)
        alert('Transaction deleted successfully!')
        fetchData() // Refresh the list
      } catch (error) {
        console.error('Error deleting transaction:', error)
        alert('Failed to delete transaction')
      }
    }
  }

  const handleBulkDelete = async () => {
    if (selectedIds.length === 0) {
      alert('Please select transactions to delete')
      return
    }

    if (confirm(`Are you sure you want to delete ${selectedIds.length} transactions? This cannot be undone.`)) {
      try {
        setLoading(true)
        await Promise.all(selectedIds.map(id => transactionAPI.delete(id)))
        alert(`Successfully deleted ${selectedIds.length} transactions!`)
        setSelectedIds([])
        setBulkDeleteMode(false)
        fetchData()
      } catch (error) {
        console.error('Error bulk deleting:', error)
        alert('Failed to delete some transactions')
      } finally {
        setLoading(false)
      }
    }
  }

  const toggleSelectAll = () => {
    if (selectedIds.length === filteredTransactions.length) {
      setSelectedIds([])
    } else {
      setSelectedIds(filteredTransactions.map(t => t.id))
    }
  }

  const toggleSelect = (id) => {
    if (selectedIds.includes(id)) {
      setSelectedIds(selectedIds.filter(i => i !== id))
    } else {
      setSelectedIds([...selectedIds, id])
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-slate-600">Loading transactions...</div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header with Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-2xl shadow-soft hover:shadow-soft-lg transition-all duration-300 p-6 border border-slate-100">
          <p className="text-sm font-medium text-slate-500">Total Transactions (This Month)</p>
          <p className="text-3xl font-bold text-slate-800 mt-2">{currentMonthTransactions.length}</p>
        </div>
        <div className="bg-white rounded-2xl shadow-soft hover:shadow-soft-lg transition-all duration-300 p-6 border border-slate-100">
          <p className="text-sm font-medium text-slate-500">Total Income (This Month)</p>
          <p className="text-3xl font-bold text-emerald-600 mt-2">₹{totalIncome.toLocaleString()}</p>
        </div>
        <div className="bg-white rounded-2xl shadow-soft hover:shadow-soft-lg transition-all duration-300 p-6 border border-slate-100">
          <p className="text-sm font-medium text-slate-500">Total Expenses (This Month)</p>
          <p className="text-3xl font-bold text-red-600 mt-2">₹{totalExpense.toLocaleString()}</p>
        </div>
      </div>

      {/* Filters and Actions */}
      <div className="bg-white rounded-2xl shadow-soft hover:shadow-soft-lg transition-all duration-300 p-6 border border-slate-100">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="flex flex-col sm:flex-row gap-3">
            <select
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
              className="px-4 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all duration-200 bg-white hover:border-slate-300"
            >
              <option value="all">All Categories</option>
              {categories.map(cat => (
                <option key={cat.id} value={cat.id}>{cat.name}</option>
              ))}
            </select>

            <select
              value={filterSource}
              onChange={(e) => setFilterSource(e.target.value)}
              className="px-4 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all duration-200 bg-white hover:border-slate-300"
            >
              <option value="all">All Sources</option>
              <option value="cash">Cash</option>
              <option value="bank">Bank</option>
              <option value="upi">UPI</option>
            </select>
          </div>

          <div className="flex gap-3">
            {bulkDeleteMode ? (
              <>
                <button 
                  onClick={() => {
                    setBulkDeleteMode(false)
                    setSelectedIds([])
                  }}
                  className="flex items-center gap-2 px-4 py-2 border border-slate-200 rounded-xl hover:bg-slate-50 transition-all duration-200"
                >
                  Cancel
                </button>
                <button 
                  onClick={handleBulkDelete}
                  disabled={selectedIds.length === 0}
                  className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-xl hover:bg-red-700 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed shadow-soft hover:shadow-soft-lg"
                >
                  <Trash2 className="w-4 h-4" />
                  Delete Selected ({selectedIds.length})
                </button>
              </>
            ) : (
              <>
                <button 
                  onClick={() => setBulkDeleteMode(true)}
                  className="flex items-center gap-2 px-4 py-2 border border-red-200 text-red-600 rounded-xl hover:bg-red-50 transition-all duration-200"
                >
                  <Trash2 className="w-4 h-4" />
                  <span className="hidden sm:inline">Bulk Delete</span>
                </button>
                <button 
                  onClick={handleExport}
                  className="flex items-center gap-2 px-4 py-2 border border-slate-200 rounded-xl hover:bg-slate-50 transition-all duration-200"
                >
                  <Download className="w-4 h-4" />
                  <span className="hidden sm:inline">Export CSV</span>
                </button>
                <button 
                  onClick={() => setShowQuickAdd(true)}
                  className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition-all duration-200 shadow-soft hover:shadow-soft-lg"
                >
                  <Plus className="w-4 h-4" />
                  <span className="hidden sm:inline">Add Transaction</span>
                </button>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Transactions Table */}
      <div className="bg-white rounded-2xl shadow-soft hover:shadow-soft-lg transition-all duration-300 overflow-hidden border border-slate-100">
        {bulkDeleteMode && (
          <div className="bg-amber-50 border-b border-amber-200 px-6 py-4 flex items-center justify-between">
            <div className="flex items-center gap-2 text-amber-800">
              <AlertCircle className="w-5 h-5" />
              <span className="font-medium">Bulk Delete Mode: Select transactions to delete</span>
            </div>
            <button
              onClick={toggleSelectAll}
              className="text-sm text-indigo-600 hover:text-indigo-900 font-medium transition-colors duration-200"
            >
              {selectedIds.length === filteredTransactions.length ? 'Deselect All' : 'Select All'}
            </button>
          </div>
        )}
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr>
                {bulkDeleteMode && (
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                    <input
                      type="checkbox"
                      checked={selectedIds.length === filteredTransactions.length && filteredTransactions.length > 0}
                      onChange={toggleSelectAll}
                      className="w-4 h-4 text-indigo-600 border-slate-300 rounded focus:ring-indigo-500"
                    />
                  </th>
                )}
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Date</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Description</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Category</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Source</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Amount</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Status</th>
                {!bulkDeleteMode && (
                  <th className="px-6 py-3 text-right text-xs font-medium text-slate-500 uppercase tracking-wider">Actions</th>
                )}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {filteredTransactions.length === 0 ? (
                <tr>
                  <td colSpan={bulkDeleteMode ? "7" : "7"} className="px-6 py-8 text-center text-slate-500">
                    No transactions found
                  </td>
                </tr>
              ) : (
                filteredTransactions.map((transaction) => (
                  <tr key={transaction.id} className="hover:bg-slate-50 transition-colors">
                    {bulkDeleteMode && (
                      <td className="px-6 py-4 whitespace-nowrap">
                        <input
                          type="checkbox"
                          checked={selectedIds.includes(transaction.id)}
                          onChange={() => toggleSelect(transaction.id)}
                          className="w-4 h-4 text-indigo-600 border-slate-300 rounded focus:ring-indigo-500"
                        />
                      </td>
                    )}
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600">
                      {transaction.date}
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-800 font-medium">
                      {transaction.description}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600">
                      {transaction.category_name || 'Uncategorized'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <span className="px-2 py-1 text-xs font-medium rounded-full bg-slate-100 text-slate-700 capitalize">
                        {transaction.source}
                      </span>
                    </td>
                    <td className={`px-6 py-4 whitespace-nowrap text-sm font-semibold ${
                      parseFloat(transaction.amount) >= 0 ? 'text-emerald-600' : 'text-red-600'
                    }`}>
                      {parseFloat(transaction.amount) >= 0 ? '+' : ''}₹{Math.abs(parseFloat(transaction.amount)).toLocaleString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <span className={`px-2 py-1 text-xs font-medium rounded-full capitalize ${
                        transaction.status === 'verified' 
                          ? 'bg-emerald-100 text-emerald-700' 
                          : 'bg-yellow-100 text-yellow-700'
                      }`}>
                        {transaction.status}
                      </span>
                    </td>
                    {!bulkDeleteMode && (
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => handleDelete(transaction.id, transaction.description)}
                            className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                            title="Delete transaction"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    )}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Quick Add Modal */}
      {showQuickAdd && (
        <QuickAddModal onClose={() => {
          setShowQuickAdd(false)
          fetchData() // Refresh the list after adding
        }} />
      )}
    </div>
  )
}
