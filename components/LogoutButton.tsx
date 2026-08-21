"use client";

export default function LogoutButton() {
  function handleLogout() {
    localStorage.removeItem("token");
    document.cookie = "token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 UTC;";
    window.location.href = "/login";
  }

  return (
    <button
      onClick={handleLogout}
      className="px-3.5 py-1.5 text-xs font-semibold text-red-600 hover:text-white border border-red-200 hover:bg-red-600 rounded-lg transition duration-150"
    >
      Logout
    </button>
  );
}