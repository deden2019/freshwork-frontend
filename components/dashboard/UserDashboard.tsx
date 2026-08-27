export default function UserDashboard({ user }: { user: any }) {
  return (
    <div className="max-w-7xl mx-auto p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-800">Dashboard User</h1>
        <p className="text-slate-500 text-sm">Selamat datang, {user?.nama || user?.full_name || "User"}. Pantau status tiket bantuan Anda di sini.</p>
      </div>

      {/* Grid Status Ringkas */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
          <p className="text-sm font-medium text-slate-500">Tiket Open</p>
          <h3 className="text-3xl font-bold text-blue-600 mt-2">0</h3>
        </div>
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
          <p className="text-sm font-medium text-slate-500">Sedang Diproses (In Progress)</p>
          <h3 className="text-3xl font-bold text-amber-500 mt-2">0</h3>
        </div>
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
          <p className="text-sm font-medium text-slate-500">Selesai (Resolved)</p>
          <h3 className="text-3xl font-bold text-emerald-600 mt-2">0</h3>
        </div>
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
          <p className="text-sm font-medium text-slate-500">Ditutup (Closed)</p>
          <h3 className="text-3xl font-bold text-slate-600 mt-2">0</h3>
        </div>
      </div>
    </div>
  );
}