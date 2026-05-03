import { TrendingUp, TrendingDown } from 'lucide-react'
import AnimatedCounter from './AnimatedCounter'

export default function StatsCard({ 
  title, 
  value, 
  subtitle, 
  icon: Icon, 
  trend, 
  trendValue,
  color = 'indigo',
  prefix = '₹',
  animate = true
}) {
  const colorClasses = {
    indigo: 'from-indigo-500 to-purple-600',
    emerald: 'from-emerald-500 to-teal-600',
    red: 'from-red-500 to-pink-600',
    amber: 'from-amber-500 to-orange-600',
    blue: 'from-blue-500 to-cyan-600',
  }

  return (
    <div className="group bg-white rounded-2xl shadow-sm hover:shadow-xl transition-all duration-300 p-6 border border-slate-100 card-hover animate-scale-in">
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <p className="text-sm font-medium text-slate-500 mb-1">{title}</p>
          <h3 className="text-3xl font-bold text-slate-800">
            {animate ? (
              <AnimatedCounter value={value} prefix={prefix} />
            ) : (
              `${prefix}${value.toLocaleString()}`
            )}
          </h3>
        </div>
        {Icon && (
          <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${colorClasses[color]} flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300`}>
            <Icon className="w-6 h-6 text-white" />
          </div>
        )}
      </div>
      
      {subtitle && (
        <p className="text-xs text-slate-500">{subtitle}</p>
      )}
      
      {trend && (
        <div className="flex items-center mt-3 pt-3 border-t border-slate-100">
          {trend === 'up' ? (
            <TrendingUp className="w-4 h-4 text-emerald-500 mr-1" />
          ) : (
            <TrendingDown className="w-4 h-4 text-red-500 mr-1" />
          )}
          <span className={`text-sm font-medium ${trend === 'up' ? 'text-emerald-600' : 'text-red-600'}`}>
            {trendValue}
          </span>
          <span className="text-xs text-slate-500 ml-1">vs last month</span>
        </div>
      )}
    </div>
  )
}
