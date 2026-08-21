"use client";

import { useEffect, useState } from "react";

interface DashboardStats {
  total_users: number;
  total_roles: number;
  total_permissions: number;
  total_tickets: number;
  open_tickets: number;
  assigned_tickets: number;
  resolved_tickets: number;
  closed_tickets: number;
  sla_on_time: number;
  response_breached: number;
  resolution_breached: number;
}

export default function DashboardPage() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchStats() {
      try {
        const token = localStorage.getItem("token");
        const res = await fetch("http://127.0.0.1:8000/api/dashboard", {
          headers: {
            Authorization: `Bearer ${token}`,
            Accept: "application/json",
          },
        });
        const data = await res.json();
        setStats(data);
      } catch (err) {
        console.error("Failed to fetch dashboard stats:", err);
      } finally {
        setLoading(false);
      }
    }

    fetchStats();
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center py-20 text-slate-400 font-medium text-sm">
        Memuat data dashboard...
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Title Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-800 tracking-tight">Dashboard Overview</h1>
        <p className="text-slate-500 text-xs mt-1">Ringkasan performa sistem, tiket, dan metrik SLA</p>
      </div>

      {/* Section 1: User & Roles */}
      <section>
        <h2 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">User & Access Management</h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-slate-500">Total Users</p>
              <p className="text-2xl font-bold text-slate-800 mt-1">{stats?.total_users ?? 0}</p>
            </div>
            <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold text-sm">👤</div>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-slate-500">Total Roles</p>
              <p className="text-2xl font-bold text-slate-800 mt-1">{stats?.total_roles ?? 0}</p>
            </div>
            <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold text-sm">🔑</div>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-slate-500">Total Permissions</p>
              <p className="text-2xl font-bold text-slate-800 mt-1">{stats?.total_permissions ?? 0}</p>
            </div>
            <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center font-bold text-sm">🛡️</div>
          </div>
        </div>
      </section>

      {/* Section 2: Ticket Statistics */}
      <section>
        <h2 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">Ticket Statistics</h2>
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-4">
          <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs">
            <p className="text-xs font-medium text-slate-500">Total Tickets</p>
            <p className="text-2xl font-bold text-blue-600 mt-1">{stats?.total_tickets ?? 0}</p>
          </div>

          <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs">
            <p className="text-xs font-medium text-slate-500">Open</p>
            <p className="text-2xl font-bold text-amber-500 mt-1">{stats?.open_tickets ?? 0}</p>
          </div>

          <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs">
            <p className="text-xs font-medium text-slate-500">Assigned</p>
            <p className="text-2xl font-bold text-sky-500 mt-1">{stats?.assigned_tickets ?? 0}</p>
          </div>

          <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs">
            <p className="text-xs font-medium text-slate-500">Resolved</p>
            <p className="text-2xl font-bold text-emerald-500 mt-1">{stats?.resolved_tickets ?? 0}</p>
          </div>

          <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs">
            <p className="text-xs font-medium text-slate-500">Closed</p>
            <p className="text-2xl font-bold text-slate-400 mt-1">{stats?.closed_tickets ?? 0}</p>
          </div>
        </div>
      </section>

      {/* Section 3: SLA Performance */}
      <section>
        <h2 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">SLA Performance</h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-slate-500">SLA On Time</p>
              <p className="text-2xl font-bold text-emerald-600 mt-1">{stats?.sla_on_time ?? 0}</p>
            </div>
            <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold text-sm">⏱️</div>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-slate-500">Response Breached</p>
              <p className="text-2xl font-bold text-rose-600 mt-1">{stats?.response_breached ?? 0}</p>
            </div>
            <div className="w-10 h-10 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center font-bold text-sm">⚠️</div>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-slate-500">Resolution Breached</p>
              <p className="text-2xl font-bold text-rose-600 mt-1">{stats?.resolution_breached ?? 0}</p>
            </div>
            <div className="w-10 h-10 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center font-bold text-sm">🚨</div>
          </div>
        </div>
      </section>
    </div>
  );
}