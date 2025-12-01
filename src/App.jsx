import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Sidebar from "./components/Sidebar";
import ClientForm from "./components/ClientForm";
import ClientList from "./components/ClientList";
import './App.css'
import Dashboard from "./components/Dashboard";


export default function App() {
  return (
    <Router>
      <div className="flex min-h-screen bg-slate-50">
        {/* Sidebar */}
        <Sidebar />

        {/* Main Content */}
        <main className="flex-1 p-6 lg:ml-72">
          <Routes>
            <Route path="/" element={
              <div className="grid md:grid-cols-1 gap-6">
                <Dashboard/>
              </div>
            } />

            <Route path="/clients" element={<ClientList />} />
            <Route path="/add-client" element={<ClientForm />} />

            {/* Optional: Add more routes like Reports */}
            {/* <Route path="/reports" element={<Reports />} /> */}
          </Routes>
        </main>
      </div>
    </Router>
  );
}
