"use client";

import { useEffect, useState, use } from "react";
import Link from "next/link";

interface User {
  id: number;
  name: string;
  email: string;
}

interface Ticket {
  id: number;
  ticket_number?: string;
  subject: string;
  description: string;
  status: string;
  priority: string;
  assigned_to?: number | null;
  assignee?: User | null;
  requester?: User | null;
  created_at: string;
}

export default function TicketDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);

  const [ticket, setTicket] = useState<Ticket | null>(null);
  const [engineers, setEngineers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [updatingStatus, setUpdatingStatus] = useState(false);
  const [updatingAssignee, setUpdatingAssignee] = useState(false);

  // State Modal Edit
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [editSubject, setEditSubject] = useState("");
  const [editDescription, setEditDescription] = useState("");
  const [editPriority, setEditPriority] = useState("");
  const [savingEdit, setSavingEdit] = useState(false);

  useEffect(() => {
    fetchData();
  }, [id]);

  async function fetchData() {
    try {
      const token = localStorage.getItem("token");
      const headers = {
        Authorization: `Bearer ${token}`,
        Accept: "application/json",
      };

      // Fetch Detail Tiket
      const resTicket = await fetch(`http://127.0.0.1:8000/api/tickets/${id}`, { headers });
      const dataTicket = await resTicket.json();
      const currentTicket = dataTicket.data || dataTicket;
      setTicket(currentTicket);

      // Pre-fill form edit
      if (currentTicket) {
        setEditSubject(currentTicket.subject || "");
        setEditDescription(currentTicket.description || "");
        setEditPriority(currentTicket.priority || "Medium");
      }

      // Fetch List User/Engineer
      const resUsers = await fetch(`http://127.0.0.1:8000/api/users`, { headers });
      if (resUsers.ok) {
        const dataUsers = await resUsers.json();
        setEngineers(dataUsers.data || dataUsers);
      }
    } catch (err) {
      console.error("Gagal mengambil data:", err);
    } finally {
      setLoading(false);
    }
  }

  // Handler Ubah Status Tiket
  async function handleStatusChange(newStatus: string) {
    if (updatingStatus || !ticket) return;
    setUpdatingStatus(true);

    try {
      const token = localStorage.getItem("token");

      const res = await fetch(`http://127.0.0.1:8000/api/tickets/${id}`, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify({ 
          subject: ticket.subject, 
          description: ticket.description, 
          priority: ticket.priority,
          status: newStatus 
        }),
      });

      const responseData = await res.json().catch(() => null);

      if (res.ok) {
        await fetchData();
      } else {
        console.error("Backend Error:", responseData);
        alert(`Gagal update status (${res.status}): ${responseData?.message || "Periksa server"}`);
      }
    } catch (err) {
      console.error("Network Error:", err);
      alert("Gagal terhubung ke server Backend.");
    } finally {
      setUpdatingStatus(false);
    }
  }

  // Handler Assign Engineer
  async function handleAssigneeChange(userId: string) {
    if (updatingAssignee || !ticket) return;
    setUpdatingAssignee(true);

    try {
      const token = localStorage.getItem("token");

      const res = await fetch(`http://127.0.0.1:8000/api/tickets/${id}`, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify({ 
          subject: ticket.subject,
          description: ticket.description,
          priority: ticket.priority,
          assigned_to: userId ? Number(userId) : null 
        }),
      });

      const responseData = await res.json().catch(() => null);

      if (res.ok) {
        await fetchData();
      } else {
        console.error("Backend Error:", responseData);
        alert(`Gagal assign engineer (${res.status}): ${responseData?.message || "Periksa server"}`);
      }
    } catch (err) {
      console.error("Network Error:", err);
      alert("Gagal terhubung ke server Backend.");
    } finally {
      setUpdatingAssignee(false);
    }
  }

  // Handler Submit Edit Tiket
  async function handleSaveEdit(e: React.FormEvent) {
    e.preventDefault();
    setSavingEdit(true);
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`http://127.0.0.1:8000/api/tickets/${id}`, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify({
          subject: editSubject,
          description: editDescription,
          priority: editPriority,
        }),
      });

      if (res.ok) {
        setIsEditOpen(false);
        fetchData();
      } else {
        alert("Gagal memperbarui tiket.");
      }
    } catch (err) {
      console.error("Error updating ticket:", err);
    } finally {
      setSavingEdit(false);
    }
  }

  if (loading) {
    return <div className="text-center py-10 text-slate-400 text-sm">Memuat detail tiket...</div>;
  }

  if (!ticket) {
    return <div className="text-center py-10 text-slate-500">Tiket tidak ditemukan.</div>;
  }

  return (
    <div className="space-y-6">
      {/* Navigation Back */}
      <div className="flex justify-between items-center">
        <Link href="/tickets" className="text-xs font-semibold text-blue-600 hover:text-blue-700">
          ← Kembali ke Daftar Tiket
        </Link>
        <button
          onClick={() => setIsEditOpen(true)}
          className="px-3.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-semibold transition"
        >
          ✏️ Edit Tiket
        </button>
      </div>

      {/* Header Info Tiket & Actions */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs p-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <span className="text-xs font-semibold text-slate-400">#{ticket.ticket_number || ticket.id}</span>
          <h1 className="text-xl font-bold text-slate-800 mt-0.5">{ticket.subject}</h1>
          <div className="flex items-center gap-3 mt-1.5">
            <span className="text-xs text-slate-400">
              Dibuat oleh: <span className="font-medium text-slate-600">{ticket.requester?.name || "User"}</span>
            </span>
            <span
              className={`px-2 py-0.5 rounded-md text-[10px] font-bold ${
                ticket.priority === "Urgent" || ticket.priority === "High"
                  ? "bg-rose-50 text-rose-600 border border-rose-200/60"
                  : ticket.priority === "Medium"
                  ? "bg-amber-50 text-amber-600 border border-amber-200/60"
                  : "bg-slate-100 text-slate-600"
              }`}
            >
              Priority: {ticket.priority}
            </span>
          </div>
        </div>

        {/* Quick Actions Panel */}
        <div className="flex flex-wrap items-center gap-3 bg-slate-50 p-3 rounded-xl border border-slate-200/60 w-full md:w-auto">
          {/* Status Dropdown */}
          <div className="flex flex-col">
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">
              Status {updatingStatus && "..."}
            </label>
            <select
              value={ticket.status || "Open"}
              disabled={updatingStatus}
              onChange={(e) => handleStatusChange(e.target.value)}
              className="bg-white border border-slate-300 rounded-lg px-3 py-1.5 text-xs font-semibold text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer disabled:opacity-50"
            >
              <option value="Open">Open</option>
              <option value="Assigned">Assigned</option>
              <option value="In Progress">In Progress</option>
              <option value="Resolved">Resolved</option>
              <option value="Closed">Closed</option>
            </select>
          </div>

          {/* Assignee Dropdown */}
          <div className="flex flex-col">
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">
              Assignee {updatingAssignee && "..."}
            </label>
            <select
              value={ticket.assigned_to || ticket.assignee?.id || ""}
              disabled={updatingAssignee}
              onChange={(e) => handleAssigneeChange(e.target.value)}
              className="bg-white border border-slate-300 rounded-lg px-3 py-1.5 text-xs font-semibold text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer disabled:opacity-50"
            >
              <option value="">-- Unassigned --</option>
              {engineers.map((eng) => (
                <option key={eng.id} value={eng.id}>
                  {eng.name}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Section Deskripsi Tiket */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs p-6 space-y-4">
        <h2 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Deskripsi Masalah</h2>
        <div className="p-4 bg-slate-50/50 rounded-xl border border-slate-200/60 text-slate-700 text-sm whitespace-pre-wrap leading-relaxed">
          {ticket.description}
        </div>
      </div>

      {/* MODAL EDIT TICKET */}
      {isEditOpen && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full border border-slate-200 shadow-xl p-6 space-y-5">
            <div className="flex justify-between items-center border-b border-slate-100 pb-3">
              <h3 className="font-bold text-slate-800 text-base">Edit Tiket #{ticket.id}</h3>
              <button
                onClick={() => setIsEditOpen(false)}
                className="text-slate-400 hover:text-slate-600 text-lg leading-none"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveEdit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wider mb-1">
                  Subjek Tiket
                </label>
                <input
                  type="text"
                  required
                  value={editSubject}
                  onChange={(e) => setEditSubject(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 text-slate-800 text-xs focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wider mb-1">
                  Prioritas
                </label>
                <select
                  value={editPriority}
                  onChange={(e) => setEditPriority(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 text-slate-800 text-xs focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="Low">Low</option>
                  <option value="Medium">Medium</option>
                  <option value="High">High</option>
                  <option value="Urgent">Urgent</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wider mb-1">
                  Deskripsi
                </label>
                <textarea
                  rows={4}
                  required
                  value={editDescription}
                  onChange={(e) => setEditDescription(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 text-slate-800 text-xs focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsEditOpen(false)}
                  className="px-4 py-2 rounded-lg text-xs font-semibold text-slate-600 hover:bg-slate-100 transition"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={savingEdit}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-semibold transition disabled:opacity-50"
                >
                  {savingEdit ? "Menyimpan..." : "Simpan Perubahan"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}