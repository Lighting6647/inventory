"use client";

import React from 'react';
import styles from './Topbar.module.css';

interface TopbarProps {
  onToggleSidebar?: () => void;
}

export default function Topbar({ onToggleSidebar }: TopbarProps) {
  return (
    <header className={styles.topbar} style={{ padding: '0 1rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', backgroundColor: '#3c8dbc', color: 'white', height: '50px' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
        <button 
          onClick={onToggleSidebar} 
          style={{ background: 'none', border: 'none', color: 'white', fontSize: '1.25rem', cursor: 'pointer', padding: '0.25rem 0.5rem' }}
          aria-label="Toggle menu"
        >
          ☰
        </button>
        <span style={{ fontWeight: 600, fontSize: '1.1rem' }}>DPOS POS & Inventory</span>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
        <div style={{ fontSize: '0.875rem' }}>Admin</div>
        <div className={styles.avatar} style={{ backgroundColor: '#222d32', width: '32px', height: '32px' }}>A</div>
      </div>
    </header>
  );
}
