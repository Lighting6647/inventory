"use client";
import React, { useState, useEffect } from 'react';

export default function SettingsPage() {
  const [settings, setSettings] = useState<{ [key: string]: string }>({});
  const [storeName, setStoreName] = useState('');
  const [taxRate, setTaxRate] = useState('');
  const [promptPayNumber, setPromptPayNumber] = useState('');
  
  const fetchSettings = async () => {
    const res = await fetch('/api/settings');
    const data = await res.json();
    const map: any = {};
    data.forEach((s: any) => { map[s.key] = s.value; });
    setSettings(map);
    setStoreName(map['STORE_NAME'] || '');
    setTaxRate(map['TAX_RATE'] || '');
    setPromptPayNumber(map['PROMPTPAY_NUMBER'] || '');
  };

  useEffect(() => { fetchSettings(); }, []);

  const handleSave = async (key: string, value: string) => {
    await fetch('/api/settings', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ key, value })
    });
    fetchSettings();
    alert('บันทึกข้อมูลเรียบร้อยแล้ว (Setting saved!)');
  };

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto', padding: '2rem 0' }}>
      <h1 style={{ fontSize: '2rem', fontWeight: 700, marginBottom: '2rem' }}>ตั้งค่าระบบ (Settings)</h1>
      <div className="card glass">
        <h2 style={{ fontSize: '1.25rem', marginBottom: '1rem' }}>การตั้งค่าทั่วไป (General Configuration)</h2>
        
        <div style={{ marginBottom: '1.5rem' }}>
          <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600 }}>ชื่อร้านค้า (Store Name)</label>
          <div style={{ display: 'flex', gap: '1rem' }}>
            <input className="input" style={{ flex: 1 }} value={storeName} onChange={e => setStoreName(e.target.value)} />
            <button className="btn btn-primary" onClick={() => handleSave('STORE_NAME', storeName)}>บันทึก (Save)</button>
          </div>
        </div>

        <div style={{ marginBottom: '1.5rem' }}>
          <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600 }}>หมายเลขพร้อมเพย์รับเงิน (PromptPay Number)</label>
          <div style={{ display: 'flex', gap: '1rem' }}>
            <input className="input" style={{ flex: 1 }} placeholder="เช่น 0812345678 หรือ 1234567890123" value={promptPayNumber} onChange={e => setPromptPayNumber(e.target.value)} />
            <button className="btn btn-primary" onClick={() => handleSave('PROMPTPAY_NUMBER', promptPayNumber)}>บันทึก (Save)</button>
          </div>
        </div>

        <div style={{ marginBottom: '1.5rem' }}>
          <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600 }}>ภาษี % (Tax Rate %)</label>
          <div style={{ display: 'flex', gap: '1rem' }}>
            <input className="input" style={{ flex: 1 }} type="number" value={taxRate} onChange={e => setTaxRate(e.target.value)} />
            <button className="btn btn-primary" onClick={() => handleSave('TAX_RATE', taxRate)}>บันทึก (Save)</button>
          </div>
        </div>
        
      </div>
    </div>
  );
}
