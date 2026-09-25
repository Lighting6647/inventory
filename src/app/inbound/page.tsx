"use client";

import React, { useState, useEffect, useRef } from 'react';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';
import BarcodeScanner from '@/components/BarcodeScanner';
import Papa from 'papaparse';

type Category = { id: string; name: string };

export default function InboundPage() {
  const containerRef = useRef<HTMLDivElement>(null);
  
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedCatName, setSelectedCatName] = useState('');
  const [qty, setQty] = useState(1);
  const [cost, setCost] = useState(0);
  const [price, setPrice] = useState(0);
  
  const [isScannerOpen, setIsScannerOpen] = useState(false);
  const [statusMsg, setStatusMsg] = useState('');

  const [isImportOpen, setIsImportOpen] = useState(false);
  const [importFile, setImportFile] = useState<File | null>(null);
  const [importing, setImporting] = useState(false);

  const [isAddOpen, setIsAddOpen] = useState(false);
  const [newProduct, setNewProduct] = useState({ name: '', sku: '', barcode: '', cost: 0, price: 0, currentStock: 0, categoryName: '' });

  useEffect(() => {
    fetch('/api/categories').then(r => r.json()).then(setCategories).catch(console.error);
  }, []);

  useGSAP(() => {
    gsap.fromTo('.inbound-card', 
      { y: 30, opacity: 0 }, 
      { y: 0, opacity: 1, duration: 0.8, ease: 'power3.out' }
    );
  }, { scope: containerRef });

  const handleScan = async (barcode: string) => {
    setIsScannerOpen(false);
    setStatusMsg(`Scanning: ${barcode}...`);
    
    try {
      const res = await fetch('/api/inbound', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          barcode,
          categoryName: selectedCatName,
          quantity: qty,
          cost,
          price
        })
      });

      if (res.ok) {
        setStatusMsg(`✅ Success! Added ${qty} items of ${barcode}`);
      } else {
        const err = await res.json();
        setStatusMsg(`❌ Error: ${err.error}`);
      }
    } catch (e: any) {
      setStatusMsg(`❌ Error: ${e.message}`);
    }
  };

  const handleImport = async () => {
    if (!importFile) return;
    setImporting(true);

    Papa.parse(importFile, {
      header: true,
      skipEmptyLines: true,
      complete: async (results) => {
        try {
          const res = await fetch('/api/inventory/import', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ products: results.data })
          });
          
          if (res.ok) {
            const data = await res.json();
            alert(`Import successful! Added/Updated: ${data.successCount}, Skipped: ${data.skipCount}`);
            setIsImportOpen(false);
            setImportFile(null);
          } else {
            const err = await res.json();
            alert(`Import failed: ${err.error}`);
          }
        } catch (e: any) {
          alert('Error during import: ' + e.message);
        } finally {
          setImporting(false);
        }
      },
      error: (error) => {
        alert('Failed to parse CSV: ' + error.message);
        setImporting(false);
      }
    });
  };

  const handleAddProduct = async () => {
    try {
      const res = await fetch('/api/inventory/add', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newProduct)
      });
      if (res.ok) {
        setIsAddOpen(false);
        setNewProduct({ name: '', sku: '', barcode: '', cost: 0, price: 0, currentStock: 0, categoryName: '' });
        fetch('/api/categories').then(r => r.json()).then(setCategories).catch(console.error);
        alert('Product created successfully');
      } else {
        const err = await res.json();
        alert('Error: ' + err.error);
      }
    } catch (e: any) {
      alert('Error: ' + e.message);
    }
  };

  return (
    <div ref={containerRef} style={{ maxWidth: '600px', margin: '0 auto' }}>
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <div>
          <h1 style={{ fontSize: '2rem', fontWeight: 700 }}>Inbound (รับเข้าสินค้า)</h1>
          <p style={{ color: 'var(--secondary-foreground)' }}>Set details, then scan to receive stock.</p>
        </div>
        <div style={{ display: 'flex', gap: '1rem' }}>
          <button className="btn btn-secondary" onClick={() => setIsImportOpen(true)} style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
            <span>📤</span> Import CSV
          </button>
          <button className="btn btn-primary" onClick={() => setIsAddOpen(true)} style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
            <span>+</span> Add Product
          </button>
        </div>
      </header>

      <div className="card glass inbound-card" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', opacity: 0 }}>
        
        {statusMsg && (
          <div style={{ padding: '1rem', backgroundColor: 'var(--secondary)', borderRadius: '8px', fontWeight: 500 }}>
            {statusMsg}
          </div>
        )}

        <div>
          <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500 }}>Category (หมวดหมู่)</label>
          <input 
            className="input" 
            list="inbound-category-options" 
            placeholder="-- Select or Type Category --"
            value={selectedCatName} 
            onChange={(e) => setSelectedCatName(e.target.value)}
            style={{ width: '100%' }}
          />
          <datalist id="inbound-category-options">
            {categories.map(c => (
              <option key={c.id} value={c.name} />
            ))}
          </datalist>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1rem' }}>
          <div>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500 }}>Quantity</label>
            <input 
              type="number" 
              className="input" 
              value={qty} 
              onChange={e => setQty(Number(e.target.value))}
              min="1"
              style={{ width: '100%' }}
            />
          </div>
          <div>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500 }}>Cost (ทุน)</label>
            <input 
              type="number" 
              className="input" 
              value={cost} 
              onChange={e => setCost(Number(e.target.value))}
              min="0"
              style={{ width: '100%' }}
            />
          </div>
          <div>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500 }}>Price (ราคาขาย)</label>
            <input 
              type="number" 
              className="input" 
              value={price} 
              onChange={e => setPrice(Number(e.target.value))}
              min="0"
              style={{ width: '100%' }}
            />
          </div>
        </div>

        <button 
          className="btn btn-primary" 
          onClick={() => setIsScannerOpen(true)}
          style={{ width: '100%', padding: '1rem', fontSize: '1.25rem', marginTop: '1rem' }}
        >
          📷 Scan Barcode
        </button>
      </div>

      {isScannerOpen && (
        <BarcodeScanner 
          onScanSuccess={handleScan}
          onClose={() => setIsScannerOpen(false)}
        />
      )}

      {isImportOpen && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 50 }}>
          <div className="card" style={{ width: '100%', maxWidth: '500px' }}>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 600, marginBottom: '1rem' }}>Import Products (CSV)</h2>
            <p style={{ fontSize: '0.875rem', color: 'var(--secondary-foreground)', marginBottom: '1.5rem' }}>
              Upload a CSV file with columns: <strong>sku, name, category, brand, unit, currentStock, minStockLevel</strong>
            </p>
            
            <input 
              type="file" 
              accept=".csv"
              onChange={(e) => setImportFile(e.target.files ? e.target.files[0] : null)}
              style={{ width: '100%', padding: '0.5rem', marginBottom: '1.5rem', border: '1px solid var(--border)', borderRadius: '8px' }}
            />

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem' }}>
              <button className="btn btn-secondary" onClick={() => setIsImportOpen(false)} disabled={importing}>Cancel</button>
              <button className="btn btn-primary" onClick={handleImport} disabled={!importFile || importing}>
                {importing ? 'Importing...' : 'Start Import'}
              </button>
            </div>
          </div>
        </div>
      )}

      {isAddOpen && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 50 }}>
          <div className="card" style={{ width: '100%', maxWidth: '500px', maxHeight: '90vh', overflowY: 'auto' }}>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 600, marginBottom: '1rem' }}>Add Product Manually</h2>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginBottom: '1.5rem' }}>
              <input className="input" placeholder="Product Name" value={newProduct.name} onChange={e => setNewProduct({...newProduct, name: e.target.value})} />
              <input className="input" placeholder="SKU" value={newProduct.sku} onChange={e => setNewProduct({...newProduct, sku: e.target.value})} />
              <input className="input" placeholder="Barcode (Optional)" value={newProduct.barcode} onChange={e => setNewProduct({...newProduct, barcode: e.target.value})} />
              
              <input 
                className="input" 
                list="category-options" 
                placeholder="-- Select or Type Category --" 
                value={newProduct.categoryName} 
                onChange={e => setNewProduct({...newProduct, categoryName: e.target.value})} 
              />
              <datalist id="category-options">
                {categories.map(c => <option key={c.id} value={c.name} />)}
              </datalist>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <input className="input" type="number" placeholder="Cost" value={newProduct.cost || ''} onChange={e => setNewProduct({...newProduct, cost: Number(e.target.value)})} />
                <input className="input" type="number" placeholder="Price" value={newProduct.price || ''} onChange={e => setNewProduct({...newProduct, price: Number(e.target.value)})} />
              </div>
              <input className="input" type="number" placeholder="Initial Stock" value={newProduct.currentStock || ''} onChange={e => setNewProduct({...newProduct, currentStock: Number(e.target.value)})} />
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem' }}>
              <button className="btn btn-secondary" onClick={() => setIsAddOpen(false)}>Cancel</button>
              <button className="btn btn-primary" onClick={handleAddProduct}>Save Product</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
