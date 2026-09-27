"use client";
import React, { useState, useEffect } from 'react';

export default function UsersPage() {
  const [users, setUsers] = useState<any[]>([]);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('STAFF');

  const fetchUsers = async () => {
    const res = await fetch('/api/users');
    setUsers(await res.json());
  };

  useEffect(() => { fetchUsers(); }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await fetch('/api/users', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password, role })
    });
    setUsername(''); setPassword('');
    fetchUsers();
  };

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto', padding: '2rem 0' }}>
      <h1 style={{ fontSize: '2rem', fontWeight: 700, marginBottom: '2rem' }}>Users (ผู้ใช้งาน)</h1>
      <div className="card glass" style={{ marginBottom: '2rem' }}>
        <h2 style={{ fontSize: '1.25rem', marginBottom: '1rem' }}>Add New User</h2>
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <input className="input" placeholder="Username (ชื่อผู้ใช้)" value={username} onChange={e => setUsername(e.target.value)} required />
          <input className="input" type="password" placeholder="Password (รหัสผ่าน)" value={password} onChange={e => setPassword(e.target.value)} required />
          <select className="input" value={role} onChange={e => setRole(e.target.value)}>
            <option value="STAFF">Staff (พนักงาน)</option>
            <option value="MANAGER">Manager (ผู้จัดการ)</option>
            <option value="ADMIN">Admin (ผู้ดูแลระบบ)</option>
          </select>
          <button className="btn btn-primary" type="submit">Create User</button>
        </form>
      </div>
      <div className="card glass">
        <h2 style={{ fontSize: '1.25rem', marginBottom: '1rem' }}>User List</h2>
        <table style={{ width: '100%', textAlign: 'left' }}>
          <thead>
            <tr style={{ borderBottom: '1px solid var(--border)' }}>
              <th style={{ padding: '0.5rem' }}>Username</th>
              <th style={{ padding: '0.5rem' }}>Role</th>
              <th style={{ padding: '0.5rem' }}>Created At</th>
            </tr>
          </thead>
          <tbody>
            {users.map(u => (
              <tr key={u.id} style={{ borderBottom: '1px solid var(--border)' }}>
                <td style={{ padding: '0.5rem', fontWeight: 600 }}>{u.username}</td>
                <td style={{ padding: '0.5rem' }}>
                  <span style={{ padding: '0.25rem 0.5rem', backgroundColor: 'rgba(99,102,241,0.1)', color: 'var(--primary)', borderRadius: '4px', fontSize: '0.75rem' }}>
                    {u.role}
                  </span>
                </td>
                <td style={{ padding: '0.5rem', color: 'var(--secondary-foreground)' }}>{new Date(u.createdAt).toLocaleDateString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
