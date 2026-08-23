"use client";

import { useEffect, useState } from "react";
import { apiFetch } from "@/lib/api"; // Sesuaikan path jika menggunakan alias @/lib/api

type Department = {
  id: number;
  name: string;
  description?: string;
  created_at?: string;
};

export default function DepartmentsPage() {
  const [departments, setDepartments] = useState<Department[]>([]);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [editingId, setEditingId] = useState<number | null>(null);

  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch List Departemen
  const fetchDepartments = async () => {
    setFetching(true);
    try {
      const res = await apiFetch("/departments");
      if (res.ok) {
        const data = await res.json();
        setDepartments(data);
      }
    } catch (err) {
      console.error("Gagal mengambil data departemen:", err);
    } finally {
      setFetching(false);
    }
  };

  useEffect(() => {
    fetchDepartments();
  }, []);

  const resetForm = () => {
    setName("");
    setDescription("");
    setEditingId(null);
    setError(null);
  };

  // Submit Form (Tambah / Update)
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setError("Nama Departemen wajib diisi.");
      return;
    }

    setLoading(true);
    setError(null);

    const isEdit = editingId !== null;
    const endpoint = isEdit ? `/departments/${editingId}` : "/departments";
    const method = isEdit ? "PUT" : "POST";

    try {
      const res = await apiFetch(endpoint, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, description }),
      });

      if (res.ok) {
        resetForm();
        fetchDepartments();
      } else {
        const data = await res.json();
        setError(data.message || "Gagal menyimpan data.");
      }
    } catch (err: any) {
      setError(err.message || "Terjadi kesalahan koneksi.");
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (dept: Department) => {
    setEditingId(dept.id);
    setName(dept.name);
    setDescription(dept.description || "");
    setError(null);
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Apakah Anda yakin ingin menghapus departemen ini?")) return;

    try {
      const res = await apiFetch(`/departments/${id}`, { method: "DELETE" });
      if (res.ok) {
        fetchDepartments();
      } else {
        alert("Gagal menghapus departemen.");
      }
    } catch (err) {
      console.error("Gagal menghapus:", err);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-800 tracking-tight">
          Manajemen Department / Unit
        </h1>
        <p className="text-xs text-slate-500 mt-1">
          Kelola daftar unit/departemen untuk pilihan dropdown pada form pengajuan ticket
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-start">
        {/* Form Panel */}
        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm">
          <h2 className="text-sm font-bold text-slate-800 mb-4">
            {editingId ? "Edit Department" : "+ Tambah Department"}
          </h2>

          {error && (
            <div className="p-3 bg-red-50 text-red-600 rounded-lg text-xs mb-4 border border-red-100">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Nama Department <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                placeholder="Contoh: Rawat Inap, IT Support"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs focus:ring-2 focus:ring-blue-500 focus:outline-none"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Deskripsi
              </label>
              <textarea
                rows={3}
                placeholder="Keterangan singkat..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs focus:ring-2 focus:ring-blue-500 focus:outline-none"
              />
            </div>

            <div className="flex gap-2 pt-2">
              {editingId && (
                <button
                  type="button"
                  onClick={resetForm}
                  className="flex-1 py-2 px-3 bg-slate-100 text-slate-600 rounded-lg text-xs font-medium hover:bg-slate-200 transition-colors"
                >
                  Batal
                </button>
              )}
              <button
                type="submit"
                disabled={loading}
                className="flex-1 py-2 px-3 bg-blue-600 text-white rounded-lg text-xs font-medium hover:bg-blue-700 transition-colors disabled:opacity-50"
              >
                {loading ? "Menyimpan..." : editingId ? "Update" : "Simpan"}
              </button>
            </div>
          </form>
        </div>

        {/* Table Panel */}
        <div className="md:col-span-2 bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase font-semibold">
              <tr>
                <th className="py-3 px-4 w-16">ID</th>
                <th className="py-3 px-4">Nama Department</th>
                <th className="py-3 px-4">Deskripsi</th>
                <th className="py-3 px-4 text-right w-32">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {fetching ? (
                <tr>
                  <td colSpan={4} className="py-6 text-center text-slate-400">
                    Memuat data...
                  </td>
                </tr>
              ) : departments.length === 0 ? (
                <tr>
                  <td colSpan={4} className="py-6 text-center text-slate-400">
                    Belum ada data department.
                  </td>
                </tr>
              ) : (
                departments.map((dept) => (
                  <tr key={dept.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="py-3 px-4 text-slate-400 font-mono">{dept.id}</td>
                    <td className="py-3 px-4 font-semibold text-slate-800">{dept.name}</td>
                    <td className="py-3 px-4 text-slate-500">{dept.description || "-"}</td>
                    <td className="py-3 px-4 text-right space-x-2">
                      <button
                        onClick={() => handleEdit(dept)}
                        className="text-blue-600 font-semibold hover:underline"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(dept.id)}
                        className="text-red-500 font-semibold hover:underline"
                      >
                        Hapus
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}