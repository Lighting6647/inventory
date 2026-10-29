'use client';

import React, { useEffect } from 'react';

export default function ErrorBoundary({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('POS Page Error caught:', error);
  }, [error]);

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      minHeight: '60vh',
      textAlign: 'center',
      padding: '2rem',
      color: '#fff',
    }}>
      <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>⚠️</div>
      <h2 style={{ fontSize: '1.5rem', marginBottom: '0.5rem', fontWeight: 700 }}>
        เกิดข้อผิดพลาดในการโหลดข้อมูล POS
      </h2>
      <p style={{ color: '#94a3b8', maxWidth: '480px', marginBottom: '1.5rem', fontSize: '0.9rem' }}>
        ระบบไม่สามารถเชื่อมต่อฐานข้อมูลได้ชั่วคราว หรือกำลังรอเซิร์ฟเวอร์ตอบกลับ
      </p>
      <div style={{ display: 'flex', gap: '1rem' }}>
        <button
          onClick={() => reset()}
          style={{
            padding: '0.6rem 1.25rem',
            backgroundColor: '#38bdf8',
            color: '#0f172a',
            border: 'none',
            borderRadius: '8px',
            fontWeight: 700,
            cursor: 'pointer',
          }}
        >
          🔄 ลองใหม่อีกครั้ง
        </button>
        <button
          onClick={() => window.location.href = '/'}
          style={{
            padding: '0.6rem 1.25rem',
            backgroundColor: 'rgba(255, 255, 255, 0.1)',
            color: '#fff',
            border: '1px solid rgba(255, 255, 255, 0.2)',
            borderRadius: '8px',
            fontWeight: 600,
            cursor: 'pointer',
          }}
        >
          กลับหน้าหลัก
        </button>
      </div>
    </div>
  );
}
