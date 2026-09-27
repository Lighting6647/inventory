"use client";
import React, { useState, useEffect } from 'react';

export default function LocationsPage() {
  const [locations, setLocations] = useState<any[]>([]);
  const [name, setName] = useState('');
  const [address, setAddress] = useState('');

  const fetchLocations = async () => {
    const res = await fetch('/api/locations');
    setLocations(await res.json());
  };

  useEffect(() => { fetchLocations(); }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await fetch('/api/locations', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, address })
    });
    setName(''); setAddress('');
    fetchLocations();
  };

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto', padding: '2rem 0' }}>
      <h1 style={{ fontSize: '2rem', fontWeight: 700, marginBottom: '2rem' }}>Locations (สถานที่)</h1>
      <div className="card glass" style={{ marginBottom: '2rem' }}>
        <h2 style={{ fontSize: '1.25rem', marginBottom: '1rem' }}>Add New Location</h2>
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <input className="input" placeholder="Location Name (ชื่อสถานที่)" value={name} onChange={e => setName(e.target.value)} required />
          <input className="input" placeholder="Address (ที่อยู่)" value={address} onChange={e => setAddress(e.target.value)} />
          <button className="btn btn-primary" type="submit">Save Location</button>
        </form>
      </div>
      <div className="card glass">
        <h2 style={{ fontSize: '1.25rem', marginBottom: '1rem' }}>Location List</h2>
        <table style={{ width: '100%', textAlign: 'left' }}>
          <thead>
            <tr style={{ borderBottom: '1px solid var(--border)' }}>
              <th style={{ padding: '0.5rem' }}>Name</th>
              <th style={{ padding: '0.5rem' }}>Address</th>
            </tr>
          </thead>
          <tbody>
            {locations.map(loc => (
              <tr key={loc.id} style={{ borderBottom: '1px solid var(--border)' }}>
                <td style={{ padding: '0.5rem', fontWeight: 600 }}>{loc.name}</td>
                <td style={{ padding: '0.5rem', color: 'var(--secondary-foreground)' }}>{loc.address || '-'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
