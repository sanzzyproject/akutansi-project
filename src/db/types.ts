// Tipe data untuk transaksi akuntansi
export interface Transaksi {
  id?: number;
  tanggal: string;
  keterangan: string;
  kas: number;
  perlengkapan: number;
  peralatan: number;
  utangUsaha: number;
  modal: number;
}

// Hasil perhitungan running balance
export interface SaldoBerjalan {
  transaksi: Transaksi;
  spiegel: {
    kas: number;
    perlengkapan: number;
    peralatan: number;
    utangUsaha: number;
    modal: number;
  };
}

// Ringkasan akuntansi
export interface RingkasanAkuntansi {
  totalHarta: number;
  totalUtang: number;
  totalModal: number;
  seimbang: boolean; // Harta === Utang + Modal
  jumlahTransaksi: number;
  detail: {
    kas: number;
    perlengkapan: number;
    peralatan: number;
  };
}
