"use client";
import React from 'react';

export default function HelpPage() {
  return (
    <div style={{ maxWidth: '800px', margin: '0 auto', padding: '2rem 0' }}>
      <h1 style={{ fontSize: '2rem', fontWeight: 700, marginBottom: '2rem' }}>วิธีใช้งานระบบ (Help & Support) ❓</h1>
      
      <div className="card glass" style={{ marginBottom: '1.5rem' }}>
        <h2 style={{ fontSize: '1.25rem', fontWeight: 600, marginBottom: '1rem' }}>วิดีโอสาธิตการใช้งาน POS (Demo) 🎬</h2>
        <div style={{ borderRadius: '8px', overflow: 'hidden', border: '1px solid var(--border)', boxShadow: 'var(--shadow-md)' }}>
          <video 
            src="/demo.mp4" 
            controls 
            autoPlay 
            muted 
            loop 
            style={{ width: '100%', display: 'block' }}
          >
            เบราว์เซอร์ของคุณไม่รองรับการแสดงผลวิดีโอ
          </video>
        </div>
      </div>

      <div className="card glass" style={{ marginBottom: '1.5rem' }}>
        <h2 style={{ fontSize: '1.25rem', fontWeight: 600, marginBottom: '0.5rem' }}>การขายหน้าร้าน (POS)</h2>
        <p style={{ color: 'var(--text-secondary)' }}>ไปที่เมนู <strong>งานขายและ POS</strong> ค้นหาหรือสแกนบาร์โค้ดเพื่อเพิ่มสินค้าลงตะกร้า จากนั้นเลือกวิธีการชำระเงิน ใส่จำนวนเงินที่รับมา และกดปุ่ม <strong>ชำระเงิน</strong></p>
      </div>

      <div className="card glass" style={{ marginBottom: '1.5rem' }}>
        <h2 style={{ fontSize: '1.25rem', fontWeight: 600, marginBottom: '0.5rem' }}>การจัดการสินค้าคงคลัง (Inventory)</h2>
        <p style={{ color: 'var(--text-secondary)' }}>ไปที่เมนู <strong>สินค้า</strong> เพื่อดูรายการสินค้าทั้งหมด หากต้องการนำเข้าสต๊อกใหม่ ให้ไปที่ <strong>รับเข้าสินค้า</strong></p>
      </div>
      
      <div className="card glass" style={{ marginBottom: '1.5rem' }}>
        <h2 style={{ fontSize: '1.25rem', fontWeight: 600, marginBottom: '0.5rem' }}>ระบบโปรโมชั่นและสะสมแต้มลูกค้า (CRM)</h2>
        <p style={{ color: 'var(--text-secondary)' }}>ระบบจะสะสมแต้มให้อัตโนมัติเมื่อลูกค้าซื้อครบเงื่อนไข (100 บาท = 1 แต้ม) คุณสามารถใส่ชื่อลูกค้าและกดใช้แต้มเป็นส่วนลดในหน้า POS ได้เลย</p>
      </div>
    </div>
  );
}