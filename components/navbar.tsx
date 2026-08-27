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
  
  // State untuk data perusahaan dari database
  const [companyName, setCompanyName] = useState<string>("Loading...");
  const [companyLogoText, setCompanyLogoText] = useState<string>("...");

  const dropdownRef = useRef<HTMLDivElement>(null);

  // Fungsi untuk mengambil data perusahaan langsung dari database backend
  const fetchNavbarProfile = async () => {
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

        if (data.company_name) {
          setCompanyName(data.company_name);
          setCompanyLogoText(data.company_name.charAt(0).toUpperCase());
          return;
        }
      }

      // Jika gagal dari API, fallback ke localStorage
      loadFromLocalStorage();
    } catch (error) {
      console.error("Gagal mengambil profil perusahaan untuk navbar:", error);
      loadFromLocalStorage();
    }
  };

  // Cadangan membaca dari localStorage jika offline/gagal fetch
  const loadFromLocalStorage = () => {
    const storedCompany = localStorage.getItem("company_profile");
    if (storedCompany) {
      try {
        const company = JSON.parse(storedCompany);
        if (company?.name) {
          setCompanyName(company.name);
          setCompanyLogoText(company.name.charAt(0).toUpperCase());
        }
      } catch (e) {
        console.error("Gagal parse company profile", e);
      }
    }
  };

useEffect(() => {
    const fetchNavbarProfile = async () => {
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
          if (data.company_name) {
            setCompanyName(data.company_name);
            setCompanyLogoText(data.company_name.charAt(0).toUpperCase());
            return;
          }
        }
        
        // Fallback ke localStorage jika API gagal
        const stored = localStorage.getItem("company_profile");
        if (stored) {
          const parsed = JSON.parse(stored);
          if (parsed?.name) {
            setCompanyName(parsed.name);
            setCompanyLogoText(parsed.name.charAt(0).toUpperCase());
          }
        }
      } catch (e) {
        console.error("Gagal memuat profil perusahaan", e);
      }
    };

    fetchNavbarProfile();
    window.addEventListener("storage", fetchNavbarProfile);
    return () => window.removeEventListener("storage", fetchNavbarProfile);
  }, []);

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      try {
        const user = JSON.parse(storedUser);
        const detectedName = user?.nama || user?.full_name || user?.name || user?.id;
        
        if (detectedName) {
          setUserName(detectedName);
        }

        if (user.role_id !== undefined && user.role_id !== null) {
          setRoleId(Number(user.role_id));
        } else if (user.level !== undefined && user.level !== null) {
          setRoleId(Number(user.level) === 3 ? 5 : 1); 
        }
      } catch (e) {
        console.error("Gagal parse localStorage user", e);
      }
    }
  }, []);

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

  const isNotUser = roleId !== null && roleId !== 5;
  const isSettingsActive =
    pathname.startsWith("/admin/users") ||
    pathname.startsWith("/admin/categories") ||
    pathname.startsWith("/admin/departments") ||
    pathname.startsWith("/admin/sla") ||
    pathname.startsWith("/admin/ticket-fields") ||
    pathname.startsWith("/admin/company-profile");

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
      {/* Logo & Nama Perusahaan (Dinamis dari Database) */}
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
          {companyLogoText}
        </div>
        <span style={{ fontWeight: "bold", fontSize: "18px", color: "#0f172a" }}>
          {companyName}
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

                <Link
                  href="/admin/company-profile"
                  onClick={() => setIsSettingsOpen(false)}
                  style={{
                    display: "block",
                    padding: "8px 16px",
                    fontSize: "13px",
                    textDecoration: "none",
                    color: pathname.startsWith("/admin/company-profile") ? "#2563eb" : "#475569",
                    fontWeight: pathname.startsWith("/admin/company-profile") ? "600" : "normal",
                    backgroundColor: pathname.startsWith("/admin/company-profile") ? "#eff6ff" : "transparent",
                    borderTop: "1px solid #f1f5f9",
                    marginTop: "4px",
                    paddingTop: "8px",
                  }}
                >
                  Company Profile
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