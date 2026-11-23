import { useCallback, useEffect, useRef, useState } from 'react';
import Lenis from 'lenis';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { Navbar } from './components/Navbar';
import { Preloader } from './components/Preloader';
import { TourScene } from './components/three/TourScene';
import { TourHud } from './components/TourHud';
import { SpecsSection } from './components/SpecsSection';
import { KpaCalculator } from './components/KpaCalculator';
import { WhatsAppFormSection } from './components/WhatsAppFormSection';
import { FloatingWhatsApp } from './components/FloatingWhatsApp';
import {
  INQUIRY_PURPOSES,
  TOUR_ZONES,
  getActiveZoneFromProgress,
  type InquiryPurpose,
  type SubViewId,
  type ZoneId,
} from './data/tourData';

gsap.registerPlugin(ScrollTrigger);

export default function App() {
  const tourContainerRef = useRef<HTMLDivElement>(null);
  const lenisRef = useRef<Lenis | null>(null);
  const scrollProgressRef = useRef<number>(0);
  const pendingSubViewRef = useRef<boolean>(false);

  const [isEvening, setIsEvening] = useState(false);
  const [activeSubView, setActiveSubView] = useState<SubViewId>(null);
  const [activeZoneId, setActiveZoneId] = useState<ZoneId>('foyer');
  const [showHero, setShowHero] = useState(true);
  const [isOver3D, setIsOver3D] = useState(true);
  const [activeHotspotId, setActiveHotspotId] = useState<string | null>(null);

  const [waPrefill, setWaPrefill] = useState<{
    purpose?: InquiryPurpose;
    notes?: string;
    timestamp?: number;
  }>({});

  // Auto-exit any active camera Sub-View when user physically scrolls with wheel or touch
  useEffect(() => {
    if (!activeSubView) return;

    const handleUserScrollInput = () => {
      if (!pendingSubViewRef.current) {
        setActiveSubView(null);
      }
    };

    window.addEventListener('wheel', handleUserScrollInput, { passive: true });
    window.addEventListener('touchmove', handleUserScrollInput, { passive: true });
    return () => {
      window.removeEventListener('wheel', handleUserScrollInput);
      window.removeEventListener('touchmove', handleUserScrollInput);
    };
  }, [activeSubView]);

  // Setup Lenis silky-smooth scrolling synced to GSAP ScrollTrigger
  useEffect(() => {
    const lenis = new Lenis({
      duration: 1.15,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      smoothWheel: true,
      touchMultiplier: 1.35,
    });
    lenisRef.current = lenis;

    lenis.on('scroll', ScrollTrigger.update);

    const tick = (time: number) => {
      lenis.raf(time * 1000);
    };
    gsap.ticker.add(tick);
    gsap.ticker.lagSmoothing(0);

    const container = tourContainerRef.current;
    let trigger: ScrollTrigger | null = null;

    if (container) {
      trigger = ScrollTrigger.create({
        trigger: container,
        start: 'top top',
        end: 'bottom bottom',
        scrub: true,
        onUpdate: (self) => {
          const p = self.progress;
          scrollProgressRef.current = p;

          const nextShowHero = p < 0.045;
          setShowHero((prev) => (prev !== nextShowHero ? nextShowHero : prev));

          const nextIsOver3D = p < 0.995;
          setIsOver3D((prev) => (prev !== nextIsOver3D ? nextIsOver3D : prev));

          // Clear programmatic sub-view lock once we arrive near the Bedroom/Bathroom zone
          if (pendingSubViewRef.current && p >= 0.54 && p <= 0.76) {
            pendingSubViewRef.current = false;
          }

          const nextZone = getActiveZoneFromProgress(p, false);
          setActiveZoneId((prev) => (prev !== nextZone.id ? nextZone.id : prev));
        },
      });
    }

    // Cinematic scroll-triggered fade-in for all editorial post-tour content blocks
    const revealEls = gsap.utils.toArray<HTMLElement>('[data-reveal]');
    const revealTweens: gsap.core.Tween[] = revealEls.map((el) =>
      gsap.fromTo(
        el,
        { autoAlpha: 0, y: 28 },
        {
          autoAlpha: 1,
          y: 0,
          duration: 1.05,
          ease: 'power3.out',
          scrollTrigger: {
            trigger: el,
            start: 'top 88%',
            toggleActions: 'play none none reverse',
          },
        }
      )
    );

    return () => {
      revealTweens.forEach((tw) => {
        tw.scrollTrigger?.kill();
        tw.kill();
      });
      trigger?.kill();
      gsap.ticker.remove(tick);
      lenis.destroy();
      lenisRef.current = null;
    };
  }, []);

  // Close open hotspot popover when changing rooms or sub-views
  useEffect(() => {
    setActiveHotspotId(null);
  }, [activeZoneId, activeSubView]);

  const scrollToTourProgress = useCallback((targetProgress: number) => {
    const container = tourContainerRef.current;
    if (!container) return;
    const maxScroll = Math.max(0, container.offsetHeight - window.innerHeight);
    const targetY = container.offsetTop + maxScroll * targetProgress;

    if (lenisRef.current) {
      lenisRef.current.scrollTo(targetY, { duration: 1.2 });
    } else {
      window.scrollTo({ top: targetY, behavior: 'smooth' });
    }
  }, []);

  const scrollToElementId = useCallback((elementId: string) => {
    const el = document.getElementById(elementId);
    if (!el) return;
    if (lenisRef.current) {
      lenisRef.current.scrollTo(el, { offset: -64, duration: 1.15 });
    } else {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  }, []);

  const handleNavigate = useCallback(
    (target: 'tour' | 'spesifikasi' | 'simulasi-kpa' | 'kontak') => {
      if (target === 'tour') {
        pendingSubViewRef.current = false;
        setActiveSubView(null);
        scrollToTourProgress(0.0);
        return;
      }
      scrollToElementId(target);
    },
    [scrollToElementId, scrollToTourProgress]
  );

  const handleSelectZone = useCallback(
    (zoneId: ZoneId) => {
      const zone = TOUR_ZONES.find((z) => z.id === zoneId);
      if (!zone) return;

      // All 6 zones (01 Foyer -> 02 Kitchen -> 03 Living -> 04 Bedroom -> 05 Bathroom -> 06 Balcony)
      // now live sequentially on the main scroll rail so nothing is skipped!
      pendingSubViewRef.current = false;
      setActiveSubView(null);
      scrollToTourProgress(zone.targetProgress);
    },
    [scrollToTourProgress]
  );

  const handleSelectSubView = useCallback(
    (subView: SubViewId) => {
      if (subView === 'bathroom') {
        const bathZone = TOUR_ZONES.find((z) => z.id === 'bathroom');
        pendingSubViewRef.current = false;
        setActiveSubView(null);
        if (bathZone) scrollToTourProgress(bathZone.targetProgress);
        return;
      }
      if (subView === 'exit-to-bedroom') {
        const bedZone = TOUR_ZONES.find((z) => z.id === 'bedroom');
        pendingSubViewRef.current = false;
        setActiveSubView(null);
        if (bedZone) scrollToTourProgress(bedZone.targetProgress);
        return;
      }
      pendingSubViewRef.current = false;
      setActiveSubView(subView);
    },
    [scrollToTourProgress]
  );

  const handleRequestBrochure = useCallback(() => {
    setWaPrefill({
      purpose: INQUIRY_PURPOSES[0],
      notes: 'Mohon kirimkan E-Brochure & Pricelist terbaru untuk tipe 1-Bedroom (48 m²).',
      timestamp: Date.now(),
    });
    scrollToElementId('kontak');
  }, [scrollToElementId]);

  const handleSendKpaSimulation = useCallback(
    (summaryText: string) => {
      setWaPrefill({
        purpose: INQUIRY_PURPOSES[2],
        notes: summaryText,
        timestamp: Date.now(),
      });
      scrollToElementId('kontak');
    },
    [scrollToElementId]
  );

  const activeZone =
    activeSubView === 'bathroom'
      ? TOUR_ZONES.find((z) => z.id === 'bathroom')!
      : TOUR_ZONES.find((z) => z.id === activeZoneId) ?? TOUR_ZONES[0];

  return (
    <div className="min-h-screen bg-[#F5F2EB] text-[#18181B]">
      {/* Architectural 0–100% 3D Asset Preloader */}
      <Preloader />

      {/* Global Sticky Architectural Navbar */}
      <Navbar
        onNavigate={handleNavigate}
        isEvening={isEvening}
        isOver3D={isOver3D}
      />

      {/* Tall Scroll-Driven 3D Virtual Tour Container (720vh for all 6 sequential rooms + reverse balcony panorama) */}
      <main>
        <section
          ref={tourContainerRef}
          id="tur-unit-3d"
          aria-label="Tur Virtual 3D Verdant Sky Residence"
          className="relative h-[720vh] w-full"
        >
          <div className="sticky top-0 h-screen w-full overflow-hidden">
            <TourScene
              scrollProgressRef={scrollProgressRef}
              isEvening={isEvening}
              activeSubView={activeSubView}
              activeZoneId={activeZone.id}
              activeHotspotId={activeHotspotId}
              onSelectHotspot={setActiveHotspotId}
              showHotspots={!showHero && activeSubView === null}
            />

            <TourHud
              activeZone={activeZone}
              activeSubView={activeSubView}
              showHero={showHero}
              isEvening={isEvening}
              onToggleAtmosphere={() => setIsEvening((prev) => !prev)}
              onStartTour={() => {
                setActiveSubView(null);
                scrollToTourProgress(0.1);
              }}
              onRequestBrochure={handleRequestBrochure}
              onSelectZone={handleSelectZone}
              onSelectSubView={handleSelectSubView}
            />
          </div>
        </section>

        {/* Post-Tour Section 1: Spesifikasi Teknis & Fasilitas */}
        <SpecsSection onJumpToZone={handleSelectZone} />

        {/* Post-Tour Section 2: Kalkulator Simulasi KPA Interaktif */}
        <KpaCalculator onSendSimulation={handleSendKpaSimulation} />

        {/* Post-Tour Section 3: Interactive WhatsApp Handoff Form & Concept Footer */}
        <WhatsAppFormSection
          prefillPurpose={waPrefill.purpose}
          prefillNotes={waPrefill.notes}
          prefillTimestamp={waPrefill.timestamp}
        />
      </main>

      {/* Fixed Bottom-Right Floating WhatsApp Action */}
      <FloatingWhatsApp />
    </div>
  );
}
