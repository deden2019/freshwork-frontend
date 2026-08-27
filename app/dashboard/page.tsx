"use client";

import { useEffect, useState } from "react";
import UserDashboard from "@/components/dashboard/UserDashboard";
import AgentDashboard from "@/components/dashboard/AgentDashboard";
import AdminDashboard from "@/components/dashboard/AdminDashboard";

export default function DashboardPage() {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const userData = localStorage.getItem("user");
    if (userData) {
      try {
        setUser(JSON.parse(userData));
      } catch (e) {
        console.error("Gagal parse localStorage user", e);
      }
    }
    setLoading(false);
  }, []);

  if (loading) return <div className="p-6 text-sm text-slate-500">Memuat dashboard...</div>;

  // Konversi seluruh objek user ke string lowercase untuk mencocokkan role teks biasa
  const userStr = JSON.stringify(user || {}).toLowerCase();

  // 1. Pengecekan Role Admin (Bisa dari Postgres atau Level Sybase tertentu misal level 1)
  if (userStr.includes("admin") || user?.level === "1" || user?.level === 1) {
    return <AdminDashboard />;
  }

  // 2. Pengecekan Role Engineer / Agent / Support / Level Sybase (Misal level 3 atau 2)
  if (
    userStr.includes("engineer") ||
    userStr.includes("agent") ||
    userStr.includes("support") ||
    userStr.includes("helpdesk") ||
    user?.role_id === 2 ||
    user?.level === "2" || user?.level === 2
  ) {
    return <AgentDashboard user={user} />;
  }

  // 3. Default ke User Dashboard biasa
  return <UserDashboard user={user} />;
}