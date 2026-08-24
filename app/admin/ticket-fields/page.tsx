"use client";

import { useEffect, useState } from "react";

// Mengambil URL Backend Laravel dari env atau fallback ke localhost Laravel
const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000/api";

// Tipe Data untuk Kategori Tiket
// Cari bagian interface TicketCategory di paling atas file page.tsx Anda
interface TicketCategory {
  id: number;
  name: string;
  parent_id?: number | null;
  children?: TicketCategory[]; // <--- TAMBAHKAN BARIS INI
}

// Tipe Data untuk Dynamic Field
interface CategoryField {
  id?: number;
  category_id: number;
  field_label: string;
  field_name: string;
  field_type: "text" | "number" | "select" | "textarea" | "radio";
  options: string[] | null;
  is_required: boolean;
  order_index: number;
}

export default function DynamicFieldsManagementPage() {
  const [categories, setCategories] = useState<TicketCategory[]>([]);
  const [selectedCategoryId, setSelectedCategoryId] = useState<number | "">("");
  const [existingFields, setExistingFields] = useState<CategoryField[]>([]);
  
  const [loadingCategory, setLoadingCategory] = useState<boolean>(false);
  const [loadingFields, setLoadingFields] = useState<boolean>(false);
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  // Form State untuk Tambah Field Baru
  const [fieldLabel, setFieldLabel] = useState<string>("");
  const [fieldName, setFieldName] = useState<string>("");
  const [fieldType, setFieldType] = useState<"text" | "number" | "select" | "textarea" | "radio">("text");
  const [optionsString, setOptionsString] = useState<string>("");
  const [isRequired, setIsRequired] = useState<boolean>(true);
  const [orderIndex, setOrderIndex] = useState<number>(1);

  // 1. Fetch Daftar Kategori Tiket
  useEffect(() => {
    fetchCategories();
  }, []);

  // 2. Fetch Existing Fields jika Category ID Berubah
  useEffect(() => {
    if (selectedCategoryId) {
      fetchCategoryFields(Number(selectedCategoryId));
    } else {
      setExistingFields([]);
    }
  }, [selectedCategoryId]);

  const fetchCategories = async () => {
    setLoadingCategory(true);
    try {
      const token = localStorage.getItem("token") || "";
      // DIBERSIHKAN: Menggunakan URL Laravel
      const res = await fetch(`${API_URL}/ticket-categories`, {
        headers: { 
          Accept: "application/json",
          Authorization: `Bearer ${token}` 
        },
      });
      const result = await res.json();
      // Mengantisipasi jika Laravel mengembalikan { data: [...] } atau array langsung
      setCategories(Array.isArray(result) ? result : result.data || []);
    } catch (err) {
      console.error("Gagal mengambil daftar kategori:", err);
    } finally {
      setLoadingCategory(false);
    }
  };

  const fetchCategoryFields = async (categoryId: number) => {
    setLoadingFields(true);
    try {
      const token = localStorage.getItem("token") || "";
      // DIBERSIHKAN: Menembak endpoint Laravel ticket-fields
      const res = await fetch(`${API_URL}/ticket-fields?category_id=${categoryId}`, {
        headers: { 
          Accept: "application/json",
          Authorization: `Bearer ${token}` 
        },
      });
      const result = await res.json();
      const fieldsData = Array.isArray(result) ? result : result.data || [];
      
      setExistingFields(fieldsData);
      setOrderIndex((fieldsData?.length || 0) + 1);
    } catch (err) {
      console.error("Gagal mengambil data kolom kustom:", err);
    } finally {
      setLoadingFields(false);
    }
  };

  // Auto-generate field_name berdasarkan field_label
  const handleLabelChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setFieldLabel(val);
    const slug = val
      .toLowerCase()
      .replace(/[^a-z0-9]/g, "_")
      .replace(/_+/g, "_")
      .replace(/^_|_$/g, "");
    setFieldName(slug);
  };

  // Handle Reset Form
  const resetForm = () => {
    setFieldLabel("");
    setFieldName("");
    setFieldType("text");
    setOptionsString("");
    setIsRequired(true);
    setOrderIndex(existingFields.length + 1);
    setMessage(null);
  };

  // Submit Handler untuk Tambah Field Baru
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCategoryId) {
      setMessage({ type: "error", text: "Silakan pilih Kategori Tiket terlebih dahulu!" });
      return;
    }

    setSubmitting(true);
    setMessage(null);

    let formattedOptions: string[] | null = null;
    if ((fieldType === "select" || fieldType === "radio") && optionsString.trim() !== "") {
      formattedOptions = optionsString
        .split(",")
        .map((opt) => opt.trim())
        .filter((opt) => opt.length > 0);
    }

    const payload = {
      category_id: Number(selectedCategoryId),
      field_label: fieldLabel,
      field_name: fieldName,
      field_type: fieldType,
      options: formattedOptions,
      is_required: isRequired,
      order_index: Number(orderIndex),
    };

    try {
      const token = localStorage.getItem("token") || "";
      // DIBERSIHKAN: POST ke endpoint Laravel ticket-fields
      const res = await fetch(`${API_URL}/ticket-fields`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      if (!res.ok) throw new Error("Gagal menyimpan data");

      setMessage({ type: "success", text: "Kolom formulir baru berhasil ditambahkan!" });
      resetForm();
      fetchCategoryFields(Number(selectedCategoryId));
    } catch (err) {
      setMessage({ type: "error", text: "Terjadi kesalahan saat menyimpan field." });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto p-2 sm:p-6">
      <div>
        <h1 className="text-xl font-bold text-slate-800">Manajemen Formulir Kustom (Dynamic Form Builder)</h1>
        <p className="text-xs text-slate-500 mt-1">
          Atur dan sesuaikan kolom isian tiket sesuai dengan kebutuhan kategori layanan tanpa mengetik SQL secara manual.
        </p>
      </div>

      <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm">
        <label className="block text-xs font-bold text-slate-700 mb-2">
          PILIH KATEGORI TIKET <span className="text-rose-500">*</span>
        </label>
      <select
  value={selectedCategoryId}
  onChange={(e) => setSelectedCategoryId(e.target.value ? Number(e.target.value) : "")}
  className="w-full text-xs md:text-sm px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 transition-all font-medium"
>
  <option value="">-- Pilih Sub-Kategori Tiket --</option>
  {categories.map((parent) => (
    <optgroup key={parent.id} label={`📂 ${parent.name}`}>
      {/* Opsi jika Parent itu sendiri ingin diberi field */}
      <option value={parent.id}>
        [Parent] {parent.name}
      </option>
      
      {/* Render Sub-Kategori (Children) */}
      {parent.children?.map((child) => (
        <option key={child.id} value={child.id}>
          &nbsp;&nbsp;└── {child.name}
        </option>
      ))}
    </optgroup>
  ))}
</select>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        <div className="lg:col-span-5 bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm">
          <h2 className="text-sm font-bold text-slate-800 mb-4 border-b pb-3 border-slate-100">
            ➕ Tambah Field Isian Baru
          </h2>

          {message && (
            <div
              className={`p-3 rounded-xl text-xs mb-4 ${
                message.type === "success"
                  ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                  : "bg-rose-50 text-rose-700 border border-rose-200"
              }`}
            >
              {message.text}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">
                Label Input (Tampilan UI) <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                required
                placeholder="Contoh: Jenis Data / Nomor Registrasi"
                value={fieldLabel}
                onChange={handleLabelChange}
                className="w-full text-xs px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 transition-all"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">
                Field Name (Key System/Database) <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                required
                placeholder="Contoh: jenis_data / nomor_registrasi"
                value={fieldName}
                onChange={(e) => setFieldName(e.target.value)}
                className="w-full text-xs px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-700 font-mono focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 transition-all"
              />
              <span className="text-[10px] text-slate-400 mt-0.5 block">
                Otomatis terisi, gunakan huruf kecil dan garis bawah (_).
              </span>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">
                Tipe Input <span className="text-rose-500">*</span>
              </label>
              <select
                value={fieldType}
                onChange={(e) => setFieldType(e.target.value as any)}
                className="w-full text-xs px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 transition-all"
              >
                <option value="text">Teks Singkat (Text Input)</option>
                <option value="textarea">Teks Panjang (Textarea)</option>
                <option value="number">Angka (Number)</option>
                <option value="select">Dropdown Menu (Select)</option>
                <option value="radio">Radio Button (Pilihan Tunggal)</option>
              </select>
            </div>

            {(fieldType === "select" || fieldType === "radio") && (
              <div className="bg-blue-50/50 p-3.5 rounded-xl border border-blue-100">
                <label className="block text-xs font-bold text-blue-900 mb-1">
                  Opsi Pilihan (Pisahkan dengan koma) <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="Kasir, Farmasi, Rawat Jalan, Rawat Inap"
                  value={optionsString}
                  onChange={(e) => setOptionsString(e.target.value)}
                  className="w-full text-xs px-3 py-2 bg-white border border-blue-200 rounded-lg text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                />
                <span className="text-[10px] text-blue-600 mt-1 block">
                  Sistem akan otomatis mengkonversi teks di atas menjadi format array JSON.
                </span>
              </div>
            )}

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">
                  Wajib Diisi?
                </label>
                <select
                  value={isRequired ? "true" : "false"}
                  onChange={(e) => setIsRequired(e.target.value === "true")}
                  className="w-full text-xs px-3 py-2.5 bg-white border border-slate-200 rounded-xl text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                >
                  <option value="true">Ya (Required)</option>
                  <option value="false">Tidak (Optional)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">
                  Urutan Display
                </label>
                <input
                  type="number"
                  min="1"
                  value={orderIndex}
                  onChange={(e) => setOrderIndex(Number(e.target.value))}
                  className="w-full text-xs px-3 py-2.5 bg-white border border-slate-200 rounded-xl text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                />
              </div>
            </div>

            <div className="pt-2 flex items-center gap-2">
              <button
                type="submit"
                disabled={submitting || !selectedCategoryId}
                className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2.5 px-4 rounded-xl text-xs transition-colors shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {submitting ? "Menyimpan..." : "Simpan Field Baru"}
              </button>
              <button
                type="button"
                onClick={resetForm}
                className="px-3.5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-xl text-xs font-semibold transition-colors"
              >
                Reset
              </button>
            </div>
          </form>
        </div>

        <div className="lg:col-span-7 bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm">
          <h2 className="text-sm font-bold text-slate-800 mb-4 border-b pb-3 border-slate-100 flex items-center justify-between">
            <span>📋 Daftar Field Kustom Aktif</span>
            <span className="text-xs font-normal text-slate-500">
              Total: {existingFields.length} Field
            </span>
          </h2>

          {!selectedCategoryId ? (
            <div className="py-16 text-center text-xs text-slate-400 bg-slate-50/50 rounded-xl border border-dashed border-slate-200">
              Silakan pilih kategori tiket di atas untuk melihat & mengelola kolom isian.
            </div>
          ) : loadingFields ? (
            <div className="py-12 text-center text-xs text-slate-400">Memuat field isian...</div>
          ) : existingFields.length === 0 ? (
            <div className="py-16 text-center text-xs text-slate-400 bg-slate-50/50 rounded-xl border border-dashed border-slate-200">
              Belum ada field khusus untuk kategori ini. Buat field pertama di form sebelah kiri.
            </div>
          ) : (
            <div className="space-y-3">
              {existingFields
                .sort((a, b) => a.order_index - b.order_index)
                .map((field) => (
                  <div
                    key={field.id}
                    className="p-4 bg-slate-50/80 hover:bg-slate-50 border border-slate-200/80 rounded-xl flex items-start justify-between gap-4 transition-all"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="bg-slate-200 text-slate-700 text-[10px] font-bold px-2 py-0.5 rounded-md">
                          #{field.order_index}
                        </span>
                        <span className="text-xs font-bold text-slate-800">
                          {field.field_label}
                        </span>
                        {field.is_required && (
                          <span className="text-[10px] bg-rose-100 text-rose-700 px-1.5 py-0.5 rounded font-semibold">
                            Wajib
                          </span>
                        )}
                      </div>

                      <div className="text-[11px] font-mono text-slate-500">
                        key: <span className="text-blue-600">{field.field_name}</span> | type:{" "}
                        <span className="text-emerald-600">{field.field_type}</span>
                      </div>

                      {field.options && field.options.length > 0 && (
                        <div className="flex flex-wrap gap-1 mt-1.5 pt-1">
                          {field.options.map((opt, idx) => (
                            <span
                              key={idx}
                              className="text-[10px] bg-white border border-slate-200 text-slate-600 px-2 py-0.5 rounded-full"
                            >
                              {opt}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => alert(`Fitur hapus field ID ${field.id} dapat ditambahkan.`)}
                        className="text-xs text-rose-500 hover:text-rose-700 font-semibold p-1 hover:bg-rose-50 rounded"
                      >
                        Hapus
                      </button>
                    </div>
                  </div>
                ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}