"use client";

import React, { useRef } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';
import styles from './Sidebar.module.css';
import Logo from './Logo';

interface SidebarProps {
  onClose?: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ onClose }) => {
  const sidebarRef = useRef<HTMLElement>(null);
  const pathname = usePathname();

  useGSAP(() => {
    gsap.fromTo(
      sidebarRef.current,
      { x: -250, opacity: 0 },
      { x: 0, opacity: 1, duration: 0.8, ease: 'power3.out' }
    );

    gsap.fromTo(
      '.nav-item',
      { x: -20, opacity: 0 },
      { x: 0, opacity: 1, duration: 0.5, stagger: 0.1, ease: 'power2.out', delay: 0.3 }
    );
  }, []);

  const links = [
    { name: 'ภาพรวม', path: '/', icon: '🏠' },
    { name: 'งานขายและ POS', path: '/pos', icon: '🛒' },
    { name: 'ลูกค้า', path: '/customers', icon: '👥' },
    { name: 'ซื้อ', path: '/inbound', icon: '📥' },
    { name: 'ผู้จำหน่าย', path: '/suppliers', icon: '🏢' },
    { name: 'สินค้า', path: '/inventory', icon: '📦' },
    { name: 'ค่าใช้จ่าย', path: '/expenses', icon: '💸' },
    { name: 'สถานที่', path: '/locations', icon: '📍' },
    { name: 'รายงาน', path: '/reports', icon: '📊' },
    { name: 'ผู้ใช้งาน', path: '/users', icon: '👨‍💼' },
    { name: 'SMS', path: '/sms', icon: '✉️' },
    { name: 'ตั้งค่า', path: '/settings', icon: '⚙️' },
    { name: 'ช่วยเหลือ', path: '/help', icon: '❓' }
  ];

  return (
    <aside ref={sidebarRef} className={styles.sidebar}>
      <div className={styles.logo} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0 1rem' }}>
        <Logo size="medium" />
        {onClose && (
          <button 
            onClick={onClose}
            style={{ color: '#b8c7ce', fontSize: '1.25rem', background: 'none', border: 'none', cursor: 'pointer', padding: '0.25rem' }}
            aria-label="Close menu"
          >
            ✕
          </button>
        )}
      </div>
      
      <div className={`${styles.userProfile} nav-item`}>
        <div className={styles.avatar}>👤</div>
        <div className={styles.userInfo}>
          <p className={styles.userName}>Admin <span style={{color: '#00a65a'}}>✔</span></p>
          <p className={styles.userRole}><span style={{color: '#00a65a', fontSize: '10px'}}>●</span> Online</p>
        </div>
      </div>

      <nav className={styles.nav}>
        {links.map((link) => (
          <Link 
            key={link.path} 
            href={link.path} 
            onClick={onClose}
            className={`${styles.navLink} nav-item ${pathname === link.path ? styles.active : ''}`}
          >
            <span className={styles.icon}>{link.icon}</span>
            <span>{link.name}</span>
          </Link>
        ))}
      </nav>
    </aside>
  );
};

export default Sidebar;
