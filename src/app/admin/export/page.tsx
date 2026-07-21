'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { FileSpreadsheet, FileText, Download, Calendar, Filter } from 'lucide-react';
import { analyticsService } from '@/services/analyticsService';
import { FadeIn } from '@/components/layout/PageTransition';
import type { ExportFilter } from '@/types';

export default function AdminExportPage() {
  const [filter, setFilter] = useState<ExportFilter>({
    startDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    endDate: new Date().toISOString().split('T')[0],
    type: 'orders',
    format: 'xlsx',
  });
  const [exporting, setExporting] = useState(false);
  const [preview, setPreview] = useState<any[] | null>(null);

  const handlePreview = async () => {
    const data = await analyticsService.prepareExportData(filter);
    setPreview(data.slice(0, 10));
  };

  const handleExport = async () => {
    setExporting(true);
    try {
      const data = await analyticsService.prepareExportData(filter);

      if (filter.format === 'xlsx') {
        const XLSX = await import('xlsx');
        const worksheet = XLSX.utils.json_to_sheet(data);
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, 'Laporan');
        
        // Auto-size columns
        const colWidths = Object.keys(data[0] || {}).map(key => ({
          wch: Math.max(key.length, ...data.map(r => String(r[key] || '').length)) + 2,
        }));
        worksheet['!cols'] = colWidths;
        
        XLSX.writeFile(workbook, `JSS_Laporan_${filter.type}_${filter.startDate}_${filter.endDate}.xlsx`);
      } else {
        // PDF export
        const { default: jsPDF } = await import('jspdf');
        const { default: autoTable } = await import('jspdf-autotable');
        
        const doc = new jsPDF('landscape');
        doc.setFontSize(16);
        doc.text('Laporan JSS - Jasa Suruh Kalirejo', 14, 20);
        doc.setFontSize(10);
        doc.text(`Periode: ${filter.startDate} s/d ${filter.endDate}`, 14, 28);
        doc.text(`Tipe: ${filter.type}`, 14, 34);
        
        if (data.length > 0) {
          const headers = Object.keys(data[0]);
          const rows = data.map(row => headers.map(h => String(row[h] || '')));
          
          autoTable(doc, {
            head: [headers],
            body: rows,
            startY: 40,
            styles: { fontSize: 8 },
            headStyles: { fillColor: [253, 184, 19], textColor: [17, 17, 17] },
          });
        }
        
        doc.save(`JSS_Laporan_${filter.type}_${filter.startDate}_${filter.endDate}.pdf`);
      }
    } catch (err) {
      console.error('Export error:', err);
    } finally {
      setExporting(false);
    }
  };

  return (
    <div className="space-y-6">
      <FadeIn>
        <div>
          <h1 className="text-2xl font-bold text-secondary-900">📄 Export Laporan</h1>
          <p className="text-secondary-500 text-sm mt-1">Unduh data dalam format Excel atau PDF</p>
        </div>
      </FadeIn>

      {/* Export Form */}
      <div className="bg-white rounded-card shadow-soft p-6">
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <div>
            <label className="text-sm font-semibold text-secondary-700 block mb-1">Tanggal Mulai</label>
            <input
              type="date"
              value={filter.startDate}
              onChange={e => setFilter(f => ({ ...f, startDate: e.target.value }))}
              className="w-full px-4 py-2.5 border border-secondary-200 rounded-xl text-sm focus:border-primary outline-none"
            />
          </div>
          <div>
            <label className="text-sm font-semibold text-secondary-700 block mb-1">Tanggal Selesai</label>
            <input
              type="date"
              value={filter.endDate}
              onChange={e => setFilter(f => ({ ...f, endDate: e.target.value }))}
              className="w-full px-4 py-2.5 border border-secondary-200 rounded-xl text-sm focus:border-primary outline-none"
            />
          </div>
          <div>
            <label className="text-sm font-semibold text-secondary-700 block mb-1">Tipe Data</label>
            <select
              value={filter.type}
              onChange={e => setFilter(f => ({ ...f, type: e.target.value as ExportFilter['type'] }))}
              className="w-full px-4 py-2.5 border border-secondary-200 rounded-xl text-sm focus:border-primary outline-none"
            >
              <option value="orders">📦 Data Order</option>
              <option value="revenue">💰 Pendapatan</option>
              <option value="couriers">👨‍💼 Performa Kurir</option>
              <option value="full">📊 Laporan Lengkap</option>
            </select>
          </div>
          <div>
            <label className="text-sm font-semibold text-secondary-700 block mb-1">Format</label>
            <div className="flex gap-2">
              <button
                onClick={() => setFilter(f => ({ ...f, format: 'xlsx' }))}
                className={`flex-1 py-2.5 rounded-xl text-sm font-semibold flex items-center justify-center gap-2 border transition-all ${
                  filter.format === 'xlsx' ? 'bg-emerald-50 border-emerald-200 text-emerald-700' : 'border-secondary-200 text-secondary-400'
                }`}
              >
                <FileSpreadsheet className="w-4 h-4" />
                Excel
              </button>
              <button
                onClick={() => setFilter(f => ({ ...f, format: 'pdf' }))}
                className={`flex-1 py-2.5 rounded-xl text-sm font-semibold flex items-center justify-center gap-2 border transition-all ${
                  filter.format === 'pdf' ? 'bg-red-50 border-red-200 text-red-700' : 'border-secondary-200 text-secondary-400'
                }`}
              >
                <FileText className="w-4 h-4" />
                PDF
              </button>
            </div>
          </div>
        </div>

        <div className="flex gap-3">
          <button
            onClick={handlePreview}
            className="px-6 py-2.5 border border-secondary-200 rounded-xl text-sm font-semibold text-secondary-600 hover:bg-secondary-50"
          >
            👁️ Preview
          </button>
          <motion.button
            whileTap={{ scale: 0.97 }}
            onClick={handleExport}
            disabled={exporting}
            className="px-6 py-2.5 bg-primary rounded-xl text-sm font-bold text-secondary-900 flex items-center gap-2 disabled:opacity-50"
          >
            {exporting ? (
              <div className="w-4 h-4 border-2 border-secondary-900/30 border-t-secondary-900 rounded-full animate-spin" />
            ) : (
              <Download className="w-4 h-4" />
            )}
            <span>{exporting ? 'Mengunduh...' : 'Download'}</span>
          </motion.button>
        </div>
      </div>

      {/* Preview */}
      {preview && preview.length > 0 && (
        <FadeIn>
          <div className="bg-white rounded-card shadow-soft overflow-hidden">
            <div className="px-6 py-3 border-b border-secondary-100">
              <h3 className="font-bold text-secondary-900 text-sm">Preview Data (10 baris pertama)</h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-secondary-50">
                    {Object.keys(preview[0]).map(key => (
                      <th key={key} className="px-4 py-2 text-left text-xs font-semibold text-secondary-500 whitespace-nowrap">{key}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-secondary-50">
                  {preview.map((row, i) => (
                    <tr key={i} className="hover:bg-secondary-50/50">
                      {Object.values(row).map((val, j) => (
                        <td key={j} className="px-4 py-2 text-secondary-700 whitespace-nowrap text-xs">{String(val)}</td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </FadeIn>
      )}
    </div>
  );
}
