'use client';

import React, { useEffect } from 'react';

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('Application Error:', error);
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
        ระบบกำลังกู้คืนการทำงาน
      </h2>
      <p style={{ color: '#94a3b8', maxWidth: '480px', marginBottom: '1.5rem', fontSize: '0.9rem' }}>
        กำลังเชื่อมต่อกับเซิร์ฟเวอร์ กรุณากดลองใหม่อีกครั้ง
      </p>
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
        🔄 โหลดข้อมูลใหม่
      </button>
    </div>
  );
}
