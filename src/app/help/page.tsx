"use client";
import React from 'react';

export default function HelpPage() {
  return (
    <div style={{ maxWidth: '800px', margin: '0 auto', padding: '2rem 0' }}>
      <h1 style={{ fontSize: '2rem', fontWeight: 700, marginBottom: '2rem' }}>Help & Support (ช่วยเหลือ)</h1>
      <div className="card glass" style={{ marginBottom: '1.5rem' }}>
        <h2 style={{ fontSize: '1.25rem', fontWeight: 600, marginBottom: '0.5rem' }}>How to use POS</h2>
        <p style={{ color: 'var(--secondary-foreground)' }}>Navigate to the POS menu. Scan a barcode to add an item to the cart, select payment method, enter cash tendered, and click Checkout.</p>
      </div>
      <div className="card glass" style={{ marginBottom: '1.5rem' }}>
        <h2 style={{ fontSize: '1.25rem', fontWeight: 600, marginBottom: '0.5rem' }}>How to add Inventory</h2>
        <p style={{ color: 'var(--secondary-foreground)' }}>Go to Inbound (ซื้อ). You can manually add products or import a CSV file. Then scan barcodes to increase stock.</p>
      </div>
      <div className="card glass" style={{ marginBottom: '1.5rem' }}>
        <h2 style={{ fontSize: '1.25rem', fontWeight: 600, marginBottom: '0.5rem' }}>Contact Support</h2>
        <p style={{ color: 'var(--secondary-foreground)' }}>For any issues, please contact the admin team or email support@example.com.</p>
      </div>
    </div>
  );
}
