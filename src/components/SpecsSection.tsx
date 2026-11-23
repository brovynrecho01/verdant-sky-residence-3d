import { useState } from 'react';
import {
  ArrowUpRight,
  Compass,
  Dumbbell,
  ShieldCheck,
  TrainFront,
  Waves,
  Wifi,
} from 'lucide-react';
import type { ZoneId } from '../data/tourData';

interface SpecsSectionProps {
  onJumpToZone: (zoneId: ZoneId) => void;
}

const MATERIALS = [
  {
    name: 'Light Oak Herringbone',
    detail: 'Lantai kayu engineered pola herringbone hangat di seluruh area kering',
    swatch: '#C7A984',
  },
  {
    name: 'Matte Limewash (#F5F2EB)',
    detail: 'Pelapis dinding mineral bertekstur halus yang memantulkan cahaya lembut',
    swatch: '#F5F2EB',
  },
  {
    name: 'Calacatta Marble & Travertine',
    detail: 'Permukaan meja dapur dan dining island berbahan batu alam tahan panas',
    swatch: '#DFD6C7',
  },
  {
    name: 'Sanitary Brushed Brass',
    detail: 'Keran, aksen cermin, dan perangkat kamar mandi bernuansa kuningan satin',
    swatch: '#A88B68',
  },
  {
    name: 'Double-Glazed Acoustic Glass',
    detail: 'Kaca berlapis ganda peredam bising lalu lintas sekaligus penahan radiasi panas',
    swatch: '#CBD5E1',
  },
];

const FACILITIES = [
  { icon: Waves, label: 'Infinity Sky Pool' },
  { icon: Dumbbell, label: 'Private Resident Gym' },
  { icon: Wifi, label: 'Co-Working Lounge' },
  { icon: ShieldCheck, label: '24/7 Smart Access Security' },
  { icon: TrainFront, label: '3 Menit Jalan Kaki ke Stasiun MRT' },
];

export function SpecsSection({ onJumpToZone }: SpecsSectionProps) {
  const [hoveredZone, setHoveredZone] = useState<ZoneId | null>(null);

  return (
    <section
      id="spesifikasi"
      className="relative z-10 border-t border-stone-300/70 bg-[#F5F2EB] py-24 sm:py-32"
    >
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        {/* Editorial Section Header — No Panels */}
        <div data-reveal className="max-w-3xl">
          <p className="inline-flex items-center gap-3 text-[11px] font-semibold tracking-[0.22em] uppercase text-[#8C7150]">
            <span className="h-px w-7 bg-[#A88B68]" />
            <span>Spesifikasi Teknis &amp; Fasilitas</span>
          </p>
          <h2 className="font-display mt-4 text-4xl sm:text-5xl lg:text-[3.4rem] font-medium leading-[1.08] tracking-tight text-[#18181B]">
            Dirancang untuk Kenyamanan Harian dan Nilai Investasi Jangka Panjang.
          </h2>
          <p className="mt-5 text-sm sm:text-base leading-relaxed text-stone-600">
            Detail teknis unit Tipe 1-Bedroom Signature (Concept Demo):
          </p>
        </div>

        {/* 01 · Open Architectural Metric Strip (No Bento Box) */}
        <div
          data-reveal
          className="mt-14 grid grid-cols-1 gap-8 border-y border-stone-300/75 py-10 sm:grid-cols-3 sm:divide-x sm:divide-stone-300/75 sm:gap-0"
        >
          <div className="sm:pr-8">
            <p className="text-[11px] font-semibold tracking-[0.18em] uppercase text-[#8C7150]">
              01 · Luas Semi-Gross
            </p>
            <p className="font-display mt-2 text-5xl sm:text-6xl font-medium text-[#18181B]">
              48 <span className="text-2xl text-stone-500">m²</span>
            </p>
            <p className="mt-2 text-xs text-stone-500">Proporsi ruang linear 4,5m × 11m</p>
          </div>

          <div className="sm:px-8">
            <p className="text-[11px] font-semibold tracking-[0.18em] uppercase text-[#8C7150]">
              Tinggi Plafon
            </p>
            <p className="font-display mt-2 text-5xl sm:text-6xl font-medium text-[#18181B]">
              3,2 <span className="text-2xl text-stone-500">m</span>
            </p>
            <p className="mt-2 text-xs text-stone-500">Sirkulasi udara lega &amp; cahaya alami penuh</p>
          </div>

          <div className="sm:pl-8">
            <p className="text-[11px] font-semibold tracking-[0.18em] uppercase text-[#8C7150]">
              Orientasi Pandangan
            </p>
            <p className="font-display mt-2 text-3xl sm:text-4xl font-medium leading-tight text-[#18181B]">
              City Skyline View
            </p>
            <p className="mt-2.5 inline-flex items-center gap-1.5 text-xs text-stone-600">
              <Compass className="h-3.5 w-3.5 text-[#A88B68]" />
              <span>Balkon pribadi kedalaman 1,5 meter</span>
            </p>
          </div>
        </div>

        {/* 02 & 03 · Open Two-Column Editorial Lists (No Cards / No Panels) */}
        <div className="mt-16 grid grid-cols-1 gap-14 lg:grid-cols-12 lg:gap-16">
          {/* 02 · Material Japandi Modern Luxury */}
          <div data-reveal className="lg:col-span-7">
            <p className="text-[11px] font-semibold tracking-[0.2em] uppercase text-[#8C7150]">
              02 · Material Japandi Modern Luxury
            </p>

            <div className="mt-6 divide-y divide-stone-300/70">
              {MATERIALS.map((mat) => (
                <div
                  key={mat.name}
                  className="flex items-start gap-4 py-4 first:pt-0 last:pb-0"
                >
                  <span
                    className="mt-1.5 h-3.5 w-3.5 shrink-0 rounded-full border border-stone-400/70"
                    style={{ backgroundColor: mat.swatch }}
                    aria-hidden="true"
                  />
                  <div>
                    <h3 className="text-sm sm:text-[15px] font-semibold text-[#18181B]">
                      {mat.name}
                    </h3>
                    <p className="mt-1 text-xs sm:text-[13px] leading-relaxed text-stone-600">
                      {mat.detail}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* 03 · Fasilitas Gedung */}
          <div
            data-reveal
            className="lg:col-span-5 lg:border-l lg:border-stone-300/75 lg:pl-12 flex flex-col justify-between"
          >
            <div>
              <p className="text-[11px] font-semibold tracking-[0.2em] uppercase text-[#8C7150]">
                03 · Fasilitas Gedung
              </p>

              <h3 className="font-display mt-4 text-3xl sm:text-[2.1rem] font-medium leading-[1.15] text-[#18181B]">
                Eksklusivitas Hunian Vertikal dengan Konektivitas Pusat Kota.
              </h3>

              <ul className="mt-7 divide-y divide-stone-300/70">
                {FACILITIES.map(({ icon: Icon, label }) => (
                  <li
                    key={label}
                    className="flex items-center gap-3.5 py-3.5 first:pt-0 last:pb-0 text-sm text-[#27272A]"
                  >
                    <Icon className="h-4 w-4 shrink-0 text-[#A88B68]" />
                    <span className="font-medium">{label}</span>
                  </li>
                ))}
              </ul>
            </div>

            <p className="mt-8 text-[11px] leading-relaxed text-stone-500">
              *Fasilitas gedung merupakan representasi konsep arsitektur untuk kebutuhan Concept
              Demo Verdant Sky Residence Tower A.
            </p>
          </div>
        </div>

        {/* 04 · Seamless 2D Schematic Floorplan SVG (Frameless Directly on Canvas) */}
        <div
          data-reveal
          className="mt-20 border-t border-stone-300/75 pt-14"
        >
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <p className="text-[11px] font-semibold tracking-[0.2em] uppercase text-[#8C7150]">
                04 · Denah Skematik 2D (Linear Flow 4,5m × 11m)
              </p>
              <p className="mt-1.5 text-xs sm:text-sm text-stone-600">
                Klik zona ruangan pada denah untuk melompat langsung ke tampilan 3D-nya.
              </p>
            </div>
            <button
              type="button"
              onClick={() => onJumpToZone('foyer')}
              className="inline-flex items-center gap-1.5 border-b border-[#18181B]/60 pb-1 text-xs font-semibold tracking-wide text-[#18181B] hover:border-[#8C7150] hover:text-[#8C7150] transition-colors cursor-pointer"
            >
              <span>Kembali ke Tur 3D</span>
              <ArrowUpRight className="h-3.5 w-3.5" />
            </button>
          </div>

          <div className="mt-8 w-full overflow-x-auto">
            <svg
              viewBox="0 0 740 270"
              className="w-full min-w-[540px] h-auto select-none"
              role="img"
              aria-label="Denah skematik 2D linear dari Foyer menuju Kitchen, Living, Bedroom, En-Suite Bathroom, hingga Private Sky Balcony"
            >
              {/* Dimension callouts */}
              <line x1="40" y1="242" x2="695" y2="242" stroke="#A88B68" strokeWidth="1" />
              <line x1="40" y1="237" x2="40" y2="247" stroke="#A88B68" strokeWidth="1" />
              <line x1="695" y1="237" x2="695" y2="247" stroke="#A88B68" strokeWidth="1" />
              <text
                x="367"
                y="258"
                textAnchor="middle"
                className="fill-stone-500 text-[10px] font-medium"
              >
                PANJANG UNIT 11,0 M (ALUR RUANG LINEAR)
              </text>

              {/* Zone 01: Entrance Foyer */}
              <g
                onClick={() => onJumpToZone('foyer')}
                onMouseEnter={() => setHoveredZone('foyer')}
                onMouseLeave={() => setHoveredZone(null)}
                className="cursor-pointer transition-opacity"
              >
                <rect
                  x="40"
                  y="88"
                  width="115"
                  height="132"
                  fill={hoveredZone === 'foyer' ? '#E7DEC9' : 'transparent'}
                  stroke="#18181B"
                  strokeWidth="1.4"
                />
                <path
                  d="M 40 165 A 30 30 0 0 1 70 195"
                  fill="none"
                  stroke="#A88B68"
                  strokeWidth="1.2"
                  strokeDasharray="3 2"
                />
                <line x1="40" y1="195" x2="70" y2="195" stroke="#18181B" strokeWidth="1.4" />
                <text x="97" y="136" textAnchor="middle" className="fill-[#8C7150] text-[10px] font-bold">
                  01
                </text>
                <text x="97" y="152" textAnchor="middle" className="fill-[#18181B] text-[11px] font-semibold">
                  Foyer
                </text>
                <text x="97" y="167" textAnchor="middle" className="fill-stone-500 text-[9px]">
                  Smart Lock
                </text>
              </g>

              {/* Zone 02: Kitchen & Island */}
              <g
                onClick={() => onJumpToZone('kitchen')}
                onMouseEnter={() => setHoveredZone('kitchen')}
                onMouseLeave={() => setHoveredZone(null)}
                className="cursor-pointer"
              >
                <rect
                  x="155"
                  y="88"
                  width="145"
                  height="132"
                  fill={hoveredZone === 'kitchen' ? '#E7DEC9' : 'transparent'}
                  stroke="#18181B"
                  strokeWidth="1.4"
                />
                <rect x="163" y="94" width="128" height="22" fill="none" stroke="#A88B68" strokeWidth="1" />
                <rect x="186" y="142" width="84" height="30" rx="2" fill="none" stroke="#18181B" strokeWidth="1.1" />
                <text x="228" y="160" textAnchor="middle" className="fill-[#18181B] text-[10px] font-semibold">
                  02 · Kitchen
                </text>
                <text x="228" y="198" textAnchor="middle" className="fill-stone-500 text-[9px]">
                  Travertine Island
                </text>
              </g>

              {/* Zone 03: Open-Plan Living */}
              <g
                onClick={() => onJumpToZone('living')}
                onMouseEnter={() => setHoveredZone('living')}
                onMouseLeave={() => setHoveredZone(null)}
                className="cursor-pointer"
              >
                <rect
                  x="300"
                  y="88"
                  width="165"
                  height="132"
                  fill={hoveredZone === 'living' ? '#E7DEC9' : 'transparent'}
                  stroke="#18181B"
                  strokeWidth="1.4"
                />
                <rect x="318" y="114" width="32" height="72" rx="3" fill="none" stroke="#78716C" strokeWidth="1" />
                <ellipse cx="386" cy="150" rx="16" ry="22" fill="none" stroke="#A88B68" strokeWidth="1" />
                <line x1="308" y1="220" x2="458" y2="220" stroke="#A88B68" strokeWidth="3.5" />
                <text x="386" y="148" textAnchor="middle" className="fill-[#8C7150] text-[10px] font-bold">
                  03
                </text>
                <text x="386" y="162" textAnchor="middle" className="fill-[#18181B] text-[11px] font-semibold">
                  Living
                </text>
                <text x="386" y="210" textAnchor="middle" className="fill-stone-500 text-[9px]">
                  Acoustic Window
                </text>
              </g>

              {/* Zone 05: En-Suite Bathroom Alcove */}
              <g
                onClick={() => onJumpToZone('bathroom')}
                onMouseEnter={() => setHoveredZone('bathroom')}
                onMouseLeave={() => setHoveredZone(null)}
                className="cursor-pointer"
              >
                <rect
                  x="465"
                  y="18"
                  width="125"
                  height="70"
                  fill={hoveredZone === 'bathroom' ? '#E7DEC9' : 'transparent'}
                  stroke="#18181B"
                  strokeWidth="1.4"
                />
                <line x1="512" y1="20" x2="512" y2="66" stroke="#A88B68" strokeWidth="1.2" strokeDasharray="3 2" />
                <text x="528" y="48" textAnchor="middle" className="fill-[#8C7150] text-[10px] font-bold">
                  05
                </text>
                <text x="528" y="63" textAnchor="middle" className="fill-[#18181B] text-[10px] font-semibold">
                  En-Suite Bath
                </text>
              </g>

              {/* Zone 04: Master Bedroom */}
              <g
                onClick={() => onJumpToZone('bedroom')}
                onMouseEnter={() => setHoveredZone('bedroom')}
                onMouseLeave={() => setHoveredZone(null)}
                className="cursor-pointer"
              >
                <rect
                  x="465"
                  y="88"
                  width="135"
                  height="132"
                  fill={hoveredZone === 'bedroom' ? '#E7DEC9' : 'transparent'}
                  stroke="#18181B"
                  strokeWidth="1.4"
                />
                <line
                  x1="465"
                  y1="130"
                  x2="465"
                  y2="220"
                  stroke="#A88B68"
                  strokeWidth="3.5"
                  strokeDasharray="4 3"
                />
                <rect x="504" y="118" width="76" height="68" rx="3" fill="none" stroke="#78716C" strokeWidth="1" />
                <rect x="480" y="200" width="106" height="14" fill="none" stroke="#A88B68" strokeWidth="0.9" />
                <text x="542" y="148" textAnchor="middle" className="fill-[#8C7150] text-[10px] font-bold">
                  04
                </text>
                <text x="542" y="163" textAnchor="middle" className="fill-[#18181B] text-[11px] font-semibold">
                  Bedroom
                </text>
              </g>

              {/* Zone 06: Private Sky Balcony */}
              <g
                onClick={() => onJumpToZone('balcony')}
                onMouseEnter={() => setHoveredZone('balcony')}
                onMouseLeave={() => setHoveredZone(null)}
                className="cursor-pointer"
              >
                <rect
                  x="600"
                  y="88"
                  width="95"
                  height="132"
                  fill={hoveredZone === 'balcony' ? '#E7DEC9' : 'transparent'}
                  stroke="#18181B"
                  strokeWidth="1.4"
                />
                <line x1="600" y1="96" x2="600" y2="212" stroke="#0EA5E9" strokeOpacity="0.45" strokeWidth="3" />
                <line x1="695" y1="88" x2="695" y2="220" stroke="#A88B68" strokeWidth="3" strokeDasharray="6 3" />
                <text x="647" y="146" textAnchor="middle" className="fill-[#8C7150] text-[10px] font-bold">
                  06
                </text>
                <text x="647" y="161" textAnchor="middle" className="fill-[#18181B] text-[11px] font-semibold">
                  Balcony
                </text>
                <text x="647" y="176" textAnchor="middle" className="fill-stone-500 text-[9px]">
                  Skyline →
                </text>
              </g>

              {/* Linear Flow Arrows */}
              <path
                d="M 146 112 L 162 112 M 292 112 L 308 112 M 456 108 L 474 108 M 592 112 L 608 112"
                stroke="#A88B68"
                strokeWidth="1.5"
                strokeLinecap="round"
              />
            </svg>
          </div>

          <p className="mt-4 text-xs text-stone-500">
            Alur linear: Foyer → Kitchen → Living → Bedroom / Bathroom → Sky Balcony
          </p>
        </div>
      </div>
    </section>
  );
}
