import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Building2, User, MapPin, Phone, Mail, Globe, IndianRupee, Calendar, CheckCircle2, AlertCircle } from "lucide-react";
import { addClient } from "../api/clientApi";

const categories = [
  "Salon / Beauty",
  "Gym / Fitness",
  "Real Estate",
  "Restaurant / Food",
  "Agency / Marketing",
  "Construction",
  "Hotel / Resort",
  "Education / Coaching",
  "E-commerce",
  "Personal Portfolio",
  "Law Firm",
  "Hospital / Clinic",
  "Event Management",
  "Photography",
  "NGO",
  "Automobile",
  "Travel / Tour",
  "IT Services",
  "Repair Services",
  "Interior Designer",
  "Garments / Boutique"
];

const statusOptions = [
  { value: "pending", label: "Pending", color: "bg-yellow-100 text-yellow-700" },
  { value: "accepted", label: "Accepted", color: "bg-green-100 text-green-700" },
  { value: "rejected", label: "Rejected", color: "bg-red-100 text-red-700" }
];

export default function ClientForm() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    category: "",
    name: "",
    address: "",
    phone: "",
    email: "",
    websiteNeeds: "",
    serviceCost: "",
    deadline: "",
    status: "pending"
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [notification, setNotification] = useState({ show: false, type: "", message: "" });

  const showNotification = (type, message) => {
    setNotification({ show: true, type, message });
    setTimeout(() => setNotification({ show: false, type: "", message: "" }), 4000);
  };

  const handleSubmit = async () => {
    if (!form.category || !form.name) {
      showNotification("error", "Please fill in Category and Name - these fields are required");
      return;
    }

    setIsSubmitting(true);

    const payload = {
      category: form.category,
      name: form.name,
      address: form.address,
      phone: form.phone,
      email: form.email,
      websiteNeeds: form.websiteNeeds ? form.websiteNeeds.split(",").map(s => s.trim()) : [],
      serviceCost: form.serviceCost ? Number(form.serviceCost) : 0,
      deadline: form.deadline,
      status: form.status
    };

    try {
      await addClient(payload);
      showNotification("success", "Client added successfully!");
      
      // Reset form
      setForm({
        category: "",
        name: "",
        address: "",
        phone: "",
        email: "",
        websiteNeeds: "",
        serviceCost: "",
        deadline: "",
        status: "pending"
      });

      // Navigate to clients page after 1.5 seconds
      setTimeout(() => navigate("/clients"), 1500);
    } catch (err) {
      console.error(err);
      showNotification("error", "Failed to add client. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReset = () => {
    setForm({
      category: "",
      name: "",
      address: "",
      phone: "",
      email: "",
      websiteNeeds: "",
      serviceCost: "",
      deadline: "",
      status: "pending"
    });
    showNotification("success", "Form cleared successfully");
  };

  return (
    <div className="max-w-4xl mx-auto">
      {/* Notification */}
      {notification.show && (
        <div className={`mb-6 p-4 rounded-xl flex items-center gap-3 shadow-lg ${
          notification.type === "success" ? "bg-green-50 border-2 border-green-200" : "bg-red-50 border-2 border-red-200"
        }`}>
          {notification.type === "success" ? (
            <CheckCircle2 className="w-5 h-5 text-green-600" />
          ) : (
            <AlertCircle className="w-5 h-5 text-red-600" />
          )}
          <p className={`text-sm font-medium ${notification.type === "success" ? "text-green-800" : "text-red-800"}`}>
            {notification.message}
          </p>
        </div>
      )}

      {/* Header Section */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-12 h-12 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg">
            <Building2 className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-slate-800">Add New Client</h1>
            <p className="text-slate-600 text-sm">Complete the form to onboard a new client to your system</p>
          </div>
        </div>
      </div>

      {/* Form Card */}
      <div className="bg-white rounded-2xl shadow-xl border border-slate-200 overflow-hidden">
        {/* Card Header */}
        <div className="bg-gradient-to-r from-blue-600 to-indigo-600 px-6 md:px-8 py-6">
          <h2 className="text-xl font-semibold text-white">Client Information</h2>
          <p className="text-blue-100 text-sm mt-1">Fields marked with * are required</p>
        </div>

        {/* Form Content */}
        <div className="p-6 md:p-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Category */}
            <div className="md:col-span-2">
              <label className="block text-sm font-semibold text-slate-700 mb-2">
                <Building2 className="w-4 h-4 inline mr-2" />
                Business Category *
              </label>
              <select
                value={form.category}
                onChange={e => setForm({ ...form, category: e.target.value })}
                className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl focus:border-blue-500 focus:ring-4 focus:ring-blue-100 transition-all outline-none bg-white text-slate-700"
              >
                <option value="">-- Select Business Category --</option>
                {categories.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>

            {/* Name */}
            <div className="md:col-span-2">
              <label className="block text-sm font-semibold text-slate-700 mb-2">
                <User className="w-4 h-4 inline mr-2" />
                Client Name / Company Name *
              </label>
              <input
                type="text"
                placeholder="e.g., John Doe or ABC Corporation"
                value={form.name}
                onChange={e => setForm({ ...form, name: e.target.value })}
                className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl focus:border-blue-500 focus:ring-4 focus:ring-blue-100 transition-all outline-none"
              />
            </div>

            {/* Status */}
            <div className="md:col-span-2">
              <label className="block text-sm font-semibold text-slate-700 mb-2">
                Project Status
              </label>
              <div className="flex gap-3">
                {statusOptions.map(option => (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() => setForm({ ...form, status: option.value })}
                    className={`flex-1 px-4 py-3 rounded-xl font-medium transition-all ${
                      form.status === option.value
                        ? `${option.color} border-2 border-current`
                        : "bg-slate-100 text-slate-600 border-2 border-transparent hover:bg-slate-200"
                    }`}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Address */}
            <div className="md:col-span-2">
              <label className="block text-sm font-semibold text-slate-700 mb-2">
                <MapPin className="w-4 h-4 inline mr-2" />
                Business Address
              </label>
              <input
                type="text"
                placeholder="Full address with city and state"
                value={form.address}
                onChange={e => setForm({ ...form, address: e.target.value })}
                className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl focus:border-blue-500 focus:ring-4 focus:ring-blue-100 transition-all outline-none"
              />
            </div>

            {/* Phone */}
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">
                <Phone className="w-4 h-4 inline mr-2" />
                Contact Number
              </label>
              <input
                type="tel"
                placeholder="+91 9876543210"
                value={form.phone}
                onChange={e => setForm({ ...form, phone: e.target.value })}
                className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl focus:border-blue-500 focus:ring-4 focus:ring-blue-100 transition-all outline-none"
              />
              <p className="text-xs text-slate-500 mt-1">Required for WhatsApp communications</p>
            </div>

            {/* Email */}
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">
                <Mail className="w-4 h-4 inline mr-2" />
                Email Address
              </label>
              <input
                type="email"
                placeholder="client@example.com"
                value={form.email}
                onChange={e => setForm({ ...form, email: e.target.value })}
                className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl focus:border-blue-500 focus:ring-4 focus:ring-blue-100 transition-all outline-none"
              />
              <p className="text-xs text-slate-500 mt-1">Required for email proposals</p>
            </div>

            {/* Website Needs */}
            <div className="md:col-span-2">
              <label className="block text-sm font-semibold text-slate-700 mb-2">
                <Globe className="w-4 h-4 inline mr-2" />
                Website Requirements
              </label>
              <input
                type="text"
                placeholder="E-commerce, Blog, Booking System, Portfolio (separate with commas)"
                value={form.websiteNeeds}
                onChange={e => setForm({ ...form, websiteNeeds: e.target.value })}
                className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl focus:border-blue-500 focus:ring-4 focus:ring-blue-100 transition-all outline-none"
              />
              <p className="text-xs text-slate-500 mt-1">Enter multiple requirements separated by commas</p>
            </div>

            {/* Service Cost */}
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">
                <IndianRupee className="w-4 h-4 inline mr-2" />
                Service Cost (₹)
              </label>
              <input
                type="number"
                placeholder="50000"
                value={form.serviceCost}
                onChange={e => setForm({ ...form, serviceCost: e.target.value })}
                className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl focus:border-blue-500 focus:ring-4 focus:ring-blue-100 transition-all outline-none"
              />
              <p className="text-xs text-slate-500 mt-1">Enter amount in Indian Rupees</p>
            </div>

            {/* Deadline */}
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">
                <Calendar className="w-4 h-4 inline mr-2" />
                Project Deadline
              </label>
              <input
                type="date"
                value={form.deadline}
                onChange={e => setForm({ ...form, deadline: e.target.value })}
                className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl focus:border-blue-500 focus:ring-4 focus:ring-blue-100 transition-all outline-none"
              />
              <p className="text-xs text-slate-500 mt-1">Expected project completion date</p>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="mt-8 flex flex-col sm:flex-row items-center gap-4">
            <button
              onClick={handleSubmit}
              disabled={isSubmitting}
              className="w-full sm:flex-1 bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-8 py-4 rounded-xl font-semibold shadow-lg hover:shadow-xl hover:from-blue-700 hover:to-indigo-700 transition-all duration-200 transform hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
            >
              {isSubmitting ? "Adding Client..." : "Add Client"}
            </button>
            <button
              type="button"
              onClick={handleReset}
              disabled={isSubmitting}
              className="w-full sm:w-auto px-8 py-4 border-2 border-slate-300 text-slate-700 rounded-xl font-semibold hover:bg-slate-50 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Clear Form
            </button>
          </div>

          {/* Help Text */}
          <div className="mt-6 p-4 bg-blue-50 border-2 border-blue-100 rounded-xl">
            <p className="text-sm text-blue-800">
              <strong>Tip:</strong> Make sure to add phone number and email for better communication. You can send proposals via WhatsApp and Email from the client list.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}