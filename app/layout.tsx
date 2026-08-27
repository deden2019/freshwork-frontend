"use client";

import "./globals.css";
import { useEffect, useState, useRef } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import LogoutButton from "@/components/LogoutButton";

function Navbar() {
  const pathname = usePathname();
  const [roleId, setRoleId] = useState<number | null>(null);
  const [userName, setUserName] = useState<string>("User Active");
  const [isSettingsOpen, setIsSettingsOpen] = useState<boolean>(false);

  // Ref untuk klik di luar dropdown
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Ambil data user dari localStorage
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      try {
        const user = JSON.parse(storedUser);

        // Set Nama User
        if (user.full_name) {
          setUserName(user.full_name);
        } else if (user.name) {
          setUserName(user.name);
        }

        // Set Role ID
        if (user.role_id !== undefined && user.role_id !== null) {
          setRoleId(Number(user.role_id));
        }
      } catch (e) {
        console.error("Gagal membaca session user dari localStorage:", e);
      }
    }
  }, []);

  // Event listener untuk klik di luar area Settings
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsSettingsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Sembunyikan Navbar di halaman login
  if (pathname === "/login") return null;

  // Tampilkan menu Admin jika roleId BUKAN 5 (Bukan USER biasa)
  const isNotUser = roleId !== null && roleId !== 5;

  // Cek apakah halaman aktif sedang membuka salah satu menu di dalam Settings
  const isSettingsActive =
    pathname.startsWith("/admin/users") ||
    pathname.startsWith("/admin/categories") ||
    pathname.startsWith("/admin/departments") ||
    pathname.startsWith("/admin/sla") ||
    pathname.startsWith("/admin/ticket-fields"); // Ditambahkan di sini

  // Ambil huruf pertama untuk avatar
  const initial = userName.charAt(0).toUpperCase();

  return (
    <header className="bg-white border-b border-slate-200 sticky top-0 z-50 shadow-sm">
      <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
        
        {/* Brand / Logo */}
        <div className="flex items-center gap-8">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 bg-gradient-to-tr from-blue-600 to-indigo-500 rounded-xl flex items-center justify-center text-white font-black text-lg shadow-md shadow-blue-500/20">
              F
            </div>
            <span className="font-bold text-slate-800 text-lg tracking-tight">
              Helpdesk <span className="text-blue-600 font-normal">Freshwork</span>
            </span>
          </div>

          {/* Navigation Links */}
          <nav className="flex items-center gap-1 bg-slate-100/80 p-1 rounded-xl border border-slate-200/60">
            <Link
              href="/dashboard"
              className={`px-4 py-1.5 rounded-lg text-xs font-semibold transition-all duration-200 ${
                pathname === "/dashboard"
                  ? "bg-white text-blue-600 shadow-sm"
                  : "text-slate-600 hover:text-slate-900 hover:bg-slate-200/50"
              }`}
            >
              Dashboard
            </Link>

            <Link
              href="/tickets"
              className={`px-4 py-1.5 rounded-lg text-xs font-semibold transition-all duration-200 ${
                pathname.startsWith("/tickets") && pathname !== "/tickets/create"
                  ? "bg-white text-blue-600 shadow-sm"
                  : "text-slate-600 hover:text-slate-900 hover:bg-slate-200/50"
              }`}
            >
              Tickets
            </Link>

            {/* Menu Admin (Dropdown Settings) */}
            {isNotUser && (
              <div className="relative" ref={dropdownRef}>
                <button
                  type="button"
                  onClick={() => setIsSettingsOpen(!isSettingsOpen)}
                  className={`px-4 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all duration-200 ${
                    isSettingsActive
                      ? "bg-white text-blue-600 shadow-sm"
                      : "text-slate-600 hover:text-slate-900 hover:bg-slate-200/50"
                  }`}
                >
                  <span>Settings</span>
                  <svg
                    className={`w-3.5 h-3.5 transition-transform duration-200 ${
                      isSettingsOpen ? "rotate-180" : ""
                    }`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M19 9l-7 7-7-7"
                    />
                  </svg>
                </button>

                {/* Submenu Dropdown */}
                {isSettingsOpen && (
                  <div className="absolute left-0 mt-2 w-48 bg-white rounded-xl shadow-lg border border-slate-200/80 py-1.5 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
                    <Link
                      href="/admin/users"
                      onClick={() => setIsSettingsOpen(false)}
                      className={`block px-4 py-2 text-xs font-medium transition-colors ${
                        pathname.startsWith("/admin/users")
                          ? "bg-blue-50 text-blue-600 font-semibold"
                          : "text-slate-700 hover:bg-slate-50 hover:text-slate-900"
                      }`}
                    >
                      Users / Agents
                    </Link>
                    <Link
                      href="/admin/categories"
                      onClick={() => setIsSettingsOpen(false)}
                      className={`block px-4 py-2 text-xs font-medium transition-colors ${
                        pathname.startsWith("/admin/categories")
                          ? "bg-blue-50 text-blue-600 font-semibold"
                          : "text-slate-700 hover:bg-slate-50 hover:text-slate-900"
                      }`}
                    >
                      Categories
                    </Link>
                    <Link
                      href="/admin/departments"
                      onClick={() => setIsSettingsOpen(false)}
                      className={`block px-4 py-2 text-xs font-medium transition-colors ${
                        pathname.startsWith("/admin/departments")
                          ? "bg-blue-50 text-blue-600 font-semibold"
                          : "text-slate-700 hover:bg-slate-50 hover:text-slate-900"
                      }`}
                    >
                      Departments
                    </Link>
                    <Link
                      href="/admin/sla"
                      onClick={() => setIsSettingsOpen(false)}
                      className={`block px-4 py-2 text-xs font-medium transition-colors ${
                        pathname.startsWith("/admin/sla")
                          ? "bg-blue-50 text-blue-600 font-semibold"
                          : "text-slate-700 hover:bg-slate-50 hover:text-slate-900"
                      }`}
                    >
                      SLA Settings
                    </Link>

                    {/* Menu Baru: Dynamic Custom Fields / Form Builder */}
                    <Link
                      href="/admin/ticket-fields"
                      onClick={() => setIsSettingsOpen(false)}
                      className={`block px-4 py-2 text-xs font-medium transition-colors border-t border-slate-100 mt-1 pt-2 ${
                        pathname.startsWith("/admin/ticket-fields")
                          ? "bg-blue-50 text-blue-600 font-semibold"
                          : "text-slate-700 hover:bg-slate-50 hover:text-slate-900"
                      }`}
                    >
                      Custom Form Fields
                    </Link>

                    {/* Menu Baru: Company Profile */}
                    <Link
                      href="/admin/company-profile"
                      onClick={() => setIsSettingsOpen(false)}
                      className={`block px-4 py-2 text-xs font-medium transition-colors border-t border-slate-100 mt-1 pt-2 ${
                        pathname.startsWith("/admin/company-profile")
                          ? "bg-blue-50 text-blue-600 font-semibold"
                          : "text-slate-700 hover:bg-slate-50 hover:text-slate-900"
                      }`}
                    >
                      Company Profile
                    </Link>
                  </div>
                )}
              </div>
            )}

            <Link
              href="/tickets/create"
              className={`px-4 py-1.5 rounded-lg text-xs font-semibold transition-all duration-200 ${
                pathname === "/tickets/create"
                  ? "bg-white text-blue-600 shadow-sm"
                  : "text-slate-600 hover:text-slate-900 hover:bg-slate-200/50"
              }`}
            >
              + Create Ticket
            </Link>
          </nav>
        </div>

        {/* Right Section: User Info & Logout */}
        <div className="flex items-center gap-4">
          <div className="hidden sm:flex items-center gap-3 pr-2 border-r border-slate-200">
            <div className="w-8 h-8 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center font-bold text-slate-600 text-xs">
              {initial}
            </div>
            <div className="flex flex-col">
              <span className="text-xs font-semibold text-slate-800 leading-none">{userName}</span>
              <span className="text-[10px] text-emerald-500 font-medium mt-0.5">Online</span>
            </div>
          </div>

          <LogoutButton />
        </div>

      </div>
    </header>
  );
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="bg-slate-50 min-h-screen text-slate-900 antialiased font-sans">
        <Navbar />
        <main className="max-w-7xl mx-auto px-6 py-8">{children}</main>
      </body>
    </html>
  );
}