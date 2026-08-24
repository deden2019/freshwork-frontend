"use client";

interface TimelineEvent {
  id: string;
  type: "comment" | "worklog" | "status" | "assignment";
  user: string;
  content: string;
  time: string;
}

export default function TicketTimeline({ ticket }: { ticket: any }) {
  const events: TimelineEvent[] = [];

  // 1. Map Komentar
  ticket.comments?.forEach((c: any) => {
    events.push({
      id: `comment-${c.id}`,
      type: "comment",
      user: c.user?.full_name || c.user?.name || "User",
      content: c.comment,
      time: c.created_at ? new Date(c.created_at).toLocaleString() : "-",
    });
  });

  // 2. Map Worklog
  ticket.worklogs?.forEach((w: any) => {
    events.push({
      id: `worklog-${w.id}`,
      type: "worklog",
      user: w.engineer?.full_name || w.engineer?.name || "Engineer",
      content: `Pengerjaan (${w.work_minutes} Menit): ${w.work_description}`,
      time: w.created_at ? new Date(w.created_at).toLocaleString() : "-",
    });
  });

// 3. Map Status History (Riwayat Status)
  ticket.status_histories?.forEach((s: any) => {
    // Mengambil nama status dari relasi (fallback ke teks "Awal" atau angka ID jika relasi kosong)
    const oldStatusName = s.old_status?.name || s.old_status?.status_name || (s.old_status_id ? `Status #${s.old_status_id}` : 'Awal');
    const newStatusName = s.new_status?.name || s.new_status?.status_name || (s.new_status_id ? `Status #${s.new_status_id}` : 'Baru');

    events.push({
      id: `status-${s.id}`,
      type: "status",
      user: s.changed_by?.full_name || s.changed_by?.name || "Sistem",
      content: `Mengubah status dari "${oldStatusName}" menjadi "${newStatusName}".`,
      time: s.changed_at ? new Date(s.changed_at).toLocaleString() : "-",
    });
  });

  // 4. Map Assignment History (Riwayat Penugasan)
  ticket.assignment_histories?.forEach((a: any) => {
    events.push({
      id: `assignment-${a.id}`,
      type: "assignment",
      user: a.assigned_by?.full_name || a.assigned_by?.name || "Sistem",
      content: `Memperbarui penugasan teknisi tiket.`,
      time: a.assigned_at ? new Date(a.assigned_at).toLocaleString() : "-",
    });
  });

  // Urutkan event berdasarkan waktu terbaru (opsional, jika ingin diurutkan)
  events.sort((a, b) => new Date(b.time).getTime() - new Date(a.time).getTime());

  return (
    <div className="relative border-l-2 border-slate-200 ml-3 pl-6 space-y-6">
      {events.length > 0 ? (
        events.map((event) => {
          // Menentukan warna titik indikator berdasarkan tipenya
          let dotColor = "bg-blue-500";
          if (event.type === "worklog") dotColor = "bg-orange-500";
          if (event.type === "status") dotColor = "bg-purple-500";
          if (event.type === "assignment") dotColor = "bg-emerald-500";

          return (
            <div key={event.id} className="relative">
              {/* Dots penanda aktivitas */}
              <span
                className={`absolute -left-[31px] top-1.5 h-3.5 w-3.5 rounded-full border-2 border-white ${dotColor}`}
              />
              <div className="flex items-center gap-2">
                <span className="text-sm font-semibold text-slate-800">{event.user}</span>
                <span className="rounded bg-slate-100 px-1.5 py-0.5 text-[10px] font-medium text-slate-600 uppercase">
                  {event.type}
                </span>
                <span className="text-xs text-slate-400">{event.time}</span>
              </div>
              <p className="mt-1 text-sm text-slate-600 bg-slate-50 p-3 rounded-lg border border-slate-100">
                {event.content}
              </p>
            </div>
          );
        })
      ) : (
        <p className="text-sm italic text-slate-400">Belum ada aktivitas pada tiket ini.</p>
      )}
    </div>
  );
}