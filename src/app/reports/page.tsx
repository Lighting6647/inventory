"use client";
import React, { useState, useEffect } from 'react';

export default function ReportsPage() {
  const [sales, setSales] = useState<any[]>([]);

  useEffect(() => {
    fetch('/api/transactions') // using existing API or simple summary
      .then(r => r.json())
      .then(data => {
        // Just mock some data for the report view
        setSales(data.slice(0, 50));
      })
      .catch(console.error);
  }, []);

  return (
    <div style={{ maxWidth: '1000px', margin: '0 auto', padding: '2rem 0' }}>
      <h1 style={{ fontSize: '2rem', fontWeight: 700, marginBottom: '2rem' }}>Reports (รายงาน)</h1>
      
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginBottom: '2rem' }}>
        <div className="card" style={{ borderLeft: '4px solid #3c8dbc' }}>
          <h3 style={{ fontSize: '1rem', color: 'var(--secondary-foreground)' }}>Daily Sales</h3>
          <p style={{ fontSize: '1.5rem', fontWeight: 700 }}>฿ 14,500</p>
        </div>
        <div className="card" style={{ borderLeft: '4px solid #00a65a' }}>
          <h3 style={{ fontSize: '1rem', color: 'var(--secondary-foreground)' }}>Total Orders</h3>
          <p style={{ fontSize: '1.5rem', fontWeight: 700 }}>45</p>
        </div>
        <div className="card" style={{ borderLeft: '4px solid #f39c12' }}>
          <h3 style={{ fontSize: '1rem', color: 'var(--secondary-foreground)' }}>New Customers</h3>
          <p style={{ fontSize: '1.5rem', fontWeight: 700 }}>12</p>
        </div>
      </div>

      <div className="card glass">
        <h2 style={{ fontSize: '1.25rem', marginBottom: '1rem' }}>Recent Transaction Log</h2>
        <table style={{ width: '100%', textAlign: 'left' }}>
          <thead>
            <tr style={{ borderBottom: '1px solid var(--border)' }}>
              <th style={{ padding: '0.5rem' }}>Date</th>
              <th style={{ padding: '0.5rem' }}>Type</th>
              <th style={{ padding: '0.5rem' }}>Qty</th>
              <th style={{ padding: '0.5rem' }}>Reference</th>
            </tr>
          </thead>
          <tbody>
            {sales.length === 0 ? <tr><td colSpan={4}>No data yet</td></tr> : null}
            {sales.map((s: any) => (
              <tr key={s.id} style={{ borderBottom: '1px solid var(--border)' }}>
                <td style={{ padding: '0.5rem' }}>{new Date(s.createdAt).toLocaleDateString()}</td>
                <td style={{ padding: '0.5rem' }}>
                  <span style={{ padding: '0.2rem 0.5rem', background: s.type === 'OUT' ? '#fee2e2' : '#d1fae5', color: s.type === 'OUT' ? '#ef4444' : '#10b981', borderRadius: '4px', fontSize: '0.8rem' }}>
                    {s.type}
                  </span>
                </td>
                <td style={{ padding: '0.5rem' }}>{s.quantity}</td>
                <td style={{ padding: '0.5rem' }}>{s.reference || '-'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
