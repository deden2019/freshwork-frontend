"use client";

import { useEffect, useState, useMemo } from "react";
import Link from "next/link";

interface User {
  id: number;
  name: string;
  full_name?: string;
}

interface StatusOrPriority {
  id: number;
  name: string;
}

interface Ticket {
  id: number;
  ticket_number?: string;
  subject: string;
  status?: StatusOrPriority | string;
  priority?: StatusOrPriority | string;
  assignee?: User | null;
  requester?: User | null;
  created_at: string;
}

export default function TicketsPage() {
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(true);

  // State untuk Search & Filter
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("ALL");
  const [selectedPriority, setSelectedPriority] = useState("ALL");

  useEffect(() => {
    async function fetchTickets() {
      try {
        const token = localStorage.getItem("token");
        const res = await fetch("http://127.0.0.1:8000/api/tickets", {
          headers: {
            Authorization: `Bearer ${token}`,
            Accept: "application/json",
          },
        });
        const data = await res.json();
        setTickets(Array.isArray(data) ? data : data.data || []);
      } catch (err) {
        console.error("Gagal mengambil data tiket:", err);
      } finally {
        setLoading(false);
      }
    }

    fetchTickets();
  }, []);

  // Helper untuk membaca nama status/priority baik berbentuk Objek maupun String
  const getStatusName = (status: StatusOrPriority | string | undefined) => {
    if (!status) return "Open";
    return typeof status === "object" ? status.name : status;
  };

  const getPriorityName = (priority: StatusOrPriority | string | undefined) => {
    if (!priority) return "Low";
    return typeof priority === "object" ? priority.name : priority;
  };

  // Filter logika di sisi client
  const filteredTickets = useMemo(() => {
    return tickets.filter((ticket) => {
      const statusName = getStatusName(ticket.status);
      const priorityName = getPriorityName(ticket.priority);
      const requesterName = ticket.requester?.name || ticket.requester?.full_name || "";

      // 1. Filter Search
      const matchesSearch =
        ticket.subject.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (ticket.ticket_number &&
          ticket.ticket_number.toLowerCase().includes(searchQuery.toLowerCase())) ||
        requesterName.toLowerCase().includes(searchQuery.toLowerCase());

      // 2. Filter Status
      const matchesStatus =
        selectedStatus === "ALL" ||
        statusName.toLowerCase() === selectedStatus.toLowerCase();

      // 3. Filter Priority
      const matchesPriority =
        selectedPriority === "ALL" ||
        priorityName.toLowerCase() === selectedPriority.toLowerCase();

      return matchesSearch && matchesStatus && matchesPriority;
    });
  }, [tickets, searchQuery, selectedStatus, selectedPriority]);

  return (
    <div className="space-y-6">
      {/* Header & Create Button */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 tracking-tight">Daftar Tiket</h1>
          <p className="text-slate-500 text-xs mt-1">Kelola dan pantau semua tiket bantuan IT</p>
        </div>
        <Link
          href="/tickets/create"
          className="inline-flex items-center justify-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-semibold shadow-md shadow-blue-500/20 transition duration-200"
        >
          + Buat Tiket Baru
        </Link>
      </div>

      {/* Control Bar: Search & Filter Inputs */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col sm:flex-row gap-3 items-center justify-between">
        {/* Search Input */}
        <div className="relative w-full sm:w-80">
          <input
            type="text"
            placeholder="Cari nomor tiket, subjek, requester..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition"
          />
          <span className="absolute left-3 top-2.5 text-slate-400 text-xs">🔍</span>
        </div>

        {/* Filter Dropdowns */}
        <div className="flex items-center gap-3 w-full sm:w-auto">
          {/* Status Filter */}
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <span className="text-xs text-slate-400 font-medium hidden sm:inline">Status:</span>
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="w-full sm:w-auto bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500/20 cursor-pointer"
            >
              <option value="ALL">Semua Status</option>
              <option value="Open">Open</option>
              <option value="Assigned">Assigned</option>
              <option value="In Progress">In Progress</option>
              <option value="Resolved">Resolved</option>
              <option value="Closed">Closed</option>
            </select>
          </div>

          {/* Priority Filter */}
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <span className="text-xs text-slate-400 font-medium hidden sm:inline">Prioritas:</span>
            <select
              value={selectedPriority}
              onChange={(e) => setSelectedPriority(e.target.value)}
              className="w-full sm:w-auto bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500/20 cursor-pointer"
            >
              <option value="ALL">Semua Prioritas</option>
              <option value="Low">Low</option>
              <option value="Medium">Medium</option>
              <option value="High">High</option>
              <option value="Urgent">Urgent</option>
            </select>
          </div>
        </div>
      </div>

      {/* Ticket Table */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
        {loading ? (
          <div className="text-center py-12 text-slate-400 text-xs">Memuat daftar tiket...</div>
        ) : filteredTickets.length === 0 ? (
          <div className="text-center py-12 text-slate-400 text-xs">
            Tidak ada tiket yang sesuai dengan kriteria pencarian/filter.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50/70 border-b border-slate-200/80 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                  <th className="py-3.5 px-4">No. Tiket</th>
                  <th className="py-3.5 px-4">Subjek</th>
                  <th className="py-3.5 px-4">Requester</th>
                  <th className="py-3.5 px-4">Assignee</th>
                  <th className="py-3.5 px-4">Prioritas</th>
                  <th className="py-3.5 px-4">Status</th>
                  <th className="py-3.5 px-4 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs text-slate-700">
                {filteredTickets.map((ticket) => {
                  const statusName = getStatusName(ticket.status);
                  const priorityName = getPriorityName(ticket.priority);

                  return (
                    <tr key={ticket.id} className="hover:bg-slate-50/50 transition duration-150">
                      <td className="py-3.5 px-4 font-mono font-medium text-slate-500">
                        #{ticket.ticket_number || ticket.id}
                      </td>
                      <td className="py-3.5 px-4 font-semibold text-slate-800 max-w-xs truncate">
                        {ticket.subject}
                      </td>
                      <td className="py-3.5 px-4 text-slate-600">
                        {ticket.requester?.name || ticket.requester?.full_name || "-"}
                      </td>
                      <td className="py-3.5 px-4 text-slate-600">
                        {ticket.assignee?.name || ticket.assignee?.full_name || (
                          <span className="text-slate-400 italic">Unassigned</span>
                        )}
                      </td>
                      <td className="py-3.5 px-4">
                        <span
                          className={`inline-block px-2 py-0.5 rounded-md text-[10px] font-bold ${
                            priorityName === "Urgent" || priorityName === "High"
                              ? "bg-rose-50 text-rose-600 border border-rose-200/60"
                              : priorityName === "Medium"
                              ? "bg-amber-50 text-amber-600 border border-amber-200/60"
                              : "bg-slate-100 text-slate-600"
                          }`}
                        >
                          {priorityName}
                        </span>
                      </td>
                      <td className="py-3.5 px-4">
                        <span
                          className={`inline-block px-2.5 py-1 rounded-lg text-[10px] font-bold ${
                            statusName === "Open"
                              ? "bg-amber-50 text-amber-600 border border-amber-200/60"
                              : statusName === "Assigned" || statusName === "In Progress"
                              ? "bg-blue-50 text-blue-600 border border-blue-200/60"
                              : statusName === "Resolved"
                              ? "bg-emerald-50 text-emerald-600 border border-emerald-200/60"
                              : "bg-slate-100 text-slate-500"
                          }`}
                        >
                          {statusName}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <Link
                          href={`/tickets/${ticket.id}`}
                          className="inline-block px-3 py-1 bg-slate-100 hover:bg-blue-600 hover:text-white text-slate-600 rounded-lg text-[11px] font-medium transition duration-150"
                        >
                          Detail
                        </Link>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}