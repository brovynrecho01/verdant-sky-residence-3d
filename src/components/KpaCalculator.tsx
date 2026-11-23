import { useMemo, useState } from 'react';
import { ArrowRight, Info } from 'lucide-react';
import { UNIT_OPTIONS, formatRupiah, type UnitOption } from '../data/tourData';

interface KpaCalculatorProps {
  onSendSimulation: (summaryText: string) => void;
}

const TENOR_OPTIONS = [5, 10, 15, 20] as const;
const ANNUAL_INTEREST_RATE = 5.5; // 5,5% p.a. (Fixed 3 Tahun Pertama — Estimasi Awal)

export function KpaCalculator({ onSendSimulation }: KpaCalculatorProps) {
  const [selectedUnit, setSelectedUnit] = useState<UnitOption>(UNIT_OPTIONS[1]); // Default 1-Bedroom 48 m²
  const [dpPercent, setDpPercent] = useState<number>(10);
  const [tenorYears, setTenorYears] = useState<number>(15);

  const calculation = useMemo(() => {
    const dpAmount = (selectedUnit.price * dpPercent) / 100;
    const principal = Math.max(0, selectedUnit.price - dpAmount);
    const monthlyRate = ANNUAL_INTEREST_RATE / 100 / 12;
    const totalMonths = tenorYears * 12;

    if (principal <= 0) {
      return { dpAmount, principal: 0, monthlyInstallment: 0 };
    }

    const factor = Math.pow(1 + monthlyRate, totalMonths);
    const monthlyInstallment = (principal * monthlyRate * factor) / (factor - 1);

    return {
      dpAmount,
      principal,
      monthlyInstallment,
    };
  }, [selectedUnit, dpPercent, tenorYears]);

  const handleSendToForm = () => {
    const summary = `Simulasi KPA ${selectedUnit.label} (${selectedUnit.priceLabel}) — DP ${dpPercent}% (${formatRupiah(
      calculation.dpAmount
    )}), Pokok Pinjaman ${formatRupiah(
      calculation.principal
    )}, Tenor ${tenorYears} Tahun, Bunga ${ANNUAL_INTEREST_RATE
      .toFixed(1)
      .replace('.', ',')}% p.a. → Estimasi Cicilan ${formatRupiah(
      calculation.monthlyInstallment
    )}/bulan.`;

    onSendSimulation(summary);
  };

  return (
    <section
      id="simulasi-kpa"
      className="relative z-10 border-t border-stone-300/70 bg-[#EAE6DF]/65 py-24 sm:py-32"
    >
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        {/* Editorial Header — Frameless */}
        <div data-reveal className="max-w-3xl">
          <p className="inline-flex items-center gap-3 text-[11px] font-semibold tracking-[0.22em] uppercase text-[#8C7150]">
            <span className="h-px w-7 bg-[#A88B68]" />
            <span>Simulasi KPA Interaktif</span>
          </p>
          <h2 className="font-display mt-4 text-4xl sm:text-5xl lg:text-[3.4rem] font-medium leading-[1.08] tracking-tight text-[#18181B]">
            Hitung Estimasi Cicilan Sesuai Rencana Keuangan Anda.
          </h2>
          <p className="mt-5 text-sm sm:text-base leading-relaxed text-stone-600">
            Geser persentase uang muka (DP) dan tenor untuk melihat gambaran angsuran bulanan secara
            transparan.
          </p>
        </div>

        {/* Open Two-Column Editorial Layout (Zero Card Panels) */}
        <div className="mt-14 grid grid-cols-1 gap-14 lg:grid-cols-12 lg:gap-16 border-t border-stone-300/75 pt-12">
          {/* Left Column: Open Interactive Controls */}
          <div data-reveal className="lg:col-span-7 space-y-10">
            {/* Unit Type Selection (Borderless Underline Tabs) */}
            <div>
              <label className="block text-[11px] font-semibold tracking-[0.18em] uppercase text-stone-500">
                Pilih Tipe Unit (Concept Pricing)
              </label>
              <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-6">
                {UNIT_OPTIONS.map((unit) => {
                  const isActive = unit.id === selectedUnit.id;
                  return (
                    <button
                      key={unit.id}
                      type="button"
                      onClick={() => setSelectedUnit(unit)}
                      className={`flex flex-col items-start border-b-2 pb-3.5 text-left transition-all cursor-pointer ${
                        isActive
                          ? 'border-[#18181B] text-[#18181B]'
                          : 'border-stone-300/90 text-stone-500 hover:border-[#A88B68] hover:text-[#18181B]'
                      }`}
                    >
                      <span
                        className={`text-xs font-medium tracking-wide ${
                          isActive ? 'text-[#8C7150]' : 'text-stone-500'
                        }`}
                      >
                        {unit.label}
                      </span>
                      <span className="font-display mt-1 text-2xl sm:text-3xl font-medium tabular-nums">
                        {unit.priceLabel}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* DP Slider */}
            <div>
              <div className="flex flex-wrap items-baseline justify-between gap-2">
                <label
                  htmlFor="kpa-dp-slider"
                  className="text-[11px] font-semibold tracking-[0.18em] uppercase text-stone-500"
                >
                  Uang Muka (DP)
                </label>
                <div className="flex items-baseline gap-3">
                  <span className="text-xs font-semibold tracking-wider text-[#8C7150] tabular-nums">
                    {dpPercent}%
                  </span>
                  <span className="font-display text-2xl font-medium text-[#18181B] tabular-nums">
                    {formatRupiah(calculation.dpAmount)}
                  </span>
                </div>
              </div>

              <input
                id="kpa-dp-slider"
                type="range"
                min={0}
                max={30}
                step={1}
                value={dpPercent}
                onChange={(e) => setDpPercent(Number(e.target.value))}
                className="japandi-slider mt-5 w-full"
              />
              <div className="mt-2.5 flex justify-between text-[11px] text-stone-500 tabular-nums">
                <span>0%</span>
                <span>10%</span>
                <span>20%</span>
                <span>30%</span>
              </div>
            </div>

            {/* Tenor Selection (Minimalist Underline Tabs) */}
            <div>
              <label className="block text-[11px] font-semibold tracking-[0.18em] uppercase text-stone-500">
                Tenor Pinjaman
              </label>
              <div className="mt-4 flex flex-wrap items-center gap-6 sm:gap-8">
                {TENOR_OPTIONS.map((years) => {
                  const isActive = tenorYears === years;
                  return (
                    <button
                      key={years}
                      type="button"
                      onClick={() => setTenorYears(years)}
                      className={`border-b-2 pb-1.5 text-sm sm:text-base font-medium transition-all cursor-pointer ${
                        isActive
                          ? 'border-[#18181B] text-[#18181B]'
                          : 'border-transparent text-stone-500 hover:border-[#A88B68]/60 hover:text-[#18181B]'
                      }`}
                    >
                      {years} Tahun
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Subtle Inline Interest Note (No Box) */}
            <div className="flex items-start gap-2.5 pt-2 text-xs leading-relaxed text-stone-600">
              <Info className="mt-0.5 h-3.5 w-3.5 shrink-0 text-[#8C7150]" />
              <p>
                <span className="font-semibold text-[#18181B]">
                  Asumsi Suku Bunga: 5,5% p.a.
                </span>{' '}
                (Fixed 3 Tahun Pertama — Estimasi Awal menggunakan rumus anuitas standar perbankan).
              </p>
            </div>
          </div>

          {/* Right Column: Open Editorial Summary & Live Output (No Dark Box) */}
          <div
            data-reveal
            className="lg:col-span-5 lg:border-l lg:border-stone-300/80 lg:pl-12 flex flex-col justify-between"
          >
            <div>
              <p className="text-[11px] font-semibold tracking-[0.2em] uppercase text-[#8C7150]">
                Estimasi Angsuran Bulanan
              </p>

              <div className="mt-4">
                <p className="font-display text-5xl sm:text-[3.4rem] font-medium leading-none tracking-tight text-[#18181B] tabular-nums">
                  {formatRupiah(calculation.monthlyInstallment)}
                </p>
                <p className="mt-2.5 text-sm text-stone-500">
                  per bulan · tenor {tenorYears} tahun
                </p>
              </div>

              <div className="mt-8 space-y-3.5 border-t border-stone-300/80 pt-6 text-sm">
                <div className="flex items-center justify-between">
                  <span className="text-stone-500">Harga Unit</span>
                  <span className="font-medium text-[#18181B] tabular-nums">
                    {formatRupiah(selectedUnit.price)}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-stone-500">Uang Muka ({dpPercent}%)</span>
                  <span className="font-medium text-[#18181B] tabular-nums">
                    {formatRupiah(calculation.dpAmount)}
                  </span>
                </div>
                <div className="flex items-center justify-between border-t border-stone-300/80 pt-3.5">
                  <span className="font-medium text-[#18181B]">Total Pokok Pinjaman</span>
                  <span className="font-semibold text-[#8C7150] tabular-nums">
                    {formatRupiah(calculation.principal)}
                  </span>
                </div>
              </div>
            </div>

            <div className="mt-10">
              <button
                type="button"
                onClick={handleSendToForm}
                className="group inline-flex w-full items-center justify-center gap-2 rounded-full bg-[#25D366] px-6 py-3.5 text-sm font-semibold !text-white transition-all hover:bg-[#20BD5A] cursor-pointer"
              >
                <span>Kirim Hasil Simulasi Ini ke WhatsApp</span>
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
              </button>
              <p className="mt-3 text-center text-[11px] text-stone-500">
                Hasil simulasi otomatis terisi ke formulir konsultasi di bawah.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
