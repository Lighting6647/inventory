"use client";
import React, { useState, useEffect } from 'react';

export default function SettingsPage() {
  const [settings, setSettings] = useState<{ [key: string]: string }>({});
  const [storeName, setStoreName] = useState('');
  const [taxRate, setTaxRate] = useState('');
  const [promptPayNumber, setPromptPayNumber] = useState('');
  const [qrImage, setQrImage] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  
  const fetchSettings = async () => {
    const res = await fetch('/api/settings');
    const data = await res.json();
    const map: any = {};
    data.forEach((s: any) => { map[s.key] = s.value; });
    setSettings(map);
    setStoreName(map['STORE_NAME'] || '');
    setTaxRate(map['TAX_RATE'] || '');
    setPromptPayNumber(map['PROMPTPAY_NUMBER'] || '');
    setQrImage(map['PROMPTPAY_QR_IMAGE'] || null);
  };

  useEffect(() => { fetchSettings(); }, []);

  const handleSave = async (key: string, value: string) => {
    await fetch('/api/settings', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ key, value })
    });
    fetchSettings();
    alert('บันทึกข้อมูลเรียบร้อยแล้ว (Setting saved!)');
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    
    // Resize image to ensure base64 string is small enough for the DB
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
          const res = await fetch('/api/settings', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ key: 'PROMPTPAY_QR_IMAGE', value: base64String })
          });
          if (!res.ok) throw new Error("Upload failed");
          alert('อัปโหลดและบันทึกรูปภาพ QR Code สำเร็จ!');
        } catch(err) {
          console.error(err);
          alert('เกิดข้อผิดพลาดในการอัปโหลดรูปภาพ โปรดลองรูปที่มีขนาดเล็กลง');
        } finally {
          setIsUploading(false);
        }
      };
      img.src = event.target?.result as string;
    };
    reader.readAsDataURL(file);
  };

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto', padding: '2rem 0' }}>
      <h1 style={{ fontSize: '2rem', fontWeight: 700, marginBottom: '2rem' }}>ตั้งค่าระบบ (Settings)</h1>
      <div className="card glass">
        <h2 style={{ fontSize: '1.25rem', marginBottom: '1rem' }}>การตั้งค่าทั่วไป (General Configuration)</h2>
        
        <div style={{ marginBottom: '1.5rem' }}>
          <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600 }}>ชื่อร้านค้า (Store Name)</label>
          <div style={{ display: 'flex', gap: '1rem' }}>
            <input className="input" style={{ flex: 1 }} value={storeName} onChange={e => setStoreName(e.target.value)} />
            <button className="btn btn-primary" onClick={() => handleSave('STORE_NAME', storeName)}>บันทึก (Save)</button>
          </div>
        </div>

        <div style={{ marginBottom: '1.5rem', padding: '1.5rem', backgroundColor: '#f8fafc', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
          <h3 style={{ fontSize: '1.1rem', fontWeight: 600, marginBottom: '1rem', color: '#003d6b' }}>การรับชำระเงิน (Payment Settings)</h3>
          
          <div style={{ marginBottom: '1rem' }}>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600 }}>หมายเลขพร้อมเพย์รับเงิน (PromptPay Number)</label>
            <div style={{ display: 'flex', gap: '1rem' }}>
              <input className="input" style={{ flex: 1 }} placeholder="เช่น 0812345678 หรือ 1234567890123" value={promptPayNumber} onChange={e => setPromptPayNumber(e.target.value)} />
              <button className="btn btn-primary" onClick={() => handleSave('PROMPTPAY_NUMBER', promptPayNumber)}>บันทึก (Save)</button>
            </div>
          </div>

          <div style={{ marginBottom: '1rem' }}>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600 }}>รูปภาพ QR Code รับเงินของร้าน (Bank QR Code Image)</label>
            <div style={{ display: 'flex', gap: '1rem', alignItems: 'flex-start', flexWrap: 'wrap' }}>
              <div style={{ flex: 1 }}>
                <input 
                  type="file" 
                  accept="image/*" 
                  onChange={handleImageUpload} 
                  disabled={isUploading}
                  style={{ display: 'block', width: '100%', padding: '0.5rem', border: '1px solid #cbd5e1', borderRadius: '4px', backgroundColor: 'white' }} 
                />
                <p style={{ fontSize: '0.8rem', color: '#64748b', marginTop: '0.5rem' }}>รองรับไฟล์รูปภาพ .png, .jpg ขนาดไม่เกิน 5MB (ระบบจะทำการย่อขนาดและบันทึกอัตโนมัติ)</p>
              </div>
              
              <div style={{ 
                width: '150px', 
                height: '150px', 
                backgroundColor: 'white',
                border: '1px dashed #cbd5e1',
                borderRadius: '8px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                overflow: 'hidden'
              }}>
                {isUploading ? (
                  <span style={{ fontSize: '0.875rem', color: '#64748b' }}>กำลังอัปโหลด...</span>
                ) : qrImage ? (
                  <img src={qrImage} alt="QR Code" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
                ) : (
                  <span style={{ fontSize: '0.875rem', color: '#94a3b8' }}>ยังไม่มีรูป QR</span>
                )}
              </div>
            </div>
          </div>
        </div>

        <div style={{ marginBottom: '1.5rem' }}>
          <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600 }}>ภาษี % (Tax Rate %)</label>
          <div style={{ display: 'flex', gap: '1rem' }}>
            <input className="input" style={{ flex: 1 }} type="number" value={taxRate} onChange={e => setTaxRate(e.target.value)} />
            <button className="btn btn-primary" onClick={() => handleSave('TAX_RATE', taxRate)}>บันทึก (Save)</button>
          </div>
        </div>
        
      </div>
    </div>
  );
}
