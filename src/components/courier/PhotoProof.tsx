'use client';

import { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { Camera, X, Upload, Image, Check } from 'lucide-react';

interface PhotoProofProps {
  onUpload: (photoUrl: string) => void;
  onClose: () => void;
}

export default function PhotoProof({ onUpload, onClose }: PhotoProofProps) {
  const [preview, setPreview] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (ev) => {
      setPreview(ev.target?.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleUpload = async () => {
    if (!preview) return;
    setUploading(true);
    // In mock mode, just use the data URL as photo URL
    await new Promise(r => setTimeout(r, 800));
    onUpload(preview);
    setUploading(false);
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[95] bg-black/80 backdrop-blur-sm flex items-end sm:items-center justify-center"
    >
      <motion.div
        initial={{ y: 100 }}
        animate={{ y: 0 }}
        exit={{ y: 100 }}
        className="w-full max-w-md bg-secondary-800 rounded-t-3xl sm:rounded-3xl overflow-hidden"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-white/10">
          <div className="flex items-center gap-2">
            <Camera className="w-5 h-5 text-primary" />
            <h3 className="text-white font-bold">Bukti Foto</h3>
          </div>
          <button onClick={onClose} className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center">
            <X className="w-4 h-4 text-white/60" />
          </button>
        </div>

        {/* Content */}
        <div className="p-5">
          <p className="text-white/50 text-sm mb-4">
            Upload foto barang atau foto customer menerima barang untuk menyelesaikan order.
          </p>

          {/* Preview / Upload Area */}
          {preview ? (
            <div className="relative rounded-2xl overflow-hidden mb-4">
              <img src={preview} alt="Bukti Foto Order" className="w-full h-64 object-cover" />
              <button
                onClick={() => setPreview(null)}
                className="absolute top-3 right-3 w-8 h-8 bg-black/50 rounded-lg flex items-center justify-center"
              >
                <X className="w-4 h-4 text-white" />
              </button>
            </div>
          ) : (
            <button
              onClick={() => fileInputRef.current?.click()}
              className="w-full h-48 border-2 border-dashed border-white/20 rounded-2xl flex flex-col items-center justify-center gap-3 hover:border-primary/50 transition-colors mb-4"
            >
              <div className="w-16 h-16 bg-white/5 rounded-2xl flex items-center justify-center">
                <Image className="w-8 h-8 text-white/30" />
              </div>
              <div className="text-center">
                <p className="text-white/60 text-sm font-medium">Ketuk untuk memilih foto</p>
                <p className="text-white/30 text-xs mt-1">atau ambil foto langsung</p>
              </div>
            </button>
          )}

          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            capture="environment"
            className="hidden"
            onChange={handleFileSelect}
          />

          {/* Buttons */}
          <div className="space-y-2">
            {preview ? (
              <motion.button
                whileTap={{ scale: 0.97 }}
                onClick={handleUpload}
                disabled={uploading}
                className="w-full py-3.5 bg-gradient-to-r from-primary to-amber-400 rounded-xl font-bold text-secondary-900 flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {uploading ? (
                  <div className="w-5 h-5 border-2 border-secondary-900/30 border-t-secondary-900 rounded-full animate-spin" />
                ) : (
                  <>
                    <Check className="w-5 h-5" />
                    <span>Konfirmasi Foto</span>
                  </>
                )}
              </motion.button>
            ) : (
              <motion.button
                whileTap={{ scale: 0.97 }}
                onClick={() => fileInputRef.current?.click()}
                className="w-full py-3.5 bg-primary/20 rounded-xl font-bold text-primary flex items-center justify-center gap-2"
              >
                <Camera className="w-5 h-5" />
                <span>Ambil Foto</span>
              </motion.button>
            )}
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}
