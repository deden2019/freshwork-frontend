"use client";

import { useEffect, useState } from "react";
import { apiFetch } from "../../lib/api";

export default function DashboardPage() {
  const [dashboard, setDashboard] = useState<any>(null);

  useEffect(() => {
    apiFetch("/dashboard")
      .then((res) => res.json())
      .then((data) => setDashboard(data));
  }, []);

  if (!dashboard) {
    return <div>Loading...</div>;
  }

  return (
    <div style={{ padding: "40px" }}>
      <h1>Dashboard</h1>

      <p>Total Tickets: {dashboard.total_tickets}</p>
      <p>Open Tickets: {dashboard.open_tickets}</p>
      <p>Assigned Tickets: {dashboard.assigned_tickets}</p>
      <p>Resolved Tickets: {dashboard.resolved_tickets}</p>

      <hr />

      <p>SLA On Time: {dashboard.sla_on_time}</p>
      <p>
        SLA Response Breached:
        {dashboard.sla_response_breached}
      </p>
      <p>
        SLA Resolution Breached:
        {dashboard.sla_resolution_breached}
      </p>
    </div>
  );
}