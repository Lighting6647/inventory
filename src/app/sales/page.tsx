"use client";

import React, { useState, useEffect } from 'react';
import BarcodeScanner from '@/components/BarcodeScanner';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';

type Product = {
  id: string;
  sku: string;
  name: string;
  currentStock: number;
  unit: string;
};

export default function SalesPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [items, setItems] = useState([{ sku: '', quantity: 1, reference: '' }]);
  const [isScannerOpen, setIsScannerOpen] = useState(false);
  const [currentScanIndex, setCurrentScanIndex] = useState<number | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

  useEffect(() => {
    fetch('/api/inventory')
      .then(res => res.json())
      .then(data => setProducts(data))
      .catch(console.error);
  }, []);

  useGSAP(() => {
    gsap.fromTo('.form-card', 
      { y: 20, opacity: 0 }, 
      { y: 0, opacity: 1, duration: 0.5, ease: 'power2.out' }
    );
  }, []);

  const handleScan = (decodedText: string) => {
    if (currentScanIndex === null) return;
    const found = products.find(p => p.sku === decodedText || (p as any).barcode === decodedText);
    if (found) {
      updateItem(currentScanIndex, 'sku', found.sku);
    } else {
      alert(`Product not found for barcode: ${decodedText}`);
    }
  };

  const updateItem = (index: number, field: string, value: any) => {
    const newItems = [...items] as any[];
    newItems[index][field] = value;
    setItems(newItems);
  };

  const addItem = () => setItems([...items, { sku: '', quantity: 1, reference: '' }]);
  const removeItem = (index: number) => {
    const newItems = [...items];
    newItems.splice(index, 1);
    setItems(newItems);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setMessage(null);

    let successCount = 0;
    
    // We submit one by one since the deduct API takes single items currently
    // In a real app, you'd batch this to a new SalesOrder API
    for (const item of items) {
      if (!item.sku || item.quantity <= 0) continue;
      
      try {
        const res = await fetch('/api/sales/deduct', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            sku: item.sku,
            quantity: item.quantity,
            saleReference: item.reference || 'Manual Issue'
          })
        });
        
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || 'Failed');
        successCount++;
      } catch (err: any) {
        setMessage({ type: 'error', text: `Failed on SKU ${item.sku}: ${err.message}` });
        setSubmitting(false);
        return;
      }
    }

    setMessage({ type: 'success', text: `Successfully issued ${successCount} items (FIFO applied).` });
    setItems([{ sku: '', quantity: 1, reference: '' }]);
    setSubmitting(false);
    
    // Refetch to update stock display
    fetch('/api/inventory').then(r => r.json()).then(d => setProducts(d));
  };

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto' }}>
      <header style={{ marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '2rem', fontWeight: 700 }}>Issue Stock / Sales</h1>
        <p style={{ color: 'var(--secondary-foreground)' }}>Deduct items from inventory. FIFO logic is applied automatically.</p>
      </header>

      {message && (
        <div style={{ 
          padding: '1rem', marginBottom: '1.5rem', borderRadius: '8px',
          backgroundColor: message.type === 'success' ? 'rgba(16, 185, 129, 0.1)' : 'rgba(239, 68, 68, 0.1)',
          color: message.type === 'success' ? 'var(--success)' : 'var(--danger)',
          border: `1px solid ${message.type === 'success' ? 'var(--success)' : 'var(--danger)'}`
        }}>
          {message.text}
        </div>
      )}

      <form className="card form-card glass" onSubmit={handleSubmit}>
        {items.map((item, index) => (
          <div key={index} style={{ 
            display: 'grid', gridTemplateColumns: '2fr 1fr 1fr auto', gap: '1rem', 
            alignItems: 'end', marginBottom: '1.5rem', paddingBottom: '1.5rem', borderBottom: '1px solid var(--border)' 
          }}>
            
            <div>
              <label style={{ display: 'block', fontSize: '0.875rem', marginBottom: '0.5rem', fontWeight: 500 }}>Product SKU</label>
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <select 
                  required
                  value={item.sku}
                  onChange={e => updateItem(index, 'sku', e.target.value)}
                  style={{ flex: 1, padding: '0.625rem', borderRadius: '8px', border: '1px solid var(--border)', background: 'var(--background)' }}
                >
                  <option value="">Select or scan...</option>
                  {products.map(p => (
                    <option key={p.id} value={p.sku}>{p.sku} - {p.name} (Stock: {p.currentStock})</option>
                  ))}
                </select>
                <button 
                  type="button" 
                  onClick={() => { setCurrentScanIndex(index); setIsScannerOpen(true); }}
                  className="btn btn-secondary"
                  title="Scan"
                >
                  📷
                </button>
              </div>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.875rem', marginBottom: '0.5rem', fontWeight: 500 }}>Quantity</label>
              <input 
                type="number" min="1" required
                value={item.quantity}
                onChange={e => updateItem(index, 'quantity', Number(e.target.value))}
                style={{ width: '100%', padding: '0.625rem', borderRadius: '8px', border: '1px solid var(--border)', background: 'var(--background)' }}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.875rem', marginBottom: '0.5rem', fontWeight: 500 }}>Reference</label>
              <input 
                type="text" placeholder="e.g. SO-1002"
                value={item.reference}
                onChange={e => updateItem(index, 'reference', e.target.value)}
                style={{ width: '100%', padding: '0.625rem', borderRadius: '8px', border: '1px solid var(--border)', background: 'var(--background)' }}
              />
            </div>

            <button 
              type="button" 
              onClick={() => removeItem(index)}
              disabled={items.length === 1}
              style={{ padding: '0.625rem', color: 'var(--danger)', background: 'rgba(239, 68, 68, 0.1)', borderRadius: '8px', border: 'none', cursor: items.length === 1 ? 'not-allowed' : 'pointer' }}
            >
              ✕
            </button>
          </div>
        ))}

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '1rem' }}>
          <button type="button" className="btn btn-secondary" onClick={addItem}>
            + Add Another Item
          </button>
          
          <button type="submit" className="btn btn-primary" disabled={submitting}>
            {submitting ? 'Processing...' : 'Confirm Issue'}
          </button>
        </div>
      </form>

      {isScannerOpen && (
        <BarcodeScanner 
          onScanSuccess={handleScan}
          onClose={() => setIsScannerOpen(false)}
        />
      )}
    </div>
  );
}
