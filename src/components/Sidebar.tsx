"use client";

import React, { useRef } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';
import styles from './Sidebar.module.css';

const Sidebar = () => {
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
    { name: 'Dashboard (ภาพรวม)', path: '/', icon: '📊' },
    { name: 'POS (ขายหน้าร้าน)', path: '/pos', icon: '🛒' },
    { name: 'Inbound (รับของเข้า)', path: '/inbound', icon: '📥' },
    { name: 'Inventory (คลังสินค้า)', path: '/inventory', icon: '📦' },
    { name: 'Transactions', path: '/transactions', icon: '📋' },
    { name: 'Purchase Orders', path: '/orders', icon: '📄' },
    { name: 'Suppliers', path: '/suppliers', icon: '🏢' },
    { name: 'Settings', path: '/settings', icon: '⚙️' }
  ];

  return (
    <aside ref={sidebarRef} className={styles.sidebar}>
      <div className={styles.logo}>
        <div className={styles.logoIcon}>I</div>
        <h2>Invento</h2>
      </div>
      <nav className={styles.nav}>
        {links.map((link) => (
          <Link 
            key={link.path} 
            href={link.path} 
            className={`${styles.navLink} nav-item ${pathname === link.path ? styles.active : ''}`}
          >
            <span className={styles.icon}>{link.icon}</span>
            <span>{link.name}</span>
          </Link>
        ))}
      </nav>
      
      <div className={`${styles.userProfile} nav-item`}>
        <div className={styles.avatar}>A</div>
        <div className={styles.userInfo}>
          <p className={styles.userName}>Admin User</p>
          <p className={styles.userRole}>Administrator</p>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
