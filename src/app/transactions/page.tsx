"use client";

import React, { useState, useEffect, useRef } from 'react';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';

type Transaction = {
  id: string;
  type: string; // IN, OUT, ADJUST
  quantity: number;
  reference: string | null;
  createdAt: string;
  product: { name: string; sku: string };
  lot?: { batchNumber: string };
};

export default function TransactionsPage() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    fetch('/api/transactions')
      .then(res => res.json())
      .then(data => {
        setTransactions(data);
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setLoading(false);
      });
  }, []);

  useGSAP(() => {
    if (!loading && transactions.length > 0) {
      gsap.fromTo('.tx-row', 
        { y: 15, opacity: 0 }, 
        { y: 0, opacity: 1, duration: 0.3, stagger: 0.05, ease: 'power2.out' }
      );
    }
  }, [loading, transactions]);

  const filteredTx = transactions.filter(t => 
    t.product.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
    t.product.sku.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (t.reference && t.reference.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const getBadgeColor = (type: string) => {
    if (type === 'IN') return { bg: 'rgba(16, 185, 129, 0.1)', color: 'var(--success)' };
    if (type === 'OUT') return { bg: 'rgba(239, 68, 68, 0.1)', color: 'var(--danger)' };
    return { bg: 'rgba(245, 158, 11, 0.1)', color: 'var(--warning)' };
  };

  return (
    <div ref={containerRef} style={{ maxWidth: '1200px', margin: '0 auto' }}>
      <header style={{ marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '2rem', fontWeight: 700 }}>Transaction History</h1>
        <p style={{ color: 'var(--secondary-foreground)' }}>Monitor stock movements (In, Out, Adjustments).</p>
      </header>

      <div className="card glass" style={{ marginBottom: '2rem' }}>
        <input 
          type="text" 
          placeholder="Search by SKU, Name, or Reference..." 
          value={searchQuery}
          onChange={e => setSearchQuery(e.target.value)}
          style={{ 
            width: '100%', padding: '0.875rem 1rem', 
            borderRadius: '8px', border: '1px solid var(--border)', 
            background: 'var(--background)', color: 'var(--foreground)'
          }}
        />
      </div>

      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
            <thead style={{ backgroundColor: 'var(--secondary)', borderBottom: '1px solid var(--border)' }}>
              <tr>
                <th style={{ padding: '1rem 1.5rem', fontWeight: 600 }}>Date & Time</th>
                <th style={{ padding: '1rem 1.5rem', fontWeight: 600 }}>Product</th>
                <th style={{ padding: '1rem 1.5rem', fontWeight: 600 }}>Type</th>
                <th style={{ padding: '1rem 1.5rem', fontWeight: 600 }}>Qty</th>
                <th style={{ padding: '1rem 1.5rem', fontWeight: 600 }}>Ref / Lot</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={5} style={{ padding: '2rem', textAlign: 'center' }}>Loading...</td></tr>
              ) : filteredTx.length === 0 ? (
                <tr><td colSpan={5} style={{ padding: '2rem', textAlign: 'center' }}>No transactions found.</td></tr>
              ) : (
                filteredTx.map(tx => {
                  const colors = getBadgeColor(tx.type);
                  return (
                    <tr key={tx.id} className="tx-row" style={{ borderBottom: '1px solid var(--border)' }}>
                      <td style={{ padding: '1rem 1.5rem', fontSize: '0.875rem' }}>
                        {new Date(tx.createdAt).toLocaleString()}
                      </td>
                      <td style={{ padding: '1rem 1.5rem' }}>
                        <div style={{ fontWeight: 500 }}>{tx.product.name}</div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--secondary-foreground)' }}>SKU: {tx.product.sku}</div>
                      </td>
                      <td style={{ padding: '1rem 1.5rem' }}>
                        <span style={{ 
                          padding: '0.25rem 0.75rem', borderRadius: '999px', 
                          fontSize: '0.75rem', fontWeight: 600, 
                          backgroundColor: colors.bg, color: colors.color 
                        }}>
                          {tx.type}
                        </span>
                      </td>
                      <td style={{ padding: '1rem 1.5rem', fontWeight: 600 }}>
                        {tx.type === 'OUT' || (tx.type === 'ADJUST' && tx.quantity < 0) ? '' : '+'}{tx.quantity}
                      </td>
                      <td style={{ padding: '1rem 1.5rem', fontSize: '0.875rem' }}>
                        <div>Ref: {tx.reference || '-'}</div>
                        {tx.lot && <div style={{ color: 'var(--secondary-foreground)' }}>Lot: {tx.lot.batchNumber}</div>}
                      </td>
                    </tr>
                  )
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
