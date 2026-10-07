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

  const [customers, setCustomers] = useState<any[]>([]);
  const [selectedCustomerId, setSelectedCustomerId] = useState<string>('');
  
  const [promotions, setPromotions] = useState<any[]>([]);
  const [promoCodeInput, setPromoCodeInput] = useState('');
  const [appliedPromo, setAppliedPromo] = useState<any | null>(null);
  
  const [usePoints, setUsePoints] = useState<number>(0);
  
  useEffect(() => {
    fetch('/api/customers').then(r => r.json()).then(setCustomers).catch(()=>console.log('Customer fetch err'));
    fetch('/api/promotions').then(r => r.json()).then(setPromotions).catch(()=>console.log('Promo fetch err'));
  }, []);


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

  
  const subtotal = cart.reduce((sum, item) => sum + (Number(item.price) * item.qty), 0);
  
  let discountAmount = 0;
  if (appliedPromo) {
    if (appliedPromo.discountType === 'PERCENT') {
      discountAmount = subtotal * (appliedPromo.discountValue / 100);
    } else {
      discountAmount = appliedPromo.discountValue;
    }
  }
  
  // Assuming 1 point = 1 Baht discount for now (can be dynamic via settings)
  const pointsDiscount = usePoints;
  
  const total = Math.max(0, subtotal - discountAmount - pointsDiscount);


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
          <select 
            className="input" 
            style={{ marginBottom: '0.5rem', fontSize: '0.8rem' }}
            value={selectedCustomerId}
            onChange={(e) => {
              setSelectedCustomerId(e.target.value);
              setUsePoints(0);
            }}
          >
            <option value="">-- เลือกลูกค้า (ไม่บังคับ) --</option>
            {customers.map(c => <option key={c.id} value={c.id}>{c.name} (แต้ม: {c.points})</option>)}
          </select>

          {selectedCustomerId && customers.find(c=>c.id===selectedCustomerId)?.points > 0 && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '0.5rem', fontSize: '0.8rem' }}>
              <span>ใช้แต้มลดราคา (มี {customers.find(c=>c.id===selectedCustomerId)?.points} แต้ม):</span>
              <input 
                type="number" 
                max={customers.find(c=>c.id===selectedCustomerId)?.points} 
                min={0}
                value={usePoints || ''}
                onChange={e => setUsePoints(Math.min(Number(e.target.value), customers.find(c=>c.id===selectedCustomerId)?.points || 0))}
                style={{ width: '80px', padding: '0.2rem', borderRadius: '4px', border: '1px solid var(--border)' }}
              />
            </div>
          )}

          <div style={{ display: 'flex', gap: '8px', marginBottom: '0.75rem' }}>
            <input 
              type="text" 
              placeholder="โค้ดส่วนลด..." 
              value={promoCodeInput}
              onChange={e => setPromoCodeInput(e.target.value.toUpperCase())}
              style={{ flex: 1, padding: '0.5rem', borderRadius: '6px', border: '1px solid var(--border)', fontSize: '0.8rem' }}
            />
            <button 
              onClick={() => {
                const promo = promotions.find(p => p.code === promoCodeInput && p.isActive);
                if(promo) setAppliedPromo(promo);
                else alert('ไม่พบโค้ดนี้ หรือโค้ดหมดอายุแล้ว');
              }}
              style={{ padding: '0.5rem 1rem', background: 'var(--primary)', color: 'white', borderRadius: '6px', fontSize: '0.8rem', border: 'none', cursor: 'pointer' }}
            >
              ใช้โค้ด
            </button>
          </div>
          
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
