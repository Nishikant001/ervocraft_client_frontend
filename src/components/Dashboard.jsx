import React, { useEffect, useState } from "react";
import { BarChart3, TrendingUp, Users, DollarSign, CheckCircle, Clock, XCircle, Loader2, IndianRupee, PieChart, Activity } from "lucide-react";
import { BarChart, Bar, PieChart as RePieChart, Pie, Cell, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { getDashboardReport } from "../api/clientApi"; // Import the real API function

const COLORS = ['#3b82f6', '#8b5cf6', '#10b981', '#f59e0b', '#ef4444', '#06b6d4'];

export default function Dashboard() {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState({
    clientsByCategory: [],
    clientsByStatus: [],
    revenueByCategory: [],
    totalRevenue: 0
  });

  useEffect(() => {
    loadReport();
  }, []);

  const loadReport = async () => {
    setLoading(true);
    try {
      const res = await getDashboardReport();
      console.log(res)
      // Handle axios response structure
      setData(res.data || res);
    } catch (err) {
      console.error("Dashboard Error:", err);
      alert("Failed to load dashboard data. Please check your API connection.");
    } finally {
      setLoading(false);
    }
  };

  const getStatusData = (status) => {
    const found = data.clientsByStatus.find(s => s._id === status);
    return found ? found.count : 0;
  };

  const totalClients = data.clientsByStatus.reduce((sum, s) => sum + s.count, 0);

  // Prepare data for charts
  const statusChartData = data.clientsByStatus.map(item => ({
    name: item._id.charAt(0).toUpperCase() + item._id.slice(1),
    value: item.count,
    percentage: totalClients > 0 ? ((item.count / totalClients) * 100).toFixed(1) : 0
  }));

  const categoryBarData = data.clientsByCategory.map(item => ({
    name: item._id.length > 15 ? item._id.substring(0, 15) + '...' : item._id,
    clients: item.count
  }));

  const revenueBarData = data.revenueByCategory.map(item => ({
    name: item._id.length > 15 ? item._id.substring(0, 15) + '...' : item._id,
    revenue: item.revenue / 1000 // Convert to thousands for better readability
  }));

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-6 flex items-center justify-center">
        <div className="bg-white/10 backdrop-blur-xl rounded-3xl border border-white/20 p-12 flex flex-col items-center">
          <Loader2 className="w-12 h-12 text-blue-400 animate-spin mb-4" />
          <p className="text-white text-lg">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-3 sm:p-6">
      <div className="max-w-7xl mx-auto w-full">
        {/* Header */}
        <div className="mb-6 sm:mb-8">
          <div className="flex items-center gap-3 sm:gap-4 mb-2">
            <div className="w-10 h-10 sm:w-14 sm:h-14 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-2xl shadow-blue-500/50">
              <Activity className="w-5 h-5 sm:w-7 sm:h-7 text-white" />
            </div>
            <div>
              <h1 className="text-2xl sm:text-4xl font-bold text-white">Analytics Dashboard</h1>
              <p className="text-blue-200 text-xs sm:text-sm">Real-time business insights and metrics</p>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-6 sm:mb-8">
          {/* Total Clients */}
          <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl shadow-2xl p-4 sm:p-6 hover:scale-105 transition-transform duration-300 border border-blue-400/30">
            <div className="flex items-center justify-between mb-3 sm:mb-4">
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center">
                <Users className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
              </div>
              <TrendingUp className="w-4 h-4 sm:w-5 sm:h-5 text-white/80" />
            </div>
            <h3 className="text-blue-100 text-xs sm:text-sm font-medium mb-1">Total Clients</h3>
            <p className="text-3xl sm:text-4xl font-bold text-white">{totalClients}</p>
            <p className="text-blue-100 text-xs mt-2">Active client base</p>
          </div>

          {/* Accepted Clients */}
          <div className="bg-gradient-to-br from-green-500 to-emerald-600 rounded-2xl shadow-2xl p-4 sm:p-6 hover:scale-105 transition-transform duration-300 border border-green-400/30">
            <div className="flex items-center justify-between mb-3 sm:mb-4">
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center">
                <CheckCircle className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
              </div>
            </div>
            <h3 className="text-green-100 text-xs sm:text-sm font-medium mb-1">Accepted Projects</h3>
            <p className="text-3xl sm:text-4xl font-bold text-white">{getStatusData("accepted")}</p>
            <p className="text-green-100 text-xs mt-2">{totalClients > 0 ? ((getStatusData("accepted") / totalClients) * 100).toFixed(1) : 0}% conversion rate</p>
          </div>

          {/* Pending Clients */}
          <div className="bg-gradient-to-br from-amber-500 to-orange-600 rounded-2xl shadow-2xl p-4 sm:p-6 hover:scale-105 transition-transform duration-300 border border-amber-400/30">
            <div className="flex items-center justify-between mb-3 sm:mb-4">
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center">
                <Clock className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
              </div>
            </div>
            <h3 className="text-amber-100 text-xs sm:text-sm font-medium mb-1">Pending Review</h3>
            <p className="text-3xl sm:text-4xl font-bold text-white">{getStatusData("pending")}</p>
            <p className="text-amber-100 text-xs mt-2">Awaiting response</p>
          </div>

          {/* Total Revenue */}
          <div className="bg-gradient-to-br from-purple-500 to-pink-600 rounded-2xl shadow-2xl p-4 sm:p-6 hover:scale-105 transition-transform duration-300 border border-purple-400/30">
            <div className="flex items-center justify-between mb-3 sm:mb-4">
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center">
                <IndianRupee className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
              </div>
            </div>
            <h3 className="text-purple-100 text-xs sm:text-sm font-medium mb-1">Total Revenue</h3>
            <p className="text-3xl sm:text-4xl font-bold text-white">₹{(data.totalRevenue ).toFixed(1)}</p>
            <p className="text-purple-100 text-xs mt-2">From accepted clients</p>
          </div>
        </div>

        {/* Charts Row 1 */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 mb-4 sm:mb-6">
          {/* Status Distribution Pie Chart */}
          <div className="bg-white/10 backdrop-blur-xl rounded-3xl border border-white/20 p-4 sm:p-6 shadow-2xl">
            <div className="flex items-center gap-2 sm:gap-3 mb-4 sm:mb-6">
              <PieChart className="w-5 h-5 sm:w-6 sm:h-6 text-blue-400" />
              <h2 className="text-lg sm:text-xl font-bold text-white">Status Distribution</h2>
            </div>
            <ResponsiveContainer width="100%" height={250} className="sm:hidden">
              <RePieChart>
                <Pie
                  data={statusChartData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ percentage }) => `${percentage}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {statusChartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'rgba(15, 23, 42, 0.9)', 
                    border: '1px solid rgba(148, 163, 184, 0.2)',
                    borderRadius: '12px',
                    color: '#fff',
                    fontSize: '12px'
                  }}
                />
              </RePieChart>
            </ResponsiveContainer>
            <ResponsiveContainer width="100%" height={300} className="hidden sm:block">
              <RePieChart>
                <Pie
                  data={statusChartData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percentage }) => `${name}: ${percentage}%`}
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {statusChartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'rgba(15, 23, 42, 0.9)', 
                    border: '1px solid rgba(148, 163, 184, 0.2)',
                    borderRadius: '12px',
                    color: '#fff'
                  }}
                />
              </RePieChart>
            </ResponsiveContainer>
            <div className="flex justify-center gap-3 sm:gap-4 mt-4 flex-wrap">
              {statusChartData.map((entry, index) => (
                <div key={entry.name} className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: COLORS[index % COLORS.length] }}></div>
                  <span className="text-xs sm:text-sm text-white">{entry.name}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Clients by Category Bar Chart */}
          <div className="bg-white/10 backdrop-blur-xl rounded-3xl border border-white/20 p-4 sm:p-6 shadow-2xl">
            <div className="flex items-center gap-2 sm:gap-3 mb-4 sm:mb-6">
              <BarChart3 className="w-5 h-5 sm:w-6 sm:h-6 text-purple-400" />
              <h2 className="text-lg sm:text-xl font-bold text-white">Clients by Category</h2>
            </div>
            <ResponsiveContainer width="100%" height={250} className="sm:hidden">
              <BarChart data={categoryBarData}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                <XAxis 
                  dataKey="name" 
                  stroke="#94a3b8" 
                  tick={{ fill: '#cbd5e1', fontSize: 10 }}
                  angle={-45}
                  textAnchor="end"
                  height={60}
                />
                <YAxis stroke="#94a3b8" tick={{ fill: '#cbd5e1', fontSize: 10 }} />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'rgba(15, 23, 42, 0.9)', 
                    border: '1px solid rgba(148, 163, 184, 0.2)',
                    borderRadius: '12px',
                    color: '#fff',
                    fontSize: '12px'
                  }}
                />
                <Bar dataKey="clients" fill="url(#colorClients)" radius={[8, 8, 0, 0]} />
                <defs>
                  <linearGradient id="colorClients" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#8b5cf6" stopOpacity={1}/>
                    <stop offset="100%" stopColor="#3b82f6" stopOpacity={0.8}/>
                  </linearGradient>
                </defs>
              </BarChart>
            </ResponsiveContainer>
            <ResponsiveContainer width="100%" height={300} className="hidden sm:block">
              <BarChart data={categoryBarData}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                <XAxis 
                  dataKey="name" 
                  stroke="#94a3b8" 
                  tick={{ fill: '#cbd5e1' }}
                  angle={-45}
                  textAnchor="end"
                  height={80}
                />
                <YAxis stroke="#94a3b8" tick={{ fill: '#cbd5e1' }} />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'rgba(15, 23, 42, 0.9)', 
                    border: '1px solid rgba(148, 163, 184, 0.2)',
                    borderRadius: '12px',
                    color: '#fff'
                  }}
                />
                <Bar dataKey="clients" fill="url(#colorClients)" radius={[8, 8, 0, 0]} />
                <defs>
                  <linearGradient id="colorClients" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#8b5cf6" stopOpacity={1}/>
                    <stop offset="100%" stopColor="#3b82f6" stopOpacity={0.8}/>
                  </linearGradient>
                </defs>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Revenue Chart */}
        <div className="bg-white/10 backdrop-blur-xl rounded-3xl border border-white/20 p-4 sm:p-6 shadow-2xl">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-3 mb-4 sm:mb-6">
            <div className="flex items-center gap-2 sm:gap-3">
              <IndianRupee className="w-5 h-5 sm:w-6 sm:h-6 text-green-400" />
              <h2 className="text-lg sm:text-xl font-bold text-white">Revenue by Category</h2>
            </div>
            <span className="sm:ml-auto text-xs sm:text-sm text-green-400 font-semibold">(in thousands ₹)</span>
          </div>
          <ResponsiveContainer width="100%" height={280} className="sm:hidden">
            <BarChart data={revenueBarData} layout="horizontal">
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
              <XAxis 
                dataKey="name" 
                stroke="#94a3b8" 
                tick={{ fill: '#cbd5e1', fontSize: 10 }}
                angle={-45}
                textAnchor="end"
                height={60}
              />
              <YAxis stroke="#94a3b8" tick={{ fill: '#cbd5e1', fontSize: 10 }} />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: 'rgba(15, 23, 42, 0.9)', 
                  border: '1px solid rgba(148, 163, 184, 0.2)',
                  borderRadius: '12px',
                  color: '#fff',
                  fontSize: '12px'
                }}
                formatter={(value) => `₹${value}K`}
              />
              <Bar dataKey="revenue" fill="url(#colorRevenue)" radius={[8, 8, 0, 0]} />
              <defs>
                <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#10b981" stopOpacity={1}/>
                  <stop offset="100%" stopColor="#059669" stopOpacity={0.8}/>
                </linearGradient>
              </defs>
            </BarChart>
          </ResponsiveContainer>
          <ResponsiveContainer width="100%" height={350} className="hidden sm:block">
            <BarChart data={revenueBarData} layout="horizontal">
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
              <XAxis 
                dataKey="name" 
                stroke="#94a3b8" 
                tick={{ fill: '#cbd5e1' }}
                angle={-45}
                textAnchor="end"
                height={80}
              />
              <YAxis stroke="#94a3b8" tick={{ fill: '#cbd5e1' }} />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: 'rgba(15, 23, 42, 0.9)', 
                  border: '1px solid rgba(148, 163, 184, 0.2)',
                  borderRadius: '12px',
                  color: '#fff'
                }}
                formatter={(value) => `₹${value}K`}
              />
              <Bar dataKey="revenue" fill="url(#colorRevenue)" radius={[8, 8, 0, 0]} />
              <defs>
                <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#10b981" stopOpacity={1}/>
                  <stop offset="100%" stopColor="#059669" stopOpacity={0.8}/>
                </linearGradient>
              </defs>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}