import { Suspense, useEffect, useMemo, useRef } from 'react';
import * as THREE from 'three';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { ContactShadows, Environment, Lightformer, Stars } from '@react-three/drei';
import { ApartmentModels } from './ApartmentModels';
import { CameraRig } from './CameraRig';
import { getProceduralTextures } from '../../utils/proceduralTextures';
import type { SubViewId, ZoneId } from '../../data/tourData';

interface TourSceneProps {
  scrollProgressRef: React.MutableRefObject<number>;
  isEvening: boolean;
  activeSubView: SubViewId;
  activeZoneId: ZoneId;
  activeHotspotId: string | null;
  onSelectHotspot: (id: string | null) => void;
  showHotspots: boolean;
}

const DAY_FOG = new THREE.Color('#CFE3F5');
const NIGHT_FOG = new THREE.Color('#090D16');
const DAY_SUN = new THREE.Color('#FFF5E4');
const NIGHT_MOON = new THREE.Color('#3B82F6');

/** Crisp azure daytime sky dome shader (bright horizon #CBE4F9 -> mid #60A5FA -> rich zenith #3B82F6) */
function DaylightSkyDome() {
  const shaderMat = useMemo(
    () =>
      new THREE.ShaderMaterial({
        side: THREE.BackSide,
        depthWrite: false,
        fog: false,
        uniforms: {
          uZenithColor: { value: new THREE.Color('#2E6FE6') },
          uMidColor: { value: new THREE.Color('#60A5FA') },
          uHorizonColor: { value: new THREE.Color('#CBE4F9') },
          uSunDir: { value: new THREE.Vector3(10.5, 6.8, -20.5).normalize() },
          uSunGlowColor: { value: new THREE.Color('#FFF7E8') },
        },
        vertexShader: `
          varying vec3 vWorldDir;
          void main() {
            vec4 wp = modelMatrix * vec4(position, 1.0);
            vWorldDir = normalize(wp.xyz - vec3(2.25, 1.5, -6.0));
            gl_Position = projectionMatrix * viewMatrix * wp;
          }
        `,
        fragmentShader: `
          uniform vec3 uZenithColor;
          uniform vec3 uMidColor;
          uniform vec3 uHorizonColor;
          uniform vec3 uSunDir;
          uniform vec3 uSunGlowColor;
          varying vec3 vWorldDir;
          void main() {
            vec3 dir = normalize(vWorldDir);
            float h = clamp(dir.y, -0.15, 1.0);
            vec3 col = mix(uHorizonColor, uMidColor, smoothstep(0.0, 0.34, h));
            col = mix(col, uZenithColor, smoothstep(0.28, 0.85, h));

            // Soft natural atmospheric solar halo near sun direction
            float sunAmt = max(dot(dir, normalize(uSunDir)), 0.0);
            col += uSunGlowColor * pow(sunAmt, 14.0) * 0.28;
            col += uSunGlowColor * pow(sunAmt, 120.0) * 0.45;

            gl_FragColor = vec4(col, 1.0);
          }
        `,
      }),
    []
  );

  return (
    <mesh material={shaderMat} position={[2.25, 0, -15]}>
      <sphereGeometry args={[135, 32, 24]} />
    </mesh>
  );
}

/** Deep twilight gradient sky dome for Evening Mood (#090D16 -> #1E293B) */
function TwilightSkyDome() {
  const shaderMat = useMemo(
    () =>
      new THREE.ShaderMaterial({
        side: THREE.BackSide,
        depthWrite: false,
        fog: false,
        uniforms: {
          uTopColor: { value: new THREE.Color('#090D16') },
          uMidColor: { value: new THREE.Color('#111A2E') },
          uHorizonColor: { value: new THREE.Color('#1E293B') },
        },
        vertexShader: `
          varying vec3 vWorldPos;
          void main() {
            vec4 wp = modelMatrix * vec4(position, 1.0);
            vWorldPos = wp.xyz;
            gl_Position = projectionMatrix * viewMatrix * wp;
          }
        `,
        fragmentShader: `
          uniform vec3 uTopColor;
          uniform vec3 uMidColor;
          uniform vec3 uHorizonColor;
          varying vec3 vWorldPos;
          void main() {
            float h = normalize(vWorldPos).y;
            vec3 col = mix(uHorizonColor, uMidColor, smoothstep(-0.08, 0.25, h));
            col = mix(col, uTopColor, smoothstep(0.22, 0.78, h));
            gl_FragColor = vec4(col, 1.0);
          }
        `,
      }),
    []
  );

  return (
    <mesh material={shaderMat} position={[2.25, 0, -15]}>
      <sphereGeometry args={[135, 32, 24]} />
    </mesh>
  );
}

interface CloudSpec {
  baseX: number;
  y: number;
  z: number;
  scaleX: number;
  scaleY: number;
  speed: number;
  opacity: number;
}

const DAY_CLOUD_SPECS: CloudSpec[] = [
  { baseX: -28, y: 15.5, z: -48, scaleX: 24, scaleY: 10.5, speed: 0.28, opacity: 0.88 },
  { baseX: -8, y: 13.5, z: -40, scaleX: 20, scaleY: 9.0, speed: 0.22, opacity: 0.86 },
  { baseX: 11, y: 17.5, z: -52, scaleX: 26, scaleY: 11.5, speed: 0.31, opacity: 0.9 },
  { baseX: 29, y: 14.0, z: -44, scaleX: 22, scaleY: 9.8, speed: 0.24, opacity: 0.84 },
  { baseX: -38, y: 21.0, z: -64, scaleX: 30, scaleY: 13.0, speed: 0.19, opacity: 0.78 },
  { baseX: -15, y: 22.5, z: -68, scaleX: 32, scaleY: 13.5, speed: 0.21, opacity: 0.82 },
  { baseX: 18, y: 23.0, z: -66, scaleX: 28, scaleY: 12.0, speed: 0.25, opacity: 0.8 },
  { baseX: 42, y: 19.5, z: -60, scaleX: 26, scaleY: 11.2, speed: 0.2, opacity: 0.76 },
  { baseX: -19, y: 11.2, z: -34, scaleX: 16, scaleY: 7.4, speed: 0.34, opacity: 0.74 },
  { baseX: 4, y: 10.8, z: -31, scaleX: 15, scaleY: 6.8, speed: 0.3, opacity: 0.72 },
  { baseX: 23, y: 11.6, z: -35, scaleX: 17, scaleY: 7.5, speed: 0.27, opacity: 0.76 },
  { baseX: 0, y: 19.2, z: -56, scaleX: 25, scaleY: 10.8, speed: 0.23, opacity: 0.85 },
];

/** Self-contained procedural sunlit cumulus clouds drifting smoothly high above the skyline */
function DaylightClouds() {
  const groupRef = useRef<THREE.Group>(null);
  const { cloudPuffTexture } = useMemo(() => getProceduralTextures(), []);

  useFrame((state) => {
    const grp = groupRef.current;
    if (!grp) return;
    const t = state.clock.elapsedTime;
    grp.children.forEach((child, i) => {
      const spec = DAY_CLOUD_SPECS[i];
      if (!spec) return;
      // Gentle horizontal wind drift wrapping smoothly across the wide horizon
      const span = 110;
      const rawX = spec.baseX + t * spec.speed;
      const wrappedX = ((((rawX + span * 0.5) % span) + span) % span) - span * 0.5;
      child.position.x = wrappedX;
      child.position.y = spec.y + Math.sin(t * 0.18 + i * 0.9) * 0.25;
    });
  });

  return (
    <group ref={groupRef} name="Procedural_Daylight_Clouds">
      {DAY_CLOUD_SPECS.map((spec, idx) => (
        <mesh
          key={idx}
          position={[spec.baseX, spec.y, spec.z]}
          rotation={[0.04, 0, 0]}
        >
          <planeGeometry args={[spec.scaleX, spec.scaleY]} />
          <meshBasicMaterial
            map={cloudPuffTexture}
            transparent
            opacity={spec.opacity}
            depthWrite={false}
            fog
          />
        </mesh>
      ))}
    </group>
  );
}

function AtmosphereLighting({ isEvening }: { isEvening: boolean }) {
  const { scene, gl } = useThree();
  const ambientRef = useRef<THREE.AmbientLight>(null);
  const hemiLightRef = useRef<THREE.HemisphereLight>(null);
  const dirLightRef = useRef<THREE.DirectionalLight>(null);
  const dirTargetObj = useMemo(() => {
    const obj = new THREE.Object3D();
    obj.position.set(2.0, 0.8, -6.0);
    return obj;
  }, []);
  const bounceLightRef = useRef<THREE.DirectionalLight>(null);
  const bounceTargetObj = useMemo(() => {
    const obj = new THREE.Object3D();
    obj.position.set(2.0, 1.0, -2.6);
    return obj;
  }, []);
  const warmLightsRef = useRef<THREE.Group>(null);
  const fogColorRef = useRef(DAY_FOG.clone());

  // Bind directional light targets cleanly into the scene graph
  useEffect(() => {
    if (dirLightRef.current) {
      dirLightRef.current.target = dirTargetObj;
    }
    if (bounceLightRef.current) {
      bounceLightRef.current.target = bounceTargetObj;
    }
  }, [dirTargetObj, bounceTargetObj]);

  useFrame((state, delta) => {
    const t = Math.min(1, delta * 3.0);
    const elapsed = state.clock.elapsedTime;

    // 1. Atmospheric haze fog transition (#CFE3F5 daylight <-> #090D16 deep twilight)
    const targetFog = isEvening ? NIGHT_FOG : DAY_FOG;
    fogColorRef.current.lerp(targetFog, t);
    scene.background = fogColorRef.current;
    if (scene.fog instanceof THREE.FogExp2) {
      scene.fog.color.copy(fogColorRef.current);
      scene.fog.density = THREE.MathUtils.lerp(scene.fog.density, 0.009, t);
    }

    // 2. Photographic ACES Filmic exposure (0.92 crisp daylight -> 1.05 rich evening) & balanced IBL
    const targetExposure = isEvening ? 1.05 : 0.92;
    gl.toneMappingExposure = THREE.MathUtils.lerp(
      gl.toneMappingExposure,
      targetExposure,
      t
    );
    scene.environmentIntensity = THREE.MathUtils.lerp(
      scene.environmentIntensity ?? 0.48,
      isEvening ? 0.18 : 0.48,
      t
    );

    // 3. Controlled Ambient & Hemisphere fill (eliminates white daylight glare)
    if (ambientRef.current) {
      ambientRef.current.intensity = THREE.MathUtils.lerp(
        ambientRef.current.intensity,
        isEvening ? 0.12 : 0.28,
        t
      );
    }

    if (hemiLightRef.current) {
      hemiLightRef.current.intensity = THREE.MathUtils.lerp(
        hemiLightRef.current.intensity,
        isEvening ? 0.15 : 0.35,
        t
      );
    }

    // 4. Primary warm-white sun (2.6) <-> cool twilight moonlight (0.25)
    if (dirLightRef.current) {
      dirLightRef.current.intensity = THREE.MathUtils.lerp(
        dirLightRef.current.intensity,
        isEvening ? 0.25 : 2.6,
        t
      );
      dirLightRef.current.color.lerp(isEvening ? NIGHT_MOON : DAY_SUN, t);
    }

    // 5. Gentle indirect daylight bounce into deeper Foyer/Kitchen zones (off at night)
    if (bounceLightRef.current) {
      bounceLightRef.current.intensity = THREE.MathUtils.lerp(
        bounceLightRef.current.intensity,
        isEvening ? 0.0 : 0.45,
        t
      );
    }

    // 6. Interior warm architectural point lights with realistic dim-glow animations in Evening Mood
    if (warmLightsRef.current) {
      warmLightsRef.current.children.forEach((child, idx) => {
        if (child instanceof THREE.PointLight) {
          const baseNight = (child.userData.nightIntensity as number) ?? 1.4;
          const baseDay = (child.userData.dayIntensity as number) ?? 0.0;
          const breathAmp = (child.userData.breathAmp as number) ?? 0.06;
          const animType = (child.userData.animType as string) ?? 'standard';
          let breath = 1;
          if (isEvening) {
            if (animType === 'pendant') {
              // Synchronized calm dim warm filament breathing for lampugantung.glb
              const phase = idx === 1 ? 0.35 : 1.85;
              breath =
                1 +
                Math.sin(elapsed * 0.62 + phase) * 0.1 +
                Math.sin(elapsed * 1.48 + phase * 1.7) * 0.04;
            } else if (animType === 'table-lamp') {
              // Synchronized realistic tranquil dim glow shimmer for lampumeja.glb beside sofa
              breath =
                1 +
                Math.sin(elapsed * 0.54 + 0.9) * 0.11 +
                Math.sin(elapsed * 1.32 + 1.89) * 0.045 +
                Math.sin(elapsed * 2.4 + 0.5) * 0.018;
            } else {
              breath = 1 + Math.sin(elapsed * 0.68 + idx * 1.1) * breathAmp;
            }
          }
          const target = isEvening ? baseNight * breath : baseDay;
          child.intensity = THREE.MathUtils.lerp(child.intensity, target, t);
        }
      });
    }
  });

  return (
    <>
      {/* Subtle Atmospheric Haze merging distant city towers cleanly into horizon */}
      <fogExp2 attach="fog" args={[isEvening ? '#090D16' : '#CFE3F5', 0.009]} />

      {/* Crisp Blue Daytime Sky + Drifting Clouds vs Deep Twilight Dome + Stars */}
      {isEvening ? (
        <>
          <TwilightSkyDome />
          <Stars
            radius={80}
            depth={40}
            count={1500}
            factor={2}
            saturation={0.2}
            fade
            speed={0.35}
          />
        </>
      ) : (
        <>
          <DaylightSkyDome />
          <DaylightClouds />
        </>
      )}

      {/* Low, physically restrained base ambient & sky/ground hemisphere bounce */}
      <ambientLight ref={ambientRef} intensity={0.28} color="#FFFBF4" />
      <hemisphereLight
        ref={hemiLightRef}
        args={['#DCEEFF', '#B8A38C', 0.35]}
      />

      {/* Directional Sunlight target & primary soft-shadow sun casting window/furniture shadows */}
      <primitive object={dirTargetObj} />
      <directionalLight
        ref={dirLightRef}
        position={[10.5, 6.8, -20.5]}
        intensity={2.6}
        color="#FFF5E4"
        castShadow
        shadow-mapSize={[2048, 2048]}
        shadow-camera-left={-12}
        shadow-camera-right={12}
        shadow-camera-top={14}
        shadow-camera-bottom={-4}
        shadow-camera-near={1}
        shadow-camera-far={38}
        shadow-bias={-0.0006}
        shadow-normalBias={0.035}
      />

      {/* Soft indirect window-bounce fill for Foyer & Kitchen (non-shadow-casting, off at night) */}
      <primitive object={bounceTargetObj} />
      <directionalLight
        ref={bounceLightRef}
        position={[6.5, 3.8, -5.5]}
        intensity={0.45}
        color="#F8F2E8"
      />

      {/* Warm Architectural Interior Point Lights (active in Evening Mood; wardrobe & bathroom softly lit in day) */}
      <group ref={warmLightsRef}>
        {/* Foyer indirect cove */}
        <pointLight
          position={[2.25, 2.52, -1.05]}
          color="#FFBE73"
          distance={5.5}
          decay={2}
          intensity={0.0}
          userData={{ dayIntensity: 0.0, nightIntensity: 1.45, breathAmp: 0.05 }}
        />
        {/* Kitchen Woven Basket Pendant 01 (lampugantung.glb opal bulb center) */}
        <pointLight
          position={[2.25, 2.04, -2.88]}
          color="#FFCA80"
          distance={5.8}
          decay={2}
          intensity={0.0}
          userData={{ dayIntensity: 0.0, nightIntensity: 1.65, breathAmp: 0.09, animType: 'pendant' }}
        />
        {/* Kitchen Woven Basket Pendant 02 (lampugantung.glb opal bulb center) */}
        <pointLight
          position={[2.25, 2.04, -3.62]}
          color="#FFCA80"
          distance={5.8}
          decay={2}
          intensity={0.0}
          userData={{ dayIntensity: 0.0, nightIntensity: 1.6, breathAmp: 0.09, animType: 'pendant' }}
        />
        {/* Living Room Sculptural Lamp beside Sofa (lampumeja.glb diffuser core) */}
        <pointLight
          position={[3.58, 1.08, -5.05]}
          color="#FFC87A"
          distance={6.8}
          decay={2}
          intensity={0.0}
          userData={{ dayIntensity: 0.0, nightIntensity: 2.15, breathAmp: 0.1, animType: 'table-lamp' }}
        />
        {/* Master Bedroom Left & Right Globe Pendants */}
        <pointLight
          position={[1.22, 1.4, -8.85]}
          color="#FFBE73"
          distance={5.5}
          decay={2}
          intensity={0.0}
          userData={{ dayIntensity: 0.0, nightIntensity: 1.55, breathAmp: 0.06 }}
        />
        <pointLight
          position={[3.28, 1.4, -8.85]}
          color="#FFBE73"
          distance={5.5}
          decay={2}
          intensity={0.0}
          userData={{ dayIntensity: 0.0, nightIntensity: 1.55, breathAmp: 0.06 }}
        />
        {/* Dedicated Warm Interior Wardrobe Light (lemari.glb open oak shelves, brass rail & safe) */}
        <pointLight
          position={[3.72, 2.24, -8.5]}
          color="#FFD699"
          distance={3.6}
          decay={2}
          intensity={0.75}
          userData={{ dayIntensity: 0.75, nightIntensity: 1.45, breathAmp: 0.04 }}
        />
        {/* En-Suite Bathroom ceiling & backlit mirror halo (enclosed windowless spa alcove) */}
        <pointLight
          position={[-0.85, 2.35, -8.0]}
          color="#FFF1DC"
          distance={5.5}
          decay={1.7}
          intensity={1.75}
          userData={{ dayIntensity: 1.75, nightIntensity: 1.65, breathAmp: 0.04 }}
        />
        <pointLight
          position={[-1.08, 1.52, -7.88]}
          color="#FFBE73"
          distance={4.5}
          decay={1.8}
          intensity={0.85}
          userData={{ dayIntensity: 0.85, nightIntensity: 1.55, breathAmp: 0.05 }}
        />
        {/* Balcony subtle warm evening spill (softly illuminates Burgundy lounge chairs at night) */}
        <pointLight
          position={[2.25, 2.25, -10.18]}
          color="#FFBE73"
          distance={5.8}
          decay={2}
          intensity={0.0}
          userData={{ dayIntensity: 0.0, nightIntensity: 1.35, breathAmp: 0.05 }}
        />
      </group>

      {/* Natural Grounded Ambient Occlusion under all furniture on the apartment floor */}
      <ContactShadows
        position={[2.25, 0.069, -5.5]}
        opacity={0.42}
        scale={15}
        blur={2}
        far={4}
        frames={2}
        resolution={512}
        color="#231D16"
      />

      {/* Restrained Procedural IBL Environment for realistic marble, brass & glass reflections */}
      <Environment resolution={256} frames={1}>
        <Lightformer
          form="rect"
          intensity={1.4}
          position={[0, 6, -5]}
          rotation={[Math.PI / 2, 0, 0]}
          scale={[12, 16, 1]}
          color="#FFF8EE"
        />
        <Lightformer
          form="rect"
          intensity={2.2}
          position={[0, 4, -22]}
          rotation={[0, 0, 0]}
          scale={[24, 10, 1]}
          color="#93C5FD"
        />
        <Lightformer
          form="rect"
          intensity={1.2}
          position={[10, 3, -5]}
          rotation={[0, -Math.PI / 2, 0]}
          scale={[14, 6, 1]}
          color="#FFF3E0"
        />
        <Lightformer
          form="rect"
          intensity={0.65}
          position={[-10, 2, -5]}
          rotation={[0, Math.PI / 2, 0]}
          scale={[14, 6, 1]}
          color="#E5DDD0"
        />
        <Lightformer
          form="rect"
          intensity={0.45}
          position={[0, -5, -5]}
          rotation={[-Math.PI / 2, 0, 0]}
          scale={[16, 16, 1]}
          color="#BFA88F"
        />
      </Environment>
    </>
  );
}

export function TourScene({
  scrollProgressRef,
  isEvening,
  activeSubView,
  activeZoneId,
  activeHotspotId,
  onSelectHotspot,
  showHotspots,
}: TourSceneProps) {
  return (
    <Canvas
      shadows="soft"
      dpr={[1, 2]}
      camera={{ fov: 50, near: 0.08, far: 220, position: [2.22, 1.56, -1.98] }}
      gl={{
        antialias: true,
        powerPreference: 'high-performance',
        toneMapping: THREE.ACESFilmicToneMapping,
        toneMappingExposure: isEvening ? 1.05 : 0.92,
      }}
      onPointerMissed={() => onSelectHotspot(null)}
      className="h-full w-full"
    >
      <AtmosphereLighting isEvening={isEvening} />
      <CameraRig
        scrollProgressRef={scrollProgressRef}
        activeSubView={activeSubView}
      />
      <Suspense fallback={null}>
        <ApartmentModels
          isEvening={isEvening}
          activeZoneId={activeZoneId}
          activeHotspotId={activeHotspotId}
          onSelectHotspot={onSelectHotspot}
          showHotspots={showHotspots}
        />
      </Suspense>
    </Canvas>
  );
}
