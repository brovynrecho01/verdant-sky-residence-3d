import { useEffect, useMemo, useRef } from 'react';
import * as THREE from 'three';
import { useFrame, useThree } from '@react-three/fiber';
import type { SubViewId } from '../../data/tourData';

interface CameraRigProps {
  scrollProgressRef: React.MutableRefObject<number>;
  activeSubView: SubViewId;
}

interface CameraKeyframe {
  /** Scroll progress [0..1] synchronized with TOUR_ZONES */
  t: number;
  /** Three.js Y-up camera position */
  pos: THREE.Vector3;
  /** Three.js Y-up lookAt target */
  target: THREE.Vector3;
}

/**
 * Full-coverage architectural camera choreography (Three.js Y-up world coordinates):
 * - 01 Foyer (0%–15%): Smart lock door, oak slats, arch mirror & bench
 * - 02 Kitchen (15%–30%): Calacatta marble counter, cooktop & travertine island
 * - 03 Living (30%–50%): Wide diagonal framing sofa + table + TV, sweeping to sunlit curtains
 * - 04 Bedroom (50%–70%): Clean passage entry -> full Queen bed & pillows -> illuminated wardrobe
 * - 05 Bathroom (70%–78%): Physically enters inside bathroom (vanity, backlit mirror, toilet & shower)
 * - 06 Balcony (78%–100%): Part A stepping out to blue sky/skyline -> Part B 150° reverse panorama
 *   looking back across both Burgundy lounge chairs, side table, planters & apartment glass facade.
 */
const CAMERA_KEYFRAMES: CameraKeyframe[] = [
  // Zona 01 — Entrance Foyer (0%–15%)
  {
    t: 0.0,
    pos: new THREE.Vector3(2.22, 1.56, -1.98),
    target: new THREE.Vector3(2.08, 1.24, -0.22),
  },
  {
    t: 0.1,
    pos: new THREE.Vector3(2.45, 1.56, -1.86),
    target: new THREE.Vector3(1.94, 1.22, -0.32),
  },
  // Zona 02 — Compact Kitchen & Island Dining (15%–30%)
  {
    t: 0.22,
    pos: new THREE.Vector3(2.94, 1.58, -2.38),
    target: new THREE.Vector3(1.36, 1.2, -3.55),
  },
  {
    t: 0.29,
    pos: new THREE.Vector3(3.38, 1.58, -3.65),
    target: new THREE.Vector3(1.72, 1.18, -5.25),
  },
  // Zona 03 — Full Open-Plan Living Room (30%–50%)
  {
    t: 0.37,
    pos: new THREE.Vector3(3.45, 1.58, -4.46),
    target: new THREE.Vector3(1.66, 1.12, -6.48), // Captures sofa, coffee table, rug & TV/media console together
  },
  {
    t: 0.45,
    pos: new THREE.Vector3(1.36, 1.56, -5.82),
    target: new THREE.Vector3(3.22, 1.32, -6.28), // Pans across to floor-to-ceiling sheer curtain & standing lamp
  },
  // Zona 04 — Master Bedroom Full Sweep (50%–70%)
  {
    t: 0.5,
    pos: new THREE.Vector3(0.88, 1.56, -7.12), // Living side of open left passage (X=0.14..1.45)
    target: new THREE.Vector3(2.15, 1.22, -8.65),
  },
  {
    t: 0.54,
    pos: new THREE.Vector3(0.96, 1.56, -7.88), // Cleanly past partition wall into Bedroom
    target: new THREE.Vector3(2.35, 1.12, -8.78),
  },
  {
    t: 0.6,
    pos: new THREE.Vector3(2.98, 1.56, -7.94), // Full Queen bed, textured pillows, sand bolster & pendants
    target: new THREE.Vector3(1.78, 1.02, -8.86),
  },
  {
    t: 0.67,
    pos: new THREE.Vector3(1.34, 1.54, -8.32), // Arcing to reveal illuminated smoked-glass wardrobe & contents
    target: new THREE.Vector3(3.85, 1.38, -8.48),
  },
  // Zona 05 — En-Suite Bathroom Full Interior Entry (70%–78%)
  {
    t: 0.72,
    pos: new THREE.Vector3(0.32, 1.52, -7.96), // Stepping cleanly through bathroom doorway
    target: new THREE.Vector3(-1.48, 1.22, -8.14),
  },
  {
    t: 0.76,
    pos: new THREE.Vector3(-0.38, 1.5, -7.92), // Physically INSIDE bathroom: vanity, backlit mirror, toilet & shower
    target: new THREE.Vector3(-1.58, 1.2, -8.16),
  },
  // Zona 06 — Private Sky Balcony Walk-Through & Reverse Panorama (78%–100%)
  {
    t: 0.81,
    pos: new THREE.Vector3(0.95, 1.56, -8.12), // Smooth exit from bathroom aiming toward sliding glass doors
    target: new THREE.Vector3(2.25, 1.38, -11.2),
  },
  {
    t: 0.86,
    pos: new THREE.Vector3(2.25, 1.58, -10.22), // Part A: Stepping straight out onto balcony -> blue sky & skyline
    target: new THREE.Vector3(2.25, 1.66, -26.0),
  },
  {
    t: 0.93,
    pos: new THREE.Vector3(3.55, 1.6, -10.75), // Gliding to outer corner & swinging smoothly 150° inward
    target: new THREE.Vector3(1.92, 1.12, -10.15),
  },
  {
    t: 1.0,
    pos: new THREE.Vector3(4.15, 1.62, -10.9), // Part B: Reverse panorama capturing BOTH Burgundy chairs, table & glass facade
    target: new THREE.Vector3(1.75, 0.95, -9.65),
  },
];

// Dedicated interactive Sub-View camera presets (verified Three.js Y-up coordinates)
const SUB_VIEW_CAMERAS: Record<
  Exclude<SubViewId, null | 'exit-to-bedroom'>,
  { pos: THREE.Vector3; target: THREE.Vector3 }
> = {
  // Zone 03: Living Room angles
  'living-wide': {
    pos: new THREE.Vector3(3.45, 1.58, -4.46),
    target: new THREE.Vector3(1.66, 1.12, -6.48),
  },
  'living-sofa': {
    pos: new THREE.Vector3(3.12, 1.38, -6.62),
    target: new THREE.Vector3(2.04, 0.72, -5.22),
  },
  'living-tv': {
    pos: new THREE.Vector3(1.54, 1.44, -5.26),
    target: new THREE.Vector3(2.28, 1.1, -7.42),
  },
  // Zone 04: Master Bedroom angles
  'bedroom-bed': {
    pos: new THREE.Vector3(1.08, 1.48, -7.76),
    target: new THREE.Vector3(2.35, 0.92, -8.82),
  },
  'bedroom-wardrobe': {
    pos: new THREE.Vector3(0.95, 1.46, -8.38),
    target: new THREE.Vector3(3.96, 1.38, -8.48),
  },
  'bedroom-tv': {
    pos: new THREE.Vector3(2.38, 1.48, -9.12),
    target: new THREE.Vector3(2.38, 1.28, -7.6),
  },
  // Zone 05: En-Suite Bathroom interior angles
  bathroom: {
    pos: new THREE.Vector3(-0.38, 1.5, -7.92),
    target: new THREE.Vector3(-1.58, 1.2, -8.16),
  },
  'bathroom-vanity': {
    pos: new THREE.Vector3(-0.56, 1.46, -8.08),
    target: new THREE.Vector3(-1.66, 1.2, -8.38),
  },
  'bathroom-shower': {
    pos: new THREE.Vector3(-0.3, 1.46, -8.16),
    target: new THREE.Vector3(-1.22, 1.24, -7.42),
  },
  // Zone 06: Private Sky Balcony angles
  'balcony-skyline': {
    pos: new THREE.Vector3(2.25, 1.6, -10.18),
    target: new THREE.Vector3(2.25, 1.72, -32.0),
  },
  'balcony-reverse': {
    pos: new THREE.Vector3(4.15, 1.62, -10.9),
    target: new THREE.Vector3(1.75, 0.95, -9.65),
  },
};

/** Maps arbitrary scroll progress [0..1] to the exact CatmullRomCurve3 segment parameter u [0..1] */
function mapProgressToCurveU(progress: number): number {
  const count = CAMERA_KEYFRAMES.length;
  if (progress <= CAMERA_KEYFRAMES[0].t) return 0;
  if (progress >= CAMERA_KEYFRAMES[count - 1].t) return 1;

  for (let i = 0; i < count - 1; i++) {
    const k0 = CAMERA_KEYFRAMES[i];
    const k1 = CAMERA_KEYFRAMES[i + 1];
    if (progress >= k0.t && progress <= k1.t) {
      const span = Math.max(0.0001, k1.t - k0.t);
      const localAlpha = (progress - k0.t) / span;
      return (i + localAlpha) / (count - 1);
    }
  }
  return 1;
}

export function CameraRig({ scrollProgressRef, activeSubView }: CameraRigProps) {
  const { camera, size } = useThree();

  const posCurve = useMemo(
    () =>
      new THREE.CatmullRomCurve3(
        CAMERA_KEYFRAMES.map((k) => k.pos),
        false,
        'centripetal',
        0.5
      ),
    []
  );
  const targetCurve = useMemo(
    () =>
      new THREE.CatmullRomCurve3(
        CAMERA_KEYFRAMES.map((k) => k.target),
        false,
        'centripetal',
        0.5
      ),
    []
  );

  const currentPos = useRef(CAMERA_KEYFRAMES[0].pos.clone());
  const currentTarget = useRef(CAMERA_KEYFRAMES[0].target.clone());
  const desiredPos = useRef(new THREE.Vector3());
  const desiredTarget = useRef(new THREE.Vector3());
  const pointer = useRef({ x: 0, y: 0 });
  const dampedPointer = useRef({ x: 0, y: 0 });
  const smoothProgress = useRef(0);
  const initialized = useRef(false);

  // Subtle pointer parallax listener (±2.8° max)
  useEffect(() => {
    const onPointerMove = (e: PointerEvent) => {
      const nx = (e.clientX / window.innerWidth) * 2 - 1;
      const ny = (e.clientY / window.innerHeight) * 2 - 1;
      pointer.current.x = THREE.MathUtils.clamp(nx, -1, 1);
      pointer.current.y = THREE.MathUtils.clamp(ny, -1, 1);
    };

    const onPointerLeave = () => {
      pointer.current.x = 0;
      pointer.current.y = 0;
    };

    window.addEventListener('pointermove', onPointerMove, { passive: true });
    window.addEventListener('pointerleave', onPointerLeave);
    return () => {
      window.removeEventListener('pointermove', onPointerMove);
      window.removeEventListener('pointerleave', onPointerLeave);
    };
  }, []);

  // Responsive FOV for mobile portrait vs desktop widescreen
  useEffect(() => {
    if (camera instanceof THREE.PerspectiveCamera) {
      const aspect = size.width / Math.max(1, size.height);
      const nextFov = aspect < 0.75 ? 62 : aspect < 1.1 ? 56 : 50;
      if (Math.abs(camera.fov - nextFov) > 0.5) {
        camera.fov = nextFov;
        camera.updateProjectionMatrix();
      }
    }
  }, [camera, size.width, size.height]);

  useFrame((_, delta) => {
    const dt = Math.min(delta, 0.05);
    const rawProgress = THREE.MathUtils.clamp(scrollProgressRef.current, 0, 1);

    smoothProgress.current = THREE.MathUtils.lerp(
      smoothProgress.current,
      rawProgress,
      1 - Math.exp(-7.5 * dt)
    );

    const preset =
      activeSubView && activeSubView !== 'exit-to-bedroom'
        ? SUB_VIEW_CAMERAS[activeSubView]
        : null;

    if (preset) {
      desiredPos.current.copy(preset.pos);
      desiredTarget.current.copy(preset.target);
    } else {
      const curveU = mapProgressToCurveU(smoothProgress.current);
      posCurve.getPoint(curveU, desiredPos.current);
      targetCurve.getPoint(curveU, desiredTarget.current);
    }

    if (!initialized.current) {
      currentPos.current.copy(desiredPos.current);
      currentTarget.current.copy(desiredTarget.current);
      initialized.current = true;
    } else {
      const lerpAlpha = 1 - Math.exp(-(preset ? 4.8 : 6.2) * dt);
      currentPos.current.lerp(desiredPos.current, lerpAlpha);
      currentTarget.current.lerp(desiredTarget.current, lerpAlpha);
    }

    const ptrAlpha = 1 - Math.exp(-4.5 * dt);
    dampedPointer.current.x = THREE.MathUtils.lerp(
      dampedPointer.current.x,
      pointer.current.x,
      ptrAlpha
    );
    dampedPointer.current.y = THREE.MathUtils.lerp(
      dampedPointer.current.y,
      pointer.current.y,
      ptrAlpha
    );

    camera.position.copy(currentPos.current);
    camera.lookAt(currentTarget.current);

    // Subtle ±2.8° yaw & ±1.6° pitch parallax without leaving the guided rail
    const maxYaw = THREE.MathUtils.degToRad(2.8);
    const maxPitch = THREE.MathUtils.degToRad(1.6);
    camera.rotateY(-dampedPointer.current.x * maxYaw);
    camera.rotateX(-dampedPointer.current.y * maxPitch);
  });

  return null;
}
