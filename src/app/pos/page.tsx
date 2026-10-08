
"use client";

import React, { useState, useEffect, useRef } from 'react';
import BarcodeScanner from '@/components/BarcodeScanner';
import PromptPayModal from '@/components/PromptPayModal';
import ReceiptModal from '@/components/ReceiptModal';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';

type Product = {
  id: string;
  name: string;
  sku: string;
  price: number;
  cost: number;
  currentStock: number;
  minStockLevel: number;
  unit: string;
};

type CartItem = Product & { qty: number };

type ReceiptData = {
  orderId: string;
  date: string;
  customerName?: string;
  items: CartItem[];
  total: number;
  paymentMethod: string;
  cashTendered?: number;
  change?: number;
};

export default function POSPage() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  
  const [cart, setCart] = useState<CartItem[]>([]);
  const [isScannerOpen, setIsScannerOpen] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<'CASH' | 'TRANSFER' | 'CREDIT'>('CASH');
  const [cashTendered, setCashTendered] = useState<number>(0);
  const [loading, setLoading] = useState(false);
  
  const [customers, setCustomers] = useState<any[]>([]);
  const [selectedCustomerId, setSelectedCustomerId] = useState<string>('');
  
  const [promotions, setPromotions] = useState<any[]>([]);
  const [promoCodeInput, setPromoCodeInput] = useState('');
  const [appliedPromo, setAppliedPromo] = useState<any | null>(null);
  
  const [usePoints, setUsePoints] = useState<number>(0);

  // Modals
  const [isPromptPayOpen, setIsPromptPayOpen] = useState(false);
  const [receiptData, setReceiptData] = useState<ReceiptData | null>(null);

  
  // --- Screen Wake Lock API ---
  useEffect(() => {
    let wakeLock: any = null;
    const requestWakeLock = async () => {
      try {
        if ('wakeLock' in navigator) {
          wakeLock = await (navigator as any).wakeLock.request('screen');
          console.log('Screen Wake Lock is active');
        }
      } catch (err: any) {
        console.error(`${err.name}, ${err.message}`);
      }
    };

    const handleVisibilityChange = () => {
      if (wakeLock !== null && document.visibilityState === 'visible') {
        requestWakeLock();
      }
    };

    requestWakeLock();
    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      if (wakeLock !== null) {
        wakeLock.release().then(() => { wakeLock = null; });
      }
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, []);
  // -----------------------------

  useEffect(() => {
    fetch('/api/inventory').then(r => r.json()).then(setProducts).catch(console.error);
    fetch('/api/customers').then(r => r.json()).then(setCustomers).catch(()=>console.log('Customer fetch err'));
    fetch('/api/promotions').then(r => r.json()).then(setPromotions).catch(()=>console.log('Promo fetch err'));
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
    setUsePoints(0);
    setAppliedPromo(null);
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
          customerId: selectedCustomerId || undefined,
          promotionId: appliedPromo?.id || undefined,
          discountAmount,
          pointsUsed: usePoints
        })
      });
      if (res.ok) {
        setIsPromptPayOpen(false);
        const resData = await res.json();
        
        // Prepare Receipt Data
        setReceiptData({
          orderId: resData.soNumber,
          date: new Date().toLocaleString('th-TH'),
          customerName: customers.find(c=>c.id===selectedCustomerId)?.name || undefined,
          items: [...cart],
          total,
          paymentMethod,
          cashTendered: paymentMethod === 'CASH' ? cashTendered : total,
          change: paymentMethod === 'CASH' && cashTendered > total ? (cashTendered - total) : 0,
        });

        // Reset
        setCart([]);
        setCashTendered(0);
        setSelectedCustomerId('');
        setAppliedPromo(null);
        setPromoCodeInput('');
        setUsePoints(0);

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

      {/* Main Content: Products Grid */}
      <div className="pos-grid" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        {/* Header */}
        <div className="card" style={{ padding: '1rem 1.5rem', marginBottom: 0 }}>
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
                style={{ fontSize: '0.85rem', padding: '0.4rem 0.8rem', display: 'flex', alignItems: 'center', gap: '5px' }}
              >
                📺 เปิดหน้าจอลูกค้า
              </button>
              <button 
                className="btn btn-primary" 
                onClick={() => setIsScannerOpen(true)}
                style={{ fontSize: '0.85rem', padding: '0.4rem 0.8rem', display: 'flex', alignItems: 'center', gap: '5px' }}
              >
                📷 สแกนบาร์โค้ด
              </button>
            </div>
          </header>
        </div>

        {/* Search input */}
        <div style={{ position: 'relative' }}>
          <input 
            type="text" 
            placeholder="ค้นหาสินค้า (ชื่อ, SKU, บาร์โค้ด)..." 
            className="input"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            style={{ width: '100%', padding: '0.75rem 1rem', paddingLeft: '2.5rem', borderRadius: '8px', border: '1px solid var(--border)', fontSize: '0.95rem', boxShadow: 'var(--shadow-sm)' }}
          />
          <span style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', opacity: 0.5 }}>🔍</span>
        </div>

        {/* Products Grid */}
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', 
          gap: '1rem',
          overflowY: 'auto',
          alignContent: 'start',
          flex: 1
        }}>
          {filteredProducts.map(p => (
            <div 
              key={p.id} 
              onClick={() => addToCart(p)}
              style={{ 
                backgroundColor: 'white', 
                borderRadius: '8px', 
                padding: '1rem', 
                cursor: 'pointer',
                border: '1px solid var(--border)',
                boxShadow: 'var(--shadow-sm)',
                transition: 'all 0.2s',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                position: 'relative',
                overflow: 'hidden'
              }}
              onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-3px)'}
              onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
            >
              {p.currentStock <= p.minStockLevel && (
                <div style={{ position: 'absolute', top: 0, right: 0, backgroundColor: 'var(--danger)', color: 'white', fontSize: '0.65rem', padding: '2px 8px', borderBottomLeftRadius: '8px', fontWeight: 700 }}>
                  ใกล้หมด
                </div>
              )}
              
              <div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)', marginBottom: '4px' }}>{p.sku}</div>
                <h3 style={{ fontSize: '0.95rem', fontWeight: 600, color: 'var(--text-primary)', margin: '0 0 8px 0', lineHeight: 1.3 }}>{p.name}</h3>
              </div>
              
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginTop: '8px' }}>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>คงเหลือ {p.currentStock}</span>
                <span style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--primary)' }}>฿{Number(p.price).toLocaleString()}</span>
              </div>
            </div>
          ))}
          {filteredProducts.length === 0 && (
            <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '3rem', color: 'var(--text-tertiary)' }}>
              ไม่มีสินค้าที่ค้นหา
            </div>
          )}
        </div>
      </div>

      {/* Sidebar: Cart & Checkout */}
      <div className="pos-cart card" style={{ 
        display: 'flex', 
        flexDirection: 'column', 
        height: '100%',
        margin: 0,
        padding: '1.25rem'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', paddingBottom: '0.75rem', borderBottom: '2px dashed var(--border)' }}>
          <h2 style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--text-primary)', margin: 0 }}>ตะกร้าสินค้า</h2>
          <button 
            onClick={clearCart}
            style={{ background: 'none', border: 'none', color: 'var(--danger)', fontSize: '0.85rem', cursor: 'pointer', fontWeight: 600 }}
          >
            ล้างทั้งหมด
          </button>
        </div>

        {/* Cart Items */}
        <div style={{ flex: 1, overflowY: 'auto', marginBottom: '1rem', paddingRight: '0.5rem' }}>
          {cart.length === 0 ? (
            <div style={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-tertiary)', fontSize: '0.9rem' }}>
              ยังไม่มีสินค้าในตะกร้า
            </div>
          ) : (
            cart.map(item => (
              <div key={item.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem', paddingBottom: '0.75rem', borderBottom: '1px solid var(--border)' }}>
                <div style={{ flex: 1, paddingRight: '10px' }}>
                  <div style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '4px', lineHeight: 1.2 }}>{item.name}</div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>฿{Number(item.price).toLocaleString()} / {item.unit}</div>
                </div>
                
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', margin: '0 10px' }}>
                  <button 
                    onClick={() => updateQty(item.id, -1)}
                    style={{ width: '22px', height: '22px', borderRadius: '4px', border: '1px solid var(--border)', background: '#fff', cursor: 'pointer', fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                  >
                    -
                  </button>
                  <span style={{ fontSize: '0.85rem', fontWeight: 700, minWidth: '20px', textAlign: 'center' }}>
                    {item.qty}
                  </span>
                  <button 
                    onClick={() => updateQty(item.id, 1)}
                    style={{ width: '22px', height: '22px', borderRadius: '4px', border: '1px solid var(--border)', background: '#fff', cursor: 'pointer', fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                  >
                    +
                  </button>
                </div>

                <div style={{ fontWeight: 700, fontSize: '0.9rem', color: 'var(--text-primary)', minWidth: '55px', textAlign: 'right' }}>
                  ฿{(Number(item.price) * item.qty).toLocaleString()}
                </div>

                <button 
                  onClick={() => removeFromCart(item.id)}
                  style={{ background: 'none', border: 'none', color: 'var(--text-tertiary)', cursor: 'pointer', padding: '0 4px', fontSize: '0.85rem' }}
                  title="ลบรายการ"
                >
                  ✕
                </button>
              </div>
            ))
          )}
        </div>

        {/* Total & Checkout Section */}
        <div style={{ marginTop: '0.75rem', paddingTop: '0.75rem', borderTop: '2px dashed var(--border)' }}>
          
          <select 
            className="input" 
            style={{ marginBottom: '0.5rem', fontSize: '0.8rem', width: '100%', padding: '0.5rem', borderRadius: '6px' }}
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

          <div style={{ marginBottom: '0.75rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
              <span>ยอดรวม:</span>
              <span>฿{subtotal.toLocaleString('en-US', { minimumFractionDigits: 2 })}</span>
            </div>
            {(discountAmount > 0 || pointsDiscount > 0) && (
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', color: 'var(--danger)' }}>
                <span>ส่วนลด:</span>
                <span>-฿{(discountAmount + pointsDiscount).toLocaleString('en-US', { minimumFractionDigits: 2 })}</span>
              </div>
            )}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginTop: '0.5rem', borderTop: '1px solid var(--border)', paddingTop: '0.5rem' }}>
              <span style={{ fontSize: '1rem', fontWeight: 600, color: 'var(--text-primary)' }}>ยอดสุทธิ:</span>
              <span style={{ fontSize: '1.6rem', fontWeight: 900, color: 'var(--primary)', fontFamily: 'monospace' }}>
                ฿{total.toLocaleString('en-US', { minimumFractionDigits: 2 })}
              </span>
            </div>
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
                  border: paymentMethod === m.id ? '2px solid var(--primary)' : '1px solid var(--border)',
                  backgroundColor: paymentMethod === m.id ? 'var(--primary)' : '#f8fafc',
                  color: paymentMethod === m.id ? 'white' : 'var(--text-secondary)',
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
                      border: '1px solid var(--border)',
                      backgroundColor: '#f1f5f9',
                      color: 'var(--text-primary)',
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
                  border: '1px solid var(--border)', 
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
              backgroundColor: cart.length === 0 || loading || (paymentMethod === 'CASH' && cashTendered < total) ? '#94a3b8' : 'var(--primary)',
              color: 'white',
              cursor: cart.length === 0 || loading || (paymentMethod === 'CASH' && cashTendered < total) ? 'not-allowed' : 'pointer',
              boxShadow: 'var(--shadow-md)',
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
          customerName={customers.find(c=>c.id===selectedCustomerId)?.name || ''}
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
