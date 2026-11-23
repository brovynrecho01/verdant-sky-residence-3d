import { useEffect, useState, type FormEvent } from 'react';
import { CheckCircle2, MessageCircle, Send } from 'lucide-react';
import {
  INQUIRY_PURPOSES,
  buildWhatsAppUrl,
  type InquiryPurpose,
} from '../data/tourData';

interface WhatsAppFormSectionProps {
  prefillPurpose?: InquiryPurpose;
  prefillNotes?: string;
  prefillTimestamp?: number;
}

export function WhatsAppFormSection({
  prefillPurpose,
  prefillNotes,
  prefillTimestamp,
}: WhatsAppFormSectionProps) {
  const [name, setName] = useState('');
  const [purpose, setPurpose] = useState<InquiryPurpose>(INQUIRY_PURPOSES[0]);
  const [preferredTime, setPreferredTime] = useState('');
  const [notes, setNotes] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [submittedNotice, setSubmittedNotice] = useState(false);

  // Sync external pre-fill triggers (e.g., from Hero CTA or KPA Calculator)
  useEffect(() => {
    if (!prefillTimestamp) return;
    if (prefillPurpose) setPurpose(prefillPurpose);
    if (prefillNotes !== undefined) setNotes(prefillNotes);
    setSubmittedNotice(false);
  }, [prefillPurpose, prefillNotes, prefillTimestamp]);

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setErrorMsg('Mohon lengkapi nama Anda terlebih dahulu.');
      return;
    }

    setErrorMsg('');
    const waUrl = buildWhatsAppUrl({
      name,
      purpose,
      preferredTime,
      notes,
    });

    setSubmittedNotice(true);
    window.open(waUrl, '_blank', 'noopener,noreferrer');
  };

  return (
    <section
      id="kontak"
      className="relative z-10 border-t border-stone-300/70 bg-[#F5F2EB] pt-24 sm:pt-32 pb-16"
    >
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-14 lg:grid-cols-12 lg:items-start lg:gap-16">
          {/* Left Editorial Column — No Panel Box */}
          <div data-reveal className="lg:col-span-5">
            <p className="inline-flex items-center gap-3 text-[11px] font-semibold tracking-[0.22em] uppercase text-[#8C7150]">
              <span className="h-px w-7 bg-[#A88B68]" />
              <span>Konsultasi &amp; Private Viewing</span>
            </p>

            <h2 className="font-display mt-4 text-4xl sm:text-5xl font-medium leading-[1.08] tracking-tight text-[#18181B]">
              Ingin Melihat Suasana Aslinya Secara Langsung?
            </h2>

            <p className="mt-5 text-sm sm:text-base leading-relaxed text-stone-600">
              Pilih tujuan konsultasi Anda di bawah ini. Sistem akan menyusun pesan rapi agar tim
              konsultan properti kami bisa langsung menyiapkan e-brochure, pricelist terbaru, atau
              jadwal private viewing untuk Anda.
            </p>

            <div className="mt-9 border-t border-stone-300/75 pt-6 space-y-2 text-xs leading-relaxed text-stone-600">
              <div className="flex items-center gap-2 text-[#18181B] font-semibold">
                <MessageCircle className="h-4 w-4 text-[#25D366]" />
                <span>Handoff Langsung via WhatsApp Resmi</span>
              </div>
              <p>
                Formulir ini bekerja 100% di sisi perangkat Anda—tanpa pendaftaran akun atau
                pembayaran online. Pesan yang tersusun akan langsung terbuka di aplikasi WhatsApp
                Anda untuk ditinjau sebelum dikirim.
              </p>
            </div>
          </div>

          {/* Right Form Column — Frameless Architectural Underline Inputs (No Card Box) */}
          <div data-reveal className="lg:col-span-7 lg:border-l lg:border-stone-300/75 lg:pl-12">
            <form onSubmit={handleSubmit} noValidate className="space-y-8">
              {/* Field 1: Nama Lengkap */}
              <div>
                <label
                  htmlFor="wa-name"
                  className="block text-[11px] font-semibold tracking-[0.16em] uppercase text-stone-500"
                >
                  Nama Lengkap <span className="text-[#8C7150]">*</span>
                </label>
                <input
                  id="wa-name"
                  type="text"
                  required
                  value={name}
                  onChange={(e) => {
                    setName(e.target.value);
                    if (errorMsg) setErrorMsg('');
                  }}
                  placeholder="Contoh: Budi Santoso"
                  className="mt-2 w-full border-b border-stone-400/75 bg-transparent py-2.5 text-sm sm:text-base text-[#18181B] placeholder:text-stone-400 focus:border-[#18181B] focus:outline-none transition-colors"
                />
                {errorMsg && (
                  <p className="mt-1.5 text-xs font-medium text-red-600">{errorMsg}</p>
                )}
              </div>

              {/* Field 2: Kebutuhan Utama (Clean Frameless Radio Rows) */}
              <div>
                <span className="block text-[11px] font-semibold tracking-[0.16em] uppercase text-stone-500">
                  Kebutuhan Utama
                </span>
                <div className="mt-3 divide-y divide-stone-300/70 border-y border-stone-300/70">
                  {INQUIRY_PURPOSES.map((option) => {
                    const isSelected = purpose === option;
                    return (
                      <label
                        key={option}
                        className={`flex items-center gap-3.5 py-3.5 text-sm cursor-pointer transition-colors ${
                          isSelected
                            ? 'text-[#18181B] font-semibold'
                            : 'text-stone-600 hover:text-[#18181B]'
                        }`}
                      >
                        <input
                          type="radio"
                          name="inquiry-purpose"
                          value={option}
                          checked={isSelected}
                          onChange={() => setPurpose(option)}
                          className="sr-only"
                        />
                        <span
                          className={`flex h-4 w-4 shrink-0 items-center justify-center rounded-full border transition-colors ${
                            isSelected ? 'border-[#18181B] bg-[#18181B]' : 'border-stone-400'
                          }`}
                        >
                          {isSelected && (
                            <span className="h-1.5 w-1.5 rounded-full bg-[#F5F2EB]" />
                          )}
                        </span>
                        <span>{option}</span>
                      </label>
                    );
                  })}
                </div>
              </div>

              {/* Field 3: Preferensi Hari / Waktu (Opsional) */}
              <div>
                <label
                  htmlFor="wa-schedule"
                  className="block text-[11px] font-semibold tracking-[0.16em] uppercase text-stone-500"
                >
                  Preferensi Hari / Waktu{' '}
                  <span className="font-normal normal-case text-stone-400">(Opsional)</span>
                </label>
                <input
                  id="wa-schedule"
                  type="text"
                  value={preferredTime}
                  onChange={(e) => setPreferredTime(e.target.value)}
                  placeholder="Contoh: Sabtu pagi sekitar jam 10.00"
                  className="mt-2 w-full border-b border-stone-400/75 bg-transparent py-2.5 text-sm sm:text-base text-[#18181B] placeholder:text-stone-400 focus:border-[#18181B] focus:outline-none transition-colors"
                />
              </div>

              {/* Field 4: Catatan / Detail Simulasi KPA */}
              <div>
                <label
                  htmlFor="wa-notes"
                  className="block text-[11px] font-semibold tracking-[0.16em] uppercase text-stone-500"
                >
                  Catatan / Detail Simulasi KPA
                </label>
                <textarea
                  id="wa-notes"
                  rows={3}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Tulis pertanyaan khusus atau klik tombol pada Kalkulator KPA di atas untuk mengisi estimasi cicilan otomatis…"
                  className="mt-2 w-full border-b border-stone-400/75 bg-transparent py-2.5 text-sm sm:text-base text-[#18181B] placeholder:text-stone-400 focus:border-[#18181B] focus:outline-none transition-colors resize-y"
                />
              </div>

              {/* Submit Button */}
              <div className="pt-2">
                <button
                  type="submit"
                  className="flex w-full items-center justify-center gap-2.5 rounded-full bg-[#25D366] px-6 py-4 text-sm font-semibold !text-white transition-all hover:bg-[#20BD5A] active:scale-[0.99] cursor-pointer"
                >
                  <Send className="h-4 w-4" />
                  <span>Kirim Pesan via WhatsApp</span>
                </button>

                {submittedNotice && (
                  <p className="mt-3 flex items-center justify-center gap-1.5 text-xs font-medium text-emerald-700">
                    <CheckCircle2 className="h-4 w-4" />
                    <span>
                      Tab WhatsApp telah dibuka dengan pesan konsultasi terformat rapi.
                    </span>
                  </p>
                )}
              </div>
            </form>
          </div>
        </div>

        {/* Minimalist Architectural Footer & Concept Demo Disclosure */}
        <footer
          data-reveal
          className="mt-24 border-t border-stone-300/75 pt-8 pb-12 sm:pb-6"
        >
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between text-xs text-stone-500">
            <div>
              <p className="font-display text-lg font-semibold tracking-[0.08em] text-[#18181B]">
                VERDANT SKY RESIDENCE
              </p>
              <p className="mt-1">
                Tower A · Tipe 1-Bedroom Japandi Modern Luxury (48 m²) · Kerangka Satu Laman
              </p>
            </div>

            <div className="max-w-md sm:text-right">
              <p className="text-[10px] font-semibold tracking-[0.18em] uppercase text-[#8C7150]">
                Concept Demo / Interactive 3D Showcase
              </p>
              <p className="mt-1.5 leading-relaxed">
                Seluruh visualisasi 3D, spesifikasi, dan harga merupakan konsep demo interaktif dan
                bukan proyek komersial yang telah dipasarkan.
              </p>
            </div>
          </div>
        </footer>
      </div>
    </section>
  );
}
