"use client";

import { useState, useEffect } from "react";
import { apiFetch } from "@/lib/api";

interface Attachment {
  id: number;
  file_name: string;
  file_path: string;
  created_at?: string;
  user?: { name: string };
}

export default function AttachmentForm({
  ticketId,
  onAttachmentUploaded,
}: {
  ticketId: string | number;
  onAttachmentUploaded?: () => void;
}) {
  const [attachments, setAttachments] = useState<Attachment[]>([]);
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // 1. Ambil daftar lampiran dari Backend
  const fetchAttachments = async () => {
    try {
      const res = await apiFetch(`/tickets/${ticketId}/attachments`);
      if (res.ok) {
        const data = await res.json();
        setAttachments(data);
      }
    } catch (err) {
      console.error("Gagal mengambil daftar lampiran:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (ticketId) fetchAttachments();
  }, [ticketId]);

  // 2. Unggah File Baru
  async function handleUpload(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!file || !ticketId) return;

    const formElement = e.currentTarget;
    setUploading(true);
    setError(null);

    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await apiFetch(`/tickets/${ticketId}/attachments`, {
        method: "POST",
        body: formData,
      });

      if (res.ok) {
        setFile(null);
        formElement.reset();
        fetchAttachments(); // Reload daftar lampiran
        if (onAttachmentUploaded) onAttachmentUploaded();
      } else {
        const data = await res.json().catch(() => null);
        setError(data?.message || "Gagal mengunggah berkas.");
      }
    } catch (err: any) {
      setError(err.message || "Terjadi kesalahan jaringan.");
    } finally {
      setUploading(false);
    }
  }

  // URL dasar Laravel Storage
  const getStorageUrl = (path: string) => {
    const baseUrl = process.env.NEXT_PUBLIC_API_URL?.replace("/api", "") || "http://localhost:8000";
    return `${baseUrl}/storage/${path}`;
  };

  return (
    <div className="mt-3 space-y-6">
      {/* FORM UPLOAD */}
      <form onSubmit={handleUpload} className="flex items-center gap-3">
        <input
          type="file"
          onChange={(e) => setFile(e.target.files?.[0] || null)}
          className="block text-sm text-slate-500 file:mr-3 file:rounded-md file:border-0 file:bg-slate-100 file:px-3 file:py-1.5 file:text-xs file:font-semibold file:text-slate-700 hover:file:bg-slate-200 cursor-pointer"
        />
        <button
          type="submit"
          disabled={!file || uploading}
          className="rounded-md bg-blue-600 px-3 py-1.5 text-xs font-semibold text-white shadow-sm hover:bg-blue-500 disabled:bg-gray-300 disabled:cursor-not-allowed cursor-pointer"
        >
          {uploading ? "Uploading..." : "Upload File"}
        </button>
        {error && <span className="text-xs text-red-500">{error}</span>}
      </form>

      {/* DAFTAR FILE TERUNGGAH */}
      <div className="pt-2 border-t border-slate-100">
        <h4 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">
          Lampiran Terunggah ({attachments.length})
        </h4>

        {loading ? (
          <p className="text-xs text-slate-400">Memuat berkas...</p>
        ) : attachments.length === 0 ? (
          <p className="text-xs text-slate-400 italic">Belum ada lampiran di unggah.</p>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {attachments.map((item) => {
              const fileUrl = getStorageUrl(item.file_path);
              const isImage = /\.(jpg|jpeg|png|webp|gif)$/i.test(item.file_name);

              return (
                <a
                  key={item.id}
                  href={fileUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group block border border-slate-200 rounded-lg p-2 bg-white hover:border-blue-400 transition-all"
                >
                  <div className="w-full h-20 rounded bg-slate-100 flex items-center justify-center overflow-hidden mb-2">
                    {isImage ? (
                      <img src={fileUrl} alt={item.file_name} className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
                    ) : (
                      <span className="text-xl">📄</span>
                    )}
                  </div>
                  <p className="text-xs font-medium text-slate-700 truncate group-hover:text-blue-600" title={item.file_name}>
                    {item.file_name}
                  </p>
                </a>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}