"use client";

import React, { useState, useEffect, useRef } from 'react';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';
import BarcodeScanner from '@/components/BarcodeScanner';
import ReceiptModal, { ReceiptData } from '@/components/ReceiptModal';
import PromptPayModal from '@/components/PromptPayModal';

type Product = {
  id: string;
  sku: string;
  name: string;
  price: string | number;
  currentStock: number;
  category?: { name: string };
};

type CartItem = Product & { qty: number };

export default function POSPage() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [cart, setCart] = useState<CartItem[]>([]);
  const [isScannerOpen, setIsScannerOpen] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<'CASH' | 'TRANSFER' | 'CREDIT'>('CASH');
  const [cashTendered, setCashTendered] = useState<number>(0);
  const [customerName, setCustomerName] = useState('');
  const [loading, setLoading] = useState(false);

  // Modals
  const [isPromptPayOpen, setIsPromptPayOpen] = useState(false);
  const [receiptData, setReceiptData] = useState<ReceiptData | null>(null);

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

  const updateQty = (id: string, delta: number) => {
    setCart(prev =>
      prev
        .map(item => {
          if (item.id === id) {
            const newQty = item.qty + delta;
            return newQty > 0 ? { ...item, qty: newQty } : null;
          }
          return item;
        })
        .filter(Boolean) as CartItem[]
    );
  };

  const removeFromCart = (id: string) => {
    setCart(prev => prev.filter(item => item.id !== id));
  };

  const clearCart = () => {
    setCart([]);
    setCashTendered(0);
  };

  const handleScan = (barcode: string) => {
    setIsScannerOpen(false);
    const p = products.find(p => p.sku === barcode || p.id === barcode || (p as any).barcode === barcode);
    if (p) {
      addToCart(p);
    } else {
      alert(`ไม่พบสินค้าที่มีบาร์โค้ด: ${barcode}`);
    }
  };

  const total = cart.reduce((sum, item) => sum + (Number(item.price) * item.qty), 0);

  useEffect(() => {
    let status = 'idle';
    if (isPromptPayOpen) status = 'paying';
    if (receiptData) status = 'success';

    localStorage.setItem('pos-live-cart', JSON.stringify({
      cart,
      total,
      showPayment: isPromptPayOpen,
      status
    }));
  }, [cart, total, isPromptPayOpen, receiptData]);

  const openCustomerDisplay = () => {
    window.open('/customer-display', 'CustomerDisplay', 'width=1024,height=768');
  };

  const filteredProducts = products.filter(p => 
    p.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
    p.sku.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleCheckoutClick = () => {
    if (cart.length === 0) return;

    if (paymentMethod === 'TRANSFER') {
      setIsPromptPayOpen(true);
    } else {
      executeCheckout();
    }
  };

  const executeCheckout = async () => {
    if (cart.length === 0) return;
    setLoading(true);
    try {
      const res = await fetch('/api/pos/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          items: cart, 
          paymentMethod, 
          cashTendered: paymentMethod === 'CASH' ? cashTendered : total, 
          customerName 
        })
      });
      if (res.ok) {
        setIsPromptPayOpen(false);
        const orderId = `REC-${new Date().getFullYear().toString().slice(-2)}${(new Date().getMonth()+1).toString().padStart(2, '0')}-${Math.floor(1000 + Math.random() * 9000)}`;
        
        // Prepare Receipt Data
        setReceiptData({
          orderId,
          date: new Date().toLocaleString('th-TH'),
          customerName: customerName.trim() || undefined,
          items: [...cart],
          total,
          paymentMethod,
          cashTendered: paymentMethod === 'CASH' ? cashTendered : total,
          change: paymentMethod === 'CASH' && cashTendered > total ? (cashTendered - total) : 0,
        });

        // Reset
        setCart([]);
        setCashTendered(0);
        setCustomerName('');

        // Refresh products stock
        const updatedProds = await fetch('/api/inventory').then(r => r.json());
        setProducts(updatedProds);
      } else {
        const err = await res.json();
        alert('เกิดข้อผิดพลาดในการขาย: ' + (err.error || 'Server error'));
      }
    } catch (e: any) {
      alert('Error: ' + e.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div ref={containerRef} className="pos-container">
      <style jsx>{`
        .pos-container {
          display: grid;
          grid-template-columns: 1fr 380px;
          gap: 1.25rem;
          min-height: calc(100vh - 120px);
        }
        @media (max-width: 1023px) {
          .pos-container {
            display: flex;
            flex-direction: column;
            min-height: auto;
          }
          .pos-cart {
            max-height: 700px;
          }
        }
      `}</style>

      {/* Left: Products & Search Bar */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
        <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <h1 style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '10px' }}>
              <span style={{ fontSize: '1.8rem' }}>🛒</span> POS จุดขายหน้าร้าน (Cashier)
            </h1>
            <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', margin: 0, marginTop: '0.25rem' }}>
              ระบบคิดเงินรวดเร็ว รองรับสแกนบาร์โค้ด และพิมพ์ใบเสร็จ
            </p>
          </div>
          <div style={{ display: 'flex', gap: '0.75rem' }}>
            <button 
              className="btn btn-secondary" 
              onClick={openCustomerDisplay}
              style={{ display: 'flex', alignItems: 'center', gap: '8px' }}
            >
              📺 เปิดหน้าจอลูกค้า
            </button>
            <button 
              className="btn btn-primary" 
              onClick={() => setIsScannerOpen(true)}
              style={{ display: 'flex', alignItems: 'center', gap: '8px' }}
            >
              📷 สแกนบาร์โค้ด
            </button>
          </div>
        </header>

        {/* Search input */}
        <div style={{ position: 'relative' }}>
          <input
            type="text"
            placeholder="🔍 ค้นหาสินค้าด้วยชื่อ หรือรหัส SKU..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            style={{
              width: '100%',
              padding: '0.65rem 1rem',
              borderRadius: '8px',
              border: '1px solid #cbd5e1',
              backgroundColor: '#ffffff',
              fontSize: '0.9rem',
              boxShadow: '0 1px 2px rgba(0,0,0,0.05)',
              outline: 'none',
            }}
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              style={{
                position: 'absolute',
                right: '12px',
                top: '50%',
                transform: 'translateY(-50%)',
                background: 'none',
                border: 'none',
                color: '#94a3b8',
                cursor: 'pointer',
              }}
            >
              ✕
            </button>
          )}
        </div>
        
        {/* Product Grid */}
        <div className="pos-grid" style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))', 
          gap: '0.75rem',
          overflowY: 'auto', 
          paddingBottom: '1rem',
          maxHeight: 'calc(100vh - 240px)'
        }}>
          {filteredProducts.length === 0 ? (
            <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '3rem', color: '#94a3b8' }}>
              ไม่พบสินค้าที่ตรงกับการค้นหา
            </div>
          ) : (
            filteredProducts.map(p => (
              <div 
                key={p.id} 
                className="card glass" 
                style={{ 
                  cursor: 'pointer', 
                  textAlign: 'center', 
                  transition: 'all 0.15s ease-in-out', 
                  padding: '0.85rem 0.6rem',
                  borderRadius: '10px',
                  border: '1px solid #e2e8f0',
                  backgroundColor: '#ffffff',
                  boxShadow: '0 2px 4px rgba(0,0,0,0.02)',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                }}
                onClick={() => addToCart(p)}
                onMouseDown={e => e.currentTarget.style.transform = 'scale(0.96)'}
                onMouseUp={e => e.currentTarget.style.transform = 'scale(1)'}
              >
                <div>
                  <div style={{ fontSize: '1.5rem', marginBottom: '4px' }}>📦</div>
                  <h3 style={{ fontWeight: 600, fontSize: '0.85rem', marginBottom: '0.2rem', color: '#1e293b', minHeight: '34px', lineHeight: '1.2' }}>
                    {p.name}
                  </h3>
                  <p style={{ color: '#64748b', fontSize: '0.7rem', marginBottom: '0.25rem', fontFamily: 'monospace' }}>
                    {p.sku}
                  </p>
                </div>
                <div>
                  <div style={{ fontWeight: 800, color: '#0284c7', fontSize: '1.1rem', margin: '4px 0' }}>
                    ฿{Number(p.price).toLocaleString()}
                  </div>
                  <div style={{ 
                    fontSize: '0.7rem', 
                    padding: '2px 6px', 
                    borderRadius: '4px', 
                    display: 'inline-block',
                    backgroundColor: p.currentStock > 5 ? '#ecfdf5' : p.currentStock > 0 ? '#fef3c7' : '#fee2e2',
                    color: p.currentStock > 5 ? '#059669' : p.currentStock > 0 ? '#d97706' : '#dc2626',
                    fontWeight: 600,
                  }}>
                    คงเหลือ: {p.currentStock}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Right: Cart & Checkout Section */}
      <div className="pos-cart card" style={{ 
        display: 'flex', 
        flexDirection: 'column', 
        height: '100%', 
        backgroundColor: '#ffffff',
        borderRadius: '12px',
        border: '1px solid #cbd5e1',
        boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)',
        padding: '1.25rem'
      }}>
        {/* Cart Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem', borderBottom: '1px solid #e2e8f0', paddingBottom: '0.75rem' }}>
          <h2 style={{ fontSize: '1.15rem', fontWeight: 700, margin: 0, color: '#1e293b', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span>🧾</span> ตะกร้าสินค้า ({cart.reduce((a,b)=>a+b.qty, 0)})
          </h2>
          {cart.length > 0 && (
            <button 
              onClick={clearCart} 
              style={{ background: 'none', border: 'none', color: '#ef4444', fontSize: '0.75rem', cursor: 'pointer', fontWeight: 600 }}
            >
              ล้างตะกร้า
            </button>
          )}
        </div>
        
        {/* Cart Items List */}
        <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '0.5rem', maxHeight: '280px', paddingRight: '4px' }}>
          {cart.length === 0 ? (
            <div style={{ textAlign: 'center', color: '#94a3b8', marginTop: '3rem', fontSize: '0.85rem' }}>
              <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>🛍️</div>
              ยังไม่มีสินค้าในตะกร้า<br/>คลิกเลือกสินค้าเพื่อเพิ่มในบิล
            </div>
          ) : (
            cart.map(item => (
              <div 
                key={item.id} 
                style={{ 
                  display: 'flex', 
                  justifyContent: 'space-between', 
                  alignItems: 'center',
                  padding: '0.5rem 0.6rem',
                  backgroundColor: '#f8fafc',
                  borderRadius: '8px',
                  border: '1px solid #f1f5f9',
                }}
              >
                <div style={{ flex: 1, minWidth: 0, marginRight: '0.5rem' }}>
                  <div style={{ fontWeight: 600, fontSize: '0.85rem', color: '#1e293b', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {item.name}
                  </div>
                  <div style={{ fontSize: '0.75rem', color: '#64748b' }}>
                    ฿{Number(item.price).toLocaleString()} / ชิ้น
                  </div>
                </div>

                {/* Qty Controls */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '4px', marginRight: '0.5rem' }}>
                  <button 
                    onClick={() => updateQty(item.id, -1)}
                    style={{ width: '22px', height: '22px', borderRadius: '4px', border: '1px solid #cbd5e1', background: '#fff', cursor: 'pointer', fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                  >
                    -
                  </button>
                  <span style={{ fontSize: '0.85rem', fontWeight: 700, minWidth: '20px', textAlign: 'center' }}>
                    {item.qty}
                  </span>
                  <button 
                    onClick={() => updateQty(item.id, 1)}
                    style={{ width: '22px', height: '22px', borderRadius: '4px', border: '1px solid #cbd5e1', background: '#fff', cursor: 'pointer', fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                  >
                    +
                  </button>
                </div>

                <div style={{ fontWeight: 700, fontSize: '0.9rem', color: '#0f172a', minWidth: '55px', textAlign: 'right' }}>
                  ฿{(Number(item.price) * item.qty).toLocaleString()}
                </div>

                <button 
                  onClick={() => removeFromCart(item.id)}
                  style={{ background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer', padding: '0 4px', fontSize: '0.85rem' }}
                  title="ลบรายการ"
                >
                  ✕
                </button>
              </div>
            ))
          )}
        </div>

        {/* Total & Checkout Section */}
        <div style={{ marginTop: '0.75rem', paddingTop: '0.75rem', borderTop: '2px dashed #e2e8f0' }}>
          {/* Total display */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: '0.75rem' }}>
            <span style={{ fontSize: '1rem', fontWeight: 600, color: '#475569' }}>ยอดรวมสุทธิ:</span>
            <span style={{ fontSize: '1.6rem', fontWeight: 900, color: '#059669', fontFamily: 'monospace' }}>
              ฿{total.toLocaleString('en-US', { minimumFractionDigits: 2 })}
            </span>
          </div>

          <input 
            type="text" 
            placeholder="ชื่อลูกค้า (ไม่บังคับ)" 
            value={customerName} 
            onChange={e => setCustomerName(e.target.value)}
            style={{ 
              width: '100%', 
              padding: '0.5rem 0.75rem', 
              borderRadius: '6px', 
              border: '1px solid #cbd5e1', 
              fontSize: '0.8rem',
              marginBottom: '0.5rem',
              outline: 'none'
            }}
          />
          
          {/* Payment Method Selector */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '4px', marginBottom: '0.6rem' }}>
            {[
              { id: 'CASH', label: '💵 เงินสด' },
              { id: 'TRANSFER', label: '📱 QR โอน' },
              { id: 'CREDIT', label: '💳 บัตร' },
            ].map(m => (
              <button
                key={m.id}
                type="button"
                onClick={() => setPaymentMethod(m.id as any)}
                style={{
                  padding: '0.45rem 0.2rem',
                  fontSize: '0.75rem',
                  fontWeight: 600,
                  borderRadius: '6px',
                  border: paymentMethod === m.id ? '2px solid #0284c7' : '1px solid #e2e8f0',
                  backgroundColor: paymentMethod === m.id ? '#e0f2fe' : '#f8fafc',
                  color: paymentMethod === m.id ? '#0369a1' : '#64748b',
                  cursor: 'pointer'
                }}
              >
                {m.label}
              </button>
            ))}
          </div>

          {/* Cash Quick Presets */}
          {paymentMethod === 'CASH' && (
            <div style={{ marginBottom: '0.6rem' }}>
              <div style={{ display: 'flex', gap: '4px', marginBottom: '4px' }}>
                {[
                  { label: 'พอดี', val: total },
                  { label: '฿50', val: 50 },
                  { label: '฿100', val: 100 },
                  { label: '฿500', val: 500 },
                  { label: '฿1,000', val: 1000 },
                ].map(preset => (
                  <button
                    key={preset.label}
                    type="button"
                    onClick={() => setCashTendered(preset.val)}
                    style={{
                      flex: 1,
                      padding: '3px 0',
                      fontSize: '0.7rem',
                      fontWeight: 600,
                      borderRadius: '4px',
                      border: '1px solid #cbd5e1',
                      backgroundColor: '#f1f5f9',
                      color: '#334155',
                      cursor: 'pointer'
                    }}
                  >
                    {preset.label}
                  </button>
                ))}
              </div>
              <input 
                type="number" 
                placeholder="จำนวนเงินที่รับมา (฿)..." 
                value={cashTendered || ''} 
                onChange={e => setCashTendered(Number(e.target.value))}
                style={{ 
                  width: '100%', 
                  padding: '0.5rem 0.75rem', 
                  borderRadius: '6px', 
                  border: '1px solid #cbd5e1', 
                  fontSize: '0.85rem',
                  fontWeight: 600,
                  fontFamily: 'monospace',
                  outline: 'none'
                }}
              />
              {cashTendered >= total && total > 0 && (
                <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '4px', padding: '4px 8px', backgroundColor: '#ecfdf5', borderRadius: '4px', color: '#059669', fontSize: '0.8rem', fontWeight: 700 }}>
                  <span>เงินทอน:</span>
                  <span>฿{(cashTendered - total).toLocaleString('en-US', { minimumFractionDigits: 2 })}</span>
                </div>
              )}
            </div>
          )}

          {/* Checkout Button */}
          <button 
            style={{ 
              width: '100%', 
              padding: '0.85rem', 
              fontSize: '1rem',
              fontWeight: 800,
              borderRadius: '8px',
              border: 'none',
              backgroundColor: cart.length === 0 || loading || (paymentMethod === 'CASH' && cashTendered < total) ? '#94a3b8' : '#059669',
              color: 'white',
              cursor: cart.length === 0 || loading || (paymentMethod === 'CASH' && cashTendered < total) ? 'not-allowed' : 'pointer',
              boxShadow: '0 4px 6px -1px rgba(5,150,105,0.3)',
              transition: 'all 0.15s',
            }}
            disabled={cart.length === 0 || loading || (paymentMethod === 'CASH' && cashTendered < total)}
            onClick={handleCheckoutClick}
          >
            {loading ? 'กำลังบันทึก...' : paymentMethod === 'TRANSFER' ? '📱 สร้าง QR PromptPay' : '✓ ชำระเงิน & ออกใบเสร็จ'}
          </button>
        </div>
      </div>

      {/* Barcode Scanner Modal */}
      {isScannerOpen && (
        <BarcodeScanner 
          onScanSuccess={handleScan}
          onClose={() => setIsScannerOpen(false)}
        />
      )}

      {/* QR PromptPay Modal */}
      {isPromptPayOpen && (
        <PromptPayModal
          amount={total}
          customerName={customerName}
          onConfirmPayment={executeCheckout}
          onClose={() => setIsPromptPayOpen(false)}
        />
      )}

      {/* Thermal Receipt Slip Modal */}
      {receiptData && (
        <ReceiptModal
          data={receiptData}
          onClose={() => setReceiptData(null)}
        />
      )}
    </div>
  );
}
