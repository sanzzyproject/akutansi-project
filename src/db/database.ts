import Dexie, { type Table } from 'dexie';
import type { Transaksi } from './types';

// Database IndexedDB menggunakan Dexie.js
class AkuntansiDB extends Dexie {
  transaksi!: Table<Transaksi, number>;

  constructor() {
    super('AkuntansiLKS');
    this.version(1).stores({
      transaksi: '++id, tanggal, keterangan',
    });
  }
}

export const db = new AkuntansiDB();

// Data dummy untuk demo awal
export const dataDummy: Omit<Transaksi, 'id'>[] = [
  { tanggal: '2026-01-01', keterangan: 'Investasi awal pemilik', kas: 50000000, perlengkapan: 0, peralatan: 0, utangUsaha: 0, modal: 50000000 },
  { tanggal: '2026-01-03', keterangan: 'Pembelian perlengkapan tunai', kas: -2000000, perlengkapan: 2000000, peralatan: 0, utangUsaha: 0, modal: 0 },
  { tanggal: '2026-01-05', keterangan: 'Pembelian peralatan kredit', kas: 0, perlengkapan: 0, peralatan: 15000000, utangUsaha: 15000000, modal: 0 },
  { tanggal: '2026-01-10', keterangan: 'Pendapatan jasa tunai', kas: 8000000, perlengkapan: 0, peralatan: 0, utangUsaha: 0, modal: 8000000 },
  { tanggal: '2026-01-15', keterangan: 'Pembayaran utang usaha', kas: -5000000, perlengkapan: 0, peralatan: 0, utangUsaha: -5000000, modal: 0 },
  { tanggal: '2026-01-20', keterangan: 'Beban gaji karyawan', kas: -3000000, perlengkapan: 0, peralatan: 0, utangUsaha: 0, modal: -3000000 },
];
