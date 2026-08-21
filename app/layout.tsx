"use client";

import "./globals.css"; // <--- PENTING: Harus di baris paling atas agar Tailwind jalan!
import Link from "next/link";
import { usePathname } from "next/navigation";
import LogoutButton from "@/components/LogoutButton";

function Navbar() {
  const pathname = usePathname();

  // Sembunyikan Navbar di halaman login
  if (pathname === "/login") return null;

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
              Helpdesk <span className="text-blue-600 font-normal">ICT-RSPB</span>
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
              U
            </div>
            <div className="flex flex-col">
              <span className="text-xs font-semibold text-slate-800 leading-none">User Active</span>
              <span className="text-[10px] text-slate-400 mt-0.5">Online</span>
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