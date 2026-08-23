"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { apiFetch } from "@/lib/api";

export default function AgentDashboard({ user }: { user: any }) {
  const [stats, setStats] = useState({
    open: 0,
    assigned: 0,
    inProgress: 0,
    resolved: 0,
    closed: 0,
    priorityUrgent: 0,
    priorityHigh: 0,
    priorityMedium: 0,
    priorityLow: 0,
    myAssigned: 0,
    unassigned: 0,
    slaNearBreach: 0,
    slaBreached: 0,
  });

  const [agentWorkload, setAgentWorkload] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(true);

  const currentUserId = user?.id;

  const getCleanStatus = (status: any): string => {
    if (!status) return "";
    let str = typeof status === "string" ? status : status.name || status.title || String(status);
    return str.toUpperCase().replace(/[\s_]+/g, "");
  };

  const getCleanPriority = (priority: any): string => {
    if (!priority) return "";
    let str = typeof priority === "string" ? priority : priority.name || String(priority);
    return str.toUpperCase().replace(/[\s_]+/g, "");
  };

  useEffect(() => {
    async function fetchAgentData() {
      try {
        const res = await apiFetch("/tickets");
        if (res.ok) {
          const data = await res.json();
          const ticketList: any[] = Array.isArray(data) ? data : data.data || [];

          let open = 0, assigned = 0, inProgress = 0, resolved = 0, closed = 0;
          let pUrgent = 0, pHigh = 0, pMedium = 0, pLow = 0;
          let myAssigned = 0, unassigned = 0, nearBreach = 0, breached = 0;

          const workloadMap: Record<string, number> = {};
          const now = new Date().getTime();

          ticketList.forEach((t) => {
            const st = getCleanStatus(t.status);
            const pr = getCleanPriority(t.priority);
            const isFinished = ["RESOLVED", "CLOSED"].includes(st);

            // Status Utama
            if (st === "OPEN") open++;
            else if (st === "ASSIGNED") assigned++;
            else if (st === "INPROGRESS") inProgress++;
            else if (st === "RESOLVED") resolved++;
            else if (st === "CLOSED") closed++;

            // Prioritas
            if (["URGENT", "CRITICAL"].includes(pr)) pUrgent++;
            else if (pr === "HIGH") pHigh++;
            else if (pr === "MEDIUM") pMedium++;
            else pLow++;

            // Tiket Saya, Unassigned & Workload
            const assigneeId = t.assignee_id || t.assigned_to || t.assignee?.id;
            const agentName = t.assignee?.full_name || t.assignee?.name || t.assignee_name;

            if (!isFinished) {
              if (assigneeId === currentUserId) myAssigned++;
              if (!assigneeId) unassigned++;
              if (agentName) workloadMap[agentName] = (workloadMap[agentName] || 0) + 1;
            }

            // SLA Calculations
            if (!isFinished && t.sla_due_at) {
              const dueDate = new Date(t.sla_due_at).getTime();
              const diffHours = (dueDate - now) / (1000 * 60 * 60);

              if (diffHours < 0) breached++;
              else if (diffHours <= 2) nearBreach++;
            }
          });

          setStats({
            open, assigned, inProgress, resolved, closed,
            priorityUrgent: pUrgent,
            priorityHigh: pHigh,
            priorityMedium: pMedium,
            priorityLow: pLow,
            myAssigned,
            unassigned,
            slaNearBreach: nearBreach,
            slaBreached: breached,
          });

          setAgentWorkload(workloadMap);
        }
      } catch (err) {
        console.error("Gagal memuat data workspace agent:", err);
      } finally {
        setLoading(false);
      }
    }

    fetchAgentData();
  }, [currentUserId]);

  return (
    <div className="space-y-6">
      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">Workspace Agent & IT Support</h2>
          <p className="text-slate-500 text-sm mt-1">
            Pantau status tiket, antrean pengerjaan, performa SLA, dan tingkat prioritas.
          </p>
        </div>
        <Link
          href="/tickets"
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2.5 rounded-xl text-xs font-semibold transition shadow"
        >
          Kelola Tiket &rarr;
        </Link>
      </div>

      {/* 1. Status Utama Tiket */}
      <div>
        <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">1. Status Utama Tiket</h3>
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

      {/* 2. Performa SLA & Antrean */}
      <div>
        <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">2. Performa SLA & Antrean</h3>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
            <p className="text-xs font-semibold text-slate-400 uppercase">Tiket Saya (Assigned)</p>
            <p className="text-3xl font-bold text-blue-600 mt-2">{loading ? "..." : stats.myAssigned}</p>
          </div>
          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
            <p className="text-xs font-semibold text-slate-400 uppercase">Belum Didaulat (Unassigned)</p>
            <p className="text-3xl font-bold text-amber-500 mt-2">{loading ? "..." : stats.unassigned}</p>
          </div>
          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
            <p className="text-xs font-semibold text-slate-400 uppercase">Hampir Overdue (&lt; 2 Jam)</p>
            <p className="text-3xl font-bold text-orange-500 mt-2">{loading ? "..." : stats.slaNearBreach}</p>
          </div>
          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm border-r-4 border-r-rose-600">
            <p className="text-xs font-semibold text-slate-400 uppercase">SLA Breached (Terlambat)</p>
            <p className="text-3xl font-bold text-rose-600 mt-2">{loading ? "..." : stats.slaBreached}</p>
          </div>
        </div>
      </div>

      {/* 3. Prioritas & Beban Kerja */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
          <h3 className="text-sm font-bold text-slate-800 mb-4">Breakdown Prioritas Tiket</h3>
          <div className="grid grid-cols-2 gap-3">
            <div className="p-3 bg-rose-50 rounded-lg border border-rose-100">
              <p className="text-[11px] font-bold text-rose-600 uppercase">Urgent / Critical</p>
              <p className="text-2xl font-bold text-rose-700 mt-1">{loading ? "..." : stats.priorityUrgent}</p>
            </div>
            <div className="p-3 bg-amber-50 rounded-lg border border-amber-100">
              <p className="text-[11px] font-bold text-amber-600 uppercase">High</p>
              <p className="text-2xl font-bold text-amber-700 mt-1">{loading ? "..." : stats.priorityHigh}</p>
            </div>
            <div className="p-3 bg-blue-50 rounded-lg border border-blue-100">
              <p className="text-[11px] font-bold text-blue-600 uppercase">Medium</p>
              <p className="text-2xl font-bold text-blue-700 mt-1">{loading ? "..." : stats.priorityMedium}</p>
            </div>
            <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
              <p className="text-[11px] font-bold text-slate-500 uppercase">Low</p>
              <p className="text-2xl font-bold text-slate-700 mt-1">{loading ? "..." : stats.priorityLow}</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
          <h3 className="text-sm font-bold text-slate-800 mb-3">Beban Kerja Agent / Teknisi</h3>
          {Object.keys(agentWorkload).length === 0 ? (
            <p className="text-xs text-slate-400 py-6 text-center">Tidak ada tiket aktif yang dipegang teknisi saat ini.</p>
          ) : (
            <div className="space-y-2.5 max-h-44 overflow-y-auto pr-1">
              {Object.entries(agentWorkload).map(([agent, count]) => (
                <div key={agent} className="flex justify-between items-center text-xs p-2.5 bg-slate-50 rounded-lg border border-slate-100">
                  <span className="font-semibold text-slate-700">{agent}</span>
                  <span className="px-2.5 py-0.5 bg-blue-100 text-blue-700 rounded-full font-bold">
                    {count} Tiket
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}