"use client";

import React, { useEffect, useState, useRef } from 'react';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';

type DashboardData = {
  totalProducts: number;
  lowStockItems: number;
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
      .then(setData)
      .catch(console.error);
  }, []);

  useGSAP(() => {
    if (data) {
      gsap.fromTo(
        '.stat-card',
        { y: 30, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.6, stagger: 0.1, ease: 'power2.out' }
      );
      gsap.fromTo(
        '.recent-activity',
        { x: 30, opacity: 0 },
        { x: 0, opacity: 1, duration: 0.6, delay: 0.3, ease: 'power2.out' }
      );
    }
  }, [data]);

  if (!data) {
    return <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>Loading...</div>;
  }

  return (
    <div ref={containerRef} style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      <header>
        <h1 style={{ fontSize: '2rem', fontWeight: 700 }}>ภาพรวม (Dashboard)</h1>
        <p style={{ color: 'var(--secondary-foreground)' }}>Welcome back! Here's your POS & Inventory status.</p>
      </header>

      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', 
        gap: '1.5rem' 
      }}>
        <div className="card glass stat-card" style={{ borderLeft: '4px solid #10b981' }}>
          <h3 style={{ fontSize: '0.875rem', color: 'var(--secondary-foreground)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            ยอดขายวันนี้ (Sales)
          </h3>
          <p style={{ fontSize: '2.5rem', fontWeight: 700, margin: '0.5rem 0', color: '#10b981' }}>
            ฿{data.todaySales?.toLocaleString() || 0}
          </p>
          <p style={{ fontSize: '0.875rem', color: 'var(--secondary-foreground)' }}>จาก {data.ordersCount || 0} บิล</p>
        </div>
        
        <div className="card glass stat-card" style={{ borderLeft: '4px solid #3b82f6' }}>
          <h3 style={{ fontSize: '0.875rem', color: 'var(--secondary-foreground)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            กำไรวันนี้ (Profit)
          </h3>
          <p style={{ fontSize: '2.5rem', fontWeight: 700, margin: '0.5rem 0', color: '#3b82f6' }}>
            ฿{data.todayProfit?.toLocaleString() || 0}
          </p>
          <p style={{ fontSize: '0.875rem', color: 'var(--secondary-foreground)' }}>หักต้นทุนแล้ว</p>
        </div>

        <div className="card glass stat-card" style={{ borderLeft: '4px solid #8b5cf6' }}>
          <h3 style={{ fontSize: '0.875rem', color: 'var(--secondary-foreground)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            สินค้าในคลัง (Total Items)
          </h3>
          <p style={{ fontSize: '2.5rem', fontWeight: 700, margin: '0.5rem 0', color: '#8b5cf6' }}>
            {data.totalProducts}
          </p>
          <p style={{ fontSize: '0.875rem', color: 'var(--secondary-foreground)' }}>รายการสินค้าทั้งหมด</p>
        </div>

        <div className="card glass stat-card" style={{ borderLeft: '4px solid #ef4444' }}>
          <h3 style={{ fontSize: '0.875rem', color: 'var(--secondary-foreground)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            สินค้าใกล้หมด (Low Stock)
          </h3>
          <p style={{ fontSize: '2.5rem', fontWeight: 700, margin: '0.5rem 0', color: '#ef4444' }}>
            {data.lowStockItems}
          </p>
          <p style={{ fontSize: '0.875rem', color: 'var(--secondary-foreground)' }}>รายการที่ต้องสั่งเพิ่ม</p>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '1.5rem' }}>
        <div className="card glass recent-activity">
          <h2 style={{ fontSize: '1.25rem', fontWeight: 600, marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <span>⚡</span> ความเคลื่อนไหวล่าสุด
          </h2>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {data.recentTransactions.length === 0 ? (
              <p style={{ color: 'var(--secondary-foreground)' }}>No recent activity.</p>
            ) : (
              data.recentTransactions.map((tx: any) => (
                <div key={tx.id} style={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'space-between',
                  padding: '1rem',
                  backgroundColor: 'rgba(255,255,255,0.03)',
                  borderRadius: '12px',
                  border: '1px solid var(--border)'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <div style={{ 
                      width: '40px', height: '40px', borderRadius: '50%', 
                      backgroundColor: tx.type === 'IN' ? 'rgba(16,185,129,0.2)' : 'rgba(239,68,68,0.2)',
                      color: tx.type === 'IN' ? '#10b981' : '#ef4444',
                      display: 'flex', justifyContent: 'center', alignItems: 'center',
                      fontWeight: 'bold'
                    }}>
                      {tx.type === 'IN' ? '↓' : '↑'}
                    </div>
                    <div>
                      <p style={{ fontWeight: 500 }}>{tx.product.name}</p>
                      <p style={{ fontSize: '0.875rem', color: 'var(--secondary-foreground)' }}>Ref: {tx.reference || 'N/A'}</p>
                    </div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <p style={{ 
                      fontWeight: 700, 
                      color: tx.type === 'IN' ? '#10b981' : '#ef4444' 
                    }}>
                      {tx.type === 'IN' ? '+' : '-'}{tx.quantity}
                    </p>
                    <p style={{ fontSize: '0.75rem', color: 'var(--secondary-foreground)' }}>
                      {new Date(tx.createdAt).toLocaleTimeString()}
                    </p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
