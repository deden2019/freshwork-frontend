"use client";

interface TimelineEvent {
  id: string;
  type: "comment" | "worklog";
  user: string;
  content: string;
  time: string;
}

export default function TicketTimeline({ ticket }: { ticket: any }) {
  const events: TimelineEvent[] = [];

  // Map Komentar
  ticket.comments?.forEach((c: any) => {
    events.push({
      id: `comment-${c.id}`,
      type: "comment",
      user: c.user?.full_name || "User",
      content: c.comment,
      time: c.created_at ? new Date(c.created_at).toLocaleString() : "-",
    });
  });

  // Map Worklog
  ticket.worklogs?.forEach((w: any) => {
    events.push({
      id: `worklog-${w.id}`,
      type: "worklog",
      user: w.engineer?.full_name || "Engineer",
      content: `Pengerjaan (${w.work_minutes} Menit): ${w.work_description}`,
      time: w.created_at ? new Date(w.created_at).toLocaleString() : "-",
    });
  });

  return (
    <div className="relative border-l-2 border-slate-200 ml-3 pl-6 space-y-6">
      {events.length > 0 ? (
        events.map((event) => (
          <div key={event.id} className="relative">
            {/* Dots penanda aktivitas */}
            <span
              className={`absolute -left-[31px] top-1.5 h-3.5 w-3.5 rounded-full border-2 border-white ${
                event.type === "comment" ? "bg-blue-500" : "bg-orange-500"
              }`}
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
        ))
      ) : (
        <p className="text-sm italic text-slate-400">Belum ada aktivitas pada tiket ini.</p>
      )}
    </div>
  );
}