"use client";
import React, { useState, useEffect } from 'react';

export default function ExpensesPage() {
  const [expenses, setExpenses] = useState<any[]>([]);
  const [title, setTitle] = useState('');
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');

  const fetchExpenses = async () => {
    const res = await fetch('/api/expenses');
    setExpenses(await res.json());
  };

  useEffect(() => { fetchExpenses(); }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await fetch('/api/expenses', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title, amount, description })
    });
    setTitle(''); setAmount(''); setDescription('');
    fetchExpenses();
  };

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto', padding: '2rem 0' }}>
      <h1 style={{ fontSize: '2rem', fontWeight: 700, marginBottom: '2rem' }}>Expenses (ค่าใช้จ่าย)</h1>
      <div className="card glass" style={{ marginBottom: '2rem' }}>
        <h2 style={{ fontSize: '1.25rem', marginBottom: '1rem' }}>Add New Expense</h2>
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <input className="input" placeholder="Title (รายการ)" value={title} onChange={e => setTitle(e.target.value)} required />
          <input className="input" type="number" placeholder="Amount (จำนวนเงิน)" value={amount} onChange={e => setAmount(e.target.value)} required />
          <input className="input" placeholder="Description (รายละเอียดเพิ่มเติม)" value={description} onChange={e => setDescription(e.target.value)} />
          <button className="btn btn-primary" type="submit">Save Expense</button>
        </form>
      </div>
      <div className="card glass">
        <h2 style={{ fontSize: '1.25rem', marginBottom: '1rem' }}>Expense History</h2>
        <table style={{ width: '100%', textAlign: 'left' }}>
          <thead>
            <tr style={{ borderBottom: '1px solid var(--border)' }}>
              <th style={{ padding: '0.5rem' }}>Date</th>
              <th style={{ padding: '0.5rem' }}>Title</th>
              <th style={{ padding: '0.5rem' }}>Amount</th>
            </tr>
          </thead>
          <tbody>
            {expenses.map(exp => (
              <tr key={exp.id} style={{ borderBottom: '1px solid var(--border)' }}>
                <td style={{ padding: '0.5rem' }}>{new Date(exp.date).toLocaleDateString()}</td>
                <td style={{ padding: '0.5rem' }}>{exp.title}</td>
                <td style={{ padding: '0.5rem', color: '#ef4444' }}>-฿{exp.amount}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
