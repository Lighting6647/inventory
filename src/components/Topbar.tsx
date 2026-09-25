import React from 'react';
import Link from 'next/link';

const Topbar = () => {
  return (
    <header style={{ 
      height: '50px', 
      backgroundColor: '#3c8dbc', 
      color: 'white', 
      display: 'flex', 
      alignItems: 'center', 
      justifyContent: 'space-between', 
      padding: '0 1rem' 
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
        <span style={{ fontSize: '1.25rem', cursor: 'pointer' }}>☰</span>
        <button style={{ backgroundColor: '#00a65a', border: 'none', color: 'white', padding: '0.25rem 0.5rem', borderRadius: '3px', cursor: 'pointer', fontWeight: 'bold' }}>+</button>
      </div>
      
      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', fontSize: '0.875rem' }}>
        <span style={{ cursor: 'pointer' }}>🇹🇭 Thai</span>
        <Link href="/pos" style={{ color: 'white', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
          <span>🛒</span> POS
        </Link>
        <Link href="/" style={{ color: 'white', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
          <span>🏠</span> ภาพรวม
        </Link>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
          <span>👤</span> Admin
        </div>
      </div>
    </header>
  );
};

export default Topbar;
