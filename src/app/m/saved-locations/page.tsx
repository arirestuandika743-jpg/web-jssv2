'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { authService } from '@/services/auth';

interface SavedLocation {
  id: string;
  icon: string;
  label: string;
  address: string;
  lat?: number;
  lng?: number;
}

const SAVED_LOCATIONS_KEY = 'jss_saved_locations';

const DEFAULT_LABELS = [
  { icon: '🏠', label: 'Rumah' },
  { icon: '🏢', label: 'Kantor' },
  { icon: '🏫', label: 'Sekolah' },
  { icon: '📍', label: 'Lainnya' },
];

export default function SavedLocationsPage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [locations, setLocations] = useState<SavedLocation[]>([]);
  const [editing, setEditing] = useState<string | null>(null);
  const [newLabel, setNewLabel] = useState('');
  const [newAddress, setNewAddress] = useState('');
  const [showAdd, setShowAdd] = useState(false);
  const [selectedType, setSelectedType] = useState(0);

  useEffect(() => {
    const loadData = async () => {
      const currentUser = await authService.getCurrentUser();
      if (!currentUser) { router.push('/m/login'); return; }
      setUser(currentUser);

      const stored = localStorage.getItem(`${SAVED_LOCATIONS_KEY}_${currentUser.id}`);
      if (stored) {
        try { setLocations(JSON.parse(stored)); } catch { }
      }
    };
    loadData();
  }, [router]);

  const saveLocations = (locs: SavedLocation[]) => {
    if (!user) return;
    setLocations(locs);
    localStorage.setItem(`${SAVED_LOCATIONS_KEY}_${user.id}`, JSON.stringify(locs));
  };

  const handleAdd = () => {
    if (!newAddress.trim()) return;
    const def = DEFAULT_LABELS[selectedType];
    const loc: SavedLocation = {
      id: `loc-${Date.now()}`,
      icon: def.icon,
      label: newLabel || def.label,
      address: newAddress,
    };
    saveLocations([...locations, loc]);
    setNewAddress('');
    setNewLabel('');
    setShowAdd(false);
  };

  const handleDelete = (id: string) => {
    saveLocations(locations.filter(l => l.id !== id));
  };

  return (
    <div style={{ padding: '0 16px', paddingBottom: 100 }}>
      <div className="jss-title-bar" style={{ padding: '16px 0', position: 'relative', borderBottom: 'none' }}>
        <button className="jss-title-bar-back" onClick={() => router.back()}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <polyline points="15,18 9,12 15,6" />
          </svg>
        </button>
        <span className="jss-title-bar-text">📍 Lokasi Tersimpan</span>
      </div>

      {/* Saved Locations List */}
      {locations.length === 0 && !showAdd ? (
        <div className="jss-empty" style={{ padding: 32 }}>
          <p className="jss-empty-title">Belum ada lokasi tersimpan</p>
          <p className="jss-empty-text">Simpan lokasi favoritmu untuk pemesanan lebih cepat</p>
        </div>
      ) : (
        locations.map((loc) => (
          <div key={loc.id} className="jss-card" style={{ marginBottom: 8, display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{ fontSize: 24 }}>{loc.icon}</div>
            <div style={{ flex: 1 }}>
              <p style={{ fontSize: 14, fontWeight: 600, margin: 0 }}>{loc.label}</p>
              <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.5)', margin: '2px 0 0' }}>{loc.address}</p>
            </div>
            <button
              className="jss-btn jss-btn-ghost jss-btn-sm"
              onClick={() => handleDelete(loc.id)}
              style={{ color: '#EF4444', padding: 4 }}
            >
              ✕
            </button>
          </div>
        ))
      )}

      {/* Add Location Form */}
      {showAdd ? (
        <div className="jss-card" style={{ marginTop: 16 }}>
          <h3 style={{ fontSize: 14, fontWeight: 700, margin: '0 0 12px' }}>Tambah Lokasi</h3>

          <div style={{ display: 'flex', gap: 8, marginBottom: 12 }}>
            {DEFAULT_LABELS.map((def, idx) => (
              <button
                key={idx}
                className={`jss-btn jss-btn-sm ${selectedType === idx ? 'jss-btn-primary' : 'jss-btn-outline'}`}
                onClick={() => setSelectedType(idx)}
                style={{ padding: '6px 10px', fontSize: 12 }}
              >
                {def.icon} {def.label}
              </button>
            ))}
          </div>

          {selectedType === 3 && (
            <div className="jss-input-group">
              <label className="jss-input-label">Nama Lokasi</label>
              <input
                className="jss-input"
                placeholder="Contoh: Masjid, Toko"
                value={newLabel}
                onChange={(e) => setNewLabel(e.target.value)}
              />
            </div>
          )}

          <div className="jss-input-group">
            <label className="jss-input-label">Alamat Lengkap</label>
            <textarea
              className="jss-input"
              placeholder="Masukkan alamat lengkap"
              rows={2}
              value={newAddress}
              onChange={(e) => setNewAddress(e.target.value)}
              style={{ resize: 'none' }}
            />
          </div>

          <div style={{ display: 'flex', gap: 8 }}>
            <button className="jss-btn jss-btn-primary jss-btn-block" onClick={handleAdd} disabled={!newAddress.trim()}>
              Simpan
            </button>
            <button className="jss-btn jss-btn-outline jss-btn-block" onClick={() => setShowAdd(false)}>
              Batal
            </button>
          </div>
        </div>
      ) : (
        <button
          className="jss-btn jss-btn-outline jss-btn-block"
          onClick={() => setShowAdd(true)}
          style={{ marginTop: 16 }}
        >
          + Tambah Lokasi Baru
        </button>
      )}
    </div>
  );
}
