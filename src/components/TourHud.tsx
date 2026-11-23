import { useState } from 'react';
import {
  ArrowDown,
  ArrowLeft,
  Camera,
  ChevronDown,
  ChevronUp,
  FileText,
  Moon,
  Sun,
} from 'lucide-react';
import {
  TOUR_ZONES,
  type SubViewId,
  type TourZone,
  type ZoneId,
} from '../data/tourData';

interface TourHudProps {
  activeZone: TourZone;
  activeSubView: SubViewId;
  showHero: boolean;
  isEvening: boolean;
  onToggleAtmosphere: () => void;
  onStartTour: () => void;
  onRequestBrochure: () => void;
  onSelectZone: (zoneId: ZoneId) => void;
  onSelectSubView: (subView: SubViewId) => void;
}

export function TourHud({
  activeZone,
  activeSubView,
  showHero,
  isEvening,
  onToggleAtmosphere,
  onStartTour,
  onRequestBrochure,
  onSelectZone,
  onSelectSubView,
}: TourHudProps) {
  const [mobileCardExpanded, setMobileCardExpanded] = useState(true);

  const legibleClass = isEvening ? 'text-legible-night' : 'text-legible-day';

  return (
    <div className="pointer-events-none absolute inset-0 z-20 flex flex-col justify-between pt-20 pb-5 sm:pb-7 px-4 sm:px-6 lg:px-8">
      {/* Seamless, borderless atmospheric vignette so frameless typography stays effortlessly legible over 3D */}
      <div
        aria-hidden="true"
        className={`pointer-events-none absolute inset-0 -z-10 transition-opacity duration-700 ${
          isEvening
            ? 'bg-gradient-to-tr from-[#0F172A]/82 via-[#0F172A]/35 to-transparent'
            : 'bg-gradient-to-tr from-[#F5F2EB]/82 via-[#F5F2EB]/32 to-transparent'
        }`}
      />
      <div
        aria-hidden="true"
        className={`pointer-events-none absolute inset-x-0 bottom-0 h-44 -z-10 transition-opacity duration-700 ${
          isEvening
            ? 'bg-gradient-to-t from-[#0F172A]/75 via-[#0F172A]/25 to-transparent'
            : 'bg-gradient-to-t from-[#F5F2EB]/78 via-[#F5F2EB]/25 to-transparent'
        }`}
      />

      {/* Top Row: Frameless Editorial Guide Hint (Top-Left) + Atmosphere Toggle (Top-Right) */}
      <div className="mx-auto flex w-full max-w-7xl items-center justify-between gap-3">
        <span
          className={`hidden md:inline-flex items-center gap-2.5 text-[11px] font-medium tracking-[0.08em] transition-colors duration-500 ${legibleClass} ${
            isEvening ? 'text-stone-200/90' : 'text-[#3F3F46]'
          }`}
        >
          <span>Scroll perlahan</span>
          <span className="h-1 w-1 rounded-full bg-[#A88B68]" />
          <span>Klik (+) untuk detail material</span>
        </span>
        <div className="md:hidden" />

        <button
          type="button"
          onClick={onToggleAtmosphere}
          aria-pressed={isEvening}
          className={`pointer-events-auto inline-flex items-center gap-2 rounded-full border px-3.5 py-2 text-xs font-medium tracking-wide transition-all duration-300 cursor-pointer ${
            isEvening
              ? 'border-white/25 bg-[#0F172A]/45 text-[#F5F2EB] hover:bg-[#0F172A]/70 backdrop-blur-xs'
              : 'border-[#18181B]/20 bg-[#F5F2EB]/55 text-[#18181B] hover:bg-[#F5F2EB]/85 backdrop-blur-xs'
          }`}
        >
          {isEvening ? (
            <>
              <Moon className="h-3.5 w-3.5 text-[#FDE68A]" />
              <span>Evening Mood</span>
              <span className="ml-1 text-[10px] opacity-75">· Siang</span>
            </>
          ) : (
            <>
              <Sun className="h-3.5 w-3.5 text-[#8C7150]" />
              <span>Daylight</span>
              <span className="ml-1 text-[10px] opacity-70">· Malam</span>
            </>
          )}
        </button>
      </div>

      {/* Center / Hero Typography — 100% Frameless, positioned independently so hidden Hero never pushes Zone Copy down */}
      <div
        className={`pointer-events-none absolute inset-0 flex items-center px-4 sm:px-6 lg:px-8 transition-all duration-700 ease-out ${
          showHero
            ? 'opacity-100 translate-y-0 blur-0'
            : 'opacity-0 -translate-y-6 blur-[4px]'
        }`}
        aria-hidden={!showHero}
      >
        <div
          className={`mx-auto w-full max-w-7xl transition-colors duration-500 ${
            isEvening ? 'text-[#F5F2EB]' : 'text-[#18181B]'
          }`}
        >
          <div className={`max-w-xl ${showHero ? 'pointer-events-auto' : 'pointer-events-none'}`}>
          <p
            className={`animate-cinematic-enter text-[10px] sm:text-[11px] font-semibold tracking-[0.22em] uppercase ${legibleClass} ${
              isEvening ? 'text-[#DFC39F]' : 'text-[#8C7150]'
            }`}
          >
            CONCEPT DEMO · 1-BEDROOM JAPANDI MODERN LUXURY · 48 M²
          </p>

          <h1
            className={`animate-cinematic-enter font-display mt-4 text-4xl sm:text-5xl lg:text-[3.4rem] font-medium leading-[1.08] tracking-tight ${legibleClass}`}
            style={{ animationDelay: '90ms' }}
          >
            Di Tengah Ritme Jakarta yang Cepat, Pulang Seharusnya Terasa Seperti Menghela Napas.
          </h1>

          <p
            className={`animate-cinematic-enter mt-5 max-w-lg text-sm sm:text-[15px] leading-relaxed ${legibleClass} ${
              isEvening ? 'text-stone-200' : 'text-[#27272A]'
            }`}
            style={{ animationDelay: '180ms' }}
          >
            Unit 1-Bedroom seluas 48 m² dengan tinggi plafon 3,2 meter dan pencahayaan alami penuh.
            Rasakan langsung alur ruangnya lewat tur virtual 3D. Cukup scroll perlahan dari pintu
            masuk hingga ke balkon pribadi Anda.
          </p>

          <div
            className="animate-cinematic-enter mt-7 flex flex-wrap items-center gap-3.5"
            style={{ animationDelay: '260ms' }}
          >
            <button
              type="button"
              onClick={onStartTour}
              className={`inline-flex items-center gap-2 rounded-full px-6 py-3 text-xs sm:text-sm font-medium tracking-wide transition-all cursor-pointer ${
                isEvening
                  ? 'bg-[#F5F2EB] !text-[#18181B] hover:bg-white'
                  : 'bg-[#18181B] !text-[#F5F2EB] hover:bg-[#2C2C30]'
              }`}
            >
              <span>Mulai Tur Unit</span>
              <ArrowDown className="h-4 w-4" />
            </button>

            <button
              type="button"
              onClick={onRequestBrochure}
              className={`inline-flex items-center gap-2 border-b pb-1.5 pt-1 text-xs sm:text-sm font-medium tracking-wide transition-all cursor-pointer ${legibleClass} ${
                isEvening
                  ? 'border-[#DFC39F]/70 text-[#F5F2EB] hover:border-white'
                  : 'border-[#18181B]/60 text-[#18181B] hover:border-[#8C7150] hover:text-[#8C7150]'
              }`}
            >
              <FileText className="h-4 w-4 text-[#A88B68]" />
              <span>Minta E-Brochure &amp; Pricelist</span>
            </button>
          </div>

          <p
            className={`animate-cinematic-enter mt-6 text-[11px] tracking-wide ${legibleClass} ${
              isEvening ? 'text-stone-300/90' : 'text-[#52525B]'
            }`}
            style={{ animationDelay: '340ms' }}
          >
            Scroll perlahan untuk melangkah masuk · Klik ikon (+) untuk detail material
          </p>
          </div>
        </div>
      </div>

      {/* Bottom Area: Proportional Left-Aligned Storytelling Copy + Camera Angle Sub-View Pills + Room Stepper */}
      <div className="mx-auto mt-auto flex w-full max-w-7xl flex-col gap-5">
        {!showHero && (
          <div className="mb-20 sm:mb-28 lg:mb-36 flex items-end justify-start">
            <div
              key={activeZone.id}
              className={`pointer-events-auto w-full max-w-lg transition-colors duration-500 ${
                isEvening ? 'text-[#F5F2EB]' : 'text-[#18181B]'
              }`}
            >
              {/* Eyebrow Row + Mobile Collapse Toggle */}
              <div className="animate-cinematic-enter flex items-center justify-between gap-3">
                <span
                  className={`inline-flex items-center gap-2.5 text-[10px] sm:text-[11px] font-semibold tracking-[0.22em] uppercase ${legibleClass} ${
                    isEvening ? 'text-[#DFC39F]' : 'text-[#8C7150]'
                  }`}
                >
                  <span className="h-px w-6 bg-[#A88B68]" />
                  <span>{activeZone.eyebrow}</span>
                </span>

                <button
                  type="button"
                  onClick={() => setMobileCardExpanded((v) => !v)}
                  aria-label={mobileCardExpanded ? 'Ringkas narasi ruang' : 'Tampilkan narasi ruang'}
                  className={`inline-flex sm:hidden h-7 w-7 items-center justify-center rounded-full cursor-pointer ${
                    isEvening ? 'text-stone-200' : 'text-stone-700'
                  }`}
                >
                  {mobileCardExpanded ? (
                    <ChevronDown className="h-4 w-4" />
                  ) : (
                    <ChevronUp className="h-4 w-4" />
                  )}
                </button>
              </div>

              <div className={mobileCardExpanded ? 'block' : 'hidden sm:block'}>
                <h2
                  className={`animate-cinematic-enter font-display mt-2.5 text-2xl sm:text-3xl lg:text-[2.15rem] font-medium leading-[1.15] tracking-tight ${legibleClass}`}
                  style={{ animationDelay: '80ms' }}
                >
                  {activeZone.title}
                </h2>
                <p
                  className={`animate-cinematic-enter mt-2.5 text-xs sm:text-[14px] leading-relaxed ${legibleClass} ${
                    isEvening ? 'text-stone-200' : 'text-[#27272A]'
                  }`}
                  style={{ animationDelay: '160ms' }}
                >
                  {activeZone.body}
                </p>

                {/* Interactive Camera Angle Sub-View Pills & Reset Trigger */}
                {(activeZone.subViews?.length || activeSubView || (activeZone.id === 'balcony' && !isEvening)) && (
                  <div
                    className="animate-cinematic-enter mt-4 flex flex-wrap items-center gap-2.5"
                    style={{ animationDelay: '220ms' }}
                  >
                    {activeZone.subViews?.map((sv) => {
                      const isActiveAngle = activeSubView === sv.id;
                      return (
                        <button
                          key={sv.id}
                          type="button"
                          onClick={() =>
                            onSelectSubView(isActiveAngle ? null : sv.id)
                          }
                          style={
                            isActiveAngle
                              ? { color: isEvening ? '#18181B' : '#F5F2EB' }
                              : undefined
                          }
                          className={`inline-flex items-center gap-1.5 rounded-full border px-3.5 py-1.5 text-[11px] sm:text-xs font-medium tracking-wide transition-all cursor-pointer ${
                            isActiveAngle
                              ? isEvening
                                ? 'border-[#F5F2EB] bg-[#F5F2EB] text-[#18181B]'
                                : 'border-[#18181B] bg-[#18181B] text-[#F5F2EB]'
                              : isEvening
                                ? 'border-white/30 bg-[#0F172A]/40 text-[#F5F2EB] hover:border-[#DFC39F] hover:text-[#DFC39F] backdrop-blur-xs'
                                : 'border-[#18181B]/25 bg-[#F5F2EB]/55 text-[#18181B] hover:border-[#18181B] hover:bg-[#F5F2EB]/85 backdrop-blur-xs'
                          }`}
                        >
                          <Camera className="h-3 w-3 shrink-0 opacity-80" />
                          <span>{sv.label}</span>
                        </button>
                      );
                    })}

                    {activeSubView && (
                      <button
                        type="button"
                        onClick={() => onSelectSubView(null)}
                        className={`inline-flex items-center gap-1.5 border-b pb-1 text-[11px] sm:text-xs font-semibold tracking-wide transition-colors cursor-pointer ${legibleClass} ${
                          isEvening
                            ? 'border-[#DFC39F] text-[#DFC39F] hover:border-white hover:text-white'
                            : 'border-[#8C7150] text-[#8C7150] hover:border-[#18181B] hover:text-[#18181B]'
                        }`}
                      >
                        <ArrowLeft className="h-3.5 w-3.5" />
                        <span>Kembali ke Tur Scroll</span>
                      </button>
                    )}

                    {activeZone.id === 'balcony' && !isEvening && (
                      <button
                        type="button"
                        onClick={onToggleAtmosphere}
                        className={`inline-flex items-center gap-1.5 border-b border-[#18181B]/60 pb-1 text-[11px] sm:text-xs font-semibold tracking-wide text-[#18181B] hover:border-[#8C7150] hover:text-[#8C7150] transition-colors cursor-pointer ${legibleClass}`}
                      >
                        <Moon className="h-3.5 w-3.5 text-[#8C7150]" />
                        <span>Mode Malam</span>
                      </button>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Bottom Room Stepper — Clean Frameless Typographic Tabs with Architectural Underline */}
        <div className="flex items-center justify-start">
          <div
            role="tablist"
            aria-label="Navigasi zona ruangan 3D"
            className="pointer-events-auto no-scrollbar flex max-w-full items-center gap-4 sm:gap-6 overflow-x-auto pb-1"
          >
            {TOUR_ZONES.map((zone) => {
              const isActive = activeZone.id === zone.id;
              return (
                <button
                  key={zone.id}
                  role="tab"
                  type="button"
                  aria-selected={isActive}
                  onClick={() => onSelectZone(zone.id)}
                  className={`group relative flex shrink-0 items-baseline gap-1.5 pb-1.5 text-[11px] sm:text-xs font-medium tracking-wide transition-all cursor-pointer ${legibleClass} ${
                    isActive
                      ? isEvening
                        ? 'text-[#F5F2EB]'
                        : 'text-[#18181B]'
                      : isEvening
                        ? 'text-stone-400 hover:text-[#F5F2EB]'
                        : 'text-stone-600 hover:text-[#18181B]'
                  }`}
                >
                  <span
                    className={`text-[10px] font-semibold tabular-nums ${
                      isActive
                        ? isEvening
                          ? 'text-[#DFC39F]'
                          : 'text-[#8C7150]'
                        : 'opacity-65'
                    }`}
                  >
                    {zone.indexLabel}
                  </span>
                  <span>{zone.shortLabel}</span>
                  <span
                    className={`absolute inset-x-0 bottom-0 h-[1.5px] transition-all duration-300 ${
                      isActive
                        ? isEvening
                          ? 'bg-[#DFC39F] opacity-100'
                          : 'bg-[#18181B] opacity-100'
                        : 'bg-transparent opacity-0 group-hover:bg-[#A88B68]/50 group-hover:opacity-100'
                    }`}
                  />
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
