import { ReactNode } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { LayoutDashboard, ArrowLeftRight, FileText, Moon, Sun } from 'lucide-react';
import { useIsMobile } from '@/hooks/use-mobile';
import { Button } from '@/components/ui/button';
import { useState, useEffect } from 'react';

const navItems = [
  { path: '/', label: 'Dashboard', icon: LayoutDashboard },
  { path: '/transaksi', label: 'Transaksi', icon: ArrowLeftRight },
  { path: '/laporan', label: 'Laporan', icon: FileText },
];

function ThemeToggle() {
  const [dark, setDark] = useState(() => document.documentElement.classList.contains('dark'));

  const toggle = () => {
    document.documentElement.classList.toggle('dark');
    setDark(!dark);
    localStorage.setItem('theme', !dark ? 'dark' : 'light');
  };

  useEffect(() => {
    const saved = localStorage.getItem('theme');
    if (saved === 'dark') {
      document.documentElement.classList.add('dark');
      setDark(true);
    }
  }, []);

  return (
    <Button variant="ghost" size="icon" onClick={toggle} className="touch-target">
      {dark ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
    </Button>
  );
}

export default function Layout({ children }: { children: ReactNode }) {
  const location = useLocation();
  const isMobile = useIsMobile();

  const currentTitle = navItems.find(n => n.path === location.pathname)?.label || 'Akuntansi LKS';

  return (
    <div className="min-h-screen flex">
      {/* Desktop Sidebar */}
      {!isMobile && (
        <aside className="w-64 bg-sidebar text-sidebar-foreground border-r border-sidebar-border flex flex-col fixed h-full z-30">
          <div className="p-6 border-b border-sidebar-border">
            <h1 className="text-xl font-bold text-sidebar-primary">📊 Akuntansi LKS</h1>
            <p className="text-xs text-sidebar-foreground/60 mt-1">Sistem Perhitungan Modern</p>
          </div>
          <nav className="flex-1 p-4 space-y-1">
            {navItems.map(item => {
              const active = location.pathname === item.path;
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors touch-target ${
                    active
                      ? 'bg-sidebar-accent text-sidebar-primary font-semibold'
                      : 'text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-foreground'
                  }`}
                >
                  <item.icon className="h-5 w-5" />
                  {item.label}
                </Link>
              );
            })}
          </nav>
          <div className="p-4 border-t border-sidebar-border">
            <ThemeToggle />
          </div>
        </aside>
      )}

      {/* Main Content */}
      <main className={`flex-1 ${!isMobile ? 'ml-64' : ''} ${isMobile ? 'pb-20' : ''}`}>
        {/* Sticky Header */}
        <header className="sticky top-0 z-20 bg-background/80 backdrop-blur-lg border-b border-border px-4 md:px-8 py-4 flex items-center justify-between">
          <h2 className="text-lg font-bold">{currentTitle}</h2>
          {isMobile && <ThemeToggle />}
        </header>

        <div className="p-4 md:p-8 max-w-6xl mx-auto">
          {children}
        </div>
      </main>

      {/* Mobile Bottom Navigation */}
      {isMobile && (
        <nav className="fixed bottom-0 left-0 right-0 z-30 bg-background/95 backdrop-blur-lg border-t border-border flex justify-around py-2 px-2 safe-area-bottom">
          {navItems.map(item => {
            const active = location.pathname === item.path;
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex flex-col items-center gap-1 px-4 py-2 rounded-xl transition-colors touch-target ${
                  active
                    ? 'text-primary'
                    : 'text-muted-foreground'
                }`}
              >
                <item.icon className={`h-5 w-5 ${active ? 'stroke-[2.5]' : ''}`} />
                <span className="text-[10px] font-medium">{item.label}</span>
              </Link>
            );
          })}
        </nav>
      )}
    </div>
  );
}
