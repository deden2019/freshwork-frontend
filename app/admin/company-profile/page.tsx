"use client";

import { useState, useEffect } from "react";

export default function CompanyProfilePage() {
  const [companyName, setCompanyName] = useState("");
  const [companyEmail, setCompanyEmail] = useState("");
  const [companyPhone, setCompanyPhone] = useState("");
  const [companyAddress, setCompanyAddress] = useState("");
  const [companyLogo, setCompanyLogo] = useState<File | null>(null); // State untuk file logo
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ text: "", type: "" });

  useEffect(() => {
    fetchCompanyProfile();
  }, []);

  const fetchCompanyProfile = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await fetch("http://127.0.0.1:8000/api/settings", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        }
      });

      if (res.ok) {
        const result = await res.json();
        const data = result.data || result; 

        setCompanyName(data.company_name || "");
        setCompanyEmail(data.email || "");
        setCompanyPhone(data.phone || "");
        setCompanyAddress(data.address || "");
      }
    } catch (error) {
      console.error("Gagal mengambil data profil:", error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const token = localStorage.getItem("token");
      const formData = new FormData();
      
      // ✅ Masukkan semua field ke dalam FormData
      formData.append("company_name", companyName);
      formData.append("email", companyEmail);
      formData.append("phone", companyPhone);
      formData.append("address", companyAddress);
      
      // ✅ Masukkan file logo jika user memilih file baru
      if (companyLogo) {
        formData.append("logo", companyLogo);
      }

      const res = await fetch("http://127.0.0.1:8000/api/settings", {
        method: "POST", // Jika di Laravel pakai method spoofing PUT/PATCH untuk update, sesuaikan (lihat catatan backend di bawah)
        headers: {
          "Authorization": `Bearer ${token}`
          // ⚠️ PENTING: Jangan tambahkan "Content-Type": "application/json" 
          // karena browser akan otomatis mengaturnya ke multipart/form-data beserta boundary-nya.
        },
        body: formData
      });

      if (res.ok) {
        setMessage({ text: "Pengaturan berhasil disimpan!", type: "success" });
        
        // Update localStorage untuk navbar
        localStorage.setItem("company_profile", JSON.stringify({ name: companyName }));
        window.dispatchEvent(new Event("storage"));
      } else {
        setMessage({ text: "Gagal menyimpan pengaturan.", type: "error" });
      }
    } catch (error) {
      console.error("Gagal menyimpan:", error);
      setMessage({ text: "Terjadi kesalahan pada server.", type: "error" });
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="text-xl font-bold text-slate-900 tracking-tight">Company Profile</h1>
        <p className="text-xs text-slate-500 mt-0.5">
          Kelola informasi identitas perusahaan dan pengaturan umum helpdesk.
        </p>
      </div>

      {message.text && (
        <div
          className={`p-4 rounded-xl text-xs font-medium border ${
            message.type === "success"
              ? "bg-emerald-50 border-emerald-200 text-emerald-700"
              : "bg-rose-50 border-rose-200 text-rose-700"
          }`}
        >
          {message.text}
        </div>
      )}

      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
        <form onSubmit={handleSubmit} className="space-y-5">
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-slate-700">
                Nama Perusahaan / Instansi
              </label>
              <input
                type="text"
                value={companyName}
                onChange={(e) => setCompanyName(e.target.value)}
                placeholder="Contoh: PT Freshwork Indonesia"
                className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-slate-800"
                required
              />
            </div>

            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-slate-700">
                Email Resmi
              </label>
              <input
                type="email"
                value={companyEmail}
                onChange={(e) => setCompanyEmail(e.target.value)}
                placeholder="support@company.com"
                className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-slate-800"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-slate-700">
                Nomor Telepon
              </label>
              <input
                type="text"
                value={companyPhone}
                onChange={(e) => setCompanyPhone(e.target.value)}
                placeholder="021-xxxxxxx"
                className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-slate-800"
              />
            </div>

            {/* ✅ Input Logo yang diperbaiki dengan menangkap file */}
            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-slate-700">
                Logo Perusahaan
              </label>
              <input
                type="file"
                accept="image/*"
                onChange={(e) => {
                  if (e.target.files && e.target.files[0]) {
                    setCompanyLogo(e.target.files[0]);
                  }
                }}
                className="w-full text-xs text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-blue-50 file:text-blue-600 hover:file:bg-blue-100 cursor-pointer"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="block text-xs font-semibold text-slate-700">
              Alamat Kantor
            </label>
            <textarea
              rows={3}
              value={companyAddress}
              onChange={(e) => setCompanyAddress(e.target.value)}
              placeholder="Masukkan alamat lengkap perusahaan..."
              className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-slate-800"
            />
          </div>

          <div className="flex justify-end pt-3 border-t border-slate-100">
            <button
              type="submit"
              disabled={loading}
              className="px-5 py-2 rounded-xl bg-blue-600 text-white text-xs font-semibold hover:bg-blue-700 transition-all shadow-sm shadow-blue-500/20 disabled:opacity-50"
            >
              {loading ? "Menyimpan..." : "Simpan Perubahan"}
            </button>
          </div>

        </form>
      </div>
    </div>
  );
}