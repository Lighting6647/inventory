"use client";

import React, { useEffect, useRef, useState } from 'react';
import { Html5Qrcode, Html5QrcodeSupportedFormats } from 'html5-qrcode';

interface BarcodeScannerProps {
  onScanSuccess: (decodedText: string) => void;
  onClose: () => void;
}

const BarcodeScanner: React.FC<BarcodeScannerProps> = ({ onScanSuccess, onClose }) => {
  const scannerElementId = 'reader';
  const [errorMsg, setErrorMsg] = useState<string>('');
  const [isLoading, setIsLoading] = useState(true);
  
  const scannerRef = useRef<Html5Qrcode | null>(null);
  const hasScanned = useRef(false);
  const isMounted = useRef(true);

  useEffect(() => {
    isMounted.current = true;
    hasScanned.current = false;
    
    const startScanner = async () => {
      try {
        // Request camera list first to trigger permission prompt automatically
        const devices = await Html5Qrcode.getCameras();
        
        if (!isMounted.current) return;
        
        if (devices && devices.length > 0) {
          const html5QrCode = new Html5Qrcode(scannerElementId);
          scannerRef.current = html5QrCode;
          
          // Try to find a back camera
          let cameraId = devices[0].id;
          for (const device of devices) {
            if (device.label.toLowerCase().includes('back') || device.label.toLowerCase().includes('environment')) {
              cameraId = device.id;
              break;
            }
          }

          await html5QrCode.start(
            cameraId,
            {
              fps: 10,
              qrbox: { width: 250, height: 250 }
            },
            (decodedText) => {
              if (!hasScanned.current) {
                hasScanned.current = true;
                onScanSuccess(decodedText);
                
                if (scannerRef.current) {
                  scannerRef.current.stop().then(() => {
                    onClose();
                  }).catch(console.error);
                }
              }
            },
            (errorMessage) => {
              // Ignore normal scan errors
            }
          );
          setIsLoading(false);
        } else {
          setErrorMsg('ไม่พบกล้องบนอุปกรณ์นี้ (No camera found)');
          setIsLoading(false);
        }
      } catch (err: any) {
        if (!isMounted.current) return;
        console.error(err);
        
        // Handle specific permission errors
        if (err.name === 'NotAllowedError' || (typeof err === 'string' && err.includes('NotAllowedError'))) {
          setErrorMsg('คุณไม่อนุญาตให้ใช้งานกล้อง กรุณาเปิดการอนุญาตในตั้งค่าเบราว์เซอร์ (Camera permission denied)');
        } else if (err.name === 'NotFoundError' || (typeof err === 'string' && err.includes('NotFoundError'))) {
           setErrorMsg('ไม่พบกล้องบนอุปกรณ์นี้ (No camera found)');
        } else {
          setErrorMsg('ไม่สามารถเปิดกล้องได้: ' + (err.message || String(err)));
        }
        setIsLoading(false);
      }
    };

    startScanner();

    return () => {
      isMounted.current = false;
      if (scannerRef.current && scannerRef.current.isScanning) {
        scannerRef.current.stop().catch(console.error);
      }
    };
  }, [onScanSuccess, onClose]);

  return (
    <div style={overlayStyle}>
      <div style={modalStyle}>
        <div style={headerStyle}>
          <h3 style={{ margin: 0, fontSize: '1.25rem', fontWeight: 600 }}>สแกนบาร์โค้ด / QR</h3>
          <button onClick={onClose} style={closeBtnStyle}>✕</button>
        </div>
        
        <div style={{ position: 'relative', width: '100%', marginTop: '1rem', minHeight: '300px', backgroundColor: '#f1f5f9', borderRadius: '8px', overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          
          {isLoading && !errorMsg && (
            <div style={{ position: 'absolute', color: '#64748b', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
              <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>📷</div>
              <span>กำลังเปิดกล้อง...</span>
            </div>
          )}
          
          {errorMsg && (
            <div style={{ position: 'absolute', padding: '2rem', textAlign: 'center', color: '#ef4444' }}>
              <div style={{ fontSize: '2.5rem', marginBottom: '1rem' }}>⚠️</div>
              <div style={{ fontWeight: 600 }}>{errorMsg}</div>
              <p style={{ fontSize: '0.875rem', marginTop: '1rem', color: '#64748b' }}>
                หากใช้ iOS/iPhone กรุณาตรวจสอบว่าคุณไม่ได้ปฏิเสธการเข้าถึงกล้อง และต้องใช้งานผ่าน <b>Safari</b> เท่านั้น
              </p>
            </div>
          )}

          <div id={scannerElementId} style={{ width: '100%', display: errorMsg ? 'none' : 'block' }}></div>
        </div>
        
        <p style={{ textAlign: 'center', marginTop: '1rem', opacity: 0.7, fontSize: '0.875rem' }}>
          หันกล้องไปที่บาร์โค้ดหรือคิวอาร์โค้ดเพื่อสแกนสินค้า
        </p>
      </div>
    </div>
  );
};

// Inline styles for simplicity
const overlayStyle: React.CSSProperties = {
  position: 'fixed',
  top: 0, left: 0, right: 0, bottom: 0,
  backgroundColor: 'rgba(0, 0, 0, 0.75)',
  backdropFilter: 'blur(4px)',
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  zIndex: 9999
};

const modalStyle: React.CSSProperties = {
  backgroundColor: '#fff',
  border: '1px solid #ddd',
  borderRadius: '0.75rem',
  padding: '1.5rem',
  width: '90%',
  maxWidth: '450px',
  boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.5)',
  color: '#333'
};

const headerStyle: React.CSSProperties = {
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center'
};

const closeBtnStyle: React.CSSProperties = {
  background: 'none',
  border: 'none',
  color: '#ef4444',
  fontSize: '1.25rem',
  cursor: 'pointer',
  padding: '0.25rem'
};

export default BarcodeScanner;
