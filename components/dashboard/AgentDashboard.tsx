"use client";

import { useEffect, useState } from "react";
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  PieChart, Pie, Cell, LineChart, Line, Legend 
} from "recharts";

const COLORS = ["#3B82F6", "#10B981", "#F59E0B", "#EF4444", "#8B5CF6"];

export default function AgentDashboard({ user }: { user: any }) {
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchDashboardStats() {
      try {
        const token = localStorage.getItem("token");
        const res = await fetch("http://127.0.0.1:8000/api/dashboard", {
          headers: {
            Authorization: `Bearer ${token}`,
            Accept: "application/json",
          },
        });

        if (res.ok) {
          const data = await res.json();
          setStats(data);
        }
      } catch (err) {
        console.error("Gagal memuat statistik agent:", err);
      } finally {
        setLoading(false);
      }
    }

    fetchDashboardStats();
  }, []);

  if (loading) return <div className="p-4 text-xs text-slate-400">Memuat data agent...</div>;

  return (
    <div className="space-y-6">
      {/* 1. KARTU STATISTIK ATAS (KODE ASLI ANDA) */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200">
        <h1 className="text-xl font-bold text-slate-800">Workspace Agent</h1>
        <p className="text-xs text-slate-400 mt-1">Antrean pekerjaan dan performa SLA hari ini.</p>

        {/* GRID 4 KARTU STATISTIK */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-6">
          
          {/* Tiket Saya */}
          <div className="p-4 bg-slate-50 border border-slate-200/80 rounded-xl">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
              TIKET SAYA (ASSIGNED)
            </span>
            <span className="text-2xl font-black text-blue-600 mt-2 block">
              {stats?.my_tickets ?? 0}
            </span>
          </div>

          {/* Belum Didaulat */}
          <div className="p-4 bg-slate-50 border border-slate-200/80 rounded-xl">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
              BELUM DIDAULAT (UNASSIGNED)
            </span>
            <span className="text-2xl font-black text-amber-500 mt-2 block">
              {stats?.unassigned_tickets ?? 0}
            </span>
          </div>

          {/* Hampir Overdue */}
          <div className="p-4 bg-slate-50 border border-slate-200/80 rounded-xl">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
              HAMPIR OVERDUE (SLA)
            </span>
            <span className="text-2xl font-black text-rose-500 mt-2 block">
              {stats?.sla_resolution_breached ?? 0}
            </span>
          </div>

          {/* Selesai Hari Ini */}
          <div className="p-4 bg-slate-50 border border-slate-200/80 rounded-xl">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
              SELESAI HARI INI
            </span>
            <span className="text-2xl font-black text-emerald-600 mt-2 block">
              {stats?.completed_today ?? 0}
            </span>
          </div>

        </div>
      </div>

      {/* 2. TAMBAHAN: GRAFIK ANALYTICS ITSM (UNTUK AUDIT MANAJEMEN) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Line Chart Tren Tiket Bulanan */}
        <div className="lg:col-span-2 bg-white p-6 rounded-2xl border border-slate-200">
          <h3 className="text-sm font-bold text-slate-800">Tren Volume Tiket Bulanan</h3>
          <p className="text-xs text-slate-400 mb-4">Perbandingan tiket masuk vs tiket selesai</p>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={stats?.monthly_trends || []}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="month" tick={{ fontSize: 11, fill: "#64748b" }} />
                <YAxis tick={{ fontSize: 11, fill: "#64748b" }} />
                <Tooltip />
                <Legend wrapperStyle={{ fontSize: "12px" }} />
                <Line type="monotone" dataKey="incoming" name="Tiket Masuk" stroke="#3B82F6" strokeWidth={2} />
                <Line type="monotone" dataKey="resolved" name="Tiket Selesai" stroke="#10B981" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Pie Chart Top Kategori */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200">
          <h3 className="text-sm font-bold text-slate-800">Top Kategori Masalah</h3>
          <p className="text-xs text-slate-400 mb-4">Kategori paling sering muncul</p>
          <div className="h-64 w-full flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={stats?.top_categories || []}
                  cx="50%"
                  cy="50%"
                  innerRadius={45}
                  outerRadius={75}
                  paddingAngle={4}
                  dataKey="count"
                  label={(e) => e.name}
                >
                  {(stats?.top_categories || []).map((entry: any, index: number) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Bar Chart Beban Kerja Tim ICT */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200">
        <h3 className="text-sm font-bold text-slate-800">Distribusi Beban Kerja Tim ICT</h3>
        <p className="text-xs text-slate-400 mb-4">Jumlah tiket aktif yang sedang ditangani per agen</p>
        <div className="h-56 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={stats?.agent_workloads || []}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis dataKey="name" tick={{ fontSize: 11, fill: "#64748b" }} />
              <YAxis tick={{ fontSize: 11, fill: "#64748b" }} />
              <Tooltip />
              <Bar dataKey="active_tickets" name="Tiket Aktif" fill="#3B82F6" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

    </div>
  );
}