import { useState } from 'react'
import { User, Mail, Bell, Shield, Palette } from 'lucide-react'

export default function Settings() {
  const [notifications, setNotifications] = useState({
    budgetAlerts: true,
    weeklyReports: false,
    emailDigest: true,
  })

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-semibold text-slate-800">Settings</h2>
        <p className="text-slate-500 mt-1">Manage your account preferences and settings</p>
      </div>

      {/* Profile Settings */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <div className="flex items-center mb-6">
          <User className="h-5 w-5 text-indigo-600 mr-3" />
          <h3 className="text-lg font-semibold text-slate-800">Profile Information</h3>
        </div>
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Full Name</label>
              <input
                type="text"
                defaultValue="Mattapalli Srinath Rao"
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Email</label>
              <input
                type="email"
                defaultValue="srinath@example.com"
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
              />
            </div>
          </div>
          <button className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors font-medium">
            Save Changes
          </button>
        </div>
      </div>

      {/* Notification Settings */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <div className="flex items-center mb-6">
          <Bell className="h-5 w-5 text-indigo-600 mr-3" />
          <h3 className="text-lg font-semibold text-slate-800">Notifications</h3>
        </div>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium text-slate-800">Budget Alerts</p>
              <p className="text-sm text-slate-500">Get notified when you reach 90% of your budget</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={notifications.budgetAlerts}
                onChange={(e) => setNotifications({...notifications, budgetAlerts: e.target.checked})}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-slate-300 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-indigo-500 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600"></div>
            </label>
          </div>

          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium text-slate-800">Weekly Reports</p>
              <p className="text-sm text-slate-500">Receive weekly spending summary via email</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={notifications.weeklyReports}
                onChange={(e) => setNotifications({...notifications, weeklyReports: e.target.checked})}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-slate-300 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-indigo-500 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600"></div>
            </label>
          </div>

          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium text-slate-800">Email Digest</p>
              <p className="text-sm text-slate-500">Monthly financial summary report</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={notifications.emailDigest}
                onChange={(e) => setNotifications({...notifications, emailDigest: e.target.checked})}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-slate-300 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-indigo-500 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600"></div>
            </label>
          </div>
        </div>
      </div>

      {/* Security Settings */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <div className="flex items-center mb-6">
          <Shield className="h-5 w-5 text-indigo-600 mr-3" />
          <h3 className="text-lg font-semibold text-slate-800">Security</h3>
        </div>
        <div className="space-y-4">
          <button className="w-full md:w-auto px-6 py-2 border border-slate-300 text-slate-700 rounded-lg hover:bg-gray-50 transition-colors font-medium">
            Change Password
          </button>
        </div>
      </div>

      {/* Categories Management */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <div className="flex items-center mb-6">
          <Palette className="h-5 w-5 text-indigo-600 mr-3" />
          <h3 className="text-lg font-semibold text-slate-800">Custom Categories</h3>
        </div>
        <div className="space-y-3">
          {['Food', 'Travel', 'Rent', 'Entertainment', 'Shopping'].map((cat) => (
            <div key={cat} className="flex items-center justify-between p-3 border border-slate-200 rounded-lg">
              <span className="text-slate-700 font-medium">{cat}</span>
              <button className="text-sm text-red-600 hover:text-red-700">Remove</button>
            </div>
          ))}
          <button className="w-full py-2 border-2 border-dashed border-slate-300 text-slate-600 rounded-lg hover:border-indigo-400 hover:text-indigo-600 transition-colors font-medium">
            + Add New Category
          </button>
        </div>
      </div>
    </div>
  )
}
