import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { hitungRingkasan, seedDummyData } from '@/services/api';
import type { RingkasanAkuntansi } from '@/db/types';
import { DollarSign, TrendingUp, TrendingDown, CheckCircle, XCircle, Plus, FileText, Wallet, Package, Monitor } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';

function formatRupiah(n: number) {
  return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(n);
}

export default function Dashboard() {
  const [data, setData] = useState<RingkasanAkuntansi | null>(null);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    setLoading(true);
    await seedDummyData();
    const r = await hitungRingkasan();
    setData(r);
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  if (loading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-28 w-full rounded-xl" />
        <div className="grid grid-cols-2 gap-4">
          <Skeleton className="h-24 rounded-xl" />
          <Skeleton className="h-24 rounded-xl" />
          <Skeleton className="h-24 rounded-xl" />
          <Skeleton className="h-24 rounded-xl" />
        </div>
        <Skeleton className="h-64 rounded-xl" />
      </div>
    );
  }

  if (!data || data.jumlahTransaksi === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center space-y-4">
        <div className="h-20 w-20 rounded-full bg-muted flex items-center justify-center">
          <DollarSign className="h-10 w-10 text-muted-foreground" />
        </div>
        <h3 className="text-xl font-semibold">Belum Ada Data</h3>
        <p className="text-muted-foreground max-w-sm">Mulai tambahkan transaksi akuntansi untuk melihat ringkasan dashboard.</p>
        <Button asChild size="lg" className="touch-target mt-4">
          <Link to="/transaksi"><Plus className="mr-2 h-5 w-5" />Tambah Transaksi</Link>
        </Button>
      </div>
    );
  }

  const chartData = [
    { name: 'Kas', value: data.detail.kas, color: 'hsl(217, 91%, 50%)' },
    { name: 'Perlengkapan', value: data.detail.perlengkapan, color: 'hsl(142, 76%, 36%)' },
    { name: 'Peralatan', value: data.detail.peralatan, color: 'hsl(38, 92%, 50%)' },
  ];

  return (
    <div className="space-y-6">
      {/* Persamaan Akuntansi */}
      <Card className={`border-2 ${data.seimbang ? 'border-success/50 bg-success/5' : 'border-destructive/50 bg-destructive/5'}`}>
        <CardContent className="p-4 flex items-center gap-3">
          {data.seimbang
            ? <CheckCircle className="h-8 w-8 text-success shrink-0" />
            : <XCircle className="h-8 w-8 text-destructive shrink-0" />}
          <div>
            <p className="font-semibold text-sm">Persamaan Akuntansi</p>
            <p className="text-xs text-muted-foreground">
              Harta ({formatRupiah(data.totalHarta)}) = Utang ({formatRupiah(data.totalUtang)}) + Modal ({formatRupiah(data.totalModal)})
            </p>
            <p className={`text-xs font-bold mt-1 ${data.seimbang ? 'text-success' : 'text-destructive'}`}>
              {data.seimbang ? '✅ Seimbang' : '❌ Tidak Seimbang'}
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        <SummaryCard icon={TrendingUp} label="Total Harta" value={formatRupiah(data.totalHarta)} color="text-primary" />
        <SummaryCard icon={TrendingDown} label="Total Utang" value={formatRupiah(data.totalUtang)} color="text-destructive" />
        <SummaryCard icon={DollarSign} label="Total Modal" value={formatRupiah(data.totalModal)} color="text-success" />
        <SummaryCard icon={FileText} label="Transaksi" value={data.jumlahTransaksi.toString()} color="text-warning" />
      </div>

      {/* Detail Harta */}
      <Card>
        <CardContent className="p-4 space-y-3">
          <h3 className="font-semibold text-sm">Komposisi Harta</h3>
          <div className="space-y-2">
            <DetailRow icon={Wallet} label="Kas" value={formatRupiah(data.detail.kas)} />
            <DetailRow icon={Package} label="Perlengkapan" value={formatRupiah(data.detail.perlengkapan)} />
            <DetailRow icon={Monitor} label="Peralatan" value={formatRupiah(data.detail.peralatan)} />
          </div>
        </CardContent>
      </Card>

      {/* Chart */}
      <Card>
        <CardContent className="p-4">
          <h3 className="font-semibold text-sm mb-4">Grafik Harta</h3>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={chartData}>
              <XAxis dataKey="name" tick={{ fontSize: 12 }} />
              <YAxis tick={{ fontSize: 10 }} tickFormatter={v => `${(v / 1_000_000).toFixed(0)}jt`} />
              <Tooltip formatter={(v: number) => formatRupiah(v)} />
              <Bar dataKey="value" radius={[8, 8, 0, 0]}>
                {chartData.map((entry, i) => (
                  <Cell key={i} fill={entry.color} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <div className="grid grid-cols-2 gap-3">
        <Button asChild size="lg" className="touch-target">
          <Link to="/transaksi"><Plus className="mr-2 h-5 w-5" />Tambah Transaksi</Link>
        </Button>
        <Button asChild variant="outline" size="lg" className="touch-target">
          <Link to="/laporan"><FileText className="mr-2 h-5 w-5" />Lihat Laporan</Link>
        </Button>
      </div>
    </div>
  );
}

function SummaryCard({ icon: Icon, label, value, color }: { icon: any; label: string; value: string; color: string }) {
  return (
    <Card>
      <CardContent className="p-4">
        <Icon className={`h-5 w-5 ${color} mb-2`} />
        <p className="text-[11px] text-muted-foreground">{label}</p>
        <p className="text-sm font-bold mt-0.5 truncate">{value}</p>
      </CardContent>
    </Card>
  );
}

function DetailRow({ icon: Icon, label, value }: { icon: any; label: string; value: string }) {
  return (
    <div className="flex items-center justify-between py-2 border-b border-border last:border-0">
      <div className="flex items-center gap-2">
        <Icon className="h-4 w-4 text-muted-foreground" />
        <span className="text-sm">{label}</span>
      </div>
      <span className="text-sm font-semibold">{value}</span>
    </div>
  );
}
