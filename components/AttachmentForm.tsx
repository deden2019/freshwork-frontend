"use client";

import { useState } from "react";
import { apiFetch } from "@/lib/api";

export default function AttachmentForm({
  ticketId,
  onAttachmentUploaded,
}: {
  ticketId: string | number;
  onAttachmentUploaded: () => void;
}) {
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleUpload(e: React.FormEvent) {
    e.preventDefault();
    if (!file) return;

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
        onAttachmentUploaded();
      } else {
        const data = await res.json();
        setError(data.message || "Gagal mengunggah berkas.");
      }
    } catch (err: any) {
      setError(err.message || "Terjadi kesalahan jaringan.");
    } finally {
      setUploading(false);
    }
  }

  return (
    <form onSubmit={handleUpload} className="mt-3 flex items-center gap-3">
      <input
        type="file"
        onChange={(e) => setFile(e.target.files?.[0] || null)}
        className="block text-sm text-gray-500 file:mr-3 file:rounded-md file:border-0 file:bg-slate-100 file:px-3 file:py-1.5 file:text-sm file:font-semibold file:text-slate-700 hover:file:bg-slate-200"
      />
      <button
        type="submit"
        disabled={!file || uploading}
        className="rounded-md bg-blue-600 px-3 py-1.5 text-xs font-semibold text-white shadow-sm hover:bg-blue-500 disabled:bg-gray-300"
      >
        {uploading ? "Uploading..." : "Upload File"}
      </button>
      {error && <span className="text-xs text-red-500">{error}</span>}
    </form>
  );
}