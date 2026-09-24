"use client";

import React, { useEffect, useRef, useState } from 'react';
import { Html5Qrcode } from 'html5-qrcode';

interface BarcodeScannerProps {
  onScanSuccess: (decodedText: string) => void;
  onClose: () => void;
}

const BarcodeScanner: React.FC<BarcodeScannerProps> = ({ onScanSuccess, onClose }) => {
  const [error, setError] = useState<string | null>(null);
  const scannerRef = useRef<Html5Qrcode | null>(null);
  const scannerElementId = 'reader';

  useEffect(() => {
    let html5Qrcode: Html5Qrcode;

    const startScanner = async () => {
      try {
        html5Qrcode = new Html5Qrcode(scannerElementId);
        scannerRef.current = html5Qrcode;

        await html5Qrcode.start(
          { facingMode: "environment" },
          {
            fps: 10,
            qrbox: { width: 250, height: 250 }
          },
          (decodedText) => {
            onScanSuccess(decodedText);
            // Stop after success
            if (scannerRef.current) {
              scannerRef.current.stop().then(() => {
                onClose();
              }).catch(err => console.error(err));
            }
          },
          (errorMessage) => {
            // Ignore normal errors like "not found" to prevent spam
          }
        );
      } catch (err: any) {
        setError(err?.message || 'Failed to start camera. Please check permissions.');
      }
    };

    startScanner();

    return () => {
      if (scannerRef.current && scannerRef.current.isScanning) {
        scannerRef.current.stop().catch(console.error);
      }
    };
  }, [onScanSuccess, onClose]);

  return (
    <div style={overlayStyle}>
      <div style={modalStyle}>
        <div style={headerStyle}>
          <h3 style={{ margin: 0, fontSize: '1.25rem', fontWeight: 600 }}>Scan Barcode / QR</h3>
          <button onClick={onClose} style={closeBtnStyle}>✕</button>
        </div>
        
        {error ? (
          <div style={{ color: '#ef4444', padding: '1rem', textAlign: 'center' }}>{error}</div>
        ) : (
          <div id={scannerElementId} style={{ width: '100%', marginTop: '1rem', minHeight: '300px' }} />
        )}
        
        <p style={{ textAlign: 'center', marginTop: '1rem', opacity: 0.7, fontSize: '0.875rem' }}>
          Point your camera at a barcode to scan.
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
  backgroundColor: 'var(--background)',
  border: '1px solid var(--border)',
  borderRadius: '0.75rem',
  padding: '1.5rem',
  width: '90%',
  maxWidth: '450px',
  boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.5)'
};

const headerStyle: React.CSSProperties = {
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center'
};

const closeBtnStyle: React.CSSProperties = {
  background: 'none',
  border: 'none',
  color: 'var(--danger, #ef4444)',
  fontSize: '1.25rem',
  cursor: 'pointer',
  padding: '0.25rem'
};

export default BarcodeScanner;
