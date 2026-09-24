"use client";

import React, { useState, useEffect } from 'react';
import styles from './suppliers.module.css';

type Supplier = {
  id: string;
  name: string;
  contact: string | null;
  address: string | null;
  taxId: string | null;
};

export default function SuppliersPage() {
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({ name: '', contact: '', address: '', taxId: '' });

  const fetchSuppliers = async () => {
    try {
      const res = await fetch('/api/suppliers');
      const data = await res.json();
      setSuppliers(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSuppliers();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await fetch('/api/suppliers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      setIsModalOpen(false);
      setFormData({ name: '', contact: '', address: '', taxId: '' });
      fetchSuppliers();
    } catch (e) {
      console.error(e);
    }
  };

  if (loading) return <div className={styles.loading}>Loading suppliers...</div>;

  return (
    <div className="card">
      <div className={styles.header}>
        <h1 className={styles.title}>Suppliers</h1>
        <button className="btn btn-primary" onClick={() => setIsModalOpen(true)}>Add Supplier</button>
      </div>

      <table className={styles.table}>
        <thead>
          <tr>
            <th>Name</th>
            <th>Contact</th>
            <th>Tax ID</th>
            <th>Address</th>
          </tr>
        </thead>
        <tbody>
          {suppliers.length === 0 ? (
            <tr>
              <td colSpan={4} className={styles.emptyState}>No suppliers found.</td>
            </tr>
          ) : (
            suppliers.map(sup => (
              <tr key={sup.id}>
                <td style={{ fontWeight: 500 }}>{sup.name}</td>
                <td>{sup.contact || '-'}</td>
                <td>{sup.taxId || '-'}</td>
                <td>{sup.address || '-'}</td>
              </tr>
            ))
          )}
        </tbody>
      </table>

      {isModalOpen && (
        <div className={styles.modalOverlay}>
          <div className={styles.modal}>
            <h2 style={{ marginBottom: '1.5rem', fontWeight: 600 }}>Add New Supplier</h2>
            <form onSubmit={handleSubmit}>
              <div className={styles.formGroup}>
                <label>Supplier Name *</label>
                <input 
                  type="text" 
                  className={styles.input} 
                  required
                  value={formData.name}
                  onChange={e => setFormData({...formData, name: e.target.value})}
                />
              </div>
              <div className={styles.formGroup}>
                <label>Contact Info (Phone / Email)</label>
                <input 
                  type="text" 
                  className={styles.input}
                  value={formData.contact}
                  onChange={e => setFormData({...formData, contact: e.target.value})}
                />
              </div>
              <div className={styles.formGroup}>
                <label>Tax ID</label>
                <input 
                  type="text" 
                  className={styles.input}
                  value={formData.taxId}
                  onChange={e => setFormData({...formData, taxId: e.target.value})}
                />
              </div>
              <div className={styles.formGroup}>
                <label>Address</label>
                <textarea 
                  className={styles.input} 
                  rows={3}
                  value={formData.address}
                  onChange={e => setFormData({...formData, address: e.target.value})}
                ></textarea>
              </div>
              
              <div className={styles.modalActions}>
                <button type="button" className="btn" onClick={() => setIsModalOpen(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary">Save</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
