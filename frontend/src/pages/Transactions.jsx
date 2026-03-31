import { useState } from 'react'
import { Filter, Download, Plus } from 'lucide-react'

// Mock data - in real app, this comes from API
const mockTransactions = [
  { id: 1, date: '2024-02-20', description: 'Zomato Order', category: 'Food', amount: -450, source: 'UPI', status: 'Verified' },
  { id: 2, date: '2024-02-19', description: 'Uber Ride', category: 'Travel', amount: -180, source: 'Bank', status: 'Verified' },
  { id: 3, date: '2024-02-19', description: 'Grocery Shopping', category: 'Food', amount: -820, source: 'Cash', status: 'Verified' },
  { id: 4, date: '2024-02-18', description: 'Salary Credit', category: 'Income', amount: 30000, source: 'Bank', status: 'Verified' },
  { id: 5, date: '2024-02-17', description: 'Coffee', category: 'Food', amount: -120, source: 'Cash', status: 'Verified' },
  { id: 6, date: '2024-02-16', description: 'Netflix Subscription', category: 'Entertainment', amount: -199, source: 'Bank', status: 'Verified' },
  { id: 7, date: '2024-02-15', description: 'Petrol', category: 'Travel', amount: -500, source: 'UPI', status: 'Verified' },
  { id: 8, date: '2024-02-14', description: 'Restaurant', category: 'Food', amount: -1200, source: 'Bank', status: 'Verified' },
  { id: 9, date: '2024-02-13', description: 'Freelance Payment', category: 'Income', amount: 5000, source: 'Bank', status: 'Verified' },
  { id: 10, date: '2024-02-12', description: 'Book Purchase', category: 'Shopping', amount: -350, source: 'Cash', status: 'Verified' },
]

export default function Transactions() {
  const [transactions] = useState(mockTransactions)
  const [filterCategory, setFilterCategory] = useState('all')
  const [filterSource, setFilterSource] = useState('all')

  const filteredTransactions = transactions.filter(t => {
    if (filterCategory !== 'all' && t.category !== filterCategory) return false
    if (filterSource !== 'all' && t.source !== filterSource) return false
    return true
  })

  const totalIncome = transactions.filter(t => t.amount > 0).reduce((sum, t) => sum + t.amount, 0)
  const totalExpense = transactions.filter(t => t.amount < 0).reduce((sum, t) => sum + Math.abs(t.amount), 0)

  return (
    <div className="space-y-6">
      {/* Header with Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-lg shadow-sm p-6">
          <p className="text-sm font-medium text-slate-500">Total Transactions</p>
          <p className="text-3xl font-bold text-slate-800 mt-2">{transactions.length}</p>
        </div>
        <div className="bg-white rounded-lg shadow-sm p-6">
          <p className="text-sm font-medium text-slate-500">Total Income</p>
          <p className="text-3xl font-bold text-emerald-600 mt-2">₹{totalIncome.toLocaleString()}</p>
        </div>
        <div className="bg-white rounded-lg shadow-sm p-6">
          <p className="text-sm font-medium text-slate-500">Total Expenses</p>
          <p className="text-3xl font-bold text-red-600 mt-2">₹{totalExpense.toLocaleString()}</p>
        </div>
      </div>

      {/* Filters and Actions */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-center space-x-4">
            <Filter className="h-5 w-5 text-slate-400" />
            <select
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
              className="px-4 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none"
            >
              <option value="all">All Categories</option>
              <option value="Food">Food</option>
              <option value="Travel">Travel</option>
              <option value="Income">Income</option>
              <option value="Entertainment">Entertainment</option>
              <option value="Shopping">Shopping</option>
            </select>

            <select
              value={filterSource}
              onChange={(e) => setFilterSource(e.target.value)}
              className="px-4 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none"
            >
              <option value="all">All Sources</option>
              <option value="Cash">Cash</option>
              <option value="Bank">Bank</option>
              <option value="UPI">UPI</option>
            </select>
          </div>

          <div className="flex space-x-3">
            <button className="flex items-center px-4 py-2 border border-slate-300 text-slate-700 rounded-lg hover:bg-gray-50 transition-colors text-sm font-medium">
              <Download className="h-4 w-4 mr-2" />
              Export CSV
            </button>
            <button className="flex items-center px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors text-sm font-medium">
              <Plus className="h-4 w-4 mr-2" />
              Add Transaction
            </button>
          </div>
        </div>
      </div>

      {/* Transactions Table */}
      <div className="bg-white rounded-lg shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Date</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Description</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Category</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Amount</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Source</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredTransactions.map((transaction) => (
                <tr key={transaction.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-700">{transaction.date}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-800 font-medium">{transaction.description}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600">{transaction.category}</td>
                  <td className={`px-6 py-4 whitespace-nowrap text-sm font-semibold ${
                    transaction.amount > 0 ? 'text-emerald-600' : 'text-red-600'
                  }`}>
                    {transaction.amount > 0 ? '+' : ''}₹{Math.abs(transaction.amount).toLocaleString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="px-2 py-1 text-xs font-medium rounded-full bg-slate-100 text-slate-700">
                      {transaction.source}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="px-2 py-1 text-xs font-medium rounded-full bg-emerald-100 text-emerald-700">
                      {transaction.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
