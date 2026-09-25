"use client";

import React, { useState, useEffect, useRef } from 'react';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';
import BarcodeScanner from '@/components/BarcodeScanner';

import Papa from 'papaparse';

type Product = {
  id: string;
  sku: string;
  name: string;
  category: string | null;
  brand: string | null;
  unit: string;
  currentStock: number;
  minStockLevel: number;
  lots?: { id: string; batchNumber: string; currentQty: number; location: string | null }[];
};

export default function InventoryPage() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editValue, setEditValue] = useState<number>(0);
  const [isScannerOpen, setIsScannerOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  
  const [isImportOpen, setIsImportOpen] = useState(false);
  const [importFile, setImportFile] = useState<File | null>(null);
  const [importing, setImporting] = useState(false);

  const [isAddOpen, setIsAddOpen] = useState(false);
  const [newProduct, setNewProduct] = useState({ name: '', sku: '', barcode: '', cost: 0, price: 0, currentStock: 0, categoryId: '' });
  const [categories, setCategories] = useState<{id: string, name: string}[]>([]);

  const fetchInventory = async () => {
    try {
      const res = await fetch('/api/inventory');
      const data = await res.json();
      setProducts(data);
    } catch (error) {
      console.error('Error fetching inventory', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInventory();
    fetch('/api/categories').then(r => r.json()).then(setCategories).catch(console.error);
  }, []);

  useGSAP(() => {
    if (!loading && products.length > 0) {
      gsap.fromTo('.product-row', 
        { y: 15, opacity: 0 }, 
        { y: 0, opacity: 1, duration: 0.4, stagger: 0.05, ease: 'power2.out' }
      );
    }
  }, [loading, products]); // Re-run when products load

  const handleScan = (decodedText: string) => {
    setSearchQuery(decodedText);
  };

  const handleEditClick = (product: Product) => {
    setEditingId(product.id);
    setEditValue(product.currentStock);
  };

  const handleSave = async (id: string) => {
    try {
      await fetch('/api/inventory', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          productId: id,
          newStock: editValue,
          reason: 'Physical Count Adjustment'
        })
      });
      setEditingId(null);
      fetchInventory();
    } catch (error) {
      console.error('Failed to update stock', error);
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
            fetchInventory();
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
        setNewProduct({ name: '', sku: '', barcode: '', cost: 0, price: 0, currentStock: 0, categoryId: '' });
        fetchInventory();
      } else {
        const err = await res.json();
        alert('Error: ' + err.error);
      }
    } catch (e: any) {
      alert('Error: ' + e.message);
    }
  };

  if (loading) return <div style={{ display: 'flex', justifyContent: 'center', padding: '3rem' }}>Loading inventory...</div>;

  const filteredProducts = products.filter(p => 
    p.sku.toLowerCase().includes(searchQuery.toLowerCase()) || 
    p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (p as any).barcode?.includes(searchQuery)
  );

  return (
    <div ref={containerRef} style={{ maxWidth: '1400px', margin: '0 auto' }}>
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <div>
          <h1 style={{ fontSize: '2rem', fontWeight: 700 }}>Inventory Items</h1>
          <p style={{ color: 'var(--secondary-foreground)' }}>Manage your stock levels and items.</p>
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

      <div className="card glass" style={{ marginBottom: '2rem' }}>
        <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
          <div style={{ flex: 1, position: 'relative' }}>
            <span style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', opacity: 0.5 }}>🔍</span>
            <input 
              type="text" 
              placeholder="Search by SKU, Name, or Barcode..." 
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              style={{ 
                width: '100%', padding: '0.875rem 1rem 0.875rem 2.5rem', 
                borderRadius: '8px', border: '1px solid var(--border)', 
                background: 'var(--background)', color: 'var(--foreground)',
                outline: 'none', transition: 'border-color 0.2s'
              }}
            />
          </div>
          <button className="btn btn-secondary" onClick={() => setIsScannerOpen(true)} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <span>📷</span> Scan
          </button>
        </div>
      </div>

      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
            <thead style={{ backgroundColor: 'var(--secondary)', borderBottom: '1px solid var(--border)' }}>
              <tr>
                <th style={{ padding: '1rem 1.5rem', fontWeight: 600, color: 'var(--secondary-foreground)' }}>Product Details</th>
                <th style={{ padding: '1rem 1.5rem', fontWeight: 600, color: 'var(--secondary-foreground)' }}>Category / Brand</th>
                <th style={{ padding: '1rem 1.5rem', fontWeight: 600, color: 'var(--secondary-foreground)' }}>Stock Level</th>
                <th style={{ padding: '1rem 1.5rem', fontWeight: 600, color: 'var(--secondary-foreground)' }}>Status</th>
                <th style={{ padding: '1rem 1.5rem', fontWeight: 600, color: 'var(--secondary-foreground)', textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredProducts.length === 0 ? (
                <tr>
                  <td colSpan={5} style={{ padding: '3rem', textAlign: 'center', color: 'var(--secondary-foreground)' }}>
                    No products found.
                  </td>
                </tr>
              ) : (
                filteredProducts.map((product) => (
                  <tr key={product.id} className="product-row" style={{ borderBottom: '1px solid var(--border)', transition: 'background-color 0.2s' }}>
                    <td style={{ padding: '1rem 1.5rem' }}>
                      <div style={{ fontWeight: 600, color: 'var(--foreground)' }}>{product.name}</div>
                      <div style={{ fontSize: '0.875rem', color: 'var(--secondary-foreground)', marginTop: '0.25rem' }}>SKU: {product.sku}</div>
                      
                      {product.lots && product.lots.length > 0 && (
                        <div style={{ marginTop: '0.75rem', fontSize: '0.75rem', display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                          {product.lots.map(l => (
                            <span key={l.id} style={{ padding: '0.125rem 0.5rem', backgroundColor: 'var(--secondary)', borderRadius: '999px', color: 'var(--secondary-foreground)' }}>
                              Lot: {l.batchNumber} ({l.currentQty})
                            </span>
                          ))}
                        </div>
                      )}
                    </td>
                    <td style={{ padding: '1rem 1.5rem' }}>
                      <div style={{ fontSize: '0.875rem' }}>
                        {product.category ? <span style={{ display: 'inline-block', padding: '0.25rem 0.5rem', backgroundColor: 'rgba(99, 102, 241, 0.1)', color: 'var(--primary)', borderRadius: '6px', marginBottom: '0.25rem' }}>{product.category}</span> : '-'}
                      </div>
                      <div style={{ fontSize: '0.875rem', color: 'var(--secondary-foreground)' }}>{product.brand || 'No Brand'}</div>
                    </td>
                    <td style={{ padding: '1rem 1.5rem' }}>
                      {editingId === product.id ? (
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                          <input 
                            type="number" 
                            value={editValue} 
                            onChange={(e) => setEditValue(Number(e.target.value))}
                            style={{ width: '80px', padding: '0.375rem', borderRadius: '4px', border: '1px solid var(--primary)' }}
                          />
                          <span style={{ fontSize: '0.875rem', color: 'var(--secondary-foreground)' }}>{product.unit}</span>
                        </div>
                      ) : (
                        <span style={{ fontWeight: 500, fontSize: '1rem' }}>{product.currentStock} <span style={{ fontSize: '0.875rem', color: 'var(--secondary-foreground)' }}>{product.unit}</span></span>
                      )}
                    </td>
                    <td style={{ padding: '1rem 1.5rem' }}>
                      {product.currentStock <= product.minStockLevel ? (
                        <span style={{ padding: '0.25rem 0.75rem', borderRadius: '999px', fontSize: '0.75rem', fontWeight: 600, backgroundColor: 'rgba(239, 68, 68, 0.1)', color: 'var(--danger)' }}>Low Stock</span>
                      ) : (
                        <span style={{ padding: '0.25rem 0.75rem', borderRadius: '999px', fontSize: '0.75rem', fontWeight: 600, backgroundColor: 'rgba(16, 185, 129, 0.1)', color: 'var(--success)' }}>In Stock</span>
                      )}
                    </td>
                    <td style={{ padding: '1rem 1.5rem', textAlign: 'right' }}>
                      {editingId === product.id ? (
                        <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end' }}>
                          <button className="btn btn-primary" style={{ padding: '0.375rem 0.75rem', fontSize: '0.75rem' }} onClick={() => handleSave(product.id)}>Save</button>
                          <button className="btn btn-secondary" style={{ padding: '0.375rem 0.75rem', fontSize: '0.75rem' }} onClick={() => setEditingId(null)}>Cancel</button>
                        </div>
                      ) : (
                        <button className="btn btn-secondary" style={{ padding: '0.375rem 0.75rem', fontSize: '0.75rem' }} onClick={() => handleEditClick(product)}>Adjust</button>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
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
              <select className="input" value={newProduct.categoryId} onChange={e => setNewProduct({...newProduct, categoryId: e.target.value})}>
                <option value="">-- Select Category --</option>
                {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
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
