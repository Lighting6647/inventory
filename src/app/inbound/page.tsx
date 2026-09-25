"use client";

import React, { useState, useEffect, useRef } from 'react';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';
import BarcodeScanner from '@/components/BarcodeScanner';

type Category = { id: string; name: string };

export default function InboundPage() {
  const containerRef = useRef<HTMLDivElement>(null);
  
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedCat, setSelectedCat] = useState('');
  const [qty, setQty] = useState(1);
  const [cost, setCost] = useState(0);
  const [price, setPrice] = useState(0);
  
  const [isScannerOpen, setIsScannerOpen] = useState(false);
  const [statusMsg, setStatusMsg] = useState('');

  useEffect(() => {
    fetch('/api/categories').then(r => r.json()).then(setCategories).catch(console.error);
  }, []);

  useGSAP(() => {
    gsap.fromTo('.inbound-card', 
      { y: 30, opacity: 0 }, 
      { y: 0, opacity: 1, duration: 0.8, ease: 'power3.out' }
    );
  }, { scope: containerRef });

  const handleScan = async (barcode: string) => {
    setIsScannerOpen(false);
    setStatusMsg(`Scanning: ${barcode}...`);
    
    try {
      const res = await fetch('/api/inbound', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          barcode,
          categoryId: selectedCat,
          quantity: qty,
          cost,
          price
        })
      });

      if (res.ok) {
        setStatusMsg(`✅ Success! Added ${qty} items of ${barcode}`);
      } else {
        const err = await res.json();
        setStatusMsg(`❌ Error: ${err.error}`);
      }
    } catch (e: any) {
      setStatusMsg(`❌ Error: ${e.message}`);
    }
  };

  return (
    <div ref={containerRef} style={{ maxWidth: '600px', margin: '0 auto' }}>
      <header style={{ marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '2rem', fontWeight: 700 }}>Inbound (รับเข้าสินค้า)</h1>
        <p style={{ color: 'var(--secondary-foreground)' }}>Set details, then scan to receive stock.</p>
      </header>

      <div className="card glass inbound-card" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', opacity: 0 }}>
        
        {statusMsg && (
          <div style={{ padding: '1rem', backgroundColor: 'var(--secondary)', borderRadius: '8px', fontWeight: 500 }}>
            {statusMsg}
          </div>
        )}

        <div>
          <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500 }}>Category (หมวดหมู่)</label>
          <select 
            className="input" 
            value={selectedCat} 
            onChange={(e) => setSelectedCat(e.target.value)}
            style={{ width: '100%' }}
          >
            <option value="">-- Select Category --</option>
            {categories.map(c => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1rem' }}>
          <div>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500 }}>Quantity</label>
            <input 
              type="number" 
              className="input" 
              value={qty} 
              onChange={e => setQty(Number(e.target.value))}
              min="1"
              style={{ width: '100%' }}
            />
          </div>
          <div>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500 }}>Cost (ทุน)</label>
            <input 
              type="number" 
              className="input" 
              value={cost} 
              onChange={e => setCost(Number(e.target.value))}
              min="0"
              style={{ width: '100%' }}
            />
          </div>
          <div>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500 }}>Price (ราคาขาย)</label>
            <input 
              type="number" 
              className="input" 
              value={price} 
              onChange={e => setPrice(Number(e.target.value))}
              min="0"
              style={{ width: '100%' }}
            />
          </div>
        </div>

        <button 
          className="btn btn-primary" 
          onClick={() => setIsScannerOpen(true)}
          style={{ width: '100%', padding: '1rem', fontSize: '1.25rem', marginTop: '1rem' }}
        >
          📷 Scan Barcode
        </button>
      </div>

      {isScannerOpen && (
        <BarcodeScanner 
          onScanSuccess={handleScan}
          onClose={() => setIsScannerOpen(false)}
        />
      )}
    </div>
  );
}
