import React, { useEffect, useState } from "react";
import { Users, Filter, MessageCircle, Mail, Search, MapPin, Phone, IndianRupee, Calendar, Loader2, Edit2, Trash2, X, Save, ChevronDown, ChevronUp, Download } from "lucide-react";
import { getClients, updateClient, deleteClient, sendEmailToClient } from "../api/clientApi";
import * as XLSX from "xlsx";

const categories = [
  "All", "Salon / Beauty", "Gym / Fitness", "Real Estate", "Restaurant / Food",
  "Agency / Marketing", "Construction", "Hotel / Resort", "Education / Coaching",
  "E-commerce", "Personal Portfolio", "Law Firm", "Hospital / Clinic"
];

const statusOptions = ["All", "pending", "accepted", "rejected"];

function makeMessage(client) {
  const needs = (client.websiteNeeds || []).join(", ") || "Not specified";
  return `Hello ${client.name}, 👋

I hope you're doing well. I have been following your ${client.businessType || "business"} for a while, and during that time, I noticed a few areas where your business could benefit — such as:
${needs}

I would be happy to help you with these requirements and provide professional solutions at a budget-friendly price to support your business growth.

If you're open to it, I'd love to share some ideas that could be helpful for you.

Looking forward to connecting! 😊
Our Website Link: https://ervocraft-react.vercel.app/`;
}

export default function ClientList() {
  const [clients, setClients] = useState([]);
  const [filter, setFilter] = useState("All");
  const [statusFilter, setStatusFilter] = useState("All");
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [editingId, setEditingId] = useState(null);
  const [editForm, setEditForm] = useState({});
  const [sortField, setSortField] = useState("");
  const [sortDirection, setSortDirection] = useState("asc");
  const [expandedRows, setExpandedRows] = useState(new Set());
  const [showExportModal, setShowExportModal] = useState(false);
  const [exportStartDate, setExportStartDate] = useState("");
  const [exportEndDate, setExportEndDate] = useState("");
  const [filterStartDate, setFilterStartDate] = useState("");
const [filterEndDate, setFilterEndDate] = useState("");

  const load = async (category = "All", status = "All") => {
    setLoading(true);
    try {
      const res = await getClients(category, status);
      setClients(res.data.data || res.data || []);
    } catch (err) {
      console.error("Error loading clients:", err);
      alert("Failed to load clients. Please check your connection and try again.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load(filter, statusFilter);
  }, []);

  const onFilterChange = (cat) => {
    setFilter(cat);
    load(cat, statusFilter);
  };

  const onStatusFilterChange = (status) => {
    setStatusFilter(status);
    load(filter, status);
  };

  const handleWhatsApp = (client) => {
    if (!client.phone) return alert("Client phone missing!");
    const number = client.phone.replace(/\s+/g, "").replace(/\+/g, "");
    const message = makeMessage(client);
    window.open(`https://wa.me/${number}?text=${message}`, "_blank");
  };

  const handleSendEmail = async (client) => {
    if (!client.email) return alert("Client email missing!");
    try {
      await sendEmailToClient(client._id);
      alert("Email sent successfully!");
    } catch (err) {
      console.error("Error sending email:", err);
      alert("Failed to send email. Please try again.");
    }
  };

  const handleEdit = (client) => {
    setEditingId(client._id);
    setEditForm({
      name: client.name,
      category: client.category,
      address: client.address || "",
      phone: client.phone || "",
      email: client.email || "",
      websiteNeeds: (client.websiteNeeds || []).join(", "),
      serviceCost: client.serviceCost || "",
      deadline: client.deadline || "",
      status: client.status || "pending"
    });
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setEditForm({});
  };

  const handleSaveEdit = async (id) => {
    try {
      const websiteNeedsArray = editForm.websiteNeeds
        .split(",")
        .map(need => need.trim())
        .filter(need => need.length > 0);

      const updatedData = {
        ...editForm,
        websiteNeeds: websiteNeedsArray,
        serviceCost: parseFloat(editForm.serviceCost) || 0
      };

      await updateClient(id, updatedData);
      alert("Client updated successfully!");
      setEditingId(null);
      setEditForm({});
      load(filter, statusFilter);
    } catch (err) {
      console.error("Error updating client:", err);
      alert("Failed to update client. Please try again.");
    }
  };

  const handleDelete = async (id, name) => {
    if (!window.confirm(`Are you sure you want to delete ${name}?`)) return;
    try {
      await deleteClient(id);
      alert("Client deleted successfully!");
      load(filter, statusFilter);
    } catch (err) {
      console.error("Error deleting client:", err);
      alert("Failed to delete client. Please try again.");
    }
  };

  const handleSort = (field) => {
    if (sortField === field) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortDirection("asc");
    }
  };

  const toggleRowExpand = (id) => {
    const newExpanded = new Set(expandedRows);
    if (newExpanded.has(id)) {
      newExpanded.delete(id);
    } else {
      newExpanded.add(id);
    }
    setExpandedRows(newExpanded);
  };

  const formatDate = (dateString) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    return date.toISOString().split('T')[0]; // Returns YYYY-MM-DD
  };

  const handleExportToExcel = () => {
    let dataToExport = [...clients];

    // Filter by date range if provided
    if (exportStartDate || exportEndDate) {
      dataToExport = dataToExport.filter(client => {
        const clientDate = formatDate(client.createdAt);
        
        if (exportStartDate && exportEndDate) {
          return clientDate >= exportStartDate && clientDate <= exportEndDate;
        } else if (exportStartDate) {
          return clientDate >= exportStartDate;
        } else if (exportEndDate) {
          return clientDate <= exportEndDate;
        }
        return true;
      });
    }

    if (dataToExport.length === 0) {
      alert("No clients found for the selected date range!");
      return;
    }

    // Prepare data for Excel
    const excelData = dataToExport.map(client => ({
      "Name": client.name,
      "Email": client.email,
      "Phone": client.phone,
      "Category": client.category,
      "Address": client.address || "N/A",
      "Website Needs": (client.websiteNeeds || []).join(", "),
      "Service Cost (₹)": client.serviceCost || 0,
      "Deadline": client.deadline || "N/A",
      "Status": client.status || "pending",
      "Created Date": formatDate(client.createdAt),
      "Business Type": client.businessType || "N/A"
    }));

    // Create worksheet and workbook
    const worksheet = XLSX.utils.json_to_sheet(excelData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Clients");

    // Set column widths
    const columnWidths = [
      { wch: 20 }, // Name
      { wch: 25 }, // Email
      { wch: 15 }, // Phone
      { wch: 20 }, // Category
      { wch: 30 }, // Address
      { wch: 30 }, // Website Needs
      { wch: 15 }, // Service Cost
      { wch: 12 }, // Deadline
      { wch: 10 }, // Status
      { wch: 12 }, // Created Date
      { wch: 15 }  // Business Type
    ];
    worksheet['!cols'] = columnWidths;

    // Generate filename with date range
    let filename = "clients_export";
    if (exportStartDate && exportEndDate) {
      filename += `_${exportStartDate}_to_${exportEndDate}`;
    } else if (exportStartDate) {
      filename += `_from_${exportStartDate}`;
    } else if (exportEndDate) {
      filename += `_until_${exportEndDate}`;
    }
    filename += `.xlsx`;

    // Download file
    XLSX.writeFile(workbook, filename);

    // Close modal and reset dates
    setShowExportModal(false);
    setExportStartDate("");
    setExportEndDate("");
    
    alert(`Successfully exported ${dataToExport.length} clients to Excel!`);
  };

 let filteredClients = clients.filter(c => 
  searchTerm === "" || c.name.toLowerCase().includes(searchTerm.toLowerCase())
);

// Apply date range filter
if (filterStartDate || filterEndDate) {
  filteredClients = filteredClients.filter(client => {
    const clientDate = formatDate(client.createdAt);
    
    if (filterStartDate && filterEndDate) {
      return clientDate >= filterStartDate && clientDate <= filterEndDate;
    } else if (filterStartDate) {
      return clientDate >= filterStartDate;
    } else if (filterEndDate) {
      return clientDate <= filterEndDate;
    }
    return true;
  });
}

  if (sortField) {
    filteredClients.sort((a, b) => {
      let aVal = a[sortField];
      let bVal = b[sortField];
      
      if (sortField === "serviceCost") {
        aVal = aVal || 0;
        bVal = bVal || 0;
      }
      
      if (aVal < bVal) return sortDirection === "asc" ? -1 : 1;
      if (aVal > bVal) return sortDirection === "asc" ? 1 : -1;
      return 0;
    });
  }

  const SortIcon = ({ field }) => {
    if (sortField !== field) return <ChevronDown className="w-4 h-4 text-slate-400 opacity-0 group-hover:opacity-100" />;
    return sortDirection === "asc" ? 
      <ChevronUp className="w-4 h-4 text-blue-400" /> : 
      <ChevronDown className="w-4 h-4 text-blue-400" />;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 p-6">
      <div className="max-w-[1600px] mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 bg-gradient-to-br from-blue-500 to-cyan-600 rounded-2xl flex items-center justify-center shadow-2xl shadow-blue-500/50">
                <Users className="w-7 h-7 text-white" />
              </div>
              <div>
                <h1 className="text-4xl font-bold text-white">Client Management</h1>
                <p className="text-blue-200 text-sm">Manage and track all your client relationships</p>
              </div>
            </div>

            {/* Export Button */}
            <button
              onClick={() => setShowExportModal(true)}
              className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-green-500 to-emerald-600 text-white font-semibold rounded-xl hover:from-green-600 hover:to-emerald-700 transition-all shadow-lg shadow-green-500/30"
            >
              <Download className="w-5 h-5" />
              Export to Excel
            </button>
          </div>

          {/* Filters */}
          <div className="bg-white/10 backdrop-blur-xl rounded-2xl border border-white/20 p-6 shadow-2xl">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="relative min-w-[180px]">
  <input
    type="date"
    value={filterStartDate}
    onChange={e => setFilterStartDate(e.target.value)}
    placeholder="Start Date"
    className="w-full px-4 py-3 bg-white/10 border-2 border-white/20 rounded-xl text-white focus:border-blue-400 focus:bg-white/20 transition-all outline-none"
  />
</div>

<div className="relative min-w-[180px]">
  <input
    type="date"
    value={filterEndDate}
    onChange={e => setFilterEndDate(e.target.value)}
    placeholder="End Date"
    className="w-full px-4 py-3 bg-white/10 border-2 border-white/20 rounded-xl text-white focus:border-blue-400 focus:bg-white/20 transition-all outline-none"
  />
</div>
              <div className="flex-1 relative">
                <Search className="w-5 h-5 absolute left-4 top-1/2 -translate-y-1/2 text-blue-300" />
                <input
                  type="text"
                  placeholder="Search clients by name..."
                  value={searchTerm}
                  onChange={e => setSearchTerm(e.target.value)}
                  className="w-full pl-12 pr-4 py-3 bg-white/10 border-2 border-white/20 rounded-xl text-white placeholder-blue-200 focus:border-blue-400 focus:bg-white/20 transition-all outline-none"
                />
              </div>

              <div className="relative min-w-[200px]">
                <Filter className="w-5 h-5 absolute left-4 top-1/2 -translate-y-1/2 text-blue-300" />
                <select
                  value={filter}
                  onChange={e => onFilterChange(e.target.value)}
                  className="w-full pl-12 pr-4 py-3 bg-white/10 border-2 border-white/20 rounded-xl text-white focus:border-blue-400 focus:bg-white/20 transition-all outline-none appearance-none"
                >
                  {categories.map(c => <option key={c} value={c} className="bg-slate-800">{c}</option>)}
                </select>
              </div>

              <div className="relative min-w-[180px]">
                <select
                  value={statusFilter}
                  onChange={e => onStatusFilterChange(e.target.value)}
                  className="w-full px-4 py-3 bg-white/10 border-2 border-white/20 rounded-xl text-white focus:border-blue-400 focus:bg-white/20 transition-all outline-none appearance-none"
                >
                  {statusOptions.map(s => <option key={s} value={s} className="bg-slate-800">{s === "All" ? "All Status" : s.charAt(0).toUpperCase() + s.slice(1)}</option>)}
                </select>
              </div>
            </div>

            <div className="mt-4 flex items-center gap-6 text-sm">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-blue-400"></div>
                <span className="text-blue-200">Total: <span className="font-semibold text-white">{filteredClients.length}</span></span>
              </div>
            </div>
          </div>
        </div>

        {/* Export Modal */}
        {showExportModal && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-slate-800 rounded-2xl border border-white/20 p-6 max-w-md w-full">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-white">Export to Excel</h2>
                <button
                  onClick={() => {
                    setShowExportModal(false);
                    setExportStartDate("");
                    setExportEndDate("");
                  }}
                  className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5 text-white" />
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-blue-300 mb-2">
                    Start Date (Optional)
                  </label>
                  <input
                    type="date"
                    value={exportStartDate}
                    onChange={e => setExportStartDate(e.target.value)}
                    className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:border-blue-400 outline-none"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-blue-300 mb-2">
                    End Date (Optional)
                  </label>
                  <input
                    type="date"
                    value={exportEndDate}
                    onChange={e => setExportEndDate(e.target.value)}
                    className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:border-blue-400 outline-none"
                  />
                </div>

                <div className="bg-blue-500/10 border border-blue-400/30 rounded-lg p-3">
                  <p className="text-sm text-blue-200">
                    <strong>Tip:</strong> Leave dates empty to export all clients, or select a date range to filter by creation date.
                  </p>
                </div>
              </div>

              <div className="flex gap-3 mt-6">
                <button
                  onClick={handleExportToExcel}
                  className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-r from-green-500 to-emerald-600 text-white font-semibold rounded-lg hover:from-green-600 hover:to-emerald-700 transition-all"
                >
                  <Download className="w-4 h-4" />
                  Download Excel
                </button>
                <button
                  onClick={() => {
                    setShowExportModal(false);
                    setExportStartDate("");
                    setExportEndDate("");
                  }}
                  className="px-4 py-3 bg-white/10 text-white font-semibold rounded-lg hover:bg-white/20 transition-all"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Edit Modal */}
        {editingId && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-slate-800 rounded-2xl border border-white/20 p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-white">Edit Client</h2>
                <button
                  onClick={handleCancelEdit}
                  className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5 text-white" />
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-blue-300 mb-2">Name</label>
                  <input
                    type="text"
                    value={editForm.name}
                    onChange={e => setEditForm({...editForm, name: e.target.value})}
                    className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:border-blue-400 outline-none"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-blue-300 mb-2">Category</label>
                  <select
                    value={editForm.category}
                    onChange={e => setEditForm({...editForm, category: e.target.value})}
                    className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:border-blue-400 outline-none"
                  >
                    {categories.filter(c => c !== "All").map(c => <option key={c} value={c} className="bg-slate-800">{c}</option>)}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-blue-300 mb-2">Email</label>
                  <input
                    type="email"
                    value={editForm.email}
                    onChange={e => setEditForm({...editForm, email: e.target.value})}
                    className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:border-blue-400 outline-none"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-blue-300 mb-2">Phone</label>
                  <input
                    type="tel"
                    value={editForm.phone}
                    onChange={e => setEditForm({...editForm, phone: e.target.value})}
                    className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:border-blue-400 outline-none"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-blue-300 mb-2">Address</label>
                  <input
                    type="text"
                    value={editForm.address}
                    onChange={e => setEditForm({...editForm, address: e.target.value})}
                    className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:border-blue-400 outline-none"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-blue-300 mb-2">Website Needs (comma-separated)</label>
                  <input
                    type="text"
                    value={editForm.websiteNeeds}
                    onChange={e => setEditForm({...editForm, websiteNeeds: e.target.value})}
                    placeholder="E-commerce, Booking System, Blog"
                    className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:border-blue-400 outline-none"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-blue-300 mb-2">Service Cost (₹)</label>
                    <input
                      type="number"
                      value={editForm.serviceCost}
                      onChange={e => setEditForm({...editForm, serviceCost: e.target.value})}
                      className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:border-blue-400 outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-blue-300 mb-2">Deadline</label>
                    <input
                      type="date"
                      value={editForm.deadline}
                      onChange={e => setEditForm({...editForm, deadline: e.target.value})}
                      className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:border-blue-400 outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-blue-300 mb-2">Status</label>
                  <select
                    value={editForm.status}
                    onChange={e => setEditForm({...editForm, status: e.target.value})}
                    className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:border-blue-400 outline-none"
                  >
                    <option value="pending" className="bg-slate-800">Pending</option>
                    <option value="accepted" className="bg-slate-800">Accepted</option>
                    <option value="rejected" className="bg-slate-800">Rejected</option>
                  </select>
                </div>
              </div>

              <div className="flex gap-3 mt-6">
                <button
                  onClick={() => handleSaveEdit(editingId)}
                  className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-r from-blue-500 to-cyan-600 text-white font-semibold rounded-lg hover:from-blue-600 hover:to-cyan-700 transition-all"
                >
                  <Save className="w-4 h-4" />
                  Save Changes
                </button>
                <button
                  onClick={handleCancelEdit}
                  className="px-4 py-3 bg-white/10 text-white font-semibold rounded-lg hover:bg-white/20 transition-all"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Table */}
        {loading ? (
          <div className="bg-white/10 backdrop-blur-xl rounded-2xl border border-white/20 p-12 flex flex-col items-center justify-center">
            <Loader2 className="w-12 h-12 text-blue-400 animate-spin mb-4" />
            <p className="text-white">Loading clients...</p>
          </div>
        ) : (
          <div className="bg-white/10 backdrop-blur-xl rounded-2xl border border-white/20 shadow-2xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-white/5 border-b border-white/10">
                    <th className="px-6 py-4 text-left">
                      <button 
                        onClick={() => handleSort("name")}
                        className="flex items-center gap-2 text-sm font-semibold text-blue-300 hover:text-blue-200 transition-colors group"
                      >
                        Client Name
                        <SortIcon field="name" />
                      </button>
                    </th>
                    <th className="px-6 py-4 text-left">
                      <button 
                        onClick={() => handleSort("category")}
                        className="flex items-center gap-2 text-sm font-semibold text-blue-300 hover:text-blue-200 transition-colors group"
                      >
                        Category
                        <SortIcon field="category" />
                      </button>
                    </th>
                    <th className="px-6 py-4 text-left">
                      <span className="text-sm font-semibold text-blue-300">Contact</span>
                    </th>
                    <th className="px-6 py-4 text-left">
                      <button 
                        onClick={() => handleSort("serviceCost")}
                        className="flex items-center gap-2 text-sm font-semibold text-blue-300 hover:text-blue-200 transition-colors group"
                      >
                        Revenue
                        <SortIcon field="serviceCost" />
                      </button>
                    </th>
                    <th className="px-6 py-4 text-left">
                      <button 
                        onClick={() => handleSort("status")}
                        className="flex items-center gap-2 text-sm font-semibold text-blue-300 hover:text-blue-200 transition-colors group"
                      >
                        Status
                        <SortIcon field="status" />
                      </button>
                    </th>
                    <th className="px-6 py-4 text-center">
                      <span className="text-sm font-semibold text-blue-300">Actions</span>
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {filteredClients.length === 0 ? (
                    <tr>
                      <td colSpan="6" className="px-6 py-12 text-center">
                        <Users className="w-16 h-16 text-slate-500 mx-auto mb-4" />
                        <h3 className="text-xl font-semibold text-white mb-2">No clients found</h3>
                        <p className="text-blue-200">Try adjusting your filters or add new clients</p>
                      </td>
                    </tr>
                  ) : (
                    filteredClients.map((client) => (
                      <React.Fragment key={client._id}>
                        <tr className="border-b border-white/5 hover:bg-white/5 transition-colors">
                          <td className="px-6 py-4">
                            <button
                              onClick={() => toggleRowExpand(client._id)}
                              className="flex items-center gap-3 text-left w-full"
                            >
                              <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center text-white font-bold text-sm shadow-lg">
                                {client.name.charAt(0).toUpperCase()}
                              </div>
                              <div>
                                <div className="text-white font-semibold">{client.name}</div>
                                <div className="text-blue-300 text-xs">{client.email}</div>
                              </div>
                            </button>
                          </td>
                          <td className="px-6 py-4">
                            <span className="px-3 py-1 bg-blue-500/20 text-blue-300 text-xs font-semibold rounded-full border border-blue-400/30">
                              {client.category}
                            </span>
                          </td>
                          <td className="px-6 py-4">
                            <div className="space-y-1">
                              <div className="flex items-center gap-2 text-sm text-blue-200">
                                <Phone className="w-3 h-3" />
                                {client.phone}
                              </div>
                              <div className="flex items-center gap-2 text-xs text-slate-400">
                                <MapPin className="w-3 h-3" />
                                {client.address}
                              </div>
                              </div>
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-2 text-green-400 font-semibold">
                              <IndianRupee className="w-4 h-4" />
                              {client.serviceCost?.toLocaleString() || 0}
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <span className={`px-3 py-1 text-xs font-semibold rounded-full ${
                              client.status === "accepted" 
                                ? "bg-green-500/20 text-green-300 border border-green-400/30"
                                : client.status === "rejected"
                                ? "bg-red-500/20 text-red-300 border border-red-400/30"
                                : "bg-yellow-500/20 text-yellow-300 border border-yellow-400/30"
                            }`}>
                              {client.status || "pending"}
                            </span>
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex items-center justify-center gap-2">
                              <button
                                onClick={() => handleWhatsApp(client)}
                                className="p-2 bg-green-500/20 text-green-300 rounded-lg hover:bg-green-500/30 transition-colors border border-green-400/30"
                                title="Send WhatsApp"
                              >
                                <MessageCircle className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => handleSendEmail(client)}
                                className="p-2 bg-blue-500/20 text-blue-300 rounded-lg hover:bg-blue-500/30 transition-colors border border-blue-400/30"
                                title="Send Email"
                              >
                                <Mail className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => handleEdit(client)}
                                className="p-2 bg-purple-500/20 text-purple-300 rounded-lg hover:bg-purple-500/30 transition-colors border border-purple-400/30"
                                title="Edit Client"
                              >
                                <Edit2 className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => handleDelete(client._id, client.name)}
                                className="p-2 bg-red-500/20 text-red-300 rounded-lg hover:bg-red-500/30 transition-colors border border-red-400/30"
                                title="Delete Client"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </td>
                        </tr>
                        
                        {/* Expanded Row Details */}
                        {expandedRows.has(client._id) && (
                          <tr className="bg-white/5 border-b border-white/5">
                            <td colSpan="6" className="px-6 py-4">
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                  <h4 className="text-sm font-semibold text-blue-300 mb-2">Website Needs</h4>
                                  <div className="flex flex-wrap gap-2">
                                    {(client.websiteNeeds || []).length > 0 ? (
                                      client.websiteNeeds.map((need, idx) => (
                                        <span key={idx} className="px-2 py-1 bg-cyan-500/20 text-cyan-300 text-xs rounded-lg border border-cyan-400/30">
                                          {need}
                                        </span>
                                      ))
                                    ) : (
                                      <span className="text-slate-400 text-sm">No needs specified</span>
                                    )}
                                  </div>
                                </div>
                                
                                <div>
                                  <h4 className="text-sm font-semibold text-blue-300 mb-2">Project Details</h4>
                                  <div className="space-y-2">
                                    <div className="flex items-center gap-2 text-sm text-blue-200">
                                      <Calendar className="w-4 h-4" />
                                      <span className="text-slate-400">Deadline:</span>
                                      <span>{client.deadline || "Not set"}</span>
                                    </div>
                                    <div className="flex items-center gap-2 text-sm text-blue-200">
                                      <span className="text-slate-400">Business Type:</span>
                                      <span>{client.businessType || "Not specified"}</span>
                                    </div>
                                    {client.createdAt && (
                                      <div className="flex items-center gap-2 text-sm text-blue-200">
                                        <span className="text-slate-400">Added:</span>
                                        <span>{formatDate(client.createdAt)}</span>
                                      </div>
                                    )}
                                  </div>
                                </div>
                              </div>
                            </td>
                          </tr>
                        )}
                      </React.Fragment>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}