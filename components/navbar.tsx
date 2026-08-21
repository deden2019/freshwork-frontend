"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import LogoutButton from "./LogoutButton";

export default function Navbar() {
  const pathname = usePathname();

  // Sembunyikan Navbar jika sedang berada di halaman login
  if (pathname === "/login") {
    return null;
  }

  return (
    <nav
      style={{
        padding: "15px 24px",
        borderBottom: "1px solid #ddd",
        display: "flex",
        alignItems: "center",
        gap: "20px",
        background: "#fff",
      }}
    >
      <Link href="/dashboard" style={{ textDecoration: "none", color: "#333", fontWeight: 500 }}>
        Dashboard
      </Link>
      <Link href="/tickets" style={{ textDecoration: "none", color: "#333", fontWeight: 500 }}>
        Tickets
      </Link>
      <Link href="/tickets/create" style={{ textDecoration: "none", color: "#333", fontWeight: 500 }}>
        Create Ticket
      </Link>

      <div style={{ marginLeft: "auto" }}>
        <LogoutButton />
      </div>
    </nav>
  );
}