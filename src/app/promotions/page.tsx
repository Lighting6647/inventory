"use client";
import React, { useState, useEffect } from 'react';

type Promotion = {
  id: string;
  code: string;
  name: string;
  discountType: 'PERCENT' | 'FIXED';
  discountValue: number;
  isActive: boolean;
};

export default function PromotionsPage() {
  const [promotions, setPromotions] = useState<Promotion[]>([]);
  const [loading, setLoading] = useState(true);
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({ code: '', name: '', discountType: 'PERCENT', discountValue: 0 });

  const fetchPromotions = async () => {
    try {
      const res = await fetch('/api/promotions');
      const data = await res.json();
      setPromotions(data);
    } catch(err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchPromotions(); }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await fetch('/api/promotions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...formData, discountValue: Number(formData.discountValue), isActive: true })
      });
      setIsModalOpen(false);
      setFormData({ code: '', name: '', discountType: 'PERCENT', discountValue: 0 });
      fetchPromotions();
    } catch(err) {
      alert('Error saving promotion');
    }
  };

  const toggleActive = async (id: string, isActive: boolean) => {
    try {
      await fetch(`/api/promotions/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isActive: !isActive })
      });
      fetchPromotions();
    } catch(err) {}
  };

  const handleDelete = async (id: string) => {
    if(!confirm('คุณแน่ใจหรือไม่ว่าจะลบโปรโมชั่นนี้?')) return;
    try {
      await fetch(`/api/promotions/${id}`, { method: 'DELETE' });
      fetchPromotions();
    } catch(err) {}
  };

  return (
    <div style={{ padding: '2rem', maxWidth: '1000px', margin: '0 auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <div>
          <h1 style={{ fontSize: '1.8rem', fontWeight: 700, color: 'var(--text-primary)' }}>🎟️ โปรโมชั่นและคูปอง</h1>
          <p style={{ color: 'var(--text-secondary)' }}>จัดการส่วนลดและคูปองโปรโมชั่นสำหรับใช้ในหน้า POS</p>
        </div>
        <button className="btn btn-primary" onClick={() => setIsModalOpen(true)}>+ สร้างโปรโมชั่นใหม่</button>
      </div>

      <div className="card">
        {loading ? <p>Loading...</p> : (
          <table style={{ width: '100%', textAlign: 'left', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ borderBottom: '2px solid var(--border)', color: 'var(--text-secondary)' }}>
                <th style={{ padding: '1rem' }}>โค้ด (Code)</th>
                <th style={{ padding: '1rem' }}>ชื่อโปรโมชั่น</th>
                <th style={{ padding: '1rem' }}>ส่วนลด</th>
                <th style={{ padding: '1rem' }}>สถานะ</th>
                <th style={{ padding: '1rem', textAlign: 'right' }}>จัดการ</th>
              </tr>
            </thead>
            <tbody>
              {promotions.map(promo => (
                <tr key={promo.id} style={{ borderBottom: '1px solid var(--border)' }}>
                  <td style={{ padding: '1rem', fontWeight: 600, color: 'var(--primary)' }}>{promo.code}</td>
                  <td style={{ padding: '1rem' }}>{promo.name}</td>
                  <td style={{ padding: '1rem', fontWeight: 700 }}>
                    {promo.discountType === 'PERCENT' ? `${promo.discountValue}%` : `฿${promo.discountValue}`}
                  </td>
                  <td style={{ padding: '1rem' }}>
                    <button 
                      onClick={() => toggleActive(promo.id, promo.isActive)}
                      style={{ 
                        padding: '4px 12px', borderRadius: '20px', fontSize: '0.8rem', fontWeight: 600,
                        backgroundColor: promo.isActive ? '#dcfce7' : '#f1f5f9',
                        color: promo.isActive ? '#166534' : '#64748b'
                      }}
                    >
                      {promo.isActive ? 'เปิดใช้งาน' : 'ปิดใช้งาน'}
                    </button>
                  </td>
                  <td style={{ padding: '1rem', textAlign: 'right' }}>
                    <button onClick={() => handleDelete(promo.id)} style={{ color: 'var(--danger)', cursor: 'pointer' }}>ลบ</button>
                  </td>
                </tr>
              ))}
              {promotions.length === 0 && (
                <tr>
                  <td colSpan={5} style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-tertiary)' }}>
                    ยังไม่มีโปรโมชั่น
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        )}
      </div>

      {isModalOpen && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 50 }}>
          <div className="card" style={{ width: '400px', margin: '2rem' }}>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '1.5rem' }}>สร้างโปรโมชั่นใหม่</h2>
            <form onSubmit={handleSave}>
              <div style={{ marginBottom: '1rem' }}>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600 }}>โค้ดโปรโมชั่น (ห้ามซ้ำ)</label>
                <input required className="input" placeholder="เช่น SUMMER20" value={formData.code} onChange={e => setFormData({...formData, code: e.target.value.toUpperCase()})} />
              </div>
              <div style={{ marginBottom: '1rem' }}>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600 }}>ชื่อโปรโมชั่น</label>
                <input required className="input" placeholder="เช่น ส่วนลดหน้าร้อน 20%" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} />
              </div>
              <div style={{ marginBottom: '1rem', display: 'flex', gap: '1rem' }}>
                <div style={{ flex: 1 }}>
                  <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600 }}>ประเภทส่วนลด</label>
                  <select className="input" value={formData.discountType} onChange={e => setFormData({...formData, discountType: e.target.value as any})}>
                    <option value="PERCENT">ลดเป็นเปอร์เซ็นต์ (%)</option>
                    <option value="FIXED">ลดเป็นจำนวนเงิน (฿)</option>
                  </select>
                </div>
                <div style={{ flex: 1 }}>
                  <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600 }}>มูลค่าส่วนลด</label>
                  <input required type="number" min="0" step="0.01" className="input" value={formData.discountValue} onChange={e => setFormData({...formData, discountValue: e.target.value as any})} />
                </div>
              </div>
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem', marginTop: '2rem' }}>
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