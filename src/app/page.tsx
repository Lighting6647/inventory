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
      gsap.fromTo('.dpos-card', { y: 20, opacity: 0 }, { y: 0, opacity: 1, duration: 0.5, stagger: 0.05 });
    }
  }, [data]);

  if (!data) return <div style={{ padding: '2rem' }}>Loading...</div>;

  return (
    <div ref={containerRef} style={{ display: 'flex', flexDirection: 'column', gap: '1rem', backgroundColor: '#f4f6f9', minHeight: '100vh', margin: '-2rem', padding: '2rem', color: '#333' }}>
      
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
        <h1 style={{ fontSize: '1.5rem', fontWeight: 600, color: '#333' }}>ภาพรวม <span style={{ fontSize: '0.875rem', color: '#888', fontWeight: 'normal' }}>Overall Information on Single Screen</span></h1>
      </div>

      {/* Welcome Banner */}
      <div className="dpos-card" style={{ backgroundColor: '#00a65a', color: 'white', padding: '0.75rem', textAlign: 'center', borderRadius: '3px', fontWeight: 500, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <span style={{ flex: 1 }}>Welcome Admin !</span>
        <span style={{ cursor: 'pointer' }}>×</span>
      </div>

      {/* Top 8 Stats Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1rem' }}>
        
        {/* Row 1 */}
        <div className="dpos-card" style={{ display: 'flex', backgroundColor: 'white', borderRadius: '2px', boxShadow: '0 1px 1px rgba(0,0,0,0.1)' }}>
          <div style={{ width: '80px', backgroundColor: '#00c0ef', display: 'flex', justifyContent: 'center', alignItems: 'center', color: 'white', fontSize: '2rem' }}>🛍️</div>
          <div style={{ padding: '1rem' }}>
            <div style={{ fontSize: '0.75rem', color: '#666' }}>งานจัดซื้อที่ค้างทั้งหมด</div>
            <div style={{ fontSize: '1.25rem', fontWeight: 'bold' }}>฿ 0.00</div>
          </div>
        </div>

        <div className="dpos-card" style={{ display: 'flex', backgroundColor: 'white', borderRadius: '2px', boxShadow: '0 1px 1px rgba(0,0,0,0.1)' }}>
          <div style={{ width: '80px', backgroundColor: '#f39c12', display: 'flex', justifyContent: 'center', alignItems: 'center', color: 'white', fontSize: '2rem' }}>💲</div>
          <div style={{ padding: '1rem' }}>
            <div style={{ fontSize: '0.75rem', color: '#666' }}>งานขายที่ค้างทั้งหมด</div>
            <div style={{ fontSize: '1.25rem', fontWeight: 'bold' }}>฿ 0.00</div>
          </div>
        </div>

        <div className="dpos-card" style={{ display: 'flex', backgroundColor: 'white', borderRadius: '2px', boxShadow: '0 1px 1px rgba(0,0,0,0.1)' }}>
          <div style={{ width: '80px', backgroundColor: '#00a65a', display: 'flex', justifyContent: 'center', alignItems: 'center', color: 'white', fontSize: '2rem' }}>🛒</div>
          <div style={{ padding: '1rem' }}>
            <div style={{ fontSize: '0.75rem', color: '#666' }}>ยอดขายทั้งหมด</div>
            <div style={{ fontSize: '1.25rem', fontWeight: 'bold' }}>฿ {data.todaySales.toLocaleString()}</div>
          </div>
        </div>

        <div className="dpos-card" style={{ display: 'flex', backgroundColor: 'white', borderRadius: '2px', boxShadow: '0 1px 1px rgba(0,0,0,0.1)' }}>
          <div style={{ width: '80px', backgroundColor: '#dd4b39', display: 'flex', justifyContent: 'center', alignItems: 'center', color: 'white', fontSize: '2rem' }}>➖</div>
          <div style={{ padding: '1rem' }}>
            <div style={{ fontSize: '0.75rem', color: '#666' }}>ยอดค่าใช้จ่ายทั้งหมด</div>
            <div style={{ fontSize: '1.25rem', fontWeight: 'bold' }}>฿ 0.00</div>
          </div>
        </div>

        {/* Row 2 */}
        <div className="dpos-card" style={{ display: 'flex', backgroundColor: 'white', borderRadius: '2px', boxShadow: '0 1px 1px rgba(0,0,0,0.1)' }}>
          <div style={{ width: '80px', backgroundColor: '#00c0ef', display: 'flex', justifyContent: 'center', alignItems: 'center', color: 'white', fontSize: '2rem' }}>🛍️</div>
          <div style={{ padding: '1rem' }}>
            <div style={{ fontSize: '0.75rem', color: '#666' }}>ยอดซื้อวันนี้</div>
            <div style={{ fontSize: '1.25rem', fontWeight: 'bold' }}>฿ 0.00</div>
          </div>
        </div>

        <div className="dpos-card" style={{ display: 'flex', backgroundColor: 'white', borderRadius: '2px', boxShadow: '0 1px 1px rgba(0,0,0,0.1)' }}>
          <div style={{ width: '80px', backgroundColor: '#f39c12', display: 'flex', justifyContent: 'center', alignItems: 'center', color: 'white', fontSize: '2rem' }}>💲</div>
          <div style={{ padding: '1rem' }}>
            <div style={{ fontSize: '0.75rem', color: '#666' }}>ยอดรับชำระวันนี้(SALES)</div>
            <div style={{ fontSize: '1.25rem', fontWeight: 'bold' }}>฿ {data.todaySales.toLocaleString()}</div>
          </div>
        </div>

        <div className="dpos-card" style={{ display: 'flex', backgroundColor: 'white', borderRadius: '2px', boxShadow: '0 1px 1px rgba(0,0,0,0.1)' }}>
          <div style={{ width: '80px', backgroundColor: '#00a65a', display: 'flex', justifyContent: 'center', alignItems: 'center', color: 'white', fontSize: '2rem' }}>🛒</div>
          <div style={{ padding: '1rem' }}>
            <div style={{ fontSize: '0.75rem', color: '#666' }}>ยอดขายวันนี้</div>
            <div style={{ fontSize: '1.25rem', fontWeight: 'bold' }}>฿ {data.todaySales.toLocaleString()}</div>
          </div>
        </div>

        <div className="dpos-card" style={{ display: 'flex', backgroundColor: 'white', borderRadius: '2px', boxShadow: '0 1px 1px rgba(0,0,0,0.1)' }}>
          <div style={{ width: '80px', backgroundColor: '#dd4b39', display: 'flex', justifyContent: 'center', alignItems: 'center', color: 'white', fontSize: '2rem' }}>➖</div>
          <div style={{ padding: '1rem' }}>
            <div style={{ fontSize: '0.75rem', color: '#666' }}>ยอดค่าใช้จ่ายวันนี้</div>
            <div style={{ fontSize: '1.25rem', fontWeight: 'bold' }}>฿ 0.00</div>
          </div>
        </div>

      </div>

      {/* Bottom 4 Colored Blocks */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1rem', marginTop: '0.5rem' }}>
        
        <div className="dpos-card" style={{ backgroundColor: '#e81e63', color: 'white', borderRadius: '2px', display: 'flex', flexDirection: 'column' }}>
          <div style={{ padding: '1rem', display: 'flex', justifyContent: 'space-between' }}>
            <div>
              <div style={{ fontSize: '2rem', fontWeight: 'bold' }}>1</div>
              <div style={{ fontSize: '0.875rem' }}>ลูกค้า</div>
            </div>
            <div style={{ fontSize: '3rem', opacity: 0.3 }}>👥</div>
          </div>
          <div style={{ backgroundColor: 'rgba(0,0,0,0.1)', padding: '0.25rem', textAlign: 'center', fontSize: '0.75rem', cursor: 'pointer' }}>VIEW ➔</div>
        </div>

        <div className="dpos-card" style={{ backgroundColor: '#9c27b0', color: 'white', borderRadius: '2px', display: 'flex', flexDirection: 'column' }}>
          <div style={{ padding: '1rem', display: 'flex', justifyContent: 'space-between' }}>
            <div>
              <div style={{ fontSize: '2rem', fontWeight: 'bold' }}>0</div>
              <div style={{ fontSize: '0.875rem' }}>ผู้จำหน่าย</div>
            </div>
            <div style={{ fontSize: '3rem', opacity: 0.3 }}>👥</div>
          </div>
          <div style={{ backgroundColor: 'rgba(0,0,0,0.1)', padding: '0.25rem', textAlign: 'center', fontSize: '0.75rem', cursor: 'pointer' }}>VIEW ➔</div>
        </div>

        <div className="dpos-card" style={{ backgroundColor: '#2196f3', color: 'white', borderRadius: '2px', display: 'flex', flexDirection: 'column' }}>
          <div style={{ padding: '1rem', display: 'flex', justifyContent: 'space-between' }}>
            <div>
              <div style={{ fontSize: '2rem', fontWeight: 'bold' }}>0</div>
              <div style={{ fontSize: '0.875rem' }}>บิลสั่งซื้อ</div>
            </div>
            <div style={{ fontSize: '3rem', opacity: 0.3 }}>📄</div>
          </div>
          <div style={{ backgroundColor: 'rgba(0,0,0,0.1)', padding: '0.25rem', textAlign: 'center', fontSize: '0.75rem', cursor: 'pointer' }}>VIEW ➔</div>
        </div>

        <div className="dpos-card" style={{ backgroundColor: '#4caf50', color: 'white', borderRadius: '2px', display: 'flex', flexDirection: 'column' }}>
          <div style={{ padding: '1rem', display: 'flex', justifyContent: 'space-between' }}>
            <div>
              <div style={{ fontSize: '2rem', fontWeight: 'bold' }}>{data.ordersCount}</div>
              <div style={{ fontSize: '0.875rem' }}>บิลขาย</div>
            </div>
            <div style={{ fontSize: '3rem', opacity: 0.3 }}>📄</div>
          </div>
          <div style={{ backgroundColor: 'rgba(0,0,0,0.1)', padding: '0.25rem', textAlign: 'center', fontSize: '0.75rem', cursor: 'pointer' }}>VIEW ➔</div>
        </div>

      </div>

      {/* Bottom Charts & Tables */}
      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '1rem', marginTop: '0.5rem' }}>
        
        <div className="dpos-card" style={{ backgroundColor: 'white', borderRadius: '2px', boxShadow: '0 1px 1px rgba(0,0,0,0.1)' }}>
          <div style={{ padding: '0.75rem 1rem', borderBottom: '1px solid #f4f4f4', fontWeight: 600 }}>ยอดขายประจำเดือน</div>
          <div style={{ padding: '1rem', display: 'flex', alignItems: 'flex-end', height: '200px', gap: '10px', paddingBottom: '30px' }}>
             {/* Fake Bar Chart */}
             <div style={{ flex: 1, backgroundColor: '#00a65a', height: '40%' }}></div>
             <div style={{ flex: 1, backgroundColor: '#00a65a', height: '20%' }}></div>
             <div style={{ flex: 1, backgroundColor: '#00a65a', height: '70%' }}></div>
             <div style={{ flex: 1, backgroundColor: '#00a65a', height: '30%' }}></div>
             <div style={{ flex: 1, backgroundColor: '#00a65a', height: '90%' }}></div>
          </div>
        </div>

        <div className="dpos-card" style={{ backgroundColor: 'white', borderRadius: '2px', boxShadow: '0 1px 1px rgba(0,0,0,0.1)' }}>
          <div style={{ padding: '0.75rem 1rem', borderBottom: '1px solid #f4f4f4', fontWeight: 600 }}>สินค้าที่เพิ่มใหม่ล่าสุด</div>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.875rem' }}>
            <thead>
              <tr style={{ backgroundColor: '#0073b7', color: 'white' }}>
                <th style={{ padding: '0.5rem', textAlign: 'left' }}>Sl.No</th>
                <th style={{ padding: '0.5rem', textAlign: 'left' }}>ชื่อรายการ</th>
                <th style={{ padding: '0.5rem', textAlign: 'right' }}>ราคาขาย</th>
              </tr>
            </thead>
            <tbody>
              {data.recentTransactions.map((tx: any, i: number) => (
                <tr key={tx.id} style={{ borderBottom: '1px solid #f4f4f4' }}>
                  <td style={{ padding: '0.5rem' }}>{i + 1}</td>
                  <td style={{ padding: '0.5rem' }}>{tx.product.name}</td>
                  <td style={{ padding: '0.5rem', textAlign: 'right' }}>฿{tx.product.price}</td>
                </tr>
              ))}
              {data.recentTransactions.length === 0 && (
                <tr><td colSpan={3} style={{ padding: '1rem', textAlign: 'center' }}>ไม่มีข้อมูล</td></tr>
              )}
            </tbody>
          </table>
          <div style={{ textAlign: 'center', padding: '0.75rem', fontSize: '0.75rem', color: '#0073b7', cursor: 'pointer' }}>ดูทั้งหมด</div>
        </div>

      </div>

    </div>
  );
}
