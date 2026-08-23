"use client";

import { useEffect, useState } from "react";

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
      <div className="bg-white p-6 rounded-2xl border border-slate-200">
        <h1 className="text-xl font-bold text-slate-800">Workspace Agent</h1>
        <p className="text-xs text-slate-400 mt-1">Antrean pekerjaan dan performa SLA hari ini.</p>

        {/* GRID 4 KARTU STATISTIK */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-6">
          
          {/* 1. Tiket Saya */}
          <div className="p-4 bg-slate-50 border border-slate-200/80 rounded-xl">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
              TIKET SAYA (ASSIGNED)
            </span>
            <span className="text-2xl font-black text-blue-600 mt-2 block">
              {stats?.my_tickets ?? 0}
            </span>
          </div>

          {/* 2. Belum Didaulat */}
          <div className="p-4 bg-slate-50 border border-slate-200/80 rounded-xl">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
              BELUM DIDAULAT (UNASSIGNED)
            </span>
            <span className="text-2xl font-black text-amber-500 mt-2 block">
              {stats?.unassigned_tickets ?? 0}
            </span>
          </div>

          {/* 3. Hampir Overdue */}
          <div className="p-4 bg-slate-50 border border-slate-200/80 rounded-xl">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
              HAMPIR OVERDUE (SLA)
            </span>
            <span className="text-2xl font-black text-rose-500 mt-2 block">
              {stats?.sla_resolution_breached ?? 0}
            </span>
          </div>

          {/* 4. Selesai Hari Ini (PENYESUAIAN KEY KARTU 4) */}
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
    </div>
  );
}