"use client";
import React, { useState, useEffect } from 'react';

type Customer = { id: string, name: string, phone: string, email: string, points: number };

export default function CustomersPage() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({ name: '', phone: '', email: '' });

  const fetchCustomers = async () => {
    try {
      const res = await fetch('/api/customers');
      setCustomers(await res.json());
    } catch(err) {} finally { setLoading(false); }
  };

  useEffect(() => { fetchCustomers(); }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await fetch('/api/customers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      setIsModalOpen(false);
      setFormData({ name: '', phone: '', email: '' });
      fetchCustomers();
    } catch(err) { alert('Error'); }
  };

  return (
    <div style={{ padding: '2rem', maxWidth: '1000px', margin: '0 auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <div>
          <h1 style={{ fontSize: '1.8rem', fontWeight: 700, color: 'var(--text-primary)' }}>👥 ฐานข้อมูลลูกค้า (CRM & Loyalty)</h1>
          <p style={{ color: 'var(--text-secondary)' }}>จัดการข้อมูลลูกค้าและระบบสะสมแต้ม</p>
        </div>
        <button className="btn btn-primary" onClick={() => setIsModalOpen(true)}>+ เพิ่มลูกค้าใหม่</button>
      </div>

      <div className="card">
        {loading ? <p>Loading...</p> : (
          <table style={{ width: '100%', textAlign: 'left', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ borderBottom: '2px solid var(--border)' }}>
                <th style={{ padding: '1rem' }}>ชื่อลูกค้า</th>
                <th style={{ padding: '1rem' }}>เบอร์โทร</th>
                <th style={{ padding: '1rem' }}>อีเมล</th>
                <th style={{ padding: '1rem', textAlign: 'center' }}>แต้มสะสม (Points)</th>
              </tr>
            </thead>
            <tbody>
              {customers.map(c => (
                <tr key={c.id} style={{ borderBottom: '1px solid var(--border)' }}>
                  <td style={{ padding: '1rem', fontWeight: 600 }}>{c.name}</td>
                  <td style={{ padding: '1rem' }}>{c.phone || '-'}</td>
                  <td style={{ padding: '1rem' }}>{c.email || '-'}</td>
                  <td style={{ padding: '1rem', textAlign: 'center', color: 'var(--primary)', fontWeight: 800, fontSize: '1.1rem' }}>{c.points}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {isModalOpen && (
        <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 50 }}>
          <div className="card" style={{ width: '400px' }}>
            <h2 style={{ marginBottom: '1.5rem' }}>เพิ่มลูกค้าใหม่</h2>
            <form onSubmit={handleSave}>
              <div style={{ marginBottom: '1rem' }}><label>ชื่อลูกค้า</label><input required className="input" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} /></div>
              <div style={{ marginBottom: '1rem' }}><label>เบอร์โทร</label><input className="input" value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} /></div>
              <div style={{ marginBottom: '1.5rem' }}><label>อีเมล</label><input className="input" type="email" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} /></div>
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem' }}>
                <button type="button" className="btn btn-secondary" onClick={() => setIsModalOpen(false)}>ยกเลิก</button>
                <button type="submit" className="btn btn-primary">บันทึก</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}