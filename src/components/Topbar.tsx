"use client";

import React from 'react';
import styles from './Topbar.module.css';
import Logo from './Logo';

interface TopbarProps {
  onToggleSidebar?: () => void;
}

export default function Topbar({ onToggleSidebar }: TopbarProps) {
  return (
    <header className={styles.topbar}>
      <div className={styles.leftSection}>
        <button 
          onClick={onToggleSidebar} 
          className={styles.menuBtn}
          aria-label="Toggle menu"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="3" y1="12" x2="21" y2="12" />
            <line x1="3" y1="6" x2="21" y2="6" />
            <line x1="3" y1="18" x2="21" y2="18" />
          </svg>
        </button>
        <Logo size="small" />
      </div>

      <div className={styles.actions}>
        <div className={styles.statusIndicator}>
          <span className={styles.statusDot}></span>
          <span>Online Ready</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <div style={{ textAlign: 'right', display: 'flex', flexDirection: 'column' }}>
            <span style={{ fontSize: '0.85rem', fontWeight: 600, color: '#ffffff' }}>Admin Executive</span>
            <span style={{ fontSize: '0.7rem', color: '#94a3b8' }}>DPOS Boutique</span>
          </div>
          <div className={styles.avatar} title="Admin Profile">
            A
          </div>
        </div>
      </div>
    </header>
  );
}

