"use client";

import React, { useRef, useState, useEffect } from 'react';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';

type DashboardData = {
  totalProducts: number;
  lowStockProducts: number;
  pendingOrders: number;
  totalSuppliers: number;
  recentActivity: any[];
};

export default function Home() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [data, setData] = useState<DashboardData | null>(null);

  useEffect(() => {
    fetch('/api/dashboard')
      .then(res => res.json())
      .then(d => setData(d))
      .catch(console.error);
  }, []);

  useGSAP(() => {
    // Entrance animation for header
    gsap.fromTo('.dashboard-header', 
      { y: -30, opacity: 0 }, 
      { y: 0, opacity: 1, duration: 0.8, ease: 'power3.out' }
    );

    if (data) {
      // Stagger animation for stat cards
      gsap.fromTo('.stat-card', 
        { y: 30, opacity: 0 }, 
        { y: 0, opacity: 1, duration: 0.6, stagger: 0.1, ease: 'back.out(1.2)' }
      );

      // Fade in recent activity
      gsap.fromTo('.recent-activity', 
        { opacity: 0, scale: 0.98 }, 
        { opacity: 1, scale: 1, duration: 0.8, ease: 'power2.out', delay: 0.3 }
      );
    }
  }, [data]);

  return (
    <div ref={containerRef} style={{ maxWidth: '1200px', margin: '0 auto' }}>
      <header className="dashboard-header" style={{ marginBottom: '2.5rem' }}>
        <h1 style={{ fontSize: '2rem', fontWeight: 700, color: 'var(--foreground)' }}>Overview</h1>
        <p style={{ color: 'var(--secondary-foreground)', marginTop: '0.5rem' }}>
          Welcome back! Here's what's happening with your inventory today.
        </p>
      </header>

      {!data ? (
        <div style={{ padding: '3rem', textAlign: 'center' }}>Loading dashboard...</div>
      ) : (
        <>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1.5rem', marginBottom: '2.5rem' }}>
            {[
              { title: 'Total Products', value: data.totalProducts, icon: '📦', color: '#4f46e5' },
              { title: 'Low Stock Alerts', value: data.lowStockProducts, icon: '⚠️', color: '#ef4444' },
              { title: 'Pending Orders', value: data.pendingOrders, icon: '⏳', color: '#f59e0b' },
              { title: 'Total Suppliers', value: data.totalSuppliers, icon: '🏢', color: '#10b981' }
            ].map((stat, i) => (
              <div key={i} className="card stat-card" style={{ display: 'flex', alignItems: 'center', gap: '1rem', opacity: 0 }}>
                <div style={{ 
                  width: '48px', height: '48px', borderRadius: '12px', 
                  backgroundColor: `${stat.color}15`, color: stat.color,
                  display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.5rem'
                }}>
                  {stat.icon}
                </div>
                <div>
                  <p style={{ color: 'var(--secondary-foreground)', fontSize: '0.875rem', fontWeight: 500 }}>{stat.title}</p>
                  <h3 style={{ fontSize: '1.5rem', fontWeight: 700, marginTop: '0.25rem' }}>{stat.value}</h3>
                </div>
              </div>
            ))}
          </div>

          <div className="card recent-activity glass" style={{ minHeight: '300px', opacity: 0 }}>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 600, marginBottom: '1.5rem', borderBottom: '1px solid var(--border)', paddingBottom: '1rem' }}>
              Recent Activity
            </h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {data.recentActivity.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--secondary-foreground)' }}>No recent activity.</div>
              ) : data.recentActivity.map((act) => {
                const isOut = act.type === 'OUT' || (act.type === 'ADJUST' && act.quantity < 0);
                const icon = act.type === 'IN' ? '📥' : act.type === 'OUT' ? '📉' : '📝';
                const color = act.type === 'IN' ? '#10b981' : act.type === 'OUT' ? '#ef4444' : '#f59e0b';
                
                return (
                  <div key={act.id} style={{ display: 'flex', alignItems: 'center', gap: '1rem', padding: '0.75rem', borderRadius: '8px', backgroundColor: 'var(--background)', border: '1px solid var(--border)' }}>
                    <div style={{ fontSize: '1.25rem' }}>{icon}</div>
                    <div style={{ flex: 1 }}>
                      <p style={{ fontWeight: 500, fontSize: '0.9rem' }}>
                        {act.type} {isOut ? '' : '+'}{act.quantity} {act.product.unit}
                      </p>
                      <p style={{ color: 'var(--secondary-foreground)', fontSize: '0.8rem' }}>{act.product.name} (SKU: {act.product.sku})</p>
                    </div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--secondary-foreground)' }}>
                      {new Date(act.createdAt).toLocaleString([], { dateStyle: 'short', timeStyle: 'short' })}
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
