"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { apiFetch } from "../../../lib/api";

type Category = {
  id: number;
  name: string;
  description?: string;
  parent_id?: number | null;
  children?: Category[];
};

type Department = {
  id: number;
  name: string;
};

// Type untuk Dynamic Custom Fields
type CategoryField = {
  id: number;
  field_label: string;
  field_name: string;
  field_type: "text" | "number" | "textarea" | "select" | "date";
  options?: string[] | string;
  is_required: boolean;
  placeholder?: string | null;
};

export default function CreateTicketPage() {
  const router = useRouter();

  // State Data Dinamis
  const [categories, setCategories] = useState<Category[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [selectedParent, setSelectedParent] = useState<Category | null>(null);
  const [selectedChild, setSelectedChild] = useState<Category | null>(null);

  // Dynamic Fields State
  const [customFields, setCustomFields] = useState<CategoryField[]>([]);
  const [customValues, setCustomValues] = useState<{ [key: number]: any }>({});

  // State Form Input
  const [departmentId, setDepartmentId] = useState<string>("");
  const [subject, setSubject] = useState("");
  const [description, setDescription] = useState("");
  const [files, setFiles] = useState<FileList | null>(null); // State Attachment
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch Kategori & Departemen saat halaman dimuat
  useEffect(() => {
    async function fetchData() {
      try {
        // Fetch Categories
        const catRes = await apiFetch("/ticket-categories");
        if (catRes.ok) {
          const catData: Category[] = await catRes.json();
          setCategories(catData);
          if (catData.length > 0) setSelectedParent(catData[0]);
        }

        // Fetch Departments dari tabel 'departments'
        const deptRes = await apiFetch("/departments");
        if (deptRes.ok) {
          const deptData: Department[] = await deptRes.json();
          setDepartments(deptData);
        }
      } catch (err: any) {
        console.error("Gagal mengambil data:", err);
      }
    }
    fetchData();
  }, []);

// Fetch Custom Fields otomatis saat kategori/sub-kategori dipilih
  useEffect(() => {
    const catId = selectedChild?.id || selectedParent?.id;
    if (!catId) {
      setCustomFields([]); // Bersihkan jika tidak ada kategori
      return;
    }

    async function fetchFields() {
      try {
        const res = await apiFetch(`/ticket-categories/${catId}/fields`);
        if (res.ok) {
          const fields: CategoryField[] = await res.json();
          setCustomFields(fields);
          // ❌ HAPUS setCustomValues({}) DARI SINI AGAR TIDAK BENTROK
        }
      } catch (err) {
        console.error("Gagal mengambil custom fields:", err);
      }
    }
    fetchFields();
  }, [selectedChild, selectedParent]);

const handleSelectCard = (child: Category) => {
    setSelectedChild(child);
    setSubject(child.name);
    setCustomFields([]);   // Kosongkan field lama dulu
    setCustomValues({});   // Reset jawaban form di sini
  };

  const handleCustomFieldChange = (fieldId: number, value: any) => {
    setCustomValues((prev) => ({ ...prev, [fieldId]: value }));
  };

  const parseOptions = (opts: any): string[] => {
    if (!opts) return [];
    if (Array.isArray(opts)) return opts;
    try {
      return JSON.parse(opts);
    } catch {
      return [];
    }
  };

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    if (!departmentId) {
      setError("Unit / Departemen wajib dipilih.");
      return;
    }

    if (!subject.trim()) {
      setError("Subject wajib diisi.");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const formData = new FormData();
      
      // Gunakan String() untuk menjamin format text murni
      formData.append("subject", String(subject).trim());
      formData.append("description", String(description).trim() || String(subject).trim());
      formData.append("department_id", String(departmentId));
      
      // Jika backend Laravel memvalidasi field 'title' bukan 'subject', tambahkan juga:
      formData.append("title", String(subject).trim());

      const catId = selectedChild?.id || selectedParent?.id;
      if (catId) {
        formData.append("category_id", String(catId));
      }
      formData.append("status_id", "1");

      if (customValues && Object.keys(customValues).length > 0) {
        formData.append("custom_fields", JSON.stringify(customValues));
      }

      if (files && files.length > 0) {
        Array.from(files).forEach((file) => {
          formData.append("attachments[]", file);
        });
      }

      const response = await apiFetch("/tickets", {
        method: "POST",
        body: formData,
      });

      if (response.ok) {
        router.push("/tickets");
      } else {
        const data = await response.json();
        // Menampilkan pesan error validasi detail dari Laravel jika ada
        if (data.errors) {
          const firstError = Object.values(data.errors)[0] as string[];
          setError(firstError[0] || data.message);
        } else {
          setError(data.message || "Gagal membuat tiket.");
        }
      }
    } catch (err: any) {
      setError(err.message || "Terjadi kesalahan jaringan.");
    } finally {
      setLoading(false);
    }
  }

  const commonInputStyle = {
    width: "100%",
    padding: "10px",
    border: "1px solid #cbd5e1",
    borderRadius: "6px",
    fontSize: "14px",
    boxSizing: "border-box" as const,
  };

  return (
    <div style={{ padding: "30px", fontFamily: "sans-serif", backgroundColor: "#f8fafc", minHeight: "100vh" }}>
      {/* Header */}
      <div style={{ marginBottom: "20px" }}>
        <h1 style={{ fontSize: "24px", fontWeight: "bold", color: "#1e293b", margin: 0 }}>Service Catalog</h1>
        <p style={{ color: "#64748b", fontSize: "14px", marginTop: "4px" }}>
          Browse the list of services offered and raise a request
        </p>
      </div>

      <div style={{ display: "flex", gap: "24px" }}>
        {/* Sidebar Navigasi Kategori */}
        <div style={{ width: "240px", flexShrink: 0, backgroundColor: "#fff", borderRadius: "8px", padding: "16px", border: "1px solid #e2e8f0" }}>
          <div style={{ fontSize: "12px", fontWeight: "bold", color: "#94a3b8", marginBottom: "12px", textTransform: "uppercase" }}>
            Categories
          </div>
          <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
            {categories.map((cat) => (
              <li
                key={cat.id}
                onClick={() => {
                  setSelectedParent(cat);
                  setSelectedChild(null);
                }}
                style={{
                  padding: "10px 12px",
                  borderRadius: "6px",
                  cursor: "pointer",
                  fontSize: "14px",
                  fontWeight: selectedParent?.id === cat.id ? "600" : "400",
                  backgroundColor: selectedParent?.id === cat.id ? "#e0f2fe" : "transparent",
                  color: selectedParent?.id === cat.id ? "#0284c7" : "#334155",
                  marginBottom: "4px",
                  transition: "all 0.2s",
                }}
              >
                📁 {cat.name}
              </li>
            ))}
          </ul>
        </div>

        {/* Konten Utama */}
        <div style={{ flex: 1 }}>
          {/* TAMPILAN 1: GRID CARDS SUB-KATEGORI */}
          {!selectedChild && (
            <div>
              <h2 style={{ fontSize: "14px", fontWeight: "bold", color: "#475569", letterSpacing: "0.5px", textTransform: "uppercase", marginBottom: "16px" }}>
                {selectedParent?.name || "Pilih Kategori"}
              </h2>

              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(240px, 1fr))", gap: "16px" }}>
                {selectedParent?.children && selectedParent.children.length > 0 ? (
                  selectedParent.children.map((item) => (
                    <div
                      key={item.id}
                      onClick={() => handleSelectCard(item)}
                      style={{
                        backgroundColor: "#fff",
                        border: "1px solid #e2e8f0",
                        borderRadius: "8px",
                        padding: "16px",
                        cursor: "pointer",
                        display: "flex",
                        gap: "12px",
                        boxShadow: "0 1px 2px rgba(0,0,0,0.05)",
                        transition: "transform 0.1s, box-shadow 0.2s",
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.transform = "translateY(-2px)";
                        e.currentTarget.style.boxShadow = "0 4px 12px rgba(0,0,0,0.08)";
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.transform = "translateY(0)";
                        e.currentTarget.style.boxShadow = "0 1px 2px rgba(0,0,0,0.05)";
                      }}
                    >
                      <div style={{ width: "40px", height: "40px", borderRadius: "50%", backgroundColor: "#f1f5f9", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                        👤
                      </div>
                      <div>
                        <h3 style={{ fontSize: "14px", fontWeight: "600", color: "#1e293b", margin: "0 0 4px 0" }}>
                          {item.name}
                        </h3>
                        <p style={{ fontSize: "12px", color: "#64748b", margin: 0, lineHeight: "1.4" }}>
                          {item.description || "Klik untuk mengajukan permintaaan"}
                        </p>
                      </div>
                    </div>
                  ))
                ) : (
                  <p style={{ fontSize: "14px", color: "#94a3b8" }}>Tidak ada sub-kategori tersedia.</p>
                )}
              </div>
            </div>
          )}

          {/* TAMPILAN 2: FORM INPUT TICKET */}
          {selectedChild && (
            <div style={{ backgroundColor: "#fff", border: "1px solid #e2e8f0", borderRadius: "8px", padding: "24px" }}>
              <button
                type="button"
                onClick={() => setSelectedChild(null)}
                style={{ background: "none", border: "none", color: "#2563eb", cursor: "pointer", fontSize: "14px", padding: 0, marginBottom: "16px" }}
              >
                ← Kembali ke Pilihan Catalog
              </button>

              <h2 style={{ fontSize: "20px", fontWeight: "bold", color: "#1e293b", marginBottom: "4px" }}>
                Form Pengajuan Ticket
              </h2>
              <p style={{ fontSize: "13px", color: "#64748b", marginBottom: "20px" }}>
                Kategori: <strong>{selectedParent?.name}</strong> &gt; <strong>{selectedChild.name}</strong>
              </p>

              {error && (
                <div style={{ padding: "10px", backgroundColor: "#fef2f2", color: "#ef4444", borderRadius: "6px", fontSize: "14px", marginBottom: "16px" }}>
                  {error}
                </div>
              )}

              <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
  {/* 1. Field Dropdown Unit / Departemen */}
  <div>
    <label style={{ display: "block", fontSize: "14px", fontWeight: 600, color: "#334155", marginBottom: "6px" }}>
      Unit / Departemen <span style={{ color: "#ef4444" }}>*</span>
    </label>
    <select
      value={departmentId}
      onChange={(e) => setDepartmentId(e.target.value)}
      style={{ ...commonInputStyle, backgroundColor: "#fff" }}
      required
    >
      <option value="">-- Pilih Unit / Departemen --</option>
      {departments.map((dept) => (
        <option key={dept.id} value={dept.id}>
          {dept.name}
        </option>
      ))}
    </select>
  </div>

  {/* 2. Field Subject (Otomatis dari Kategori) */}
  <div>
    <label style={{ display: "block", fontSize: "14px", fontWeight: 600, color: "#334155", marginBottom: "6px" }}>
      Subject <span style={{ color: "#ef4444" }}>*</span>
    </label>
    <input
      type="text"
      value={subject}
      onChange={(e) => setSubject(e.target.value)}
      style={commonInputStyle}
      required
    />
  </div>

  {/* 3. ===== CUSTOM FIELDS DARI DATABASE (Tampil Dinamis Sesuai Pengaturan Admin) ===== */}
  {customFields.map((field) => {
    const opts = parseOptions(field.options);
    const customPlaceholder = (field.placeholder && field.placeholder.trim() !== "") 
  ? field.placeholder 
  : `Masukkan ${field.field_label.toLowerCase()}`;

    return (
      <div key={field.id}>
        <label style={{ display: "block", fontSize: "14px", fontWeight: 600, color: "#334155", marginBottom: "6px" }}>
          {field.field_label} {field.is_required && <span style={{ color: "#ef4444" }}>*</span>}
        </label>

        {field.field_type === "textarea" ? (
          <textarea
            rows={3}
            value={customValues[field.id] || ""}
            required={field.is_required}
            onChange={(e) => handleCustomFieldChange(field.id, e.target.value)}
            style={commonInputStyle}
            placeholder={customPlaceholder}
          />
        ) : field.field_type === "select" ? (
          <select
            value={customValues[field.id] || ""}
            required={field.is_required}
            onChange={(e) => handleCustomFieldChange(field.id, e.target.value)}
            style={{ ...commonInputStyle, backgroundColor: "#fff" }}
          >
            <option value="">-- Pilih {field.field_label} --</option>
            {opts.map((opt, i) => (
              <option key={i} value={opt}>
                {opt}
              </option>
            ))}
          </select>
        ) : (
          <input
            type={field.field_type === "number" ? "number" : field.field_type === "date" ? "date" : "text"}
            value={customValues[field.id] || ""}
            required={field.is_required}
            onChange={(e) => handleCustomFieldChange(field.id, e.target.value)}
            style={commonInputStyle}
            placeholder={customPlaceholder}
          />
        )}
      </div>
    );
  })}

  

  {/* 5. Action Buttons */}
  <div style={{ display: "flex", gap: "12px", justifyContent: "flex-end", marginTop: "8px" }}>
    <button
      type="button"
      onClick={() => setSelectedChild(null)}
      style={{ padding: "10px 16px", backgroundColor: "#f1f5f9", color: "#475569", border: "none", borderRadius: "6px", cursor: "pointer" }}
    >
      Batal
    </button>
    <button
      type="submit"
      disabled={loading}
      style={{ padding: "10px 16px", backgroundColor: "#2563eb", color: "#fff", border: "none", borderRadius: "6px", cursor: "pointer", opacity: loading ? 0.7 : 1 }}
    >
      {loading ? "Mengirim..." : "Create Ticket"}
    </button>
  </div>
</form>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}