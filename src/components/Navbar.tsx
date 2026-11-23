import { useState } from 'react';
import { Menu, X } from 'lucide-react';

interface NavbarProps {
  onNavigate: (target: 'tour' | 'spesifikasi' | 'simulasi-kpa' | 'kontak') => void;
  isEvening: boolean;
  isOver3D: boolean;
}

const NAV_LINKS: { label: string; target: 'tour' | 'spesifikasi' | 'simulasi-kpa' | 'kontak' }[] = [
  { label: 'Tur Unit', target: 'tour' },
  { label: 'Spesifikasi', target: 'spesifikasi' },
  { label: 'Simulasi KPA', target: 'simulasi-kpa' },
  { label: 'Jadwalkan Kunjungan', target: 'kontak' },
];

export function Navbar({ onNavigate, isEvening, isOver3D }: NavbarProps) {
  const [mobileOpen, setMobileOpen] = useState(false);

  const darkSurface = isOver3D && isEvening;

  const handleLinkClick = (target: 'tour' | 'spesifikasi' | 'simulasi-kpa' | 'kontak') => {
    setMobileOpen(false);
    onNavigate(target);
  };

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-40 transition-all duration-500 ${
        isOver3D
          ? darkSurface
            ? 'bg-gradient-to-b from-[#0F172A]/70 via-[#0F172A]/30 to-transparent text-[#F5F2EB]'
            : 'bg-gradient-to-b from-[#F5F2EB]/75 via-[#F5F2EB]/30 to-transparent text-[#18181B]'
          : 'border-b border-stone-300/70 bg-[#F5F2EB]/92 text-[#18181B] backdrop-blur-md'
      }`}
    >
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Brand + Concept Demo Label */}
        <button
          type="button"
          onClick={() => handleLinkClick('tour')}
          className="flex items-center gap-3 text-left cursor-pointer group"
        >
          <span className="font-display text-lg sm:text-xl font-semibold tracking-[0.08em] leading-none">
            VERDANT SKY RESIDENCE
          </span>
          <span
            className={`hidden sm:inline-flex items-center text-[9px] font-semibold tracking-[0.2em] uppercase transition-colors ${
              darkSurface ? 'text-[#DFC39F]' : 'text-[#8C7150]'
            }`}
          >
            · Concept Demo
          </span>
        </button>

        {/* Desktop Center Links */}
        <nav className="hidden lg:flex items-center gap-7" aria-label="Navigasi utama">
          {NAV_LINKS.map((item) => (
            <button
              key={item.target}
              type="button"
              onClick={() => handleLinkClick(item.target)}
              className={`text-xs font-medium tracking-wide transition-colors cursor-pointer ${
                darkSurface
                  ? 'text-stone-300 hover:text-white'
                  : 'text-stone-600 hover:text-[#18181B]'
              }`}
            >
              {item.label}
            </button>
          ))}
        </nav>

        {/* Right CTA + Mobile Menu Button */}
        <div className="flex items-center gap-2.5">
          <button
            type="button"
            onClick={() => handleLinkClick('kontak')}
            className={`hidden sm:inline-flex items-center justify-center rounded-full px-4 py-2 text-xs font-semibold tracking-wide transition-all cursor-pointer ${
              darkSurface
                ? 'bg-[#F5F2EB] !text-[#18181B] hover:bg-white'
                : 'bg-[#18181B] !text-[#F5F2EB] hover:bg-[#2E2E33]'
            }`}
          >
            Tanya Ketersediaan
          </button>

          <button
            type="button"
            onClick={() => setMobileOpen((prev) => !prev)}
            aria-label={mobileOpen ? 'Tutup menu' : 'Buka menu'}
            className={`inline-flex h-9 w-9 items-center justify-center rounded-full border lg:hidden cursor-pointer ${
              darkSurface
                ? 'border-white/15 text-[#F5F2EB]'
                : 'border-stone-300 text-[#18181B]'
            }`}
          >
            {mobileOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
          </button>
        </div>
      </div>

      {/* Mobile Dropdown Drawer */}
      {mobileOpen && (
        <div
          className={`border-t px-4 py-4 lg:hidden ${
            darkSurface
              ? 'border-white/10 bg-[#0F172A]/95 text-[#F5F2EB]'
              : 'border-stone-200 bg-[#F5F2EB]/98 text-[#18181B]'
          }`}
        >
          <div className="mb-3 flex items-center gap-2 sm:hidden">
            <span className="rounded-full border border-[#A88B68]/40 bg-[#A88B68]/10 px-2.5 py-0.5 text-[10px] font-semibold tracking-[0.16em] uppercase text-[#A88B68]">
              Concept Demo · 48 m²
            </span>
          </div>
          <div className="flex flex-col gap-1">
            {NAV_LINKS.map((item) => (
              <button
                key={item.target}
                type="button"
                onClick={() => handleLinkClick(item.target)}
                className={`rounded-lg px-3 py-2.5 text-left text-sm font-medium transition-colors ${
                  darkSurface ? 'hover:bg-white/10' : 'hover:bg-stone-200/60'
                }`}
              >
                {item.label}
              </button>
            ))}
            <button
              type="button"
              onClick={() => handleLinkClick('kontak')}
              className="mt-2 rounded-full bg-[#18181B] px-4 py-2.5 text-center text-sm font-medium text-[#F5F2EB]"
            >
              Tanya Ketersediaan
            </button>
          </div>
        </div>
      )}
    </header>
  );
}
