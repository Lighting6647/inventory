"use client";
import React, { useState, useEffect, useRef } from 'react';

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState<'qr' | 'general'>('qr');
  
  // Settings Data
  const [storeName, setStoreName] = useState('');
  const [taxRate, setTaxRate] = useState('');
  const [accountName, setAccountName] = useState('');
  const [promptPayNumber, setPromptPayNumber] = useState('');
  const [bankName, setBankName] = useState('');
  const [qrImage, setQrImage] = useState<string | null>(null);
  
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const fetchSettings = async () => {
    try {
      const res = await fetch('/api/settings');
      const data = await res.json();
      const map: any = {};
      data.forEach((s: any) => { map[s.key] = s.value; });
      setStoreName(map['STORE_NAME'] || '');
      setTaxRate(map['TAX_RATE'] || '');
      setAccountName(map['ACCOUNT_NAME'] || '');
      setPromptPayNumber(map['PROMPTPAY_NUMBER'] || '');
      setBankName(map['BANK_NAME'] || '');
      setQrImage(map['PROMPTPAY_QR_IMAGE'] || null);
    } catch(err) {
      console.error("Failed to fetch settings", err);
    }
  };

  useEffect(() => { fetchSettings(); }, []);

  const handleSaveAll = async () => {
    const keysToSave = [
      { key: 'STORE_NAME', value: storeName },
      { key: 'TAX_RATE', value: taxRate },
      { key: 'ACCOUNT_NAME', value: accountName },
      { key: 'PROMPTPAY_NUMBER', value: promptPayNumber },
      { key: 'BANK_NAME', value: bankName }
    ];
    
    try {
      for (const item of keysToSave) {
        await fetch('/api/settings', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(item)
        });
      }
      alert('บันทึกข้อมูลเรียบร้อยแล้ว');
    } catch(err) {
      console.error(err);
      alert('เกิดข้อผิดพลาดในการบันทึกข้อมูล');
    }
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = async () => {
        const canvas = document.createElement('canvas');
        const MAX_WIDTH = 600;
        const MAX_HEIGHT = 600;
        let width = img.width;
        let height = img.height;

        if (width > height) {
          if (width > MAX_WIDTH) {
            height *= MAX_WIDTH / width;
            width = MAX_WIDTH;
          }
        } else {
          if (height > MAX_HEIGHT) {
            width *= MAX_HEIGHT / height;
            height = MAX_HEIGHT;
          }
        }
        
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        ctx?.drawImage(img, 0, 0, width, height);
        
        const base64String = canvas.toDataURL('image/jpeg', 0.8);
        setQrImage(base64String);
        
        try {
          await fetch('/api/settings', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ key: 'PROMPTPAY_QR_IMAGE', value: base64String })
          });
        } catch(err) {
          console.error(err);
          alert('เกิดข้อผิดพลาดในการบันทึกรูปภาพ');
        } finally {
          setIsUploading(false);
        }
      };
      img.src = event.target?.result as string;
    };
    reader.readAsDataURL(file);
  };

  return (
    <div style={{ padding: '1rem', display: 'flex', justifyContent: 'center' }}>
      
      {/* Main Settings Modal/Card */}
      <div style={{ 
        width: '100%', 
        maxWidth: '900px', 
        backgroundColor: '#1e2130', 
        borderRadius: '12px', 
        boxShadow: '0 25px 50px -12px rgba(0,0,0,0.5)',
        color: '#e2e8f0',
        overflow: 'hidden',
        fontFamily: 'sans-serif'
      }}>
        
        {/* Header */}
        <div style={{ padding: '1.5rem', borderBottom: '1px solid #334155', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div>
            <h1 style={{ fontSize: '1.5rem', fontWeight: 700, color: '#f8fafc', margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span>⚙️</span> ตั้งค่าระบบ (Settings Center)
            </h1>
            <p style={{ margin: '0.25rem 0 0 0', color: '#94a3b8', fontSize: '0.875rem' }}>
              จัดการข้อมูล QR Code รับชำระเงิน และการตั้งค่าทั่วไปขององค์กร
            </p>
          </div>
        </div>

        {/* Tabs */}
        <div style={{ display: 'flex', padding: '0 1.5rem', borderBottom: '1px solid #334155' }}>
          <button 
            onClick={() => setActiveTab('qr')}
            style={{ 
              background: 'none', border: 'none', padding: '1rem 1.5rem', cursor: 'pointer',
              color: activeTab === 'qr' ? '#3b82f6' : '#94a3b8',
              borderBottom: activeTab === 'qr' ? '2px solid #3b82f6' : '2px solid transparent',
              fontWeight: activeTab === 'qr' ? 600 : 400,
              display: 'flex', alignItems: 'center', gap: '8px', fontSize: '1rem'
            }}
          >
            💳 QR Code ชำระเงิน
          </button>
          <button 
            onClick={() => setActiveTab('general')}
            style={{ 
              background: 'none', border: 'none', padding: '1rem 1.5rem', cursor: 'pointer',
              color: activeTab === 'general' ? '#3b82f6' : '#94a3b8',
              borderBottom: activeTab === 'general' ? '2px solid #3b82f6' : '2px solid transparent',
              fontWeight: activeTab === 'general' ? 600 : 400,
              display: 'flex', alignItems: 'center', gap: '8px', fontSize: '1rem'
            }}
          >
            🎛️ ตั้งค่าทั่วไป
          </button>
        </div>

        {/* Content Area */}
        <div style={{ padding: '1.5rem', minHeight: '400px' }}>
          
          {activeTab === 'qr' && (
            <div style={{ display: 'flex', gap: '2rem', flexWrap: 'wrap' }}>
              
              {/* Left Form */}
              <div style={{ flex: '1 1 350px' }}>
                <div style={{ 
                  backgroundColor: '#1e293b', padding: '1rem', borderRadius: '8px', border: '1px solid #334155',
                  marginBottom: '1.5rem', display: 'flex', gap: '12px', alignItems: 'flex-start'
                }}>
                  <span style={{ color: '#3b82f6', fontSize: '1.25rem' }}>ⓘ</span>
                  <p style={{ margin: 0, color: '#cbd5e1', fontSize: '0.9rem', lineHeight: '1.4' }}>
                    คุณสามารถอัปโหลดรูปภาพ QR Code พร้อมเพย์ หรือกรอกข้อมูลบัญชีเพื่อใช้แสดงในระบบชำระเงินได้ที่นี่
                  </p>
                </div>

                <div style={{ marginBottom: '1rem' }}>
                  <label style={{ display: 'block', color: '#cbd5e1', fontSize: '0.875rem', marginBottom: '0.5rem' }}>ชื่อบัญชีผู้รับเงิน (Account Name)</label>
                  <input 
                    type="text" 
                    value={accountName}
                    onChange={e => setAccountName(e.target.value)}
                    style={{ width: '100%', padding: '0.75rem', backgroundColor: '#0f172a', border: '1px solid #334155', borderRadius: '6px', color: '#fff', fontSize: '1rem' }}
                    placeholder="บริษัท พาส แอป จำกัด"
                  />
                </div>

                <div style={{ marginBottom: '1rem' }}>
                  <label style={{ display: 'block', color: '#cbd5e1', fontSize: '0.875rem', marginBottom: '0.5rem' }}>เบอร์พร้อมเพย์ / เลขบัญชี (PromptPay ID)</label>
                  <input 
                    type="text" 
                    value={promptPayNumber}
                    onChange={e => setPromptPayNumber(e.target.value)}
                    style={{ width: '100%', padding: '0.75rem', backgroundColor: '#0f172a', border: '1px solid #334155', borderRadius: '6px', color: '#fff', fontSize: '1rem' }}
                    placeholder="081-234-5678"
                  />
                </div>

                <div style={{ marginBottom: '1.5rem' }}>
                  <label style={{ display: 'block', color: '#cbd5e1', fontSize: '0.875rem', marginBottom: '0.5rem' }}>ชื่อธนาคาร (Bank Name)</label>
                  <input 
                    type="text" 
                    value={bankName}
                    onChange={e => setBankName(e.target.value)}
                    style={{ width: '100%', padding: '0.75rem', backgroundColor: '#0f172a', border: '1px solid #334155', borderRadius: '6px', color: '#fff', fontSize: '1rem' }}
                    placeholder="ธนาคารกสิกรไทย (KBANK)"
                  />
                </div>

                <div>
                  <label style={{ display: 'block', color: '#cbd5e1', fontSize: '0.875rem', marginBottom: '0.5rem' }}>อัปโหลดรูปภาพ QR Code</label>
                  <input 
                    type="file" 
                    accept="image/*"
                    ref={fileInputRef}
                    onChange={handleImageUpload}
                    style={{ display: 'none' }}
                  />
                  <button 
                    onClick={() => fileInputRef.current?.click()}
                    disabled={isUploading}
                    style={{ 
                      width: '100%', padding: '0.75rem', backgroundColor: '#0088ff', color: 'white', 
                      border: 'none', borderRadius: '6px', fontSize: '1rem', fontWeight: 600, cursor: 'pointer',
                      display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '8px'
                    }}
                  >
                    {isUploading ? 'กำลังอัปโหลด...' : '↑ อัปโหลดรูป QR Code'}
                  </button>
                </div>
              </div>

              {/* Right Live Preview */}
              <div style={{ flex: '1 1 300px', backgroundColor: '#0f172a', borderRadius: '12px', border: '1px solid #1e293b', padding: '1.5rem', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                <h3 style={{ margin: '0 0 1.5rem 0', color: '#10b981', fontSize: '0.875rem', fontWeight: 600, letterSpacing: '0.5px' }}>ตัวอย่างสแกนชำระเงิน (LIVE PREVIEW)</h3>
                
                <div style={{ 
                  width: '180px', height: '180px', backgroundColor: '#fff', borderRadius: '8px', 
                  display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center',
                  overflow: 'hidden', marginBottom: '1.5rem', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.3)'
                }}>
                  {qrImage ? (
                    <img src={qrImage} alt="QR Code Preview" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
                  ) : (
                    <>
                      <div style={{ fontSize: '2rem', color: '#cbd5e1', marginBottom: '0.5rem' }}>🖼️</div>
                      <span style={{ color: '#94a3b8', fontSize: '0.75rem' }}>ยังไม่ได้เลือกรูป QR Code</span>
                    </>
                  )}
                </div>

                <div style={{ textAlign: 'center' }}>
                  <div style={{ color: '#fff', fontWeight: 700, fontSize: '1.1rem', marginBottom: '0.25rem' }}>{accountName || 'ชื่อบัญชีผู้รับเงิน'}</div>
                  <div style={{ color: '#3b82f6', fontWeight: 600, fontSize: '0.9rem', marginBottom: '0.25rem' }}>{promptPayNumber || 'เบอร์พร้อมเพย์'}</div>
                  <div style={{ color: '#94a3b8', fontSize: '0.8rem' }}>{bankName || 'ชื่อธนาคาร'}</div>
                </div>
              </div>

            </div>
          )}

          {activeTab === 'general' && (
            <div style={{ maxWidth: '500px' }}>
              <div style={{ marginBottom: '1.5rem' }}>
                <label style={{ display: 'block', color: '#cbd5e1', fontSize: '0.875rem', marginBottom: '0.5rem' }}>ชื่อร้านค้า (Store Name)</label>
                <input 
                  type="text" 
                  value={storeName}
                  onChange={e => setStoreName(e.target.value)}
                  style={{ width: '100%', padding: '0.75rem', backgroundColor: '#0f172a', border: '1px solid #334155', borderRadius: '6px', color: '#fff', fontSize: '1rem' }}
                />
              </div>

              <div style={{ marginBottom: '1.5rem' }}>
                <label style={{ display: 'block', color: '#cbd5e1', fontSize: '0.875rem', marginBottom: '0.5rem' }}>อัตราภาษี (Tax Rate %)</label>
                <input 
                  type="number" 
                  value={taxRate}
                  onChange={e => setTaxRate(e.target.value)}
                  style={{ width: '100%', padding: '0.75rem', backgroundColor: '#0f172a', border: '1px solid #334155', borderRadius: '6px', color: '#fff', fontSize: '1rem' }}
                />
              </div>
            </div>
          )}

        </div>

        {/* Footer Actions */}
        <div style={{ padding: '1rem 1.5rem', borderTop: '1px solid #334155', backgroundColor: '#1e2130', display: 'flex', justifyContent: 'flex-end', gap: '1rem' }}>
          <button style={{ background: 'none', border: 'none', color: '#cbd5e1', cursor: 'pointer', padding: '0.5rem 1rem' }}>ยกเลิก</button>
          <button 
            onClick={handleSaveAll}
            style={{ 
              backgroundColor: '#0088ff', color: 'white', border: 'none', borderRadius: '6px', 
              padding: '0.6rem 1.5rem', fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px' 
            }}
          >
            💾 บันทึกข้อมูล
          </button>
        </div>

      </div>
    </div>
  );
}
