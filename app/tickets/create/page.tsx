"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { apiFetch } from "../../../lib/api";

export default function CreateTicketPage() {
  const router = useRouter();

  const [subject, setSubject] = useState("");
  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    if (!subject.trim() || !description.trim()) {
      setError("Subject dan Description wajib diisi.");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await apiFetch("/tickets", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          subject,
          description,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        router.push("/tickets");
      } else {
        setError(data.message || "Gagal membuat tiket. Silakan coba lagi.");
      }
    } catch (err: any) {
      setError(err.message || "Terjadi kesalahan jaringan.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={{ maxWidth: "600px", margin: "0 auto", padding: "40px 20px", fontFamily: "sans-serif" }}>
      <h1 style={{ fontSize: "28px", color: "#1a202c", marginBottom: "24px" }}>Create Ticket</h1>

      {error && (
        <div
          style={{
            padding: "12px 16px",
            backgroundColor: "#fff5f5",
            color: "#e53e3e",
            border: "1px solid #fed7d7",
            borderRadius: "6px",
            marginBottom: "20px",
            fontSize: "14px",
          }}
        >
          {error}
        </div>
      )}

      <form
        onSubmit={handleSubmit}
        style={{
          background: "#fff",
          border: "1px solid #e2e8f0",
          borderRadius: "8px",
          padding: "24px",
          boxShadow: "0 1px 3px rgba(0,0,0,0.05)",
          display: "flex",
          flexDirection: "column",
          gap: "20px",
        }}
      >
        <div>
          <label
            htmlFor="subject"
            style={{ display: "block", fontSize: "14px", fontWeight: 600, color: "#4a5568", marginBottom: "6px" }}
          >
            Subject
          </label>
          <input
            id="subject"
            type="text"
            placeholder="Contoh: Printer Rusak / Email Tidak BIsa Login"
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            style={{
              width: "100%",
              padding: "10px 12px",
              fontSize: "14px",
              border: "1px solid #cbd5e0",
              borderRadius: "6px",
              outline: "none",
              boxSizing: "border-box",
            }}
            required
          />
        </div>

        <div>
          <label
            htmlFor="description"
            style={{ display: "block", fontSize: "14px", fontWeight: 600, color: "#4a5568", marginBottom: "6px" }}
          >
            Description
          </label>
          <textarea
            id="description"
            rows={5}
            placeholder="Jelaskan detail permasalahan..."
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            style={{
              width: "100%",
              padding: "10px 12px",
              fontSize: "14px",
              border: "1px solid #cbd5e0",
              borderRadius: "6px",
              outline: "none",
              boxSizing: "border-box",
              resize: "vertical",
            }}
            required
          />
        </div>

        <div style={{ display: "flex", gap: "12px", justifyContent: "flex-end", marginTop: "10px" }}>
          <button
            type="button"
            onClick={() => router.back()}
            style={{
              padding: "10px 18px",
              fontSize: "14px",
              fontWeight: 500,
              color: "#4a5568",
              backgroundColor: "#edf2f7",
              border: "none",
              borderRadius: "6px",
              cursor: "pointer",
            }}
          >
            Batal
          </button>

          <button
            type="submit"
            disabled={loading}
            style={{
              padding: "10px 18px",
              fontSize: "14px",
              fontWeight: 500,
              color: "#fff",
              backgroundColor: loading ? "#a0aec0" : "#3182ce",
              border: "none",
              borderRadius: "6px",
              cursor: loading ? "not-allowed" : "pointer",
            }}
          >
            {loading ? "Menyimpan..." : "Create Ticket"}
          </button>
        </div>
      </form>
    </div>
  );
}