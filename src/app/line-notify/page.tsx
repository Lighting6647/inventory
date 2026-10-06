"use client";
import React, { useState, useEffect } from 'react';

export default function LineNotifyPage() {
  const [token, setToken] = useState('');
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    fetch('/api/settings').then(r => r.json()).then(data => {
      const s = data.find((x: any) => x.key === 'LINE_NOTIFY_TOKEN');
      if(s) setToken(s.value);
      setLoading(false);
    });
  }, []);

  const handleSave = async () => {
    await fetch('/api/settings', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ key: 'LINE_NOTIFY_TOKEN', value: token })
    });
    alert('บันทึก Token เรียบร้อยแล้ว');
  };

  const handleTest = async () => {
    try {
      const res = await fetch('/api/line-notify/test', { method: 'POST' });
      if (res.ok) alert('ส่งข้อความทดสอบสำเร็จ! ตรวจสอบที่ LINE ของคุณ');
      else alert('เกิดข้อผิดพลาดในการส่ง กรุณาตรวจสอบ Token');
    } catch(err) {
      alert('Error');
    }
  };

  if(loading) return <div>Loading...</div>;

  return (
    <div style={{ padding: '2rem', maxWidth: '800px', margin: '0 auto' }}>
      <h1 style={{ fontSize: '1.8rem', fontWeight: 700, marginBottom: '1rem', color: 'var(--text-primary)' }}>🟢 ตั้งค่า LINE Notify</h1>
      
      <div className="card">
        <p style={{ marginBottom: '1.5rem', color: 'var(--text-secondary)' }}>
          ระบบแจ้งเตือนผ่าน LINE ฟรี เมื่อมียอดขายขนาดใหญ่ หรือสต๊อกสินค้าใกล้หมด 
          กรุณาออก Token จาก <a href="https://notify-bot.line.me/" target="_blank" style={{ color: 'var(--primary)' }}>LINE Notify</a> และนำมากรอกที่นี่
        </p>

        <div style={{ marginBottom: '1.5rem' }}>
          <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600 }}>LINE Notify Token</label>
          <input 
            type="password" 
            className="input" 
            placeholder="e.g. xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx" 
            value={token} 
            onChange={e => setToken(e.target.value)} 
          />
        </div>

        <div style={{ display: 'flex', gap: '1rem' }}>
          <button className="btn btn-primary" onClick={handleSave}>💾 บันทึก Token</button>
          {token && (
            <button className="btn btn-secondary" onClick={handleTest}>🧪 ทดสอบส่งข้อความ</button>
          )}
        </div>
      </div>
    </div>
  );
}