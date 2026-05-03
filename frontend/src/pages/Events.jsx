import { useState, useEffect } from 'react'
import { Calendar, Plus, Trash2, MapPin, DollarSign } from 'lucide-react'
import { eventAPI } from '../utils/api'

export default function Events() {
  const [events, setEvents] = useState([])
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [selectedEvent, setSelectedEvent] = useState(null)
  const [eventTransactions, setEventTransactions] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchEvents()
  }, [])

  const fetchEvents = async () => {
    try {
      setLoading(true)
      const data = await eventAPI.getAll()
      setEvents(data.results || data || [])
    } catch (error) {
      console.error('Error fetching events:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleViewEvent = async (event) => {
    try {
      const data = await eventAPI.getTransactions(event.id)
      setEventTransactions(data)
      setSelectedEvent(event)
    } catch (error) {
      console.error('Error fetching event transactions:', error)
    }
  }

  const handleDeleteEvent = async (id) => {
    if (confirm('Are you sure you want to delete this trip?')) {
      try {
        await eventAPI.delete(id)
        fetchEvents()
      } catch (error) {
        console.error('Error deleting event:', error)
      }
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-slate-600">Loading trips...</div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-semibold text-slate-800">Events & Budget Planning</h2>
          <p className="text-slate-500 mt-1">Plan budgets for specific date ranges and track expenses automatically</p>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="flex items-center px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors font-medium"
        >
          <Plus className="h-5 w-5 mr-2" />
          Create Event
        </button>
      </div>

      {/* Events List */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {events.length === 0 ? (
          <div className="col-span-full bg-white rounded-lg shadow-sm p-12 text-center">
            <MapPin className="h-12 w-12 text-slate-300 mx-auto mb-4" />
            <p className="text-slate-600 mb-2">No events yet</p>
            <p className="text-sm text-slate-500 mb-4">Create an event to track expenses for a specific date range</p>
            <button
              onClick={() => setShowCreateModal(true)}
              className="inline-flex items-center px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors font-medium text-sm"
            >
              <Plus className="h-4 w-4 mr-2" />
              Create Your First Event
            </button>
          </div>
        ) : (
          events.map((event) => (
            <div key={event.id} className="bg-white rounded-lg shadow-sm p-6 border border-slate-200 hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center">
                  <MapPin className="h-5 w-5 text-indigo-600 mr-2" />
                  <h3 className="text-lg font-semibold text-slate-800">{event.name}</h3>
                </div>
                <button
                  onClick={() => handleDeleteEvent(event.id)}
                  className="text-slate-400 hover:text-red-600 transition-colors"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>

              <div className="space-y-2 mb-4">
                <div className="flex items-center text-sm text-slate-600">
                  <Calendar className="h-4 w-4 mr-2" />
                  {event.start_date} to {event.end_date}
                </div>
                <div className="flex items-center text-sm text-slate-600">
                  <DollarSign className="h-4 w-4 mr-2" />
                  Budget: ₹{parseFloat(event.budget).toLocaleString()}
                </div>
              </div>

              {event.description && (
                <p className="text-sm text-slate-500 mb-4">{event.description}</p>
              )}

              <button
                onClick={() => handleViewEvent(event)}
                className="w-full py-2 bg-indigo-50 text-indigo-600 rounded-lg hover:bg-indigo-100 transition-colors font-medium text-sm"
              >
                View Details
              </button>
            </div>
          ))
        )}
      </div>

      {/* Create Trip Modal */}
      {showCreateModal && (
        <CreateTripModal
          onClose={() => setShowCreateModal(false)}
          onSuccess={() => {
            setShowCreateModal(false)
            fetchEvents()
          }}
        />
      )}

      {/* Event Details Modal */}
      {selectedEvent && eventTransactions && (
        <EventDetailsModal
          event={selectedEvent}
          data={eventTransactions}
          onClose={() => {
            setSelectedEvent(null)
            setEventTransactions(null)
          }}
        />
      )}
    </div>
  )
}

function CreateTripModal({ onClose, onSuccess }) {
  const [formData, setFormData] = useState({
    name: '',
    start_date: '',
    end_date: '',
    budget: '',
    description: ''
  })
  const [submitting, setSubmitting] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSubmitting(true)

    try {
      await eventAPI.create(formData)
      onSuccess()
    } catch (error) {
      console.error('Error creating event:', error)
      alert('Failed to create event')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
        <h3 className="text-xl font-semibold text-slate-800 mb-2">Create New Event</h3>
        <p className="text-sm text-slate-500 mb-4">Set a date range and budget to track expenses for a specific period</p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Event Name</label>
            <input
              type="text"
              required
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none"
              placeholder="e.g., May Week Expenses, Goa Trip"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Start Date</label>
              <input
                type="date"
                required
                value={formData.start_date}
                onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">End Date</label>
              <input
                type="date"
                required
                value={formData.end_date}
                onChange={(e) => setFormData({ ...formData, end_date: e.target.value })}
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Budget (₹)</label>
            <input
              type="number"
              required
              step="0.01"
              value={formData.budget}
              onChange={(e) => setFormData({ ...formData, budget: e.target.value })}
              className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none"
              placeholder="5000"
            />
            <p className="text-xs text-slate-500 mt-1">All expenses between these dates will be tracked against this budget</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Description (Optional)</label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none"
              rows="2"
              placeholder="Add notes about this event..."
            />
          </div>

          <div className="flex space-x-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 transition-colors font-medium"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="flex-1 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors font-medium disabled:bg-slate-400"
            >
              {submitting ? 'Creating...' : 'Create Event'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

function EventDetailsModal({ event, data, onClose }) {
  const { summary, transactions } = data

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 overflow-y-auto">
      <div className="bg-white rounded-lg shadow-xl max-w-3xl w-full p-6 my-8">
        <div className="flex items-start justify-between mb-6">
          <div>
            <h3 className="text-2xl font-semibold text-slate-800">{event.name}</h3>
            <p className="text-sm text-slate-500 mt-1">
              {event.start_date} to {event.end_date}
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 text-2xl"
          >
            ×
          </button>
        </div>

        {/* Budget Summary */}
        <div className="grid grid-cols-3 gap-4 mb-6">
          <div className="bg-indigo-50 rounded-lg p-4">
            <p className="text-sm text-indigo-600 font-medium">Budget</p>
            <p className="text-2xl font-bold text-indigo-700 mt-1">
              ₹{summary.budget.toLocaleString()}
            </p>
          </div>
          <div className="bg-red-50 rounded-lg p-4">
            <p className="text-sm text-red-600 font-medium">Spent</p>
            <p className="text-2xl font-bold text-red-700 mt-1">
              ₹{summary.spent.toLocaleString()}
            </p>
          </div>
          <div className={`rounded-lg p-4 ${summary.remaining >= 0 ? 'bg-emerald-50' : 'bg-red-50'}`}>
            <p className={`text-sm font-medium ${summary.remaining >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>
              Remaining
            </p>
            <p className={`text-2xl font-bold mt-1 ${summary.remaining >= 0 ? 'text-emerald-700' : 'text-red-700'}`}>
              ₹{summary.remaining.toLocaleString()}
            </p>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="mb-6">
          <div className="flex items-center justify-between text-sm text-slate-600 mb-2">
            <span>Budget Usage</span>
            <span>{Math.round((summary.spent / summary.budget) * 100)}%</span>
          </div>
          <div className="w-full bg-slate-200 rounded-full h-3">
            <div
              className={`h-3 rounded-full transition-all ${
                (summary.spent / summary.budget) > 0.9 ? 'bg-red-600' :
                (summary.spent / summary.budget) > 0.7 ? 'bg-amber-500' :
                'bg-emerald-500'
              }`}
              style={{ width: `${Math.min((summary.spent / summary.budget) * 100, 100)}%` }}
            />
          </div>
        </div>

        {/* Transactions */}
        <div>
          <h4 className="text-lg font-semibold text-slate-800 mb-3">
            Transactions ({summary.transaction_count})
          </h4>
          {transactions.length === 0 ? (
            <p className="text-slate-500 text-center py-8">No transactions during this period</p>
          ) : (
            <div className="space-y-2 max-h-96 overflow-y-auto">
              {transactions.map((trans) => (
                <div key={trans.id} className="flex items-center justify-between p-3 border border-slate-200 rounded-lg">
                  <div>
                    <p className="font-medium text-slate-800">{trans.description}</p>
                    <p className="text-xs text-slate-500 mt-1">
                      {trans.date} • {trans.category_name || 'Uncategorized'}
                    </p>
                  </div>
                  <p className={`font-semibold ${parseFloat(trans.amount) >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>
                    {parseFloat(trans.amount) >= 0 ? '+' : ''}₹{Math.abs(parseFloat(trans.amount)).toLocaleString()}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>

        <button
          onClick={onClose}
          className="w-full mt-6 py-3 bg-slate-100 text-slate-700 rounded-lg hover:bg-slate-200 transition-colors font-medium"
        >
          Close
        </button>
      </div>
    </div>
  )
}
