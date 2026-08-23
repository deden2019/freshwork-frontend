"use client";

import { useState, useEffect } from "react";
import axios from "@/lib/axios";

interface Department {
  id: number;
  name: string;
}

interface Role {
  id: number;
  name: string;
}

interface User {
  id: number;
  employee_number: string;
  full_name: string;
  email: string;
  phone: string | null;
  role_id: number;
  department_id: number | null;
  is_active: boolean;
  department?: Department;
  role?: Role;
}

export default function UserManagementPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [roles, setRoles] = useState<Role[]>([]); // State untuk menyimpan data roles dari Database
  const [loading, setLoading] = useState(true);

  const [isEditing, setIsEditing] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState<number | null>(null);

  const [formData, setFormData] = useState({
    employee_number: "",
    full_name: "",
    email: "",
    password: "",
    phone: "",
    role_id: "",
    department_id: "",
    is_active: true,
  });

 const fetchData = async () => {
    setLoading(true);
    
    // Menggunakan Promise.allSettled agar jika 1 API error, API lain tetap berjalan
    const [usersResult, deptResult, rolesResult] = await Promise.allSettled([
      axios.get("/api/users"),
      axios.get("/api/departments"),
      axios.get("/api/roles"),
    ]);

    if (usersResult.status === "fulfilled") {
      const data = usersResult.value.data;
      setUsers(Array.isArray(data) ? data : data.data || []);
    } else {
      console.error("Gagal memuat /api/users:", usersResult.reason);
    }

    if (deptResult.status === "fulfilled") {
      const data = deptResult.value.data;
      setDepartments(Array.isArray(data) ? data : data.data || []);
    } else {
      console.error("Gagal memuat /api/departments:", deptResult.reason);
    }

    if (rolesResult.status === "fulfilled") {
      const data = rolesResult.value.data;
      setRoles(Array.isArray(data) ? data : data.data || []);
    } else {
      console.error("Gagal memuat /api/roles:", rolesResult.reason);
    }

    setLoading(false);
  };

  useEffect(() => {
    fetchData();
  }, []);

  const resetForm = () => {
    setFormData({
      employee_number: "",
      full_name: "",
      email: "",
      password: "",
      phone: "",
      role_id: "",
      department_id: "",
      is_active: true,
    });
    setIsEditing(false);
    setSelectedUserId(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (isEditing && selectedUserId) {
        await axios.put(`/api/users/${selectedUserId}`, formData);
        alert("Data user berhasil diperbarui!");
      } else {
        await axios.post("/api/users", formData);
        alert("User berhasil ditambahkan!");
      }
      resetForm();
      fetchData();
    } catch (error: any) {
      alert(error.response?.data?.message || "Gagal menyimpan data user.");
    }
  };

  const handleEdit = (user: User) => {
    setIsEditing(true);
    setSelectedUserId(user.id);
    setFormData({
      employee_number: user.employee_number || "",
      full_name: user.full_name || "",
      email: user.email || "",
      password: "",
      phone: user.phone || "",
      role_id: String(user.role_id || ""),
      department_id: user.department_id ? String(user.department_id) : "",
      is_active: user.is_active,
    });
  };

  const handleDelete = async (id: number) => {
    if (confirm("Apakah Anda yakin ingin menghapus user ini?")) {
      try {
        await axios.delete(`/api/users/${id}`);
        alert("User berhasil dihapus");
        fetchData();
      } catch (error) {
        alert("Gagal menghapus user");
      }
    }
  };

  return (
    <div style={{ maxWidth: "1200px", margin: "0 auto", padding: "24px" }}>
      <h1 style={{ fontSize: "20px", fontWeight: "bold", marginBottom: "20px", color: "#0f172a" }}>
        Manajemen Users & Agents
      </h1>

      <div style={{ display: "grid", gridTemplateColumns: "320px 1fr", gap: "24px" }}>
        {/* Form Section */}
        <div style={{ backgroundColor: "#ffffff", padding: "20px", borderRadius: "12px", border: "1px solid #e2e8f0", height: "fit-content" }}>
          <h2 style={{ fontSize: "14px", fontWeight: "bold", marginBottom: "16px", color: "#334155" }}>
            {isEditing ? "Edit User" : "Tambah User Baru"}
          </h2>
          <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
            <div>
              <label style={{ display: "block", fontSize: "12px", color: "#64748b", marginBottom: "4px" }}>NIP / Employee Number</label>
              <input
                type="text"
                value={formData.employee_number}
                onChange={(e) => setFormData({ ...formData, employee_number: e.target.value })}
                required
                style={{ width: "100%", padding: "8px", fontSize: "13px", borderRadius: "6px", border: "1px solid #cbd5e1" }}
              />
            </div>

            <div>
              <label style={{ display: "block", fontSize: "12px", color: "#64748b", marginBottom: "4px" }}>Nama Lengkap</label>
              <input
                type="text"
                value={formData.full_name}
                onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                required
                style={{ width: "100%", padding: "8px", fontSize: "13px", borderRadius: "6px", border: "1px solid #cbd5e1" }}
              />
            </div>

            <div>
              <label style={{ display: "block", fontSize: "12px", color: "#64748b", marginBottom: "4px" }}>Email</label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                required
                style={{ width: "100%", padding: "8px", fontSize: "13px", borderRadius: "6px", border: "1px solid #cbd5e1" }}
              />
            </div>

            <div>
              <label style={{ display: "block", fontSize: "12px", color: "#64748b", marginBottom: "4px" }}>
                Password {isEditing && "(Opsional)"}
              </label>
              <input
                type="password"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                required={!isEditing}
                style={{ width: "100%", padding: "8px", fontSize: "13px", borderRadius: "6px", border: "1px solid #cbd5e1" }}
              />
            </div>

            <div>
              <label style={{ display: "block", fontSize: "12px", color: "#64748b", marginBottom: "4px" }}>No. Telepon</label>
              <input
                type="text"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                style={{ width: "100%", padding: "8px", fontSize: "13px", borderRadius: "6px", border: "1px solid #cbd5e1" }}
              />
            </div>

            {/* Dropdown Role dari Database */}
            <div>
              <label style={{ display: "block", fontSize: "12px", color: "#64748b", marginBottom: "4px" }}>Role</label>
              <select
                value={formData.role_id}
                onChange={(e) => setFormData({ ...formData, role_id: e.target.value })}
                required
                style={{ width: "100%", padding: "8px", fontSize: "13px", borderRadius: "6px", border: "1px solid #cbd5e1" }}
              >
                <option value="">-- Pilih Role --</option>
                {roles.map((role) => (
                  <option key={role.id} value={role.id}>
                    {role.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Dropdown Department */}
            <div>
              <label style={{ display: "block", fontSize: "12px", color: "#64748b", marginBottom: "4px" }}>Department</label>
              <select
                value={formData.department_id}
                onChange={(e) => setFormData({ ...formData, department_id: e.target.value })}
                style={{ width: "100%", padding: "8px", fontSize: "13px", borderRadius: "6px", border: "1px solid #cbd5e1" }}
              >
                <option value="">-- Pilih Departemen --</option>
                {departments.map((dept) => (
                  <option key={dept.id} value={dept.id}>
                    {dept.name}
                  </option>
                ))}
              </select>
            </div>

            <div style={{ display: "flex", gap: "8px", marginTop: "8px" }}>
              <button
                type="submit"
                style={{
                  flex: 1,
                  padding: "8px",
                  backgroundColor: "#2563eb",
                  color: "#ffffff",
                  border: "none",
                  borderRadius: "6px",
                  fontSize: "13px",
                  fontWeight: "500",
                  cursor: "pointer",
                }}
              >
                {isEditing ? "Update" : "Simpan"}
              </button>
              {isEditing && (
                <button
                  type="button"
                  onClick={resetForm}
                  style={{
                    padding: "8px 12px",
                    backgroundColor: "#e2e8f0",
                    color: "#475569",
                    border: "none",
                    borderRadius: "6px",
                    fontSize: "13px",
                    cursor: "pointer",
                  }}
                >
                  Batal
                </button>
              )}
            </div>
          </form>
        </div>

        {/* Table Section */}
        <div style={{ backgroundColor: "#ffffff", padding: "20px", borderRadius: "12px", border: "1px solid #e2e8f0" }}>
          <h2 style={{ fontSize: "14px", fontWeight: "bold", marginBottom: "16px", color: "#334155" }}>
            Daftar User
          </h2>

          {loading ? (
            <div style={{ fontSize: "13px", color: "#64748b" }}>Loading data...</div>
          ) : (
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "13px" }}>
              <thead>
                <tr style={{ borderBottom: "1px solid #e2e8f0", textAlign: "left", color: "#64748b" }}>
                  <th style={{ padding: "8px" }}>NIP</th>
                  <th style={{ padding: "8px" }}>Nama</th>
                  <th style={{ padding: "8px" }}>Email</th>
                  <th style={{ padding: "8px" }}>Role</th>
                  <th style={{ padding: "8px", textAlign: "center" }}>Aksi</th>
                </tr>
              </thead>
              <tbody>
                {users.map((user) => (
                  <tr key={user.id} style={{ borderBottom: "1px solid #f1f5f9" }}>
                    <td style={{ padding: "8px", fontFamily: "monospace" }}>{user.employee_number}</td>
                    <td style={{ padding: "8px", fontWeight: "500" }}>{user.full_name}</td>
                    <td style={{ padding: "8px" }}>{user.email}</td>
                    <td style={{ padding: "8px" }}>{user.role?.name || `Role #${user.role_id}`}</td>
                    <td style={{ padding: "8px", textAlign: "center" }}>
                      <button
                        onClick={() => handleEdit(user)}
                        style={{ border: "none", background: "none", color: "#2563eb", cursor: "pointer", fontSize: "12px", marginRight: "8px" }}
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(user.id)}
                        style={{ border: "none", background: "none", color: "#ef4444", cursor: "pointer", fontSize: "12px" }}
                      >
                        Hapus
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}