"use client";

import { useEffect, useState, use } from "react";
import Link from "next/link";

// Import komponen-komponen pendukung
import CommentForm from "@/components/CommentForm";
import WorklogForm from "@/components/WorklogForm";
import AttachmentForm from "@/components/AttachmentForm";
import TicketTimeline from "@/components/TicketTimeline";

interface User {
  id: number;
  name: string;
  email?: string;
  full_name?: string;
  role?: string; // Tambahkan properti role
}

interface StatusOrPriority {
  id?: number;
  name?: string;
}

interface Ticket {
  id: number;
  ticket_number?: string;
  subject: string;
  description: string;
  status: StatusOrPriority | string;
  priority: StatusOrPriority | string;
  assigned_to?: number | null;
  assignee?: User | null;
  requester?: User | null;
  created_at: string;
}

export default function TicketDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);

  const [ticket, setTicket] = useState<Ticket | null>(null);
  const [engineers, setEngineers] = useState<User[]>([]);
  const [currentUser, setCurrentUser] = useState<User | null>(null); // State User Login
    
  const [loading, setLoading] = useState(true);
  const [updatingStatus, setUpdatingStatus] = useState(false);
  const [updatingAssignee, setUpdatingAssignee] = useState(false);

  // Tab aktif untuk area interaksi
  const [activeTab, setActiveTab] = useState<"comments" | "worklogs" | "attachments">("comments");

  // State Modal Edit
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [editSubject, setEditSubject] = useState("");
  const [editDescription, setEditDescription] = useState("");
  const [editPriority, setEditPriority] = useState("");
  const [savingEdit, setSavingEdit] = useState(false);

// Helper extractor nilai string/objek
// Helper extractor nilai string/objek + Format Capitalize
  const getStatusString = (status: StatusOrPriority | string | undefined): string => {
    if (!status) return "Open";
    
    // 1. Ambil nilai string-nya
    let statusName = typeof status === "object" ? status.name || "Open" : status;
    
    // 2. Normalisasi string (Contoh: "closed" -> "Closed", "in progress" -> "In Progress")
    statusName = statusName.trim();
    if (statusName.toLowerCase() === "closed") return "Closed";
    if (statusName.toLowerCase() === "resolved") return "Resolved";
    if (statusName.toLowerCase() === "in progress" || statusName.toLowerCase() === "in_progress") return "In Progress";
    if (statusName.toLowerCase() === "assigned") return "Assigned";
    if (statusName.toLowerCase() === "open") return "Open";

    return statusName;
  };

  const getPriorityString = (priority: StatusOrPriority | string | undefined): string => {
    if (!priority) return "Medium";
    if (typeof priority === "object") return priority.name || "Medium";
    return priority;
  };

  useEffect(() => {
    // Load instan dari localStorage agar state currentUser langsung terisi tanpa tunggu API
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      try {
        setCurrentUser(JSON.parse(storedUser));
      } catch (e) {
        console.error("Gagal parse user dari localStorage", e);
      }
    }

    fetchData();
  }, [id]);

 async function fetchData() {
    try {
      const token = localStorage.getItem("token");
      const headers = {
        Authorization: `Bearer ${token}`,
        Accept: "application/json",
      };

      // 1. Cek User Login dari localStorage terlebih dahulu
      const storedUser = localStorage.getItem("user");
      if (storedUser) {
        try {
          setCurrentUser(JSON.parse(storedUser));
        } catch (e) {
          console.error("Gagal parse user:", e);
        }
      }

      // 2. Ambil data Tiket
      const resTicket = await fetch(`http://127.0.0.1:8000/api/tickets/${id}`, { headers });
      if (resTicket.ok) {
        const dataTicket = await resTicket.json();
        const currentTicket = dataTicket.data || dataTicket;
        setTicket(currentTicket);

        if (currentTicket) {
          setEditSubject(currentTicket.subject || "");
          setEditDescription(currentTicket.description || "");
          setEditPriority(getPriorityString(currentTicket.priority));
        }
      } else {
        console.error("Gagal mengambil data tiket:", resTicket.status);
      }

      // 3. Ambil data List Users / Engineers
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

// Mapping Nama Status ke status_id Database
  const statusMap: Record<string, number> = {
    "Open": 1,
    "Assigned": 2,
    "In Progress": 3,
    "Resolved": 4,
    "Closed": 5,
  };

  async function handleStatusChange(newStatus: string) {
    if (updatingStatus || !ticket) return;
    setUpdatingStatus(true);

    try {
      const token = localStorage.getItem("token");

      // KIRIM status_id (BUKAN status)
      const payload = {
        subject: ticket.subject,
        description: ticket.description,
        priority: getPriorityString(ticket.priority),
        status_id: statusMap[newStatus] || 1, // Mengirimkan ID status ke PostgreSQL
      };

      const res = await fetch(`http://127.0.0.1:8000/api/tickets/${id}`, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify(payload),
      });

      const responseData = await res.json().catch(() => null);

      if (res.ok) {
        // Update state tiket lokal
        setTicket((prev) => prev ? { ...prev, status_id: statusMap[newStatus], status: newStatus } : prev);
        await fetchData(); // Fetch ulang data dari server
      } else {
        alert(`Gagal update status (${res.status}): ${responseData?.message || "Periksa server"}`);
      }
    } catch (err) {
      console.error("Error handleStatusChange:", err);
      alert("Gagal terhubung ke server Backend.");
    } finally {
      setUpdatingStatus(false);
    }
  }

  async function handleAssigneeChange(userId: string) {
  if (updatingAssignee || !ticket) return;
  setUpdatingAssignee(true);

  try {
    const token = localStorage.getItem("token");
    // Konversi string kosong menjadi null
    const payloadValue = userId === "" ? null : Number(userId);

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
        priority: getPriorityString(ticket.priority),
        assigned_to: payloadValue // Mengirim ID number atau null
      }),
    });

    if (res.ok) {
      await fetchData();
    } else {
      const responseData = await res.json().catch(() => null);
      alert(`Gagal assign engineer: ${responseData?.message || "Periksa server"}`);
    }
  } catch (err) {
    console.error("Error handleAssigneeChange:", err);
    alert("Gagal terhubung ke server Backend.");
  } finally {
    setUpdatingAssignee(false);
  }
}

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

  if (loading) return <div className="text-center py-10 text-slate-400 text-sm">Memuat detail tiket...</div>;
  if (!ticket) return <div className="text-center py-10 text-slate-500">Tiket tidak ditemukan.</div>;

const currentStatus = getStatusString(ticket?.status);
  const currentPriority = getPriorityString(ticket?.priority);

  // Cek Otorisasi: Menggunakan casting 'as any' agar TypeScript tidak merah
  const rawUser = currentUser as any;
  const roleValue = typeof rawUser?.role === 'object' ? rawUser?.role?.name : rawUser?.role;
  const userRole = String(roleValue || "").toUpperCase();
  const roleId = Number(rawUser?.role_id || rawUser?.role?.id || 0);

  const isITStaff = 
    [1, 2, 3, 4].includes(roleId) || 
    ["SUPER_ADMIN", "ADMIN", "AGENT", "SUPERVISOR", "ENGINEER", "TECHNICIAN"].some(r => userRole.includes(r));

  return (
    <div className="space-y-6">
      {/* Navigation Back */}
      <div className="flex justify-between items-center">
        <Link href="/tickets" className="text-xs font-semibold text-blue-600 hover:text-blue-700">
          ← Kembali ke Daftar Tiket
        </Link>
        
        {/* Tombol Edit HANYA tampil jika user adalah Tim IT / Admin */}
        {isITStaff && (
          <button
            onClick={() => setIsEditOpen(true)}
            className="px-3.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-semibold transition cursor-pointer"
          >
            ✏️ Edit Tiket
          </button>
        )}
      </div>

      {/* Header Info Tiket & Actions */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs p-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <span className="text-xs font-semibold text-slate-400">#{ticket.ticket_number || ticket.id}</span>
          <h1 className="text-xl font-bold text-slate-800 mt-0.5">{ticket.subject}</h1>
          <div className="flex items-center gap-3 mt-1.5">
            <span className="text-xs text-slate-400">
              Dibuat oleh: <span className="font-medium text-slate-600">{ticket.requester?.name || ticket.requester?.full_name || "User"}</span>
            </span>
            <span
              className={`px-2 py-0.5 rounded-md text-[10px] font-bold ${
                currentPriority === "Urgent" || currentPriority === "High"
                  ? "bg-rose-50 text-rose-600 border border-rose-200/60"
                  : currentPriority === "Medium"
                  ? "bg-amber-50 text-amber-600 border border-amber-200/60"
                  : "bg-slate-100 text-slate-600"
              }`}
            >
              Priority: {currentPriority}
            </span>
          </div>
        </div>

        {/* Quick Actions Panel: Hanya aktif untuk Tim IT, jika Requester hanya melihat Badge */}
        {isITStaff ? (
          <div className="flex flex-wrap items-center gap-3 bg-slate-50 p-3 rounded-xl border border-slate-200/60 w-full md:w-auto">
            <div className="flex flex-col">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                Status {updatingStatus && "..."}
              </label>
              <select
                value={currentStatus}
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

            <div className="flex flex-col">
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">
              Assignee {updatingAssignee && "..."}
            </label>
            <select
              value={ticket.assigned_to ?? ticket.assignee?.id ?? ""}
              disabled={updatingAssignee}
              onChange={(e) => handleAssigneeChange(e.target.value)}
              className="bg-white border border-slate-300 rounded-lg px-3 py-1.5 text-xs font-semibold text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer disabled:opacity-50"
            >
              <option value="">-- Unassigned --</option>
              {engineers.map((eng) => (
                <option key={eng.id} value={eng.id}>
                  {eng.name || eng.full_name}
                </option>
              ))}
            </select>
          </div>
          </div>
        ) : (
          <div className="flex items-center gap-3 bg-slate-50 px-4 py-2.5 rounded-xl border border-slate-200/60">
            <div className="text-right">
              <span className="text-[10px] block font-bold text-slate-400 uppercase">Status Tiket</span>
              <span className="text-xs font-bold text-blue-600">{currentStatus}</span>
            </div>
            <div className="h-6 w-px bg-slate-200" />
            <div>
              <span className="text-[10px] block font-bold text-slate-400 uppercase">Assignee</span>
              <span className="text-xs font-semibold text-slate-700">
                {ticket.assignee?.name || ticket.assignee?.full_name || "Belum Ditentukan"}
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Grid Layout & Interaksi */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs p-6 space-y-3">
            <h2 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Deskripsi Masalah</h2>
            <div className="p-4 bg-slate-50/50 rounded-xl border border-slate-200/60 text-slate-700 text-sm whitespace-pre-wrap leading-relaxed">
              {ticket.description}
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs p-6 space-y-4">
            <div className="flex border-b border-slate-100 gap-4">
              <button
                onClick={() => setActiveTab("comments")}
                className={`pb-3 text-xs font-bold transition border-b-2 cursor-pointer ${
                  activeTab === "comments"
                    ? "border-blue-600 text-blue-600"
                    : "border-transparent text-slate-400 hover:text-slate-600"
                }`}
              >
                💬 Balas & Komentar
              </button>

              {/* Tab Worklog hanya dapat diakses Tim IT */}
              {isITStaff && (
                <button
                  onClick={() => setActiveTab("worklogs")}
                  className={`pb-3 text-xs font-bold transition border-b-2 cursor-pointer ${
                    activeTab === "worklogs"
                      ? "border-blue-600 text-blue-600"
                      : "border-transparent text-slate-400 hover:text-slate-600"
                  }`}
                >
                  ⏱️ Worklog (Durasi Kerja)
                </button>
              )}

              <button
                onClick={() => setActiveTab("attachments")}
                className={`pb-3 text-xs font-bold transition border-b-2 cursor-pointer ${
                  activeTab === "attachments"
                    ? "border-blue-600 text-blue-600"
                    : "border-transparent text-slate-400 hover:text-slate-600"
                }`}
              >
                📎 Lampiran File
              </button>
            </div>

            {activeTab === "comments" && (
              <CommentForm ticketId={ticket.id.toString()} onCommentAdded={fetchData} />
            )}

            {activeTab === "worklogs" && isITStaff && (
              <WorklogForm ticketId={ticket.id.toString()} onWorklogAdded={fetchData} />
            )}

            {activeTab === "attachments" && (
              <AttachmentForm ticketId={ticket.id} onAttachmentUploaded={fetchData} />
            )}
          </div>
        </div>

        <div className="lg:col-span-1">
          <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs p-6 sticky top-6">
            <h2 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4">Riwayat Aktivitas</h2>
            <TicketTimeline ticket={ticket} />
          </div>
        </div>
      </div>

      {/* MODAL EDIT TICKET */}
      {isEditOpen && isITStaff && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full border border-slate-200 shadow-xl p-6 space-y-5">
            <div className="flex justify-between items-center border-b border-slate-100 pb-3">
              <h3 className="font-bold text-slate-800 text-base">Edit Tiket #{ticket.id}</h3>
              <button
                onClick={() => setIsEditOpen(false)}
                className="text-slate-400 hover:text-slate-600 text-lg leading-none cursor-pointer"
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
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 text-slate-800 text-xs focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer"
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
                  className="px-4 py-2 rounded-lg text-xs font-semibold text-slate-600 hover:bg-slate-100 transition cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={savingEdit}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-semibold transition disabled:opacity-50 cursor-pointer"
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