"use client";

import { useState, useEffect } from "react";

interface User {
  id: number;
  name: string;
  role?: string;
}

interface CommentFormProps {
  ticketId: string;
  onCommentAdded: () => void;
}

export default function CommentForm({ ticketId, onCommentAdded }: CommentFormProps) {
  const [comment, setComment] = useState("");
  const [isInternal, setIsInternal] = useState(false); // Catatan Internal IT
  const [submitting, setSubmitting] = useState(false);
  const [currentUser, setCurrentUser] = useState<User | null>(null);

  useEffect(() => {
    // Ambil data user login
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      try {
        setCurrentUser(JSON.parse(storedUser));
      } catch (e) {
        console.error(e);
      }
    }
  }, []);

  const userRole = (currentUser?.role || "").toLowerCase();
  const isITStaff =
    userRole.includes("admin") ||
    userRole.includes("it") ||
    userRole.includes("engineer") ||
    userRole.includes("technician");

  async function handleSubmit(e: React.FormEvent, newStatus?: string) {
    e.preventDefault();
    if (!comment.trim()) return;

    setSubmitting(true);
    try {
      const token = localStorage.getItem("token");
      const headers = {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
        Accept: "application/json",
      };

      // 1. Kirim Komentar / Catatan
      const resComment = await fetch(`http://127.0.0.1:8000/api/tickets/${ticketId}/comments`, {
        method: "POST",
        headers,
        body: JSON.stringify({
          comment,
          is_internal: isInternal, // flag khusus jika pesan hanya internal IT
        }),
      });

      // 2. Jika Admin/IT memilih balasan beserta perubahan status (misal: Resolve)
      if (resComment.ok && newStatus) {
        await fetch(`http://127.0.0.1:8000/api/tickets/${ticketId}`, {
          method: "PUT",
          headers,
          body: JSON.stringify({ status: newStatus }),
        });
      }

      if (resComment.ok) {
        setComment("");
        setIsInternal(false);
        onCommentAdded();
      } else {
        alert("Gagal mengirim balasan.");
      }
    } catch (err) {
      console.error(err);
      alert("Terjadi kesalahan koneksi.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={(e) => handleSubmit(e)} className="space-y-4 pt-2">
      {/* Tampilan Toggle Catatan Internal khusus IT */}
      {isITStaff && (
        <div className="flex items-center gap-4 bg-slate-50 p-2.5 rounded-xl border border-slate-200/80 text-xs font-semibold">
          <label className="flex items-center gap-2 cursor-pointer text-slate-700">
            <input
              type="radio"
              name="comment_type"
              checked={!isInternal}
              onChange={() => setIsInternal(false)}
              className="text-blue-600 focus:ring-blue-500"
            />
            💬 Balasan Publik (Terlihat User)
          </label>
          <label className="flex items-center gap-2 cursor-pointer text-amber-700">
            <input
              type="radio"
              name="comment_type"
              checked={isInternal}
              onChange={() => setIsInternal(true)}
              className="text-amber-600 focus:ring-amber-500"
            />
            🔒 Catatan Internal IT (Hanya Tim IT)
          </label>
        </div>
      )}

      <div>
        <textarea
          rows={3}
          required
          placeholder={
            isInternal
              ? "Tulis catatan rahasia/internal antar engineer di sini..."
              : "Tulis balasan untuk requester..."
          }
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          className={`w-full p-3 text-xs rounded-xl border focus:outline-none focus:ring-2 transition ${
            isInternal
              ? "bg-amber-50/30 border-amber-200 focus:ring-amber-500 text-amber-900"
              : "bg-white border-slate-200 focus:ring-blue-500 text-slate-800"
          }`}
        />
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3">
        {/* Tombol aksi cepat khusus Admin/IT Engineer */}
        {isITStaff ? (
          <div className="flex items-center gap-2">
            <button
              type="button"
              disabled={submitting || !comment.trim()}
              onClick={(e) => handleSubmit(e, "In Progress")}
              className="px-3 py-1.5 bg-amber-50 hover:bg-amber-100 text-amber-700 border border-amber-200/60 text-xs font-semibold rounded-lg transition disabled:opacity-50 cursor-pointer"
            >
              Balas & Set "In Progress"
            </button>
            <button
              type="button"
              disabled={submitting || !comment.trim()}
              onClick={(e) => handleSubmit(e, "Resolved")}
              className="px-3 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200/60 text-xs font-semibold rounded-lg transition disabled:opacity-50 cursor-pointer"
            >
              Balas & Solve Tiket
            </button>
          </div>
        ) : (
          <div />
        )}

        {/* Tombol Kirim Standar */}
        <button
          type="submit"
          disabled={submitting || !comment.trim()}
          className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs rounded-lg transition disabled:opacity-50 cursor-pointer"
        >
          {submitting ? "Mengirim..." : "Kirim Balasan"}
        </button>
      </div>
    </form>
  );
}