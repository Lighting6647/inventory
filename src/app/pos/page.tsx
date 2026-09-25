"use client";

import React, { useState, useEffect, useRef } from 'react';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';
import BarcodeScanner from '@/components/BarcodeScanner';

type Product = {
  id: string;
  sku: string;
  name: string;
  price: string | number;
  currentStock: number;
};

type CartItem = Product & { qty: number };

export default function POSPage() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [isScannerOpen, setIsScannerOpen] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState('CASH');
  const [cashTendered, setCashTendered] = useState<number>(0);
  const [customerName, setCustomerName] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetch('/api/inventory').then(r => r.json()).then(setProducts).catch(console.error);
  }, []);

  useGSAP(() => {
    gsap.fromTo('.pos-grid', { opacity: 0, y: 20 }, { opacity: 1, y: 0, duration: 0.5 });
    gsap.fromTo('.pos-cart', { opacity: 0, x: 20 }, { opacity: 1, x: 0, duration: 0.5, delay: 0.2 });
  }, { scope: containerRef });

  const addToCart = (product: Product) => {
    setCart(prev => {
      const existing = prev.find(item => item.id === product.id);
      if (existing) {
        return prev.map(item => item.id === product.id ? { ...item, qty: item.qty + 1 } : item);
      }
      return [...prev, { ...product, qty: 1 }];
    });
  };

  const handleScan = (barcode: string) => {
    setIsScannerOpen(false);
    const p = products.find(p => p.sku === barcode || p.id === barcode); // fallback if barcode field is null
    if (p) {
      addToCart(p);
    } else {
      alert(`Product not found: ${barcode}`);
    }
  };

  const total = cart.reduce((sum, item) => sum + (Number(item.price) * item.qty), 0);

  const handleCheckout = async () => {
    if (cart.length === 0) return;
    setLoading(true);
    try {
      const res = await fetch('/api/pos/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ items: cart, paymentMethod, cashTendered, customerName })
      });
      if (res.ok) {
        alert('Checkout Complete!');
        setCart([]);
        setCashTendered(0);
        setCustomerName('');
        // Refresh products
        const updatedProds = await fetch('/api/inventory').then(r => r.json());
        setProducts(updatedProds);
      } else {
        const err = await res.json();
        alert('Checkout failed: ' + err.error);
      }
    } catch (e: any) {
      alert('Error: ' + e.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div ref={containerRef} style={{ display: 'grid', gridTemplateColumns: '1fr 350px', gap: '2rem', height: 'calc(100vh - 150px)' }}>
      {/* Left: Products & Scanner */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h1 style={{ fontSize: '2rem', fontWeight: 700 }}>POS (ขายหน้าร้าน)</h1>
          <button className="btn btn-primary" onClick={() => setIsScannerOpen(true)}>
            📷 Scan Barcode
          </button>
        </header>
        
        <div className="pos-grid" style={{ 
          display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))', gap: '1rem',
          overflowY: 'auto', paddingBottom: '2rem', opacity: 0
        }}>
          {products.map(p => (
            <div 
              key={p.id} 
              className="card glass" 
              style={{ cursor: 'pointer', textAlign: 'center', transition: 'transform 0.1s' }}
              onClick={() => addToCart(p)}
              onMouseDown={e => e.currentTarget.style.transform = 'scale(0.95)'}
              onMouseUp={e => e.currentTarget.style.transform = 'scale(1)'}
            >
              <h3 style={{ fontWeight: 600, fontSize: '1rem', marginBottom: '0.5rem' }}>{p.name}</h3>
              <p style={{ color: 'var(--secondary-foreground)', fontSize: '0.8rem', marginBottom: '0.5rem' }}>SKU: {p.sku}</p>
              <div style={{ fontWeight: 700, color: 'var(--primary)', fontSize: '1.25rem' }}>฿{p.price}</div>
              <div style={{ fontSize: '0.75rem', color: p.currentStock > 0 ? '#10b981' : '#ef4444' }}>
                Stock: {p.currentStock}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Right: Cart */}
      <div className="pos-cart card glass" style={{ display: 'flex', flexDirection: 'column', height: '100%', opacity: 0 }}>
        <h2 style={{ fontSize: '1.25rem', fontWeight: 600, marginBottom: '1rem', borderBottom: '1px solid var(--border)', paddingBottom: '1rem' }}>
          Current Order
        </h2>
        
        <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {cart.length === 0 && <p style={{ textAlign: 'center', color: 'var(--secondary-foreground)', marginTop: '2rem' }}>Cart is empty</p>}
          {cart.map(item => (
            <div key={item.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <p style={{ fontWeight: 500 }}>{item.name}</p>
                <p style={{ fontSize: '0.875rem', color: 'var(--secondary-foreground)' }}>฿{item.price} x {item.qty}</p>
              </div>
              <div style={{ fontWeight: 600 }}>฿{Number(item.price) * item.qty}</div>
            </div>
          ))}
        </div>

        <div style={{ marginTop: '1rem', paddingTop: '1rem', borderTop: '1px solid var(--border)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem', fontSize: '1.25rem', fontWeight: 700 }}>
            <span>Total:</span>
            <span>฿{total.toLocaleString()}</span>
          </div>

          <input 
            type="text" 
            className="input" 
            placeholder="Customer Name (ชื่อลูกค้า - ไม่บังคับ)" 
            value={customerName} 
            onChange={e => setCustomerName(e.target.value)}
            style={{ width: '100%', marginBottom: '1rem' }}
          />
          
          <select 
            className="input" 
            value={paymentMethod} 
            onChange={e => setPaymentMethod(e.target.value)}
            style={{ width: '100%', marginBottom: '1rem' }}
          >
            <option value="CASH">Cash (เงินสด)</option>
            <option value="TRANSFER">Transfer (โอนเงิน)</option>
            <option value="CREDIT">Credit Card</option>
          </select>

          {paymentMethod === 'CASH' && (
            <input 
              type="number" 
              className="input" 
              placeholder="Cash Tendered (รับเงินมา)" 
              value={cashTendered || ''} 
              onChange={e => setCashTendered(Number(e.target.value))}
              style={{ width: '100%', marginBottom: '1rem' }}
            />
          )}

          {paymentMethod === 'CASH' && cashTendered >= total && total > 0 && (
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem', color: '#10b981', fontWeight: 600 }}>
              <span>Change (เงินทอน):</span>
              <span>฿{(cashTendered - total).toLocaleString()}</span>
            </div>
          )}

          <button 
            className="btn btn-primary" 
            style={{ width: '100%', padding: '1rem', fontSize: '1.1rem' }}
            disabled={cart.length === 0 || loading || (paymentMethod === 'CASH' && cashTendered < total)}
            onClick={handleCheckout}
          >
            {loading ? 'Processing...' : 'Checkout (ชำระเงิน)'}
          </button>
        </div>
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
