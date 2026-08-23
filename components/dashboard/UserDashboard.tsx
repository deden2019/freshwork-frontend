"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { apiFetch } from "@/lib/api";

export default function UserDashboard({ user }: { user: any }) {
  const [stats, setStats] = useState({
    open: 0,
    assigned: 0,
    inProgress: 0,
    resolved: 0,
    closed: 0,
    slaOverdue: 0,
  });
  const [loading, setLoading] = useState(true);

  const displayName = user?.full_name || user?.name || "User";

  // Helper untuk membersihkan status
  const getCleanStatus = (status: any): string => {
    if (!status) return "";
    let str = "";
    if (typeof status === "string") str = status;
    else if (typeof status === "object" && status.name) str = String(status.name);
    else if (typeof status === "object" && status.title) str = String(status.title);
    else str = String(status);

    return str.toUpperCase().replace(/[\s_]+/g, "");
  };

  useEffect(() => {
    async function fetchUserStats() {
      try {
        const res = await apiFetch("/tickets");
        if (res.ok) {
          const data = await res.json();
          const ticketList: any[] = Array.isArray(data) ? data : data.data || [];

          let openCount = 0;
          let assignedCount = 0;
          let inProgressCount = 0;
          let resolvedCount = 0;
          let closedCount = 0;
          let overdueCount = 0;

          const now = new Date();

          ticketList.forEach((t) => {
            const st = getCleanStatus(t.status);

            // Hitung berdasarkan status spesifik
            if (st === "OPEN") openCount++;
            else if (st === "ASSIGNED") assignedCount++;
            else if (st === "INPROGRESS") inProgressCount++;
            else if (st === "RESOLVED") resolvedCount++;
            else if (st === "CLOSED") closedCount++;

            // Hitung Perhitungan SLA (Jika tiket belum selesai dan melewati SLA / due date)
            const isFinished = ["RESOLVED", "CLOSED"].includes(st);
            if (!isFinished && t.sla_due_at) {
              const dueDate = new Date(t.sla_due_at);
              if (dueDate < now) {
                overdueCount++;
              }
            }
          });

          setStats({
            open: openCount,
            assigned: assignedCount,
            inProgress: inProgressCount,
            resolved: resolvedCount,
            closed: closedCount,
            slaOverdue: overdueCount,
          });
        }
      } catch (err) {
        console.error("Gagal mengambil data tiket user:", err);
      } finally {
        setLoading(false);
      }
    }
    fetchUserStats();
  }, []);

  return (
    <div className="space-y-6">
      {/* Banner Utama */}
      <div className="bg-blue-600 rounded-xl p-6 text-white shadow-md flex justify-between items-center">
        <div>
          <h2 className="text-xl font-bold">Halo, {displayName}! 👋</h2>
          <p className="text-blue-100 text-sm mt-1">Ada kendala IT yang perlu kami bantu hari ini?</p>
        </div>
        <Link
          href="/tickets/create"
          className="bg-white text-blue-600 px-4 py-2 rounded-lg text-sm font-semibold hover:bg-blue-50 transition-colors shadow"
        >
          + Buat Tiket Baru
        </Link>
      </div>

      {/* Ringkasan Status Utama Tiket */}
      <div>
        <h3 className="text-sm font-bold text-slate-700 uppercase tracking-wider mb-3">
          Status Tiket
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm border-l-4 border-l-sky-500">
            <p className="text-[11px] font-bold text-slate-400 uppercase">Open</p>
            <p className="text-2xl font-bold text-sky-600 mt-1">{loading ? "..." : stats.open}</p>
          </div>

          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm border-l-4 border-l-purple-500">
            <p className="text-[11px] font-bold text-slate-400 uppercase">Assigned</p>
            <p className="text-2xl font-bold text-purple-600 mt-1">{loading ? "..." : stats.assigned}</p>
          </div>

          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm border-l-4 border-l-blue-500">
            <p className="text-[11px] font-bold text-slate-400 uppercase">In Progress</p>
            <p className="text-2xl font-bold text-blue-600 mt-1">{loading ? "..." : stats.inProgress}</p>
          </div>

          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm border-l-4 border-l-emerald-500">
            <p className="text-[11px] font-bold text-slate-400 uppercase">Resolved</p>
            <p className="text-2xl font-bold text-emerald-600 mt-1">{loading ? "..." : stats.resolved}</p>
          </div>

          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm border-l-4 border-l-slate-400">
            <p className="text-[11px] font-bold text-slate-400 uppercase">Closed</p>
            <p className="text-2xl font-bold text-slate-600 mt-1">{loading ? "..." : stats.closed}</p>
          </div>
        </div>
      </div>

      {/* Ringkasan SLA */}
      <div>
        <h3 className="text-sm font-bold text-slate-700 uppercase tracking-wider mb-3">
          Performa SLA
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-slate-500 uppercase">SLA Overdue (Terlambat)</p>
              <p className="text-xs text-slate-400 mt-0.5">Tiket aktif yang melewatkan batas SLA</p>
            </div>
            <span className={`text-2xl font-bold ${stats.slaOverdue > 0 ? "text-rose-600" : "text-slate-400"}`}>
              {loading ? "..." : stats.slaOverdue}
            </span>
          </div>

          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-slate-500 uppercase">Total Tiket Saya</p>
              <p className="text-xs text-slate-400 mt-0.5">Keseluruhan tiket yang pernah dibuat</p>
            </div>
            <span className="text-2xl font-bold text-slate-800">
              {loading ? "..." : stats.open + stats.assigned + stats.inProgress + stats.resolved + stats.closed}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}