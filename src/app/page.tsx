"use client";

import React, { useEffect, useState, useRef } from 'react';
import Link from 'next/link';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';

type DashboardData = {
  totalProducts: number;
  lowStockItems: number;
  lowStockList?: Array<{
    id: string;
    name: string;
    sku: string;
    currentStock: number;
    minStockLevel: number;
    price: number;
  }>;
  topSellingProducts?: Array<{
    productId: string;
    name: string;
    sku: string;
    soldQty: number;
    totalRevenue: number;
  }>;
  todaySales: number;
  todayProfit: number;
  ordersCount: number;
  recentTransactions: any[];
};

export default function Dashboard() {
  const [data, setData] = useState<DashboardData | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetch('/api/dashboard')
      .then(res => res.json())
      .then(d => {
        if (d && !d.error && typeof d.todaySales === 'number') {
          setData(d);
        }
      })
      .catch(console.error);
  }, []);

  useGSAP(() => {
    if (data) {
      gsap.fromTo('.dpos-card', 
        { y: 20, opacity: 0 }, 
        { y: 0, opacity: 1, duration: 0.5, stagger: 0.04, ease: 'power2.out' }
      );
    }
  }, [data]);

  if (!data) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', padding: '1rem' }}>
        <div style={{ height: '70px', background: 'rgba(255, 255, 255, 0.04)', borderRadius: '14px', animation: 'pulse 1.5s infinite' }} />
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem' }}>
          {[...Array(8)].map((_, i) => (
            <div key={i} style={{ height: '95px', background: 'rgba(255, 255, 255, 0.03)', borderRadius: '16px', border: '1px solid rgba(255, 255, 255, 0.06)' }} />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div ref={containerRef} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', color: '#ffffff' }}>
      
      {/* Header & Quick Action Shortcuts */}
      <div className="dpos-card" style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center', 
        flexWrap: 'wrap', 
        gap: '1.25rem',
        padding: '1.25rem 1.5rem',
        background: 'rgba(17, 24, 39, 0.65)',
        backdropFilter: 'blur(24px)',
        WebkitBackdropFilter: 'blur(24px)',
        border: '1px solid rgba(255, 255, 255, 0.1)',
        borderRadius: '18px',
        boxShadow: '0 16px 40px rgba(0, 0, 0, 0.5)'
      }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
            <span style={{ 
              display: 'inline-flex', 
              alignItems: 'center', 
              justifyContent: 'center', 
              width: '28px', 
              height: '28px', 
              borderRadius: '8px', 
              background: 'rgba(56, 189, 248, 0.15)', 
              color: '#38bdf8' 
            }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <line x1="18" y1="20" x2="18" y2="10" />
                <line x1="12" y1="20" x2="12" y2="4" />
                <line x1="6" y1="20" x2="6" y2="14" />
              </svg>
            </span>
            <h1 style={{ fontSize: '1.35rem', fontWeight: 800, color: '#ffffff', margin: 0, letterSpacing: '-0.02em' }}>
              ภาพรวมระบบบริหารจัดการ (Executive Dashboard)
            </h1>
            <span style={{ 
              fontSize: '0.7rem', 
              fontWeight: 700, 
              padding: '2px 8px', 
              borderRadius: '9999px', 
              background: 'rgba(56, 189, 248, 0.15)', 
              color: '#38bdf8', 
              border: '1px solid rgba(56, 189, 248, 0.3)' 
            }}>
              LIVE POS 2.0
            </span>
          </div>
          <span style={{ fontSize: '0.8rem', color: '#94a3b8' }}>
            สรุปข้อมูลธุรกรรมการเงิน สต็อกเรียลไทม์ และสินค้าขายดีประจำวัน
          </span>
        </div>

        {/* Action Shortcuts */}
        <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
          <Link 
            href="/pos" 
            className="btn btn-primary"
            style={{ 
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              padding: '0.55rem 1.15rem',
              fontSize: '0.85rem'
            }}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="8" cy="21" r="1" />
              <circle cx="19" cy="21" r="1" />
              <path d="M2.05 2.05h2l2.66 12.42a2 2 0 0 0 2 1.58h9.78a2 2 0 0 0 1.95-1.57l1.65-7.43H5.12" />
            </svg>
            เปิด POS คิดเงิน
          </Link>
          <Link 
            href="/inbound" 
            className="btn btn-secondary"
            style={{ 
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              padding: '0.55rem 1.15rem',
              fontSize: '0.85rem'
            }}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
              <polyline points="7 10 12 15 17 10" />
              <line x1="12" x2="12" y1="15" y2="3" />
            </svg>
            รับสินค้าเข้าสต็อก
          </Link>
          <Link 
            href="/inventory" 
            className="btn btn-secondary"
            style={{ 
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              padding: '0.55rem 1.15rem',
              fontSize: '0.85rem'
            }}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="m7.5 4.27 9 5.15" />
              <path d="M21 8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16Z" />
              <path d="m3.3 7 8.7 5 8.7-5" />
              <path d="M12 22V12" />
            </svg>
            คลังสินค้า
          </Link>
        </div>
      </div>

      {/* Low Stock Warning Alert Banner (if any) */}
      {data.lowStockItems > 0 && (
        <div className="dpos-card" style={{ 
          backgroundColor: 'rgba(245, 158, 11, 0.12)', 
          border: '1px solid rgba(245, 158, 11, 0.35)', 
          borderRadius: '16px', 
          padding: '0.9rem 1.4rem',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          color: '#fbbf24',
          backdropFilter: 'blur(20px)',
          WebkitBackdropFilter: 'blur(20px)',
          fontSize: '0.875rem'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <span style={{ 
              display: 'inline-flex', 
              alignItems: 'center', 
              justifyContent: 'center',
              width: '32px', 
              height: '32px', 
              borderRadius: '50%', 
              background: 'rgba(245, 158, 11, 0.2)',
              color: '#f59e0b'
            }}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z" />
                <line x1="12" y1="9" x2="12" y2="13" />
                <line x1="12" y1="17" x2="12.01" y2="17" />
              </svg>
            </span>
            <div>
              <strong style={{ color: '#ffffff' }}>แจ้งเตือนสต็อกด่วน:</strong> มีสินค้าจำนวน <strong style={{ color: '#f87171' }}>{data.lowStockItems} รายการ</strong> ที่มีสต็อกต่ำกว่าเกณฑ์ความปลอดภัย
            </div>
          </div>
          <Link 
            href="/inbound" 
            style={{ 
              backgroundColor: '#f59e0b', 
              color: '#060913', 
              padding: '0.4rem 0.9rem', 
              borderRadius: '8px', 
              textDecoration: 'none', 
              fontWeight: 700, 
              fontSize: '0.75rem',
              boxShadow: '0 2px 8px rgba(245, 158, 11, 0.4)'
            }}
          >
            สั่งซื้อเติมสต็อก ➔
          </Link>
        </div>
      )}

      {/* Top 8 Stats Grid - Spatial Glass Executive Archetype */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem' }}>
        
        {/* KPI 1: PO Pending */}
        <div className="dpos-card" style={{ 
          background: 'rgba(17, 24, 39, 0.65)', 
          backdropFilter: 'blur(20px)', 
          WebkitBackdropFilter: 'blur(20px)',
          borderRadius: '16px', 
          border: '1px solid rgba(255, 255, 255, 0.1)', 
          padding: '1.15rem 1.25rem',
          boxShadow: '0 8px 24px rgba(0, 0, 0, 0.45)',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          gap: '0.75rem',
          transition: 'all 0.2s ease'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '0.75rem', fontWeight: 600, color: '#94a3b8' }}>งานจัดซื้อที่ค้างทั้งหมด</span>
            <div style={{ width: '32px', height: '32px', borderRadius: '10px', background: 'rgba(56, 189, 248, 0.15)', color: '#38bdf8', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect width="16" height="20" x="4" y="2" rx="2" ry="2" />
                <path d="M9 22v-4h6v4" />
              </svg>
            </div>
          </div>
          <div>
            <div style={{ fontSize: '1.45rem', fontWeight: 800, color: '#ffffff', letterSpacing: '-0.02em' }}>฿ 0.00</div>
            <div style={{ fontSize: '0.7rem', color: '#64748b', marginTop: '2px' }}>0 คำสั่งซื้อรอดำเนินการ</div>
          </div>
        </div>

        {/* KPI 2: Sales Pending */}
        <div className="dpos-card" style={{ 
          background: 'rgba(17, 24, 39, 0.65)', 
          backdropFilter: 'blur(20px)', 
          WebkitBackdropFilter: 'blur(20px)',
          borderRadius: '16px', 
          border: '1px solid rgba(255, 255, 255, 0.1)', 
          padding: '1.15rem 1.25rem',
          boxShadow: '0 8px 24px rgba(0, 0, 0, 0.45)',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          gap: '0.75rem'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '0.75rem', fontWeight: 600, color: '#94a3b8' }}>งานขายที่ค้างทั้งหมด</span>
            <div style={{ width: '32px', height: '32px', borderRadius: '10px', background: 'rgba(245, 158, 11, 0.15)', color: '#f59e0b', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10" />
                <path d="M12 6v6l4 2" />
              </svg>
            </div>
          </div>
          <div>
            <div style={{ fontSize: '1.45rem', fontWeight: 800, color: '#ffffff', letterSpacing: '-0.02em' }}>฿ 0.00</div>
            <div style={{ fontSize: '0.7rem', color: '#64748b', marginTop: '2px' }}>ออเดอร์พร้อมจัดส่ง</div>
          </div>
        </div>

        {/* KPI 3: Today Sales (Glow Emerald) */}
        <div className="dpos-card" style={{ 
          background: 'rgba(17, 24, 39, 0.65)', 
          backdropFilter: 'blur(20px)', 
          WebkitBackdropFilter: 'blur(20px)',
          borderRadius: '16px', 
          border: '1px solid rgba(16, 185, 129, 0.3)', 
          padding: '1.15rem 1.25rem',
          boxShadow: '0 8px 24px rgba(16, 185, 129, 0.15)',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          gap: '0.75rem'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '0.75rem', fontWeight: 600, color: '#34d399' }}>ยอดขายรวมวันนี้</span>
            <div style={{ width: '32px', height: '32px', borderRadius: '10px', background: 'rgba(16, 185, 129, 0.2)', color: '#10b981', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="12" y1="1" x2="12" y2="23" />
                <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
              </svg>
            </div>
          </div>
          <div>
            <div style={{ fontSize: '1.5rem', fontWeight: 800, color: '#34d399', letterSpacing: '-0.02em', textShadow: '0 0 12px rgba(52, 211, 153, 0.35)' }}>
              ฿ {data.todaySales.toLocaleString('en-US', { minimumFractionDigits: 2 })}
            </div>
            <div style={{ fontSize: '0.7rem', color: '#10b981', marginTop: '2px', display: 'flex', alignItems: 'center', gap: '4px' }}>
              <span>↑ ยอดชำระสมบูรณ์แล้ว</span>
            </div>
          </div>
        </div>

        {/* KPI 4: Total Expenses */}
        <div className="dpos-card" style={{ 
          background: 'rgba(17, 24, 39, 0.65)', 
          backdropFilter: 'blur(20px)', 
          WebkitBackdropFilter: 'blur(20px)',
          borderRadius: '16px', 
          border: '1px solid rgba(255, 255, 255, 0.1)', 
          padding: '1.15rem 1.25rem',
          boxShadow: '0 8px 24px rgba(0, 0, 0, 0.45)',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          gap: '0.75rem'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '0.75rem', fontWeight: 600, color: '#94a3b8' }}>ยอดค่าใช้จ่ายทั้งหมด</span>
            <div style={{ width: '32px', height: '32px', borderRadius: '10px', background: 'rgba(244, 63, 94, 0.15)', color: '#f43f5e', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect width="20" height="14" x="2" y="5" rx="2" />
                <line x1="2" x2="22" y1="10" y2="10" />
              </svg>
            </div>
          </div>
          <div>
            <div style={{ fontSize: '1.45rem', fontWeight: 800, color: '#ffffff', letterSpacing: '-0.02em' }}>฿ 0.00</div>
            <div style={{ fontSize: '0.7rem', color: '#64748b', marginTop: '2px' }}>บันทึกรายจ่ายร้านค้า</div>
          </div>
        </div>

        {/* KPI 5: Total Products */}
        <div className="dpos-card" style={{ 
          background: 'rgba(17, 24, 39, 0.65)', 
          backdropFilter: 'blur(20px)', 
          WebkitBackdropFilter: 'blur(20px)',
          borderRadius: '16px', 
          border: '1px solid rgba(255, 255, 255, 0.1)', 
          padding: '1.15rem 1.25rem',
          boxShadow: '0 8px 24px rgba(0, 0, 0, 0.45)',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          gap: '0.75rem'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '0.75rem', fontWeight: 600, color: '#94a3b8' }}>จำนวนสินค้าในระบบ</span>
            <div style={{ width: '32px', height: '32px', borderRadius: '10px', background: 'rgba(56, 189, 248, 0.15)', color: '#38bdf8', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16Z" />
              </svg>
            </div>
          </div>
          <div>
            <div style={{ fontSize: '1.45rem', fontWeight: 800, color: '#ffffff', letterSpacing: '-0.02em' }}>{data.totalProducts} <span style={{ fontSize: '0.9rem', fontWeight: 500, color: '#94a3b8' }}>SKU</span></div>
            <div style={{ fontSize: '0.7rem', color: '#38bdf8', marginTop: '2px' }}>อัปเดตสต็อกเรียลไทม์</div>
          </div>
        </div>

        {/* KPI 6: Today Profit */}
        <div className="dpos-card" style={{ 
          background: 'rgba(17, 24, 39, 0.65)', 
          backdropFilter: 'blur(20px)', 
          WebkitBackdropFilter: 'blur(20px)',
          borderRadius: '16px', 
          border: '1px solid rgba(255, 255, 255, 0.1)', 
          padding: '1.15rem 1.25rem',
          boxShadow: '0 8px 24px rgba(0, 0, 0, 0.45)',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          gap: '0.75rem'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '0.75rem', fontWeight: 600, color: '#94a3b8' }}>กำไรขั้นต้นวันนี้</span>
            <div style={{ width: '32px', height: '32px', borderRadius: '10px', background: 'rgba(16, 185, 129, 0.15)', color: '#10b981', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="22 7 13.5 15.5 8.5 10.5 2 17" />
                <polyline points="16 7 22 7 22 13" />
              </svg>
            </div>
          </div>
          <div>
            <div style={{ fontSize: '1.45rem', fontWeight: 800, color: '#10b981', letterSpacing: '-0.02em' }}>
              ฿ {data.todayProfit.toLocaleString('en-US', { minimumFractionDigits: 2 })}
            </div>
            <div style={{ fontSize: '0.7rem', color: '#64748b', marginTop: '2px' }}>คำนวณจากราคาขาย - ต้นทุน</div>
          </div>
        </div>

        {/* KPI 7: Orders Count */}
        <div className="dpos-card" style={{ 
          background: 'rgba(17, 24, 39, 0.65)', 
          backdropFilter: 'blur(20px)', 
          WebkitBackdropFilter: 'blur(20px)',
          borderRadius: '16px', 
          border: '1px solid rgba(255, 255, 255, 0.1)', 
          padding: '1.15rem 1.25rem',
          boxShadow: '0 8px 24px rgba(0, 0, 0, 0.45)',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          gap: '0.75rem'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '0.75rem', fontWeight: 600, color: '#94a3b8' }}>จำนวนบิลขายวันนี้</span>
            <div style={{ width: '32px', height: '32px', borderRadius: '10px', background: 'rgba(168, 85, 247, 0.15)', color: '#c084fc', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                <polyline points="14 2 14 8 20 8" />
                <line x1="16" y1="13" x2="8" y2="13" />
                <line x1="16" y1="17" x2="8" y2="17" />
              </svg>
            </div>
          </div>
          <div>
            <div style={{ fontSize: '1.45rem', fontWeight: 800, color: '#ffffff', letterSpacing: '-0.02em' }}>{data.ordersCount} <span style={{ fontSize: '0.9rem', fontWeight: 500, color: '#94a3b8' }}>บิล</span></div>
            <div style={{ fontSize: '0.7rem', color: '#c084fc', marginTop: '2px' }}>รอบการขายวันนี้</div>
          </div>
        </div>

        {/* KPI 8: Low Stock Items */}
        <div className="dpos-card" style={{ 
          background: 'rgba(17, 24, 39, 0.65)', 
          backdropFilter: 'blur(20px)', 
          WebkitBackdropFilter: 'blur(20px)',
          borderRadius: '16px', 
          border: data.lowStockItems > 0 ? '1px solid rgba(244, 63, 94, 0.4)' : '1px solid rgba(255, 255, 255, 0.1)', 
          padding: '1.15rem 1.25rem',
          boxShadow: data.lowStockItems > 0 ? '0 8px 24px rgba(244, 63, 94, 0.2)' : '0 8px 24px rgba(0, 0, 0, 0.45)',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          gap: '0.75rem'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '0.75rem', fontWeight: 600, color: data.lowStockItems > 0 ? '#fda4af' : '#94a3b8' }}>สินค้าสต็อกต่ำ</span>
            <div style={{ width: '32px', height: '32px', borderRadius: '10px', background: data.lowStockItems > 0 ? 'rgba(244, 63, 94, 0.2)' : 'rgba(255, 255, 255, 0.05)', color: data.lowStockItems > 0 ? '#f43f5e' : '#94a3b8', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z" />
              </svg>
            </div>
          </div>
          <div>
            <div style={{ fontSize: '1.45rem', fontWeight: 800, color: data.lowStockItems > 0 ? '#f43f5e' : '#ffffff', letterSpacing: '-0.02em' }}>
              {data.lowStockItems} <span style={{ fontSize: '0.9rem', fontWeight: 500, color: '#94a3b8' }}>รายการ</span>
            </div>
            <div style={{ fontSize: '0.7rem', color: data.lowStockItems > 0 ? '#f43f5e' : '#10b981', marginTop: '2px' }}>
              {data.lowStockItems > 0 ? 'ควรสั่งซื้อเพิ่มเติม' : 'ระดับสต็อกสมบูรณ์'}
            </div>
          </div>
        </div>

      </div>

      {/* Middle Grid: Top Selling Products & Low Stock Watchlist */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: '1.25rem' }}>
        
        {/* Top 5 Best Sellers Card */}
        <div className="dpos-card" style={{ 
          background: 'rgba(17, 24, 39, 0.65)', 
          backdropFilter: 'blur(24px)', 
          WebkitBackdropFilter: 'blur(24px)',
          borderRadius: '18px', 
          border: '1px solid rgba(255, 255, 255, 0.1)', 
          overflow: 'hidden',
          boxShadow: '0 16px 40px rgba(0, 0, 0, 0.5)'
        }}>
          <div style={{ 
            padding: '1rem 1.4rem', 
            borderBottom: '1px solid rgba(255, 255, 255, 0.08)', 
            fontWeight: 700, 
            fontSize: '0.95rem', 
            color: '#ffffff', 
            display: 'flex', 
            justifyContent: 'space-between', 
            alignItems: 'center' 
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ color: '#f59e0b' }}>★</span>
              <span>สินค้าขายดี 5 อันดับแรก</span>
            </div>
            <span style={{ fontSize: '0.75rem', color: '#94a3b8', fontWeight: 500 }}>ยอดขายสะสม</span>
          </div>
          <div style={{ padding: '0.75rem 1.25rem' }}>
            {(!data.topSellingProducts || data.topSellingProducts.length === 0) ? (
              <div style={{ padding: '2.5rem', textAlign: 'center', color: '#64748b', fontSize: '0.85rem' }}>
                ยังไม่มีประวัติการขายสะสมในระบบ
              </div>
            ) : (
              data.topSellingProducts.map((p, idx) => (
                <div key={p.productId} style={{ 
                  display: 'flex', 
                  justifyContent: 'space-between', 
                  alignItems: 'center', 
                  padding: '0.75rem 0', 
                  borderBottom: idx === data.topSellingProducts!.length - 1 ? 'none' : '1px solid rgba(255, 255, 255, 0.05)' 
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <span style={{ 
                      width: '26px', 
                      height: '26px', 
                      borderRadius: '50%', 
                      backgroundColor: idx === 0 ? 'rgba(245, 158, 11, 0.2)' : idx === 1 ? 'rgba(56, 189, 248, 0.15)' : 'rgba(255, 255, 255, 0.05)',
                      color: idx === 0 ? '#fbbf24' : idx === 1 ? '#38bdf8' : '#94a3b8',
                      fontSize: '0.75rem',
                      fontWeight: 800,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      border: idx === 0 ? '1px solid rgba(245, 158, 11, 0.4)' : '1px solid rgba(255, 255, 255, 0.1)'
                    }}>
                      {idx + 1}
                    </span>
                    <div>
                      <div style={{ fontWeight: 600, fontSize: '0.875rem', color: '#ffffff' }}>{p.name}</div>
                      <div style={{ fontSize: '0.7rem', color: '#64748b' }}>SKU: {p.sku}</div>
                    </div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontWeight: 700, fontSize: '0.9rem', color: '#34d399' }}>฿{p.totalRevenue.toLocaleString()}</div>
                    <div style={{ fontSize: '0.7rem', color: '#94a3b8' }}>ขายแล้ว {p.soldQty} ชิ้น</div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Low Stock Watchlist */}
        <div className="dpos-card" style={{ 
          background: 'rgba(17, 24, 39, 0.65)', 
          backdropFilter: 'blur(24px)', 
          WebkitBackdropFilter: 'blur(24px)',
          borderRadius: '18px', 
          border: '1px solid rgba(255, 255, 255, 0.1)', 
          overflow: 'hidden',
          boxShadow: '0 16px 40px rgba(0, 0, 0, 0.5)'
        }}>
          <div style={{ 
            padding: '1rem 1.4rem', 
            borderBottom: '1px solid rgba(255, 255, 255, 0.08)', 
            fontWeight: 700, 
            fontSize: '0.95rem', 
            color: '#ffffff', 
            display: 'flex', 
            justifyContent: 'space-between', 
            alignItems: 'center' 
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ color: '#f59e0b' }}>⚠️</span>
              <span>สินค้าที่ต้องเติมสต็อกด่วน</span>
            </div>
            <Link href="/inventory" style={{ fontSize: '0.75rem', color: '#38bdf8', textDecoration: 'none' }}>ดูสต็อกทั้งหมด ➔</Link>
          </div>
          <div style={{ padding: '0.75rem 1.25rem' }}>
            {(!data.lowStockList || data.lowStockList.length === 0) ? (
              <div style={{ padding: '2.5rem', textAlign: 'center', color: '#34d399', fontSize: '0.85rem' }}>
                ✓ สต็อกสินค้าทุกรายการอยู่ในเกณฑ์ปกติ สมบูรณ์
              </div>
            ) : (
              data.lowStockList.map((p, idx) => (
                <div key={p.id} style={{ 
                  display: 'flex', 
                  justifyContent: 'space-between', 
                  alignItems: 'center', 
                  padding: '0.75rem 0', 
                  borderBottom: idx === data.lowStockList!.length - 1 ? 'none' : '1px solid rgba(255, 255, 255, 0.05)' 
                }}>
                  <div>
                    <div style={{ fontWeight: 600, fontSize: '0.875rem', color: '#ffffff' }}>{p.name}</div>
                    <div style={{ fontSize: '0.7rem', color: '#64748b' }}>SKU: {p.sku} | ขั้นต่ำ: {p.minStockLevel}</div>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span style={{ 
                      padding: '3px 10px', 
                      borderRadius: '9999px', 
                      fontSize: '0.75rem', 
                      fontWeight: 700,
                      backgroundColor: p.currentStock === 0 ? 'rgba(244, 63, 94, 0.15)' : 'rgba(245, 158, 11, 0.15)',
                      color: p.currentStock === 0 ? '#fda4af' : '#fcd34d',
                      border: p.currentStock === 0 ? '1px solid rgba(244, 63, 94, 0.3)' : '1px solid rgba(245, 158, 11, 0.3)'
                    }}>
                      เหลือ {p.currentStock}
                    </span>
                    <Link 
                      href="/inbound" 
                      style={{ 
                        fontSize: '0.75rem', 
                        color: '#38bdf8', 
                        padding: '3px 8px', 
                        border: '1px solid rgba(56, 189, 248, 0.35)', 
                        borderRadius: '6px',
                        textDecoration: 'none',
                        background: 'rgba(56, 189, 248, 0.1)'
                      }}
                    >
                      +เติม
                    </Link>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

      </div>

      {/* Bottom Grid: Monthly Sales Chart & Recent Activity */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1.25rem' }}>
        
        {/* Monthly Performance Visualizer */}
        <div className="dpos-card" style={{ 
          background: 'rgba(17, 24, 39, 0.65)', 
          backdropFilter: 'blur(24px)', 
          WebkitBackdropFilter: 'blur(24px)',
          borderRadius: '18px', 
          border: '1px solid rgba(255, 255, 255, 0.1)', 
          overflow: 'hidden',
          boxShadow: '0 16px 40px rgba(0, 0, 0, 0.5)'
        }}>
          <div style={{ padding: '1rem 1.4rem', borderBottom: '1px solid rgba(255, 255, 255, 0.08)', fontWeight: 700, color: '#ffffff', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span>ยอดขายเฉลี่ยรายสัปดาห์</span>
            <span style={{ fontSize: '0.75rem', color: '#38bdf8' }}>+18.4% vs เดือนก่อน</span>
          </div>
          <div style={{ padding: '1.5rem', display: 'flex', alignItems: 'flex-end', height: '190px', gap: '14px', paddingBottom: '24px' }}>
             <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px' }}>
               <div style={{ width: '100%', height: '70px', background: 'linear-gradient(180deg, #38bdf8 0%, rgba(56, 189, 248, 0.2) 100%)', borderRadius: '6px 6px 0 0', boxShadow: '0 0 12px rgba(56, 189, 248, 0.3)' }} />
               <span style={{ fontSize: '0.7rem', color: '#64748b' }}>W1</span>
             </div>
             <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px' }}>
               <div style={{ width: '100%', height: '45px', background: 'linear-gradient(180deg, #38bdf8 0%, rgba(56, 189, 248, 0.2) 100%)', borderRadius: '6px 6px 0 0' }} />
               <span style={{ fontSize: '0.7rem', color: '#64748b' }}>W2</span>
             </div>
             <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px' }}>
               <div style={{ width: '100%', height: '110px', background: 'linear-gradient(180deg, #38bdf8 0%, rgba(56, 189, 248, 0.2) 100%)', borderRadius: '6px 6px 0 0', boxShadow: '0 0 12px rgba(56, 189, 248, 0.3)' }} />
               <span style={{ fontSize: '0.7rem', color: '#64748b' }}>W3</span>
             </div>
             <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px' }}>
               <div style={{ width: '100%', height: '80px', background: 'linear-gradient(180deg, #38bdf8 0%, rgba(56, 189, 248, 0.2) 100%)', borderRadius: '6px 6px 0 0' }} />
               <span style={{ fontSize: '0.7rem', color: '#64748b' }}>W4</span>
             </div>
             <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px' }}>
               <div style={{ width: '100%', height: '140px', background: 'linear-gradient(180deg, #10b981 0%, rgba(16, 185, 129, 0.2) 100%)', borderRadius: '6px 6px 0 0', boxShadow: '0 0 14px rgba(16, 185, 129, 0.4)' }} />
               <span style={{ fontSize: '0.7rem', color: '#34d399', fontWeight: 700 }}>Peak</span>
             </div>
          </div>
        </div>

        {/* Recent Transactions Table */}
        <div className="dpos-card" style={{ 
          background: 'rgba(17, 24, 39, 0.65)', 
          backdropFilter: 'blur(24px)', 
          WebkitBackdropFilter: 'blur(24px)',
          borderRadius: '18px', 
          border: '1px solid rgba(255, 255, 255, 0.1)', 
          overflow: 'hidden',
          boxShadow: '0 16px 40px rgba(0, 0, 0, 0.5)'
        }}>
          <div style={{ padding: '1rem 1.4rem', borderBottom: '1px solid rgba(255, 255, 255, 0.08)', fontWeight: 700, color: '#ffffff' }}>
            สินค้าที่เพิ่มใหม่ล่าสุด
          </div>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem' }}>
            <thead>
              <tr style={{ backgroundColor: 'rgba(10, 15, 29, 0.85)', color: '#94a3b8', borderBottom: '1px solid rgba(255, 255, 255, 0.08)' }}>
                <th style={{ padding: '0.7rem 1rem', textAlign: 'left', fontSize: '0.75rem' }}>ลำดับ</th>
                <th style={{ padding: '0.7rem 1rem', textAlign: 'left', fontSize: '0.75rem' }}>ชื่อรายการ</th>
                <th style={{ padding: '0.7rem 1rem', textAlign: 'right', fontSize: '0.75rem' }}>ราคาขาย</th>
              </tr>
            </thead>
            <tbody>
              {data.recentTransactions.map((tx: any, i: number) => (
                <tr key={tx.id} style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.05)' }}>
                  <td style={{ padding: '0.7rem 1rem', color: '#64748b' }}>{i + 1}</td>
                  <td style={{ padding: '0.7rem 1rem', fontWeight: 500, color: '#ffffff' }}>{tx.product?.name || 'สินค้า'}</td>
                  <td style={{ padding: '0.7rem 1rem', textAlign: 'right', fontWeight: 700, color: '#38bdf8' }}>฿{tx.product?.price}</td>
                </tr>
              ))}
              {data.recentTransactions.length === 0 && (
                <tr><td colSpan={3} style={{ padding: '2rem', textAlign: 'center', color: '#64748b' }}>ไม่มีข้อมูลสินค้าเพิ่มใหม่</td></tr>
              )}
            </tbody>
          </table>
          <div style={{ textAlign: 'center', padding: '0.85rem', fontSize: '0.75rem' }}>
            <Link href="/inventory" style={{ color: '#38bdf8', textDecoration: 'none', fontWeight: 600 }}>ดูสินค้าทั้งหมด ➔</Link>
          </div>
        </div>

      </div>

    </div>
  );
}

