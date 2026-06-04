"use client";

import { useState } from "react";
import { UserPlus, ShieldAlert } from "lucide-react";
import styles from "./staff.module.css";

interface Staff {
  id: string;
  name: string;
  email: string;
  role: "Super Admin" | "Support Agent" | "Inventory Manager";
  status: "Active" | "Suspended";
  lastLogin: string;
}

const mockStaff: Staff[] = [
  { id: "STAFF-01", name: "Alice Admin", email: "alice@reddix.tech", role: "Super Admin", status: "Active", lastLogin: "2024-06-05T01:30:00Z" },
  { id: "STAFF-02", name: "Bob Support", email: "bob@reddix.tech", role: "Support Agent", status: "Active", lastLogin: "2024-06-04T12:00:00Z" },
  { id: "STAFF-03", name: "Charlie Stock", email: "charlie@reddix.tech", role: "Inventory Manager", status: "Active", lastLogin: "2024-06-04T09:15:00Z" },
  { id: "STAFF-04", name: "David Temp", email: "david@reddix.tech", role: "Support Agent", status: "Suspended", lastLogin: "2024-05-20T16:45:00Z" },
];

export default function StaffPage() {
  const [staffList, setStaffList] = useState<Staff[]>(mockStaff);

  const handleRoleChange = (id: string, newRole: string) => {
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
            {staffList.map(staff => (
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
                  {new Date(staff.lastLogin).toLocaleString()}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
