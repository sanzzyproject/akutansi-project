/**
 * Mock API Service Layer
 * Mensimulasikan API calls ke backend (/api/transaksi, /api/hitung)
 * Data disimpan di IndexedDB via Dexie.js
 */
import { db, dataDummy } from '@/db/database';
import type { Transaksi, SaldoBerjalan, RingkasanAkuntansi } from '@/db/types';

// Simulasi network delay
const delay = (ms = 300) => new Promise(r => setTimeout(r, ms));

// === /api/transaksi ===

export async function getTransaksi(): Promise<Transaksi[]> {
  await delay(200);
  return db.transaksi.orderBy('id').toArray();
}

export async function addTransaksi(data: Omit<Transaksi, 'id'>): Promise<Transaksi> {
  await delay(300);
  // Validasi server-side
  if (!data.keterangan.trim()) throw new Error('Keterangan tidak boleh kosong');
  const id = await db.transaksi.add(data as Transaksi);
  return { ...data, id: id as number };
}

export async function updateTransaksi(id: number, data: Omit<Transaksi, 'id'>): Promise<Transaksi> {
  await delay(300);
  if (!data.keterangan.trim()) throw new Error('Keterangan tidak boleh kosong');
  await db.transaksi.update(id, data);
  return { ...data, id };
}

export async function deleteTransaksi(id: number): Promise<void> {
  await delay(200);
  await db.transaksi.delete(id);
}

export async function resetTransaksi(): Promise<void> {
  await delay(300);
  await db.transaksi.clear();
}

export async function seedDummyData(): Promise<void> {
  await delay(200);
  const count = await db.transaksi.count();
  if (count === 0) {
    await db.transaksi.bulkAdd(dataDummy as Transaksi[]);
  }
}

// === /api/hitung ===

export async function hitungSaldo(): Promise<SaldoBerjalan[]> {
  await delay(200);
  const transaksiList = await db.transaksi.orderBy('id').toArray();

  let runKas = 0, runPerlengkapan = 0, runPeralatan = 0, runUtang = 0, runModal = 0;

  return transaksiList.map(t => {
    runKas += t.kas;
    runPerlengkapan += t.perlengkapan;
    runPeralatan += t.peralatan;
    runUtang += t.utangUsaha;
    runModal += t.modal;

    return {
      transaksi: t,
      spiegel: {
        kas: runKas,
        perlengkapan: runPerlengkapan,
        peralatan: runPeralatan,
        utangUsaha: runUtang,
        modal: runModal,
      },
    };
  });
}

export async function hitungRingkasan(): Promise<RingkasanAkuntansi> {
  await delay(200);
  const saldoList = await hitungSaldo();
  const jumlah = saldoList.length;

  if (jumlah === 0) {
    return {
      totalHarta: 0, totalUtang: 0, totalModal: 0,
      seimbang: true, jumlahTransaksi: 0,
      detail: { kas: 0, perlengkapan: 0, peralatan: 0 },
    };
  }

  const last = saldoList[jumlah - 1].spiegel;
  const totalHarta = last.kas + last.perlengkapan + last.peralatan;
  const totalUtang = last.utangUsaha;
  const totalModal = last.modal;

  return {
    totalHarta,
    totalUtang,
    totalModal,
    seimbang: totalHarta === totalUtang + totalModal,
    jumlahTransaksi: jumlah,
    detail: { kas: last.kas, perlengkapan: last.perlengkapan, peralatan: last.peralatan },
  };
}

// Export semua data sebagai JSON
export async function exportJSON(): Promise<string> {
  const transaksi = await getTransaksi();
  const ringkasan = await hitungRingkasan();
  return JSON.stringify({ transaksi, ringkasan }, null, 2);
}
