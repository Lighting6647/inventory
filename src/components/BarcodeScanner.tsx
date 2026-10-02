"use client";

import React, { useEffect, useRef, useState } from 'react';
import { Html5QrcodeScanner } from 'html5-qrcode';

interface BarcodeScannerProps {
  onScanSuccess: (decodedText: string) => void;
  onClose: () => void;
}

const BarcodeScanner: React.FC<BarcodeScannerProps> = ({ onScanSuccess, onClose }) => {
  const scannerElementId = 'reader';
  const hasScanned = useRef(false);

  useEffect(() => {
    // Prevent multiple calls to onScanSuccess
    hasScanned.current = false;
    
    const html5QrcodeScanner = new Html5QrcodeScanner(
      scannerElementId,
      { fps: 10, qrbox: { width: 250, height: 250 } },
      false
    );

    html5QrcodeScanner.render(
      (decodedText) => {
        if (!hasScanned.current) {
          hasScanned.current = true;
          onScanSuccess(decodedText);
          
          html5QrcodeScanner.clear().then(() => {
            onClose();
          }).catch(console.error);
        }
      },
      (errorMessage) => {
        // Ignore normal errors
      }
    );

    return () => {
      try {
        html5QrcodeScanner.clear().catch(console.error);
      } catch (error) {
        console.error("Failed to clear scanner on unmount: ", error);
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
        
        <div id={scannerElementId} style={{ width: '100%', marginTop: '1rem', minHeight: '300px' }}></div>
        
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
