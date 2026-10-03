"use client";
import React, { useState, useEffect } from 'react';

type CartItem = {
  id: string;
  name: string;
  price: number;
  qty: number;
  image?: string;
};

type LiveState = {
  cart: CartItem[];
  total: number;
  showPayment: boolean;
  status: 'idle' | 'scanning' | 'paying' | 'success';
};

export default function CustomerDisplayPage() {
  const [liveState, setLiveState] = useState<LiveState>({
    cart: [],
    total: 0,
    showPayment: false,
    status: 'idle'
  });

  const [promptPayNumber, setPromptPayNumber] = useState('');
  const [qrImage, setQrImage] = useState<string | null>(null);
  const [accountName, setAccountName] = useState('');
  const [bankName, setBankName] = useState('');

  useEffect(() => {
    // Fetch settings for payment display
    fetch('/api/settings')
      .then(res => res.json())
      .then(data => {
        const getVal = (key: string) => data.find((s: any) => s.key === key)?.value;
        setPromptPayNumber(getVal('PROMPTPAY_NUMBER') || '081-234-5678');
        setQrImage(getVal('PROMPTPAY_QR_IMAGE') || null);
        setAccountName(getVal('ACCOUNT_NAME') || '');
        setBankName(getVal('BANK_NAME') || '');
      })
      .catch(console.error);

    // Initial load from local storage
    const initialRaw = localStorage.getItem('pos-live-cart');
    if (initialRaw) {
      try {
        setLiveState(JSON.parse(initialRaw));
      } catch (e) {}
    }

    // Listen for cross-tab storage changes
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'pos-live-cart' && e.newValue) {
        try {
          const parsed = JSON.parse(e.newValue);
          setLiveState(parsed);
        } catch (err) {}
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  return (
    <div style={{ display: 'flex', height: '100vh', width: '100vw', overflow: 'hidden', backgroundColor: '#f1f5f9', fontFamily: 'sans-serif' }}>
      
      {/* Left Panel: Items List */}
      <div style={{ flex: 1.5, display: 'flex', flexDirection: 'column', backgroundColor: '#ffffff', borderRight: '1px solid #e2e8f0', boxShadow: '5px 0 15px rgba(0,0,0,0.05)' }}>
        
        <div style={{ padding: '1.5rem', backgroundColor: '#003d6b', color: 'white' }}>
          <h1 style={{ margin: 0, fontSize: '1.8rem', fontWeight: 700 }}>รายการสินค้า (Your Order)</h1>
          <p style={{ margin: 0, opacity: 0.8, marginTop: '0.25rem' }}>ยินดีต้อนรับ (Welcome to our store)</p>
        </div>

        <div style={{ flex: 1, overflowY: 'auto', padding: '1rem' }}>
          {liveState.cart.length === 0 && liveState.status !== 'success' ? (
            <div style={{ height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', color: '#94a3b8' }}>
              <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>🛒</div>
              <h2 style={{ fontWeight: 400 }}>ยังไม่มีรายการสินค้า</h2>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {liveState.cart.map((item, idx) => (
                <div key={idx} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '1rem', backgroundColor: '#f8fafc', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <div style={{ width: '60px', height: '60px', backgroundColor: '#e2e8f0', borderRadius: '8px', display: 'flex', justifyContent: 'center', alignItems: 'center', fontSize: '1.5rem' }}>
                      📦
                    </div>
                    <div>
                      <h3 style={{ margin: 0, fontSize: '1.25rem', color: '#1e293b' }}>{item.name}</h3>
                      <p style={{ margin: 0, color: '#64748b', marginTop: '0.25rem' }}>{item.qty} ชิ้น x ฿{Number(item.price).toLocaleString('en-US', { minimumFractionDigits: 2 })}</p>
                    </div>
                  </div>
                  <div style={{ fontSize: '1.5rem', fontWeight: 700, color: '#0f172a' }}>
                    ฿{(item.qty * Number(item.price)).toLocaleString('en-US', { minimumFractionDigits: 2 })}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Right Panel: Total and Payment */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', backgroundColor: '#f8fafc', padding: '2rem', justifyContent: 'space-between' }}>
        
        {liveState.status === 'success' ? (
          <div style={{ height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', textAlign: 'center' }}>
            <div style={{ fontSize: '6rem', color: '#10b981', marginBottom: '1rem' }}>✅</div>
            <h2 style={{ fontSize: '2.5rem', color: '#0f172a', margin: 0 }}>ขอบคุณที่ใช้บริการ</h2>
            <p style={{ fontSize: '1.5rem', color: '#64748b', marginTop: '0.5rem' }}>Thank you for shopping with us!</p>
          </div>
        ) : (
          <>
            <div>
              <div style={{ backgroundColor: 'white', padding: '2rem', borderRadius: '16px', boxShadow: '0 10px 25px -5px rgba(0,0,0,0.05)', marginBottom: '2rem' }}>
                <h2 style={{ margin: 0, color: '#64748b', fontSize: '1.25rem', marginBottom: '1rem' }}>ยอดชำระเงินรวม (Total Amount)</h2>
                <div style={{ fontSize: '4rem', fontWeight: 800, color: '#10b981', lineHeight: '1' }}>
                  ฿{liveState.total.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                </div>
                <div style={{ marginTop: '1rem', borderTop: '2px dashed #e2e8f0', paddingTop: '1rem', display: 'flex', justifyContent: 'space-between', color: '#64748b', fontSize: '1.2rem' }}>
                  <span>จำนวนสินค้าทั้งหมด:</span>
                  <span style={{ fontWeight: 700, color: '#0f172a' }}>{liveState.cart.reduce((s, i) => s + i.qty, 0)} ชิ้น</span>
                </div>
              </div>

              {liveState.showPayment && liveState.total > 0 && (
                <div style={{ backgroundColor: 'white', padding: '1.5rem', borderRadius: '16px', boxShadow: '0 10px 25px -5px rgba(0,0,0,0.05)', textAlign: 'center', animation: 'fadeIn 0.5s ease-out' }}>
                  <div style={{ backgroundColor: '#003d6b', color: 'white', padding: '0.75rem', borderRadius: '8px', fontWeight: 700, fontSize: '1.2rem', marginBottom: '1rem' }}>
                    🇹🇭 Thai QR Payment
                  </div>
                  
                  <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '1rem' }}>
                    {qrImage ? (
                      <img src={qrImage} alt="QR Code" style={{ width: '250px', height: '250px', objectFit: 'contain' }} />
                    ) : (
                      <div style={{ width: '250px', height: '250px', backgroundColor: '#e2e8f0', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '12px' }}>
                        <span style={{ color: '#64748b' }}>Bank QR Image</span>
                      </div>
                    )}
                  </div>
                  
                  <div style={{ fontSize: '1.2rem', fontWeight: 700, color: '#0f172a' }}>{accountName}</div>
                  <div style={{ fontSize: '1.1rem', color: '#3b82f6', fontWeight: 600, marginTop: '0.25rem' }}>{promptPayNumber}</div>
                  <div style={{ fontSize: '1rem', color: '#64748b', marginTop: '0.25rem' }}>{bankName}</div>
                  
                  <div style={{ marginTop: '1.5rem', padding: '0.75rem', backgroundColor: '#ecfdf5', color: '#059669', borderRadius: '8px', fontWeight: 600 }}>
                    โปรดสแกนเพื่อชำระเงิน ฿{liveState.total.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                  </div>
                </div>
              )}
            </div>
            
            <style>
              {`
                @keyframes fadeIn {
                  from { opacity: 0; transform: translateY(20px); }
                  to { opacity: 1; transform: translateY(0); }
                }
              `}
            </style>
          </>
        )}
      </div>
    </div>
  );
}
