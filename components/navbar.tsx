"use client";

import { useEffect, useState, useRef } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import LogoutButton from "./LogoutButton";

export default function Navbar() {
  const pathname = usePathname();
  const [roleId, setRoleId] = useState<number | null>(null);
  const [userName, setUserName] = useState<string>("User Active");
  const [isSettingsOpen, setIsSettingsOpen] = useState<boolean>(false);
  
  // Ref untuk mendeteksi klik di luar dropdown
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Ambil data user dari localStorage
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      try {
        const user = JSON.parse(storedUser);

        if (user.full_name) {
          setUserName(user.full_name);
        } else if (user.name) {
          setUserName(user.name);
        }

        if (user.role_id !== undefined && user.role_id !== null) {
          setRoleId(Number(user.role_id));
        }
      } catch (e) {
        console.error("Gagal parse localStorage user", e);
      }
    }
  }, []);

  // Event listener untuk menutup dropdown saat klik di luar area menu
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsSettingsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  if (pathname === "/login") return null;

  // Role BUKAN 5 (Bukan USER biasa)
  const isNotUser = roleId !== null && roleId !== 5;
  const isSettingsActive =
    pathname.startsWith("/admin/users") ||
    pathname.startsWith("/admin/categories") ||
    pathname.startsWith("/admin/departments") ||
    pathname.startsWith("/admin/sla") ||
    pathname.startsWith("/admin/ticket-fields"); // Pengecekan route aktif ditambahkan di sini

  return (
    <nav
      style={{
        padding: "12px 32px",
        borderBottom: "1px solid #e2e8f0",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        backgroundColor: "#ffffff",
      }}
    >
      {/* Logo & Navigation Group */}
      <div style={{ display: "flex", alignItems: "center", gap: "32px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <div
            style={{
              width: "32px",
              height: "32px",
              backgroundColor: "#2563eb",
              borderRadius: "50%",
              color: "#fff",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontWeight: "bold",
              fontSize: "14px",
            }}
          >
            F
          </div>
          <span style={{ fontWeight: "bold", fontSize: "18px", color: "#0f172a" }}>
            Helpdesk <span style={{ color: "#2563eb" }}>ICT-RSPB</span>
          </span>
        </div>

        {/* Capsule Navigation */}
        <div
          style={{
            backgroundColor: "#f1f5f9",
            padding: "4px",
            borderRadius: "20px",
            display: "flex",
            alignItems: "center",
            gap: "4px",
          }}
        >
          <Link
            href="/dashboard"
            style={{
              padding: "6px 16px",
              borderRadius: "16px",
              textDecoration: "none",
              fontSize: "13px",
              fontWeight: "500",
              color: pathname === "/dashboard" ? "#1e293b" : "#64748b",
              backgroundColor: pathname === "/dashboard" ? "#ffffff" : "transparent",
              boxShadow: pathname === "/dashboard" ? "0 1px 2px rgba(0,0,0,0.05)" : "none",
            }}
          >
            Dashboard
          </Link>

          <Link
            href="/tickets"
            style={{
              padding: "6px 16px",
              borderRadius: "16px",
              textDecoration: "none",
              fontSize: "13px",
              fontWeight: "500",
              color: pathname === "/tickets" ? "#1e293b" : "#64748b",
              backgroundColor: pathname === "/tickets" ? "#ffffff" : "transparent",
              boxShadow: pathname === "/tickets" ? "0 1px 2px rgba(0,0,0,0.05)" : "none",
            }}
          >
            Tickets
          </Link>

          {/* Menu Dropdown Settings untuk Admin */}
          {isNotUser && (
            <div style={{ position: "relative" }} ref={dropdownRef}>
              <button
                type="button"
                onClick={() => setIsSettingsOpen(!isSettingsOpen)}
                style={{
                  padding: "6px 16px",
                  borderRadius: "16px",
                  border: "none",
                  outline: "none",
                  cursor: "pointer",
                  fontSize: "13px",
                  fontWeight: "500",
                  color: isSettingsActive ? "#2563eb" : "#64748b",
                  backgroundColor: isSettingsActive ? "#ffffff" : "transparent",
                  boxShadow: isSettingsActive ? "0 1px 2px rgba(0,0,0,0.05)" : "none",
                  display: "flex",
                  alignItems: "center",
                  gap: "4px",
                }}
              >
                <span>Settings</span>
                <span style={{ fontSize: "10px", marginTop: "2px" }}>
                  {isSettingsOpen ? "▲" : "▼"}
                </span>
              </button>

              {/* Items Dropdown */}
              {isSettingsOpen && (
                <div
                  style={{
                    position: "absolute",
                    top: "100%",
                    left: 0,
                    marginTop: "8px",
                    backgroundColor: "#ffffff",
                    borderRadius: "12px",
                    boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)",
                    border: "1px solid #e2e8f0",
                    padding: "6px 0",
                    minWidth: "160px",
                    zIndex: 50,
                  }}
                >
                  <Link
                    href="/admin/users"
                    onClick={() => setIsSettingsOpen(false)}
                    style={{
                      display: "block",
                      padding: "8px 16px",
                      fontSize: "13px",
                      textDecoration: "none",
                      color: pathname.startsWith("/admin/users") ? "#2563eb" : "#475569",
                      fontWeight: pathname.startsWith("/admin/users") ? "600" : "normal",
                      backgroundColor: pathname.startsWith("/admin/users") ? "#eff6ff" : "transparent",
                    }}
                  >
                    Users / Agents
                  </Link>

                  <Link
                    href="/admin/categories"
                    onClick={() => setIsSettingsOpen(false)}
                    style={{
                      display: "block",
                      padding: "8px 16px",
                      fontSize: "13px",
                      textDecoration: "none",
                      color: pathname.startsWith("/admin/categories") ? "#2563eb" : "#475569",
                      fontWeight: pathname.startsWith("/admin/categories") ? "600" : "normal",
                      backgroundColor: pathname.startsWith("/admin/categories") ? "#eff6ff" : "transparent",
                    }}
                  >
                    Categories
                  </Link>

                  <Link
                    href="/admin/departments"
                    onClick={() => setIsSettingsOpen(false)}
                    style={{
                      display: "block",
                      padding: "8px 16px",
                      fontSize: "13px",
                      textDecoration: "none",
                      color: pathname.startsWith("/admin/departments") ? "#2563eb" : "#475569",
                      fontWeight: pathname.startsWith("/admin/departments") ? "600" : "normal",
                      backgroundColor: pathname.startsWith("/admin/departments") ? "#eff6ff" : "transparent",
                    }}
                  >
                    Departments
                  </Link>

                  <Link
                    href="/admin/sla"
                    onClick={() => setIsSettingsOpen(false)}
                    style={{
                      display: "block",
                      padding: "8px 16px",
                      fontSize: "13px",
                      textDecoration: "none",
                      color: pathname.startsWith("/admin/sla") ? "#2563eb" : "#475569",
                      fontWeight: pathname.startsWith("/admin/sla") ? "600" : "normal",
                      backgroundColor: pathname.startsWith("/admin/sla") ? "#eff6ff" : "transparent",
                    }}
                  >
                    SLA Settings
                  </Link>

                  {/* Menu Baru: Custom Fields */}
                  <Link
                    href="/admin/ticket-fields"
                    onClick={() => setIsSettingsOpen(false)}
                    style={{
                      display: "block",
                      padding: "8px 16px",
                      fontSize: "13px",
                      textDecoration: "none",
                      color: pathname.startsWith("/admin/ticket-fields") ? "#2563eb" : "#475569",
                      fontWeight: pathname.startsWith("/admin/ticket-fields") ? "600" : "normal",
                      backgroundColor: pathname.startsWith("/admin/ticket-fields") ? "#eff6ff" : "transparent",
                      borderTop: "1px solid #f1f5f9",
                      marginTop: "4px",
                      paddingTop: "8px",
                    }}
                  >
                    Custom Fields
                  </Link>
                </div>
              )}
            </div>
          )}

          <Link
            href="/tickets/create"
            style={{
              padding: "6px 16px",
              borderRadius: "16px",
              textDecoration: "none",
              fontSize: "13px",
              fontWeight: "500",
              color: "#2563eb",
              backgroundColor: "#ffffff",
              boxShadow: "0 1px 2px rgba(0,0,0,0.05)",
            }}
          >
            + Create Ticket
          </Link>
        </div>
      </div>

      {/* User Status & Logout */}
      <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <div
            style={{
              width: "32px",
              height: "32px",
              borderRadius: "50%",
              backgroundColor: "#e2e8f0",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "13px",
              fontWeight: "bold",
              color: "#475569",
            }}
          >
            {userName.charAt(0).toUpperCase()}
          </div>
          <div style={{ fontSize: "12px", lineHeight: "1.2" }}>
            <div style={{ fontWeight: "bold", color: "#1e293b" }}>{userName}</div>
            <div style={{ color: "#22c55e" }}>Online</div>
          </div>
        </div>

        <LogoutButton />
      </div>
    </nav>
  );
}