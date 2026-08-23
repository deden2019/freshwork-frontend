"use client";

import { useEffect, useState } from "react";
import { apiFetch } from "../../../lib/api";

type Category = {
  id: number;
  name: string;
  description?: string;
  parent_id?: number | null;
  children?: Category[];
};

export default function ManageCategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [flatCategories, setFlatCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  // Form State
  const [editingId, setEditingId] = useState<number | null>(null);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [parentId, setParentId] = useState<string>("");

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [resTree, resFlat] = await Promise.all([
        apiFetch("/ticket-categories"),
        apiFetch("/ticket-categories/list-all"),
      ]);

      if (resTree.ok && resFlat.ok) {
        setCategories(await resTree.json());
        setFlatCategories(await resFlat.json());
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleResetForm = () => {
    setEditingId(null);
    setName("");
    setDescription("");
    setParentId("");
  };

  const handleEdit = (cat: Category) => {
    setEditingId(cat.id);
    setName(cat.name);
    setDescription(cat.description || "");
    setParentId(cat.parent_id ? String(cat.parent_id) : "");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // PERBAIKAN: Pastikan parent_id bernilai null jika string kosong ("")
    const payload = {
      name,
      description,
      parent_id: parentId !== "" ? Number(parentId) : null,
    };

    const url = editingId ? `/ticket-categories/${editingId}` : "/ticket-categories";
    const method = editingId ? "PUT" : "POST";

    try {
      const res = await apiFetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        handleResetForm();
        fetchData();
      } else {
        const errorData = await res.json().catch(() => ({}));
        alert(`Gagal: ${errorData.message || "Gagal menyimpan data kategori."}`);
      }
    } catch (err) {
      console.error(err);
      alert("Terjadi kesalahan koneksi.");
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Yakin ingin menghapus kategori ini beserta sub-kategorinya?")) return;

    const res = await apiFetch(`/ticket-categories/${id}`, { method: "DELETE" });
    if (res.ok) {
      fetchData();
    } else {
      alert("Gagal menghapus kategori.");
    }
  };

  return (
    <div style={{ padding: "30px", fontFamily: "sans-serif", backgroundColor: "#f8fafc", minHeight: "100vh" }}>
      <h1 style={{ fontSize: "24px", fontWeight: "bold", color: "#1e293b", marginBottom: "20px" }}>
        Manajemen Kategori Ticket (Admin)
      </h1>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 2fr", gap: "24px" }}>
        {/* Form Add / Edit */}
        <div style={{ backgroundColor: "#fff", padding: "20px", borderRadius: "8px", border: "1px solid #e2e8f0" }}>
          <h2 style={{ fontSize: "16px", fontWeight: "bold", marginBottom: "16px" }}>
            {editingId ? "Edit Kategori" : "Tambah Kategori Baru"}
          </h2>
          <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
            <div>
              <label style={{ fontSize: "13px", fontWeight: 600 }}>Nama Kategori</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                style={{ width: "100%", padding: "8px", border: "1px solid #cbd5e1", borderRadius: "6px", marginTop: "4px" }}
              />
            </div>

            <div>
              <label style={{ fontSize: "13px", fontWeight: 600 }}>Induk Kategori (Parent)</label>
              <select
                value={parentId}
                onChange={(e) => setParentId(e.target.value)}
                style={{ width: "100%", padding: "8px", border: "1px solid #cbd5e1", borderRadius: "6px", marginTop: "4px" }}
              >
                <option value="">-- Kategori Utama (No Parent) --</option>
                {/* PERBAIKAN: Hanya tampilkan kategori utama (tanpa parent_id) sebagai opsi induk */}
                {flatCategories
                  .filter((cat) => !cat.parent_id && cat.id !== editingId)
                  .map((cat) => (
                    <option key={cat.id} value={cat.id}>
                      {cat.name}
                    </option>
                  ))}
              </select>
            </div>

            <div>
              <label style={{ fontSize: "13px", fontWeight: 600 }}>Deskripsi</label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={3}
                style={{ width: "100%", padding: "8px", border: "1px solid #cbd5e1", borderRadius: "6px", marginTop: "4px" }}
              />
            </div>

            <div style={{ display: "flex", gap: "8px", marginTop: "8px" }}>
              <button
                type="submit"
                style={{ flex: 1, padding: "8px", backgroundColor: "#2563eb", color: "#fff", border: "none", borderRadius: "6px", cursor: "pointer" }}
              >
                {editingId ? "Update" : "Simpan"}
              </button>
              {editingId && (
                <button
                  type="button"
                  onClick={handleResetForm}
                  style={{ padding: "8px", backgroundColor: "#e2e8f0", color: "#475569", border: "none", borderRadius: "6px", cursor: "pointer" }}
                >
                  Batal
                </button>
              )}
            </div>
          </form>
        </div>

        {/* List Data Table */}
        <div style={{ backgroundColor: "#fff", padding: "20px", borderRadius: "8px", border: "1px solid #e2e8f0" }}>
          <h2 style={{ fontSize: "16px", fontWeight: "bold", marginBottom: "16px" }}>Daftar Kategori</h2>

          {loading ? (
            <p>Memuat data...</p>
          ) : (
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "14px" }}>
              <thead>
                <tr style={{ borderBottom: "2px solid #e2e8f0", textAlign: "left" }}>
                  <th style={{ padding: "8px" }}>Kategori</th>
                  <th style={{ padding: "8px" }}>Deskripsi</th>
                  <th style={{ padding: "8px", textAlign: "right" }}>Aksi</th>
                </tr>
              </thead>
              <tbody>
                {categories.map((parent) => (
                  <tr key={`group-${parent.id}`} style={{ borderBottom: "1px solid #f1f5f9" }}>
                    <td colSpan={3} style={{ padding: 0 }}>
                      <table style={{ width: "100%", borderCollapse: "collapse" }}>
                        <tbody>
                          {/* Baris Kategori Utama */}
                          <tr style={{ backgroundColor: "#f8fafc", fontWeight: "bold" }}>
                            <td style={{ padding: "10px 8px" }}>📁 {parent.name}</td>
                            <td style={{ padding: "10px 8px", color: "#64748b" }}>{parent.description || "-"}</td>
                            <td style={{ padding: "10px 8px", textAlign: "right" }}>
                              <button onClick={() => handleEdit(parent)} style={{ marginRight: "8px", color: "#2563eb", border: "none", background: "none", cursor: "pointer" }}>Edit</button>
                              <button onClick={() => handleDelete(parent.id)} style={{ color: "#ef4444", border: "none", background: "none", cursor: "pointer" }}>Hapus</button>
                            </td>
                          </tr>
                          {/* Baris Sub-Kategori */}
                          {parent.children?.map((child) => (
                            <tr key={`c-${child.id}`} style={{ borderTop: "1px solid #f1f5f9" }}>
                              <td style={{ padding: "8px 8px 8px 28px", color: "#334155" }}>└─ 📄 {child.name}</td>
                              <td style={{ padding: "8px", color: "#64748b" }}>{child.description || "-"}</td>
                              <td style={{ padding: "8px", textAlign: "right" }}>
                                <button onClick={() => handleEdit(child)} style={{ marginRight: "8px", color: "#2563eb", border: "none", background: "none", cursor: "pointer" }}>Edit</button>
                                <button onClick={() => handleDelete(child.id)} style={{ color: "#ef4444", border: "none", background: "none", cursor: "pointer" }}>Hapus</button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}