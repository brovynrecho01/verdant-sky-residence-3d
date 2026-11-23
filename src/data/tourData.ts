export type ZoneId = 'foyer' | 'kitchen' | 'living' | 'bedroom' | 'bathroom' | 'balcony';

export type SubViewId =
  | null
  | 'living-wide'
  | 'living-sofa'
  | 'living-tv'
  | 'bedroom-bed'
  | 'bedroom-wardrobe'
  | 'bedroom-tv'
  | 'bathroom'
  | 'bathroom-vanity'
  | 'bathroom-shower'
  | 'exit-to-bedroom'
  | 'balcony-skyline'
  | 'balcony-reverse';

export interface SubViewOption {
  id: Exclude<SubViewId, null>;
  label: string;
}

export interface TourZone {
  id: ZoneId;
  indexLabel: string;
  shortLabel: string;
  eyebrow: string;
  title: string;
  body: string;
  scrollRange: [number, number];
  /** Target scroll progress [0..1] when clicking the room stepper */
  targetProgress: number;
  isSubView?: boolean;
  subViews?: SubViewOption[];
}

export interface HotspotConfig {
  id: string;
  meshName: string;
  zoneId: ZoneId;
  title: string;
  description: string;
  /** Three.js Y-up fallback coordinate [x, y, z] if mesh lookup fails */
  fallbackPosition: [number, number, number];
  /** Slight Y offset above mesh center for clean visual framing */
  offset?: [number, number, number];
}

export const WHATSAPP_NUMBER = '6288217872159';

export const FLOATING_WA_URL =
  'https://wa.me/6288217872159?text=Halo%20Tim%20Marketing%20Verdant%20Sky%20Residence,%20saya%20tertarik%20mengetahui%20info%20unit%201-Bedroom%20(48%20m%C2%B2).';

export const TOUR_ZONES: TourZone[] = [
  {
    id: 'foyer',
    indexLabel: '01',
    shortLabel: 'Foyer',
    eyebrow: '01 / 06 · ENTRANCE FOYER',
    title: 'Area Masuk yang Rapi dan Terang Begitu Pintu Dibuka.',
    body: 'Pintu kayu oak solid dengan smart lock langsung mengarah ke foyer yang fungsional. Ada bangku duduk, rak sepatu tersembunyi, serta kisi kayu vertikal yang membuat area depan tetap bersih dan nyaman saat Anda pulang.',
    scrollRange: [0.0, 0.15],
    targetProgress: 0.06,
  },
  {
    id: 'kitchen',
    indexLabel: '02',
    shortLabel: 'Kitchen',
    eyebrow: '02 / 06 · PANTRY & ISLAND DINING',
    title: 'Dapur Bersih yang Menyatu Langsung dengan Ruang Tengah.',
    body: 'Tanpa sekat dinding yang membatasi pandangan, pantry berhadapan langsung dengan meja island batu travertine. Cukup leluasa untuk menyiapkan kopi pagi atau makan malam berdua di rumah.',
    scrollRange: [0.15, 0.3],
    targetProgress: 0.22,
  },
  {
    id: 'living',
    indexLabel: '03',
    shortLabel: 'Living',
    eyebrow: '03 / 06 · LIVING SANCTUARY',
    title: 'Plafon 3,2 Meter yang Memberi Ruang untuk Bernapas Lega.',
    body: 'Ketinggian plafon ekstra dan bukaan kaca penuh dari lantai ke langit-langit membiarkan cahaya alami mengalir bebas ke seluruh ruangan. Sofa rendah berbahan bouclé menjaga jarak pandang tetap terbuka sehingga unit 48 m² terasa lebih lega.',
    scrollRange: [0.3, 0.5],
    targetProgress: 0.37,
    subViews: [
      { id: 'living-wide', label: 'Sudut Lebar Ruang Tamu' },
      { id: 'living-sofa', label: 'Fokus Sofa & Meja' },
      { id: 'living-tv', label: 'Fokus TV & Media Console' },
    ],
  },
  {
    id: 'bedroom',
    indexLabel: '04',
    shortLabel: 'Bedroom',
    eyebrow: '04 / 06 · MASTER BEDROOM',
    title: 'Kamar Tidur Utama dengan Pencahayaan Lembut.',
    body: 'Kasur platform kayu walnut berlapis selimut sage dan bantal linen dipadukan dengan lampu gantung hangat di kedua sisi. Di sampingnya, lemari terbuka kayu oak lengkap dengan rel kuningan dan rak lipat memudahkan Anda menata pakaian.',
    scrollRange: [0.5, 0.7],
    targetProgress: 0.58,
    subViews: [
      { id: 'bedroom-bed', label: 'Fokus Kasur & Bantal' },
      { id: 'bedroom-wardrobe', label: 'Isi Lemari Wardrobe' },
      { id: 'bedroom-tv', label: 'Area TV Kamar' },
      { id: 'bathroom', label: 'Masuk ke Kamar Mandi →' },
    ],
  },
  {
    id: 'bathroom',
    indexLabel: '05',
    shortLabel: 'Bathroom',
    eyebrow: '05 / 06 · EN-SUITE BATHROOM',
    title: 'Kamar Mandi Privat yang Bersih, Terang, dan Praktis.',
    body: 'Wastafel batu travertine di atas kabinet melayang dilengkapi cermin bulat dengan lampu belakang yang nyaman di mata. Area walk-in rain shower dipisahkan kaca bening agar lantai di luar tetap kering.',
    scrollRange: [0.7, 0.78],
    targetProgress: 0.75,
    subViews: [
      { id: 'bathroom-vanity', label: 'Wastafel & Cermin LED' },
      { id: 'bathroom-shower', label: 'Area Walk-In Shower' },
      { id: 'exit-to-bedroom', label: '← Keluar ke Kamar Tidur' },
    ],
  },
  {
    id: 'balcony',
    indexLabel: '06',
    shortLabel: 'Balcony',
    eyebrow: '06 / 06 · PRIVATE SKY BALCONY',
    title: 'Balkon Pribadi Menghadap Pemandangan Kota.',
    body: 'Melewati pintu geser kaca, dek kayu WPC dan sepasang kursi lounge burgundy siap dipakai bersantai di udara terbuka. Lanjutkan scroll hingga akhir untuk melihat sudut balik ke arah jendela ruang tamu.',
    scrollRange: [0.78, 1.0],
    targetProgress: 0.86,
    subViews: [
      { id: 'balcony-skyline', label: 'Panorama Skyline Kota' },
      { id: 'balcony-reverse', label: 'Reverse View: Lounge Burgundy & Jendela' },
    ],
  },
];

export const HOTSPOTS: HotspotConfig[] = [
  {
    id: 'smart-lock',
    meshName: 'Hotspot_SmartLock',
    zoneId: 'foyer',
    title: 'Integrated Smart Door Lock',
    description:
      'Akses sidik jari, PIN sementara untuk tamu, dan riwayat buka-tutup pintu langsung dari ponsel.',
    fallbackPosition: [1.22, 1.12, -0.18],
    offset: [0.04, 0.08, -0.06],
  },
  {
    id: 'marble-counter',
    meshName: 'Hotspot_MarbleCounter',
    zoneId: 'kitchen',
    title: 'Calacatta Marble & Travertine Island',
    description:
      'Permukaan batu alami tahan panas dengan kabinet handleless berpenutup lembut (soft-close).',
    fallbackPosition: [0.65, 1.2, -3.25],
    offset: [0.22, 0.08, 0.0],
  },
  {
    id: 'acoustic-glass',
    meshName: 'Hotspot_AcousticGlass',
    zoneId: 'living',
    title: 'Double-Glazed Acoustic Window',
    description:
      'Kaca berlapis ganda yang meredam kebisingan lalu lintas kota sekaligus menahan panas matahari siang.',
    fallbackPosition: [4.16, 1.55, -6.0],
    offset: [-0.14, 0.06, 0.0],
  },
  {
    id: 'sky-balcony',
    meshName: 'Hotspot_SkyBalcony',
    zoneId: 'balcony',
    title: 'Unobstructed City Skyline View',
    description:
      'Kedalaman balkon 1,5 meter dengan tempered frameless glass untuk pandangan tanpa halangan.',
    fallbackPosition: [2.25, 1.35, -10.88],
    offset: [-0.25, 0.76, 0.06],
  },
];

export interface UnitOption {
  id: 'studio' | '1br';
  label: string;
  area: string;
  price: number;
  priceLabel: string;
}

export const UNIT_OPTIONS: UnitOption[] = [
  {
    id: 'studio',
    label: 'Studio 32 m²',
    area: '32 m²',
    price: 980_000_000,
    priceLabel: 'Rp980.000.000',
  },
  {
    id: '1br',
    label: '1-Bedroom 48 m²',
    area: '48 m²',
    price: 1_450_000_000,
    priceLabel: 'Rp1.450.000.000',
  },
];

export const INQUIRY_PURPOSES = [
  'Minta E-Brochure & Pricelist Lengkap',
  'Jadwalkan Private Viewing Show Unit',
  'Konsultasi Simulasi KPA & Skema Bayar',
] as const;

export type InquiryPurpose = (typeof INQUIRY_PURPOSES)[number];

export function formatRupiah(amount: number): string {
  return 'Rp' + Math.round(amount).toLocaleString('id-ID');
}

export function buildWhatsAppUrl(params: {
  name: string;
  purpose: string;
  preferredTime: string;
  notes: string;
}): string {
  const name = params.name.trim() || '-';
  const purpose = params.purpose.trim() || INQUIRY_PURPOSES[0];
  const preferredTime = params.preferredTime.trim() || 'Fleksibel (menyesuaikan jadwal tim)';
  const notes = params.notes.trim() || 'Mohon info promo dan ketersediaan unit terbaru.';

  const message = `Halo Tim Marketing Verdant Sky Residence, saya tertarik dengan unit 1-Bedroom Japandi Modern Luxury (48 m²) setelah mencoba Virtual Tour 3D.

- Nama: ${name}
- Kebutuhan: ${purpose}
- Preferensi Jadwal: ${preferredTime}
- Catatan / Simulasi KPA: ${notes}

Mohon informasi ketersediaan unit dan brosur lengkapnya. Terima kasih.`;

  return `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`;
}

export function getActiveZoneFromProgress(progress: number, isBathroomView: boolean): TourZone {
  if (isBathroomView) {
    return TOUR_ZONES.find((z) => z.id === 'bathroom')!;
  }
  if (progress < 0.15) return TOUR_ZONES[0];
  if (progress < 0.3) return TOUR_ZONES[1];
  if (progress < 0.5) return TOUR_ZONES[2];
  if (progress < 0.7) return TOUR_ZONES[3];
  if (progress < 0.78) return TOUR_ZONES[4];
  return TOUR_ZONES[5];
}
