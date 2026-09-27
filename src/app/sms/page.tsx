"use client";
import React, { useState, useEffect } from 'react';

export default function SmsPage() {
  const [logs, setLogs] = useState<any[]>([]);
  const [phoneNumber, setPhoneNumber] = useState('');
  const [message, setMessage] = useState('');
  
  const fetchLogs = async () => {
    const res = await fetch('/api/sms');
    setLogs(await res.json());
  };

  useEffect(() => { fetchLogs(); }, []);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    await fetch('/api/sms', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ phoneNumber, message })
    });
    setPhoneNumber(''); setMessage('');
    alert('SMS Sent!');
    fetchLogs();
  };

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto', padding: '2rem 0' }}>
      <h1 style={{ fontSize: '2rem', fontWeight: 700, marginBottom: '2rem' }}>SMS Marketing</h1>
      <div className="card glass" style={{ marginBottom: '2rem' }}>
        <h2 style={{ fontSize: '1.25rem', marginBottom: '1rem' }}>Send SMS</h2>
        <form onSubmit={handleSend} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <input className="input" placeholder="Phone Number (เบอร์โทรศัพท์)" value={phoneNumber} onChange={e => setPhoneNumber(e.target.value)} required />
          <textarea className="input" placeholder="Message (ข้อความ)" value={message} onChange={e => setMessage(e.target.value)} required style={{ minHeight: '100px' }}></textarea>
          <button className="btn btn-primary" type="submit">Send Message</button>
        </form>
      </div>
      
      <div className="card glass">
        <h2 style={{ fontSize: '1.25rem', marginBottom: '1rem' }}>SMS History</h2>
        <table style={{ width: '100%', textAlign: 'left' }}>
          <thead>
            <tr style={{ borderBottom: '1px solid var(--border)' }}>
              <th style={{ padding: '0.5rem' }}>Date</th>
              <th style={{ padding: '0.5rem' }}>Phone</th>
              <th style={{ padding: '0.5rem' }}>Message</th>
              <th style={{ padding: '0.5rem' }}>Status</th>
            </tr>
          </thead>
          <tbody>
            {logs.map(log => (
              <tr key={log.id} style={{ borderBottom: '1px solid var(--border)' }}>
                <td style={{ padding: '0.5rem', fontSize: '0.875rem' }}>{new Date(log.createdAt).toLocaleString()}</td>
                <td style={{ padding: '0.5rem', fontWeight: 600 }}>{log.phoneNumber}</td>
                <td style={{ padding: '0.5rem' }}>{log.message}</td>
                <td style={{ padding: '0.5rem', color: '#10b981' }}>{log.status}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
