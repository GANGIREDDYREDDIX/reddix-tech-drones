"use client";

import { useState, useEffect } from "react";
import { UserPlus, ShieldAlert } from "lucide-react";
import styles from "./staff.module.css";

interface Staff {
  id: string;
  name: string;
  email: string;
  role: "Super Admin" | "Support Agent" | "Inventory Manager";
  status: "Active" | "Suspended";
  last_login: string;
}

export default function StaffPage() {
  const [staffList, setStaffList] = useState<Staff[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/staff")
      .then(res => res.json())
      .then(data => {
        setStaffList(data);
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setLoading(false);
      });
  }, []);

  const handleRoleChange = (id: string, newRole: string) => {
    // Optimistic UI update. In a real app, make a PUT request.
    setStaffList(staffList.map(s => s.id === id ? { ...s, role: newRole as Staff["role"] } : s));
  };

  return (
    <div className={styles.container}>
      <div className={styles.headerRow}>
        <div>
          <h1 className={styles.title}>Staff & Roles</h1>
          <p className={styles.subtitle}>Manage admin accounts and their permission levels.</p>
        </div>
        <button className={styles.addBtn}>
          <UserPlus size={18} /> Add Staff Member
        </button>
      </div>

      <div className={styles.tableCard}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th>Team Member</th>
              <th>Role</th>
              <th>Status</th>
              <th className={styles.textRight}>Last Login</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={4} style={{ textAlign: "center", padding: "24px" }}>Loading staff...</td></tr>
            ) : staffList.length === 0 ? (
              <tr><td colSpan={4} style={{ textAlign: "center", padding: "24px" }}>No staff found</td></tr>
            ) : staffList.map(staff => (
              <tr key={staff.id}>
                <td>
                  <div className={styles.staffInfo}>
                    <div className={styles.avatar}>
                      {staff.name.charAt(0)}
                    </div>
                    <div>
                      <div className={styles.staffName}>
                        {staff.name} {staff.role === "Super Admin" && <ShieldAlert size={14} style={{ color: "#3b82f6", display: "inline", marginLeft: "4px" }} />}
                      </div>
                      <div className={styles.staffEmail}>{staff.email}</div>
                    </div>
                  </div>
                </td>
                <td>
                  <select 
                    className={styles.roleSelect}
                    value={staff.role}
                    onChange={(e) => handleRoleChange(staff.id, e.target.value)}
                    disabled={staff.role === "Super Admin" && staff.id === "STAFF-01"} // Prevent changing main admin
                  >
                    <option value="Super Admin">Super Admin</option>
                    <option value="Inventory Manager">Inventory Manager</option>
                    <option value="Support Agent">Support Agent</option>
                  </select>
                </td>
                <td>
                  <span className={`${styles.statusBadge} ${styles[`badge${staff.status}`]}`}>
                    {staff.status}
                  </span>
                </td>
                <td className={styles.textRight}>
                  {new Date(staff.last_login).toLocaleString()}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
