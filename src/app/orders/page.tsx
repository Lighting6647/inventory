"use client";

import React, { useState, useEffect } from 'react';
import styles from './orders.module.css';
import BarcodeScanner from '@/components/BarcodeScanner';

type Product = {
  id: string;
  sku: string;
  name: string;
  price: number;
  unit: string;
};

type OrderItem = {
  id: string;
  quantity: number;
  unitPrice: number;
  product: { name: string; sku: string; unit: string };
};

type Order = {
  id: string;
  poNumber: string;
  status: string;
  createdAt: string;
  items: OrderItem[];
  supplier?: { name: string } | null;
};

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [products, setProducts] = useState<Product[]>([]);
  const [suppliers, setSuppliers] = useState<{id:string, name:string}[]>([]);
  const [selectedSupplierId, setSelectedSupplierId] = useState('');
  const [newPoItems, setNewPoItems] = useState([{ productId: '', quantity: 1, unitPrice: 0 }]);
  const [submitting, setSubmitting] = useState(false);
  
  const [isScannerOpen, setIsScannerOpen] = useState(false);
  const [currentScanIndex, setCurrentScanIndex] = useState<number | null>(null);

  const handleScan = (decodedText: string) => {
    if (currentScanIndex === null) return;
    // Find product by SKU or Barcode
    const foundProduct = products.find(p => p.sku === decodedText || (p as any).barcode === decodedText);
    if (foundProduct) {
      handleItemChange(currentScanIndex, 'productId', foundProduct.id);
    } else {
      alert(`Product with barcode ${decodedText} not found`);
    }
  };

  const fetchOrders = async () => {
    try {
      const res = await fetch('/api/orders');
      const data = await res.json();
      setOrders(data);
    } catch (error) {
      console.error('Error fetching orders', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const openCreateModal = async () => {
    setIsModalOpen(true);
    setNewPoItems([{ productId: '', quantity: 1, unitPrice: 0 }]);
    setSelectedSupplierId('');
    if (products.length === 0) {
      try {
        const [resProd, resSup] = await Promise.all([
          fetch('/api/inventory'),
          fetch('/api/suppliers')
        ]);
        setProducts(await resProd.json());
        setSuppliers(await resSup.json());
      } catch (e) {
        console.error(e);
      }
    }
  };

  const handleUpdateStatus = async (id: string, status: string) => {
    try {
      await fetch(`/api/orders/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status })
      });
      fetchOrders();
    } catch (error) {
      console.error('Failed to update status', error);
    }
  };

  const handleAddItem = () => {
    setNewPoItems([...newPoItems, { productId: '', quantity: 1, unitPrice: 0 }]);
  };

  const handleRemoveItem = (index: number) => {
    const list = [...newPoItems];
    list.splice(index, 1);
    setNewPoItems(list);
  };

  const handleItemChange = (index: number, field: string, value: any) => {
    const list = [...newPoItems] as any[];
    list[index][field] = value;
    
    // Auto fill price when product is selected
    if (field === 'productId') {
      const selectedProd = products.find(p => p.id === value);
      if (selectedProd) {
        list[index].unitPrice = selectedProd.price;
      }
    }
    
    setNewPoItems(list);
  };

  const handleSubmitPO = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    
    const validItems = newPoItems.filter(item => item.productId !== '');
    if (validItems.length === 0) {
      alert('Please add at least one item');
      setSubmitting(false);
      return;
    }

    try {
      await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ items: validItems, supplierId: selectedSupplierId || null })
      });
      setIsModalOpen(false);
      fetchOrders();
    } catch (error) {
      console.error('Failed to create PO', error);
      alert('Failed to create Purchase Order');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <div className={styles.loading}>Loading orders...</div>;

  return (
    <div className="card">
      <div className={styles.header}>
        <h1 className={styles.title}>Purchase Orders</h1>
        <button className="btn btn-primary" onClick={openCreateModal}>Create PO</button>
      </div>

      <div className={styles.orderList}>
        {orders.length === 0 ? (
          <div className={styles.emptyState}>No purchase orders found.</div>
        ) : (
          orders.map(order => (
            <div key={order.id} className={styles.orderCard}>
              <div className={styles.orderHeader}>
                <div>
                  <h3 className={styles.poNumber}>{order.poNumber}</h3>
                  <p className={styles.date}>{new Date(order.createdAt).toLocaleDateString()}</p>
                  {order.supplier && <p style={{fontSize:'0.875rem', opacity:0.8, marginTop:'0.25rem'}}>Supplier: {order.supplier.name}</p>}
                </div>
                <div className={styles.statusContainer}>
                  <span className={`${styles.statusBadge} ${styles[order.status.toLowerCase()]}`}>
                    {order.status}
                  </span>
                </div>
              </div>
              
              <div className={styles.itemsList}>
                <table className={styles.table}>
                  <thead>
                    <tr>
                      <th>Product</th>
                      <th>Quantity</th>
                      <th>Unit Price</th>
                      <th>Total</th>
                    </tr>
                  </thead>
                  <tbody>
                    {order.items.map(item => (
                      <tr key={item.id}>
                        <td>
                          <div className={styles.productName}>{item.product.name}</div>
                          <div className={styles.productSku}>{item.product.sku}</div>
                        </td>
                        <td>{item.quantity} {item.product.unit}</td>
                        <td>฿{item.unitPrice.toLocaleString()}</td>
                        <td>฿{(item.quantity * item.unitPrice).toLocaleString()}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {order.status === 'PENDING' && (
                <div className={styles.actions}>
                  <button 
                    className={`${styles.btnAction} ${styles.approve}`}
                    onClick={() => handleUpdateStatus(order.id, 'APPROVED')}
                  >
                    Approve & Receive Stock
                  </button>
                  <button 
                    className={`${styles.btnAction} ${styles.reject}`}
                    onClick={() => handleUpdateStatus(order.id, 'REJECTED')}
                  >
                    Reject
                  </button>
                </div>
              )}
            </div>
          ))
        )}
      </div>

      {isModalOpen && (
        <div className={styles.modalOverlay}>
          <div className={styles.modal}>
            <h2 className={styles.modalTitle}>Create Purchase Order</h2>
            <form onSubmit={handleSubmitPO}>
              <div className={styles.formGroup}>
                <label>Supplier (Optional)</label>
                <select 
                  className={styles.select}
                  value={selectedSupplierId}
                  onChange={e => setSelectedSupplierId(e.target.value)}
                >
                  <option value="">-- No Supplier --</option>
                  {suppliers.map(s => (
                    <option key={s.id} value={s.id}>{s.name}</option>
                  ))}
                </select>
              </div>

              <h3 style={{fontSize:'1rem', marginBottom:'1rem', marginTop:'1.5rem'}}>Order Items</h3>
              {newPoItems.map((item, index) => (
                <div key={index} className={styles.itemRow}>
                  <div className={styles.formGroup}>
                    <label>Product</label>
                    <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                      <select 
                        className={styles.select}
                        value={item.productId}
                        onChange={(e) => handleItemChange(index, 'productId', e.target.value)}
                        required
                        style={{ flex: 1 }}
                      >
                        <option value="">Select Product...</option>
                        {products.map(p => (
                          <option key={p.id} value={p.id}>{p.name} (฿{p.price})</option>
                        ))}
                      </select>
                      <button 
                        type="button" 
                        onClick={() => { setCurrentScanIndex(index); setIsScannerOpen(true); }}
                        style={{ padding: '0.5rem', background: 'var(--primary)', color: 'white', border: 'none', borderRadius: '0.25rem', cursor: 'pointer' }}
                        title="Scan Barcode"
                      >
                        📷
                      </button>
                    </div>
                  </div>
                  <div className={styles.formGroup}>
                    <label>Qty</label>
                    <input 
                      type="number" 
                      min="1"
                      className={styles.input}
                      value={item.quantity}
                      onChange={(e) => handleItemChange(index, 'quantity', Number(e.target.value))}
                      required
                    />
                  </div>
                  <div className={styles.formGroup}>
                    <label>Unit Price</label>
                    <input 
                      type="number" 
                      min="0"
                      className={styles.input}
                      value={item.unitPrice}
                      onChange={(e) => handleItemChange(index, 'unitPrice', Number(e.target.value))}
                      required
                    />
                  </div>
                  <div className={styles.formGroup} style={{ marginTop: '1.5rem' }}>
                    <button 
                      type="button" 
                      className={styles.removeBtn}
                      onClick={() => handleRemoveItem(index)}
                      disabled={newPoItems.length === 1}
                    >
                      ✕
                    </button>
                  </div>
                </div>
              ))}

              <button type="button" className={styles.addItemBtn} onClick={handleAddItem}>
                + Add Another Item
              </button>

              <div className={styles.modalActions}>
                <button 
                  type="button" 
                  className={styles.btnCancel}
                  onClick={() => setIsModalOpen(false)}
                  disabled={submitting}
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  className={styles.btnSubmit}
                  disabled={submitting}
                >
                  {submitting ? 'Submitting...' : 'Create PO'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {isScannerOpen && (
        <BarcodeScanner 
          onScanSuccess={handleScan}
          onClose={() => setIsScannerOpen(false)}
        />
      )}
    </div>
  );
}
