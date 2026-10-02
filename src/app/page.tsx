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
      .then(setData)
      .catch(console.error);
  }, []);

  useGSAP(() => {
    if (data) {
      gsap.fromTo('.dpos-card', { y: 20, opacity: 0 }, { y: 0, opacity: 1, duration: 0.5, stagger: 0.05 });
    }
  }, [data]);

  if (!data) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '60vh', color: '#64748b' }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '2rem', marginBottom: '8px' }}>⏳</div>
          <div>กำลังโหลดข้อมูลแดชบอร์ด...</div>
        </div>
      </div>
    );
  }

  return (
    <div ref={containerRef} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem', backgroundColor: '#f4f6f9', minHeight: '100vh', margin: '-2rem', padding: '2rem', color: '#333' }}>
      
      {/* Header & Quick Action Buttons */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 700, color: '#1e293b', margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span>📊</span> ภาพรวมระบบ (Dashboard)
          </h1>
          <span style={{ fontSize: '0.8rem', color: '#64748b' }}>ข้อมูลสรุปยอดขาย สต็อกสินค้า และกิจกรรมล่าสุด</span>
        </div>

        {/* Action Shortcuts */}
        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
          <Link 
            href="/pos" 
            style={{ 
              backgroundColor: '#059669', 
              color: 'white', 
              padding: '0.5rem 0.85rem', 
              borderRadius: '6px', 
              textDecoration: 'none', 
              fontWeight: 600, 
              fontSize: '0.85rem',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              boxShadow: '0 2px 4px rgba(5,150,105,0.2)'
            }}
          >
            🛒 เปิด POS คิดเงิน
          </Link>
          <Link 
            href="/inbound" 
            style={{ 
              backgroundColor: '#0284c7', 
              color: 'white', 
              padding: '0.5rem 0.85rem', 
              borderRadius: '6px', 
              textDecoration: 'none', 
              fontWeight: 600, 
              fontSize: '0.85rem',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              boxShadow: '0 2px 4px rgba(2,132,199,0.2)'
            }}
          >
            📥 รับสินค้าเข้าสต็อก
          </Link>
          <Link 
            href="/inventory" 
            style={{ 
              backgroundColor: '#ffffff', 
              color: '#334155', 
              border: '1px solid #cbd5e1', 
              padding: '0.5rem 0.85rem', 
              borderRadius: '6px', 
              textDecoration: 'none', 
              fontWeight: 600, 
              fontSize: '0.85rem',
              display: 'flex',
              alignItems: 'center',
              gap: '6px'
            }}
          >
            📦 จัดการสินค้า
          </Link>
        </div>
      </div>

      {/* Low Stock Warning Alert Banner (if any) */}
      {data.lowStockItems > 0 && (
        <div className="dpos-card" style={{ 
          backgroundColor: '#fffbeb', 
          border: '1px solid #fde68a', 
          borderRadius: '8px', 
          padding: '0.85rem 1.25rem',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          color: '#92400e',
          fontSize: '0.85rem'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <span style={{ fontSize: '1.4rem' }}>⚠️</span>
            <div>
              <strong>แจ้งเตือนสต็อก:</strong> มีสินค้าจำนวน <strong style={{ color: '#dc2626' }}>{data.lowStockItems} รายการ</strong> ที่มีสต็อกต่ำกว่าเกณฑ์ขั้นต่ำ
            </div>
          </div>
          <Link 
            href="/inbound" 
            style={{ 
              backgroundColor: '#d97706', 
              color: 'white', 
              padding: '0.35rem 0.75rem', 
              borderRadius: '4px', 
              textDecoration: 'none', 
              fontWeight: 600, 
              fontSize: '0.75rem' 
            }}
          >
            สั่งซื้อเติมสต็อก ➔
          </Link>
        </div>
      )}

      {/* Top 8 Stats Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
        
        {/* Row 1 */}
        <div className="dpos-card" style={{ display: 'flex', backgroundColor: 'white', borderRadius: '8px', boxShadow: '0 1px 3px rgba(0,0,0,0.05)', overflow: 'hidden' }}>
          <div style={{ width: '70px', backgroundColor: '#00c0ef', display: 'flex', justifyContent: 'center', alignItems: 'center', color: 'white', fontSize: '1.75rem' }}>🛍️</div>
          <div style={{ padding: '0.75rem 1rem' }}>
            <div style={{ fontSize: '0.75rem', color: '#64748b' }}>งานจัดซื้อที่ค้างทั้งหมด</div>
            <div style={{ fontSize: '1.25rem', fontWeight: 800, color: '#1e293b' }}>฿ 0.00</div>
          </div>
        </div>

        <div className="dpos-card" style={{ display: 'flex', backgroundColor: 'white', borderRadius: '8px', boxShadow: '0 1px 3px rgba(0,0,0,0.05)', overflow: 'hidden' }}>
          <div style={{ width: '70px', backgroundColor: '#f39c12', display: 'flex', justifyContent: 'center', alignItems: 'center', color: 'white', fontSize: '1.75rem' }}>💲</div>
          <div style={{ padding: '0.75rem 1rem' }}>
            <div style={{ fontSize: '0.75rem', color: '#64748b' }}>งานขายที่ค้างทั้งหมด</div>
            <div style={{ fontSize: '1.25rem', fontWeight: 800, color: '#1e293b' }}>฿ 0.00</div>
          </div>
        </div>

        <div className="dpos-card" style={{ display: 'flex', backgroundColor: 'white', borderRadius: '8px', boxShadow: '0 1px 3px rgba(0,0,0,0.05)', overflow: 'hidden' }}>
          <div style={{ width: '70px', backgroundColor: '#00a65a', display: 'flex', justifyContent: 'center', alignItems: 'center', color: 'white', fontSize: '1.75rem' }}>🛒</div>
          <div style={{ padding: '0.75rem 1rem' }}>
            <div style={{ fontSize: '0.75rem', color: '#64748b' }}>ยอดขายรวมวันนี้</div>
            <div style={{ fontSize: '1.25rem', fontWeight: 800, color: '#059669' }}>฿ {data.todaySales.toLocaleString('en-US', { minimumFractionDigits: 2 })}</div>
          </div>
        </div>

        <div className="dpos-card" style={{ display: 'flex', backgroundColor: 'white', borderRadius: '8px', boxShadow: '0 1px 3px rgba(0,0,0,0.05)', overflow: 'hidden' }}>
          <div style={{ width: '70px', backgroundColor: '#dd4b39', display: 'flex', justifyContent: 'center', alignItems: 'center', color: 'white', fontSize: '1.75rem' }}>➖</div>
          <div style={{ padding: '0.75rem 1rem' }}>
            <div style={{ fontSize: '0.75rem', color: '#64748b' }}>ยอดค่าใช้จ่ายทั้งหมด</div>
            <div style={{ fontSize: '1.25rem', fontWeight: 800, color: '#1e293b' }}>฿ 0.00</div>
          </div>
        </div>

        {/* Row 2 */}
        <div className="dpos-card" style={{ display: 'flex', backgroundColor: 'white', borderRadius: '8px', boxShadow: '0 1px 3px rgba(0,0,0,0.05)', overflow: 'hidden' }}>
          <div style={{ width: '70px', backgroundColor: '#0284c7', display: 'flex', justifyContent: 'center', alignItems: 'center', color: 'white', fontSize: '1.75rem' }}>📦</div>
          <div style={{ padding: '0.75rem 1rem' }}>
            <div style={{ fontSize: '0.75rem', color: '#64748b' }}>จำนวนสินค้าในระบบ</div>
            <div style={{ fontSize: '1.25rem', fontWeight: 800, color: '#1e293b' }}>{data.totalProducts} รายการ</div>
          </div>
        </div>

        <div className="dpos-card" style={{ display: 'flex', backgroundColor: 'white', borderRadius: '8px', boxShadow: '0 1px 3px rgba(0,0,0,0.05)', overflow: 'hidden' }}>
          <div style={{ width: '70px', backgroundColor: '#10b981', display: 'flex', justifyContent: 'center', alignItems: 'center', color: 'white', fontSize: '1.75rem' }}>📈</div>
          <div style={{ padding: '0.75rem 1rem' }}>
            <div style={{ fontSize: '0.75rem', color: '#64748b' }}>กำไรขั้นต้นวันนี้</div>
            <div style={{ fontSize: '1.25rem', fontWeight: 800, color: '#10b981' }}>฿ {data.todayProfit.toLocaleString('en-US', { minimumFractionDigits: 2 })}</div>
          </div>
        </div>

        <div className="dpos-card" style={{ display: 'flex', backgroundColor: 'white', borderRadius: '8px', boxShadow: '0 1px 3px rgba(0,0,0,0.05)', overflow: 'hidden' }}>
          <div style={{ width: '70px', backgroundColor: '#8b5cf6', display: 'flex', justifyContent: 'center', alignItems: 'center', color: 'white', fontSize: '1.75rem' }}>🧾</div>
          <div style={{ padding: '0.75rem 1rem' }}>
            <div style={{ fontSize: '0.75rem', color: '#64748b' }}>จำนวนบิลขายวันนี้</div>
            <div style={{ fontSize: '1.25rem', fontWeight: 800, color: '#8b5cf6' }}>{data.ordersCount} บิล</div>
          </div>
        </div>

        <div className="dpos-card" style={{ display: 'flex', backgroundColor: 'white', borderRadius: '8px', boxShadow: '0 1px 3px rgba(0,0,0,0.05)', overflow: 'hidden' }}>
          <div style={{ width: '70px', backgroundColor: data.lowStockItems > 0 ? '#ef4444' : '#64748b', display: 'flex', justifyContent: 'center', alignItems: 'center', color: 'white', fontSize: '1.75rem' }}>⚠️</div>
          <div style={{ padding: '0.75rem 1rem' }}>
            <div style={{ fontSize: '0.75rem', color: '#64748b' }}>สินค้าสต็อกต่ำ</div>
            <div style={{ fontSize: '1.25rem', fontWeight: 800, color: data.lowStockItems > 0 ? '#ef4444' : '#1e293b' }}>{data.lowStockItems} รายการ</div>
          </div>
        </div>

      </div>

      {/* Middle Grid: Top Selling Products & Low Stock Items */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1rem', marginTop: '0.25rem' }}>
        
        {/* Top 5 Best Sellers Card */}
        <div className="dpos-card" style={{ backgroundColor: 'white', borderRadius: '8px', boxShadow: '0 1px 3px rgba(0,0,0,0.05)', overflow: 'hidden' }}>
          <div style={{ padding: '0.85rem 1.25rem', borderBottom: '1px solid #f1f5f9', fontWeight: 700, fontSize: '0.95rem', color: '#1e293b', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span>🏆 สินค้าขายดี 5 อันดับแรก</span>
            <span style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: 'normal' }}>ตามยอดขายสะสม</span>
          </div>
          <div style={{ padding: '0.5rem 1rem' }}>
            {(!data.topSellingProducts || data.topSellingProducts.length === 0) ? (
              <div style={{ padding: '2rem', textAlign: 'center', color: '#94a3b8', fontSize: '0.85rem' }}>
                ยังไม่มีประวัติการขายในระบบ
              </div>
            ) : (
              data.topSellingProducts.map((p, idx) => (
                <div key={p.productId} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.6rem 0', borderBottom: idx === data.topSellingProducts!.length - 1 ? 'none' : '1px solid #f8fafc' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span style={{ 
                      width: '24px', 
                      height: '24px', 
                      borderRadius: '50%', 
                      backgroundColor: idx === 0 ? '#fef08a' : idx === 1 ? '#e2e8f0' : idx === 2 ? '#ffedd5' : '#f1f5f9',
                      color: idx === 0 ? '#854d0e' : idx === 1 ? '#475569' : idx === 2 ? '#9a3412' : '#64748b',
                      fontSize: '0.75rem',
                      fontWeight: 800,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}>
                      {idx + 1}
                    </span>
                    <div>
                      <div style={{ fontWeight: 600, fontSize: '0.85rem', color: '#1e293b' }}>{p.name}</div>
                      <div style={{ fontSize: '0.7rem', color: '#94a3b8' }}>SKU: {p.sku}</div>
                    </div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontWeight: 700, fontSize: '0.85rem', color: '#059669' }}>฿{p.totalRevenue.toLocaleString()}</div>
                    <div style={{ fontSize: '0.7rem', color: '#64748b' }}>ขายแล้ว {p.soldQty} ชิ้น</div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Low Stock Watchlist */}
        <div className="dpos-card" style={{ backgroundColor: 'white', borderRadius: '8px', boxShadow: '0 1px 3px rgba(0,0,0,0.05)', overflow: 'hidden' }}>
          <div style={{ padding: '0.85rem 1.25rem', borderBottom: '1px solid #f1f5f9', fontWeight: 700, fontSize: '0.95rem', color: '#1e293b', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span>⚠️ สินค้าที่ต้องเติมสต็อกด่วน</span>
            <Link href="/inventory" style={{ fontSize: '0.75rem', color: '#0284c7', textDecoration: 'none' }}>ดูสต็อกทั้งหมด ➔</Link>
          </div>
          <div style={{ padding: '0.5rem 1rem' }}>
            {(!data.lowStockList || data.lowStockList.length === 0) ? (
              <div style={{ padding: '2rem', textAlign: 'center', color: '#10b981', fontSize: '0.85rem' }}>
                ✓ สต็อกสินค้าทุกรายการอยู่ในเกณฑ์ปกติ
              </div>
            ) : (
              data.lowStockList.map((p, idx) => (
                <div key={p.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.6rem 0', borderBottom: idx === data.lowStockList!.length - 1 ? 'none' : '1px solid #f8fafc' }}>
                  <div>
                    <div style={{ fontWeight: 600, fontSize: '0.85rem', color: '#1e293b' }}>{p.name}</div>
                    <div style={{ fontSize: '0.7rem', color: '#94a3b8' }}>SKU: {p.sku} | ขั้นต่ำ: {p.minStockLevel}</div>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span style={{ 
                      padding: '2px 8px', 
                      borderRadius: '4px', 
                      fontSize: '0.75rem', 
                      fontWeight: 800,
                      backgroundColor: p.currentStock === 0 ? '#fee2e2' : '#fef3c7',
                      color: p.currentStock === 0 ? '#dc2626' : '#d97706',
                    }}>
                      เหลือ {p.currentStock}
                    </span>
                    <Link 
                      href="/inbound" 
                      style={{ 
                        fontSize: '0.7rem', 
                        color: '#0284c7', 
                        padding: '2px 6px', 
                        border: '1px solid #bae6fd', 
                        borderRadius: '4px',
                        textDecoration: 'none'
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

      {/* Bottom Charts & Recent Activity Table */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1rem', marginTop: '0.25rem' }}>
        
        <div className="dpos-card" style={{ backgroundColor: 'white', borderRadius: '8px', boxShadow: '0 1px 3px rgba(0,0,0,0.05)', overflow: 'hidden' }}>
          <div style={{ padding: '0.85rem 1.25rem', borderBottom: '1px solid #f1f5f9', fontWeight: 700, color: '#1e293b' }}>ยอดขายประจำเดือน</div>
          <div style={{ padding: '1.25rem', display: 'flex', alignItems: 'flex-end', height: '180px', gap: '12px', paddingBottom: '20px' }}>
             {/* Monthly Performance Bars */}
             <div style={{ flex: 1, backgroundColor: '#0284c7', height: '40%', borderRadius: '4px 4px 0 0' }}></div>
             <div style={{ flex: 1, backgroundColor: '#0284c7', height: '25%', borderRadius: '4px 4px 0 0' }}></div>
             <div style={{ flex: 1, backgroundColor: '#0284c7', height: '70%', borderRadius: '4px 4px 0 0' }}></div>
             <div style={{ flex: 1, backgroundColor: '#0284c7', height: '45%', borderRadius: '4px 4px 0 0' }}></div>
             <div style={{ flex: 1, backgroundColor: '#059669', height: '90%', borderRadius: '4px 4px 0 0' }}></div>
          </div>
        </div>

        <div className="dpos-card" style={{ backgroundColor: 'white', borderRadius: '8px', boxShadow: '0 1px 3px rgba(0,0,0,0.05)', overflow: 'hidden' }}>
          <div style={{ padding: '0.85rem 1.25rem', borderBottom: '1px solid #f1f5f9', fontWeight: 700, color: '#1e293b' }}>สินค้าที่เพิ่มใหม่ล่าสุด</div>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem' }}>
            <thead>
              <tr style={{ backgroundColor: '#f8fafc', color: '#475569', borderBottom: '1px solid #e2e8f0' }}>
                <th style={{ padding: '0.6rem 1rem', textAlign: 'left' }}>ลำดับ</th>
                <th style={{ padding: '0.6rem 1rem', textAlign: 'left' }}>ชื่อรายการ</th>
                <th style={{ padding: '0.6rem 1rem', textAlign: 'right' }}>ราคาขาย</th>
              </tr>
            </thead>
            <tbody>
              {data.recentTransactions.map((tx: any, i: number) => (
                <tr key={tx.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                  <td style={{ padding: '0.6rem 1rem', color: '#64748b' }}>{i + 1}</td>
                  <td style={{ padding: '0.6rem 1rem', fontWeight: 500 }}>{tx.product?.name || 'สินค้า'}</td>
                  <td style={{ padding: '0.6rem 1rem', textAlign: 'right', fontWeight: 700, color: '#059669' }}>฿{tx.product?.price}</td>
                </tr>
              ))}
              {data.recentTransactions.length === 0 && (
                <tr><td colSpan={3} style={{ padding: '1.5rem', textAlign: 'center', color: '#94a3b8' }}>ไม่มีข้อมูล</td></tr>
              )}
            </tbody>
          </table>
          <div style={{ textAlign: 'center', padding: '0.75rem', fontSize: '0.75rem' }}>
            <Link href="/inventory" style={{ color: '#0284c7', textDecoration: 'none', fontWeight: 600 }}>ดูสินค้าทั้งหมด ➔</Link>
          </div>
        </div>

      </div>

    </div>
  );
}
