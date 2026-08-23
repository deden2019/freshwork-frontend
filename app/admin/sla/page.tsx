"use client";

import { useEffect, useState } from "react";
import { getSLAList, createSLA, updateSLA, SLAConfig } from "@/lib/slaService";

export default function SLAManagementPage() {
  const [slaList, setSlaList] = useState<SLAConfig[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  // Form State
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [priorityName, setPriorityName] = useState<string>("");
  const [responseTimeHours, setResponseTimeHours] = useState<number | string>("");
  const [resolutionTimeHours, setResolutionTimeHours] = useState<number | string>("");

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("token") || "";
      const data = await getSLAList(token);
      setSlaList(data);
    } catch (err) {
      console.error("Gagal mengambil data SLA:", err);
    } finally {
      setLoading(false);
    }
  };

  // Handler Pilih Data untuk Di-edit
  const handleEditClick = (item: SLAConfig) => {
    setSelectedId(item.id);
    setPriorityName(item.priority_name);
    setResponseTimeHours(item.response_time_hours);
    setResolutionTimeHours(item.resolution_time_hours);
    setMessage(null);
  };

  // Reset Form ke Kondisi "Tambah Baru"
  const handleReset = () => {
    setSelectedId(null);
    setPriorityName("");
    setResponseTimeHours("");
    setResolutionTimeHours("");
    setMessage(null);
  };

  // Submit Handler (Bisa Tambah Baru atau Update)
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setMessage(null);

    try {
      const token = localStorage.getItem("token") || "";

      if (selectedId) {
        // Mode Update (Jika sedang memilih item dari tabel)
        await updateSLA(
          selectedId,
          {
            response_time_hours: Number(responseTimeHours),
            resolution_time_hours: Number(resolutionTimeHours),
          },
          token
        );
        setMessage({ type: "success", text: "Aturan SLA berhasil diperbarui!" });
      } else {
        // Mode Tambah Baru (Jika selectedId null)
        await createSLA(
          {
            priority_name: priorityName,
            response_time_hours: Number(responseTimeHours),
            resolution_time_hours: Number(resolutionTimeHours),
          },
          token
        );
        setMessage({ type: "success", text: "Aturan SLA baru berhasil ditambahkan!" });
      }

      handleReset();
      fetchData(); // Refresh data tabel
    } catch (err) {
      setMessage({ type: "error", text: "Gagal menyimpan konfigurasi SLA." });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Title Header */}
      <div>
        <h1 className="text-xl font-bold text-slate-800">Manajemen SLA (Service Level Agreement)</h1>
      </div>

      {/* Grid 2 Kolom (Kiri: Form, Kanan: Tabel) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* KOLOM KIRI: Form Tambah / Edit SLA */}
        <div className="lg:col-span-4 bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm">
          <h2 className="text-sm font-bold text-slate-800 mb-4">
            {selectedId ? `Edit SLA: ${priorityName}` : "Tambah SLA Baru"}
          </h2>

          {message && (
            <div
              className={`p-3 rounded-lg text-xs mb-4 ${
                message.type === "success"
                  ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                  : "bg-rose-50 text-rose-700 border border-rose-200"
              }`}
            >
              {message.text}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Tingkat Prioritas */}
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">
                Tingkat Prioritas
              </label>
              <input
                type="text"
                required
                disabled={!!selectedId} // Hanya disabled saat mode Edit
                placeholder="Contoh: Urgent / Special"
                value={priorityName}
                onChange={(e) => setPriorityName(e.target.value)}
                className="w-full text-xs px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 transition-all disabled:bg-slate-100 disabled:text-slate-500 disabled:cursor-not-allowed"
              />
            </div>

            {/* Batas Respon (Jam) */}
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">
                Batas Respon (Jam)
              </label>
              <input
                type="number"
                step="0.01"
                min="0"
                required
                placeholder="Contoh: 1 atau 0.25"
                value={responseTimeHours}
                onChange={(e) => setResponseTimeHours(e.target.value)}
                className="w-full text-xs px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 transition-all"
              />
            </div>

            {/* Batas Penyelesaian (Jam) */}
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">
                Batas Penyelesaian (Jam)
              </label>
              <input
                type="number"
                step="0.01"
                min="0"
                required
                placeholder="Contoh: 4 atau 24"
                value={resolutionTimeHours}
                onChange={(e) => setResolutionTimeHours(e.target.value)}
                className="w-full text-xs px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 transition-all"
              />
            </div>

            {/* Actions */}
            <div className="pt-2 flex items-center gap-2">
              <button
                type="submit"
                disabled={submitting}
                className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2.5 px-4 rounded-xl text-xs transition-colors shadow-sm disabled:opacity-50"
              >
                {submitting
                  ? "Menyimpan..."
                  : selectedId
                  ? "Simpan Perubahan"
                  : "Simpan SLA Baru"}
              </button>

              {selectedId && (
                <button
                  type="button"
                  onClick={handleReset}
                  className="px-3 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-xl text-xs font-semibold transition-colors"
                >
                  Batal
                </button>
              )}
            </div>
          </form>
        </div>

        {/* KOLOM KANAN: Tabel Daftar SLA */}
        <div className="lg:col-span-8 bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm min-h-[400px]">
          <h2 className="text-sm font-bold text-slate-800 mb-4">Daftar SLA Prioritas</h2>

          {loading ? (
            <div className="py-12 text-center text-xs text-slate-400">Memuat data SLA...</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-200 text-slate-500 text-[11px] font-bold uppercase tracking-wider">
                    <th className="pb-3 px-2">Prioritas</th>
                    <th className="pb-3 px-2">Batas Respon</th>
                    <th className="pb-3 px-2">Batas Penyelesaian</th>
                    <th className="pb-3 px-2 text-right">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-xs">
                  {slaList.map((item) => (
                    <tr key={item.id} className="hover:bg-slate-50/60 transition-colors">
                      <td className="py-3 px-2 font-bold text-slate-800">
                        {item.priority_name}
                      </td>
                      <td className="py-3 px-2 text-slate-600 font-medium">
                        {item.response_time_hours} Jam
                      </td>
                      <td className="py-3 px-2 text-slate-600 font-medium">
                        {item.resolution_time_hours} Jam
                      </td>
                      <td className="py-3 px-2 text-right">
                        <button
                          onClick={() => handleEditClick(item)}
                          className="text-blue-600 hover:text-blue-800 font-semibold mr-3 transition-colors"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => alert("Menghapus aturan SLA standar tidak diperbolehkan.")}
                          className="text-rose-500 hover:text-rose-700 font-semibold transition-colors"
                        >
                          Hapus
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}