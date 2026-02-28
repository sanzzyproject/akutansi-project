import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center h-[80vh] text-center px-4">
      <h1 className="text-6xl font-bold text-primary mb-4">404</h1>
      <p className="text-xl font-semibold mb-2">Halaman Tidak Ditemukan</p>
      <p className="text-muted-foreground mb-8">Maaf, halaman yang Anda tuju tidak ada atau sudah dipindahkan.</p>
      <Button asChild className="touch-target">
        <Link to="/">Kembali ke Dashboard</Link>
      </Button>
    </div>
  );
}
