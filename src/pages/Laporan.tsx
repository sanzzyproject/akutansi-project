import { useEffect, useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow, TableFooter } from '@/components/ui/table';
import { useToast } from '@/hooks/use-toast';
import { hitungSaldo, exportJSON, resetTransaksi } from '@/services/api';
import type { SaldoBerjalan } from '@/db/types';
import { Download, RotateCcw, FileText } from 'lucide-react';

function formatRp(n: number) {
  return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(n);
}

function ValueCell({ value }: { value: number }) {
  if (value === 0) return <span className="text-muted-foreground">—</span>;
  return (
    <span className={`font-medium ${value > 0 ? 'text-success' : 'text-destructive'}`}>
      {value > 0 ? '+' : ''}{formatRp(value)}
    </span>
  );
}

function BalanceCell({ value }: { value: number }) {
  return <span className="font-semibold text-xs">{formatRp(value)}</span>;
}

export default function Laporan() {
  const [data, setData] = useState<SaldoBerjalan[]>([]);
  const [loading, setLoading] = useState(true);
  const [showReset, setShowReset] = useState(false);
  const { toast } = useToast();

  const load = async () => {
    setLoading(true);
    const r = await hitungSaldo();
    setData(r);
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const handleExport = async () => {
    const json = await exportJSON();
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `akuntansi-lks-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
    toast({ title: 'Berhasil', description: 'Data berhasil di-export' });
  };

  const handleReset = async () => {
    await resetTransaksi();
    setShowReset(false);
    toast({ title: 'Berhasil', description: 'Semua data telah direset' });
    load();
  };

  if (loading) {
    return <Skeleton className="h-96 rounded-xl" />;
  }

  if (data.length === 0) {
    return (
      <div className="flex flex-col items-center py-20 text-center space-y-3">
        <div className="h-16 w-16 rounded-full bg-muted flex items-center justify-center">
          <FileText className="h-8 w-8 text-muted-foreground" />
        </div>
        <h3 className="font-semibold">Belum Ada Data Laporan</h3>
        <p className="text-sm text-muted-foreground">Tambahkan transaksi terlebih dahulu.</p>
      </div>
    );
  }

  const last = data[data.length - 1].spiegel;
  const totalHarta = last.kas + last.perlengkapan + last.peralatan;

  return (
    <div className="space-y-4">
      {/* Action Buttons */}
      <div className="flex gap-2">
        <Button onClick={handleExport} variant="outline" className="flex-1 touch-target">
          <Download className="mr-2 h-4 w-4" />Export JSON
        </Button>
        <Button onClick={() => setShowReset(true)} variant="destructive" className="touch-target">
          <RotateCcw className="mr-2 h-4 w-4" />Reset
        </Button>
      </div>

      {/* LKS Table */}
      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="min-w-[40px]">No</TableHead>
                  <TableHead className="min-w-[100px]">Keterangan</TableHead>
                  <TableHead className="min-w-[120px] text-right">Kas</TableHead>
                  <TableHead className="min-w-[120px] text-right">Perlengkapan</TableHead>
                  <TableHead className="min-w-[120px] text-right">Peralatan</TableHead>
                  <TableHead className="min-w-[120px] text-right">Utang Usaha</TableHead>
                  <TableHead className="min-w-[120px] text-right">Modal</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {data.map((row, idx) => (
                  <>
                    <TableRow key={`t-${row.transaksi.id}`}>
                      <TableCell className="font-medium">{idx + 1}</TableCell>
                      <TableCell>
                        <p className="font-medium text-xs">{row.transaksi.keterangan}</p>
                        <p className="text-[10px] text-muted-foreground">{row.transaksi.tanggal}</p>
                      </TableCell>
                      <TableCell className="text-right"><ValueCell value={row.transaksi.kas} /></TableCell>
                      <TableCell className="text-right"><ValueCell value={row.transaksi.perlengkapan} /></TableCell>
                      <TableCell className="text-right"><ValueCell value={row.transaksi.peralatan} /></TableCell>
                      <TableCell className="text-right"><ValueCell value={row.transaksi.utangUsaha} /></TableCell>
                      <TableCell className="text-right"><ValueCell value={row.transaksi.modal} /></TableCell>
                    </TableRow>
                    <TableRow key={`s-${row.transaksi.id}`} className="bg-muted/30">
                      <TableCell></TableCell>
                      <TableCell className="text-[10px] text-muted-foreground italic">Saldo</TableCell>
                      <TableCell className="text-right"><BalanceCell value={row.spiegel.kas} /></TableCell>
                      <TableCell className="text-right"><BalanceCell value={row.spiegel.perlengkapan} /></TableCell>
                      <TableCell className="text-right"><BalanceCell value={row.spiegel.peralatan} /></TableCell>
                      <TableCell className="text-right"><BalanceCell value={row.spiegel.utangUsaha} /></TableCell>
                      <TableCell className="text-right"><BalanceCell value={row.spiegel.modal} /></TableCell>
                    </TableRow>
                  </>
                ))}
              </TableBody>
              <TableFooter>
                <TableRow>
                  <TableCell colSpan={2} className="font-bold">TOTAL</TableCell>
                  <TableCell className="text-right font-bold">{formatRp(last.kas)}</TableCell>
                  <TableCell className="text-right font-bold">{formatRp(last.perlengkapan)}</TableCell>
                  <TableCell className="text-right font-bold">{formatRp(last.peralatan)}</TableCell>
                  <TableCell className="text-right font-bold">{formatRp(last.utangUsaha)}</TableCell>
                  <TableCell className="text-right font-bold">{formatRp(last.modal)}</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell colSpan={2} className="font-bold text-primary">HARTA = UTANG + MODAL</TableCell>
                  <TableCell colSpan={3} className="text-right font-bold text-primary">
                    {formatRp(totalHarta)}
                  </TableCell>
                  <TableCell colSpan={2} className="text-right font-bold text-primary">
                    {formatRp(last.utangUsaha + last.modal)}
                  </TableCell>
                </TableRow>
              </TableFooter>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Reset Dialog */}
      <Dialog open={showReset} onOpenChange={setShowReset}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Reset Semua Data?</DialogTitle>
            <DialogDescription>Semua transaksi akan dihapus permanen. Tindakan ini tidak bisa dibatalkan.</DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowReset(false)}>Batal</Button>
            <Button variant="destructive" onClick={handleReset}>Reset Data</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
