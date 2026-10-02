"use client";

import React from 'react';
import styles from './Topbar.module.css';
import Logo from './Logo';

interface TopbarProps {
  onToggleSidebar?: () => void;
}

export default function Topbar({ onToggleSidebar }: TopbarProps) {
  return (
    <header 
      className={styles.topbar} 
      style={{ 
        padding: '0 1rem', 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'space-between', 
        backgroundColor: '#1e3a5f', 
        borderBottom: '1px solid rgba(255, 255, 255, 0.08)', 
        color: 'white', 
        height: '56px' 
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
        <button 
          onClick={onToggleSidebar} 
          style={{ 
            background: 'none', 
            border: 'none', 
            color: 'white', 
            fontSize: '1.25rem', 
            cursor: 'pointer', 
            padding: '0.25rem 0.5rem', 
            display: 'flex', 
            alignItems: 'center' 
          }}
          aria-label="Toggle menu"
        >
          ☰
        </button>
        <Logo size="small" />
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
        <div style={{ fontSize: '0.875rem', fontWeight: 500 }}>Admin</div>
        <div 
          className={styles.avatar} 
          style={{ 
            backgroundColor: '#0f172a', 
            width: '34px', 
            height: '34px',
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontWeight: 700,
            border: '1px solid rgba(255, 255, 255, 0.2)'
          }}
        >
          A
        </div>
      </div>
    </header>
  );
}
