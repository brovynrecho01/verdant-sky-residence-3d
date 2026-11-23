import { useEffect, useMemo, useRef, useState } from 'react';
import * as THREE from 'three';
import { useFrame } from '@react-three/fiber';
import { Html, useGLTF } from '@react-three/drei';
import { Plus, X } from 'lucide-react';
import { HOTSPOTS, type ZoneId } from '../../data/tourData';
import {
  applyBoxProjectedUVs,
  getProceduralTextures,
} from '../../utils/proceduralTextures';

const BASE_URL = import.meta.env.BASE_URL;

const MODEL_PATHS = {
  shell: `${BASE_URL}models/00-apartment-shell.glb`,
  foyer: `${BASE_URL}models/01-foyer.glb`,
  kitchen: `${BASE_URL}models/02-kitchen.glb`,
  living: `${BASE_URL}models/03-living.glb`,
  bedroom: `${BASE_URL}models/04-bedroom.glb`,
  bathroom: `${BASE_URL}models/05-bathroom.glb`,
  balcony: `${BASE_URL}models/06-balcony-skyline.glb`,
  // Custom replacement & accent assets
  customBed: `${BASE_URL}models/bed.glb`,
  customKitchenPendant: `${BASE_URL}models/lampugantung.glb`,
  customLivingLamp: `${BASE_URL}models/lampumeja.glb`,
  customWardrobe: `${BASE_URL}models/lemari.glb`,
  customSofa: `${BASE_URL}models/sofa.glb`,
  customTowel: `${BASE_URL}models/towel.glb`,
} as const;

Object.values(MODEL_PATHS).forEach((path) => {
  useGLTF.preload(path);
});

interface ApartmentModelsProps {
  isEvening: boolean;
  activeZoneId: ZoneId;
  activeHotspotId: string | null;
  onSelectHotspot: (id: string | null) => void;
  showHotspots: boolean;
}

interface EmissiveTarget {
  material: THREE.MeshStandardMaterial | THREE.MeshPhysicalMaterial;
  dayIntensity: number;
  nightIntensity: number;
  isSkyline: boolean;
  /** 'standard' | 'pendant' | 'table-lamp' for realistic distinct dim-glow breathing curves */
  animProfile: 'standard' | 'pendant' | 'table-lamp';
  phase: number;
}

const LIGHT_NAME_REGEX =
  /^(Light_|City_Skyline_Lights)|LED|Bulb|Globe|Lamp_Shade|Cove_Warm_Light|luminous|diffuser/i;

function isStandardOrPhysical(
  mat: THREE.Material
): mat is THREE.MeshStandardMaterial | THREE.MeshPhysicalMaterial {
  return (
    (mat instanceof THREE.MeshStandardMaterial ||
      mat instanceof THREE.MeshPhysicalMaterial) &&
    mat.emissive !== undefined
  );
}

/** Creates a tactile MeshPhysicalMaterial with procedural linen wrinkle bump & soft fabric sheen */
function createSoftFabricMaterial(
  name: string,
  hexColor: string,
  bumpMap: THREE.CanvasTexture,
  options?: { bumpScale?: number; roughness?: number; sheen?: number; sheenColor?: string }
): THREE.MeshPhysicalMaterial {
  return new THREE.MeshPhysicalMaterial({
    name,
    color: new THREE.Color(hexColor),
    bumpMap,
    bumpScale: options?.bumpScale ?? 0.035,
    roughness: options?.roughness ?? 0.88,
    metalness: 0.0,
    sheen: options?.sheen ?? 0.35,
    sheenRoughness: 0.75,
    sheenColor: new THREE.Color(options?.sheenColor ?? '#FFFBF5'),
  });
}

/**
 * Enhances general architectural surfaces (walls, wood, marble, fabrics) with
 * procedural 512x512 PBR textures without overwriting specialized custom materials.
 */
function enhanceInteriorMaterial(
  mesh: THREE.Mesh,
  mat: THREE.MeshStandardMaterial | THREE.MeshPhysicalMaterial,
  textures: ReturnType<typeof getProceduralTextures>
) {
  const combined = `${mesh.name} ${mesh.parent?.name ?? ''} ${mat.name}`;

  if (
    /^Custom_/i.test(mat.name) ||
    /Glass|Mirror|Brass|Bronze|Metal|Chrome|TV_Screen|LED|Bulb|Globe|Lamp_Shade|Cove_Warm|Skyline|Leaf|Soil|Bark|Indicator|Diffuser|Luminous/i.test(
      combined
    )
  ) {
    return;
  }

  applyBoxProjectedUVs(mesh.geometry, 0.85);

  if (/Marble|Travertine|Limestone|Countertop|Island/i.test(combined)) {
    if (!mat.map) {
      mat.map = textures.marbleMap;
    }
    mat.roughnessMap = textures.marbleRoughness;
    mat.roughness = 0.2;
    mat.metalness = 0.05;
    mat.needsUpdate = true;
    return;
  }

  if (/Boucle|Linen|Fabric|Rug|Wool|Curtain|Towel/i.test(combined)) {
    mat.bumpMap = textures.fabricBump;
    mat.bumpScale = 0.026;
    mat.roughness = 0.9;
    mat.metalness = 0.0;
    mat.needsUpdate = true;
    return;
  }

  if (
    /Oak|Wood|WPC|Door|Slat|Cabinet|Floor_Main|Herringbone|Plinth|Platform|Bench|MediaConsole|Nightstand|Desk|Chair|Wardrobe/i.test(
      combined
    ) &&
    !/StoneTile|Ceramic|Glass|Handle|Track/i.test(combined)
  ) {
    if (!mat.map) {
      mat.map = textures.oakMap;
    }
    mat.roughnessMap = textures.oakRoughness;
    mat.roughness = 0.42;
    mat.metalness = 0.02;
    mat.needsUpdate = true;
    return;
  }

  if (/Limewash|Plaster|Ceiling|Stucco|Wall/i.test(combined)) {
    if (/Limewash|Plaster/i.test(mat.name)) {
      mat.color.set('#F3EFE6');
    }
    mat.bumpMap = textures.limewashBump;
    mat.bumpScale = 0.015;
    mat.roughnessMap = textures.limewashRoughness;
    mat.roughness = 0.85;
    mat.metalness = 0.0;
    mat.needsUpdate = true;
  }
}

/**
 * Sleek architectural stone/oak feature backing panel mounted in front of the living-room
 * wood slats (Z = -7.40) so the Living Room TV sits cleanly proud with zero slat clipping
 * and zero overlap with the Bedroom TV on the opposite side.
 */
function LivingTvFeatureBacking({
  marbleMap,
  marbleRoughness,
}: {
  marbleMap: THREE.CanvasTexture;
  marbleRoughness: THREE.CanvasTexture;
}) {
  return (
    <group position={[2.18, 1.32, -7.4]} name="Living_TV_FeatureBacking">
      {/* Main warm travertine-plaster TV backing slab */}
      <mesh castShadow receiveShadow>
        <boxGeometry args={[1.66, 1.36, 0.045]} />
        <meshStandardMaterial
          color="#EAE4DA"
          map={marbleMap}
          roughnessMap={marbleRoughness}
          roughness={0.55}
          metalness={0.02}
        />
      </mesh>
      {/* Subtle architectural dark-bronze vertical side trim */}
      <mesh position={[-0.84, 0, 0]}>
        <boxGeometry args={[0.022, 1.36, 0.05]} />
        <meshStandardMaterial color="#3A332D" roughness={0.45} metalness={0.5} />
      </mesh>
      <mesh position={[0.84, 0, 0]}>
        <boxGeometry args={[0.022, 1.36, 0.05]} />
        <meshStandardMaterial color="#3A332D" roughness={0.45} metalness={0.5} />
      </mesh>
    </group>
  );
}

/**
 * Sleek minimalist wall-mounted Bedroom Smart TV + floating oak shelf mounted cleanly
 * on the bedroom side of the partition (Z = -7.66, clear of the oak slats at -7.61).
 */
function BedroomTvWallUnit({
  oakMap,
  oakRoughness,
}: {
  oakMap: THREE.CanvasTexture;
  oakRoughness: THREE.CanvasTexture;
}) {
  return (
    <group position={[2.38, 1.44, -7.66]} name="Bedroom_WallMounted_TV">
      {/* Clean warm oak backing panel separating Bedroom TV cleanly from wood slats */}
      <mesh castShadow receiveShadow position={[0, -0.06, 0.025]}>
        <boxGeometry args={[1.42, 1.18, 0.025]} />
        <meshStandardMaterial
          color="#DFC6A6"
          map={oakMap}
          roughnessMap={oakRoughness}
          roughness={0.46}
          metalness={0.02}
        />
      </mesh>
      <mesh castShadow receiveShadow position={[0, 0, -0.012]}>
        <boxGeometry args={[1.18, 0.68, 0.025]} />
        <meshStandardMaterial color="#18181B" roughness={0.35} metalness={0.45} />
      </mesh>
      <mesh position={[0, 0, -0.026]}>
        <planeGeometry args={[1.14, 0.64]} />
        <meshPhysicalMaterial
          color="#0F131A"
          roughness={0.14}
          metalness={0.15}
          clearcoat={0.5}
          clearcoatRoughness={0.15}
        />
      </mesh>
      <mesh castShadow receiveShadow position={[0, -0.46, -0.08]}>
        <boxGeometry args={[1.28, 0.045, 0.16]} />
        <meshStandardMaterial
          color="#D5B895"
          map={oakMap}
          roughnessMap={oakRoughness}
          roughness={0.42}
          metalness={0.02}
        />
      </mesh>
      <mesh castShadow receiveShadow position={[-0.44, -0.365, -0.08]}>
        <cylinderGeometry args={[0.04, 0.052, 0.145, 18]} />
        <meshStandardMaterial color="#EAE3D8" roughness={0.78} />
      </mesh>
      <mesh castShadow receiveShadow position={[0.42, -0.415, -0.08]}>
        <boxGeometry args={[0.2, 0.045, 0.13]} />
        <meshStandardMaterial color="#7C4326" roughness={0.62} />
      </mesh>
    </group>
  );
}

/** Clones materials on an imported asset so animations/tweaks never leak between instances */
function cloneAssetMaterials(root: THREE.Object3D) {
  root.traverse((obj) => {
    if ((obj as THREE.Mesh).isMesh) {
      const mesh = obj as THREE.Mesh;
      if (Array.isArray(mesh.material)) {
        mesh.material = mesh.material.map((m) => (m ? m.clone() : m));
      } else if (mesh.material) {
        mesh.material = mesh.material.clone();
      }
    }
  });
}

export function ApartmentModels({
  isEvening,
  activeZoneId,
  activeHotspotId,
  onSelectHotspot,
  showHotspots,
}: ApartmentModelsProps) {
  const rootRef = useRef<THREE.Group>(null);
  const emissiveTargetsRef = useRef<EmissiveTarget[]>([]);
  const [hotspotPositions, setHotspotPositions] = useState<
    Record<string, [number, number, number]>
  >(() =>
    Object.fromEntries(HOTSPOTS.map((h) => [h.id, h.fallbackPosition]))
  );

  const shellGltf = useGLTF(MODEL_PATHS.shell);
  const foyerGltf = useGLTF(MODEL_PATHS.foyer);
  const kitchenGltf = useGLTF(MODEL_PATHS.kitchen);
  const livingGltf = useGLTF(MODEL_PATHS.living);
  const bedroomGltf = useGLTF(MODEL_PATHS.bedroom);
  const bathroomGltf = useGLTF(MODEL_PATHS.bathroom);
  const balconyGltf = useGLTF(MODEL_PATHS.balcony);

  const customBedGltf = useGLTF(MODEL_PATHS.customBed);
  const customPendantGltf = useGLTF(MODEL_PATHS.customKitchenPendant);
  const customLivingLampGltf = useGLTF(MODEL_PATHS.customLivingLamp);
  const customWardrobeGltf = useGLTF(MODEL_PATHS.customWardrobe);
  const customSofaGltf = useGLTF(MODEL_PATHS.customSofa);
  const customTowelGltf = useGLTF(MODEL_PATHS.customTowel);

  const textures = useMemo(() => getProceduralTextures(), []);

  const scenes = useMemo(() => {
    const shell = shellGltf.scene.clone(true);
    const foyer = foyerGltf.scene.clone(true);
    const kitchen = kitchenGltf.scene.clone(true);
    const living = livingGltf.scene.clone(true);
    const bedroom = bedroomGltf.scene.clone(true);
    const bathroom = bathroomGltf.scene.clone(true);
    const balcony = balconyGltf.scene.clone(true);

    const customBed = customBedGltf.scene.clone(true);
    const customPendant01 = customPendantGltf.scene.clone(true);
    const customPendant02 = customPendantGltf.scene.clone(true);
    const customLivingLamp = customLivingLampGltf.scene.clone(true);
    const customWardrobe = customWardrobeGltf.scene.clone(true);
    const customSofa = customSofaGltf.scene.clone(true);
    const customTowel = customTowelGltf.scene.clone(true);

    [
      customBed,
      customPendant01,
      customPendant02,
      customLivingLamp,
      customWardrobe,
      customSofa,
      customTowel,
    ].forEach(cloneAssetMaterials);

    // 1. Shell polish: prevent ceiling self-shadow grid artifacts (petak-petak gelap) & coplanar cove z-fighting
    shell.traverse((obj) => {
      if ((obj as THREE.Mesh).isMesh) {
        const mesh = obj as THREE.Mesh;
        const mats = Array.isArray(mesh.material) ? mesh.material : [mesh.material];
        let shouldCastShadow = false;
        let shouldReceiveShadow = true;

        mats.forEach((m) => {
          if (!m || !isStandardOrPhysical(m)) return;
          if (/Glass/i.test(m.name)) {
            shouldCastShadow = false;
            shouldReceiveShadow = false;
            m.transparent = true;
            m.opacity = 0.18;
            m.roughness = 0.06;
            m.metalness = 0.1;
            m.depthWrite = false;
          } else if (/Cove_Warm_Light/i.test(m.name)) {
            // Prevent coplanar z-fighting against ceiling plaster at Y=2.98 when off in Daylight
            shouldCastShadow = false;
            shouldReceiveShadow = false;
            m.color.set('#F3EFE6');
            m.polygonOffset = true;
            m.polygonOffsetFactor = -2;
            m.polygonOffsetUnits = -2;
            m.needsUpdate = true;
          } else if (/Exterior_Stucco/i.test(m.name)) {
            shouldCastShadow = false;
            shouldReceiveShadow = false;
            enhanceInteriorMaterial(mesh, m, textures);
          } else if (/Dark_Bronze_Frame|Light_Oak_Wood/i.test(m.name)) {
            // Window mullions and wood slats cast crisp architectural shadows
            shouldCastShadow = true;
            shouldReceiveShadow = true;
            enhanceInteriorMaterial(mesh, m, textures);
          } else {
            // Walls, ceiling & floors receive crisp shadows without self-shadowing ceiling acne
            shouldCastShadow = false;
            shouldReceiveShadow = true;
            enhanceInteriorMaterial(mesh, m, textures);
          }
        });

        mesh.castShadow = shouldCastShadow;
        mesh.receiveShadow = shouldReceiveShadow;
      }
    });

    // 2. Foyer cleanup: hide duplicate outer wall/floor/ceiling to prevent z-fighting with shell
    foyer.traverse((obj) => {
      if (/^(Foyer_Floor|Foyer_Ceiling_Cove|Foyer_Wall_South)$/i.test(obj.name)) {
        obj.visible = false;
      }
      if ((obj as THREE.Mesh).isMesh) {
        const mesh = obj as THREE.Mesh;
        if (/Foyer_Bench_Cushion/i.test(`${mesh.name} ${mesh.parent?.name ?? ''}`)) {
          mesh.geometry.computeVertexNormals();
          applyBoxProjectedUVs(mesh.geometry, 0.9);
          mesh.material = createSoftFabricMaterial(
            'Custom_Foyer_BenchCushion',
            '#DED6C8',
            textures.linenWrinkleBump,
            { bumpScale: 0.03 }
          );
        }
      }
    });

    // 3. Kitchen: hide old pendant lamps so our new woven teak lampugantung.glb replaces them cleanly
    kitchen.traverse((obj) => {
      if (/^Light_Kitchen_Pendant/i.test(obj.name)) {
        obj.visible = false;
      }
    });

    // 4. Living Room: hide old sofa, pillows & standing lamp; pull TV cleanly forward off the wood slats
    living.traverse((obj) => {
      if (/^(Sofa_|Light_Living_Lamp)/i.test(obj.name)) {
        obj.visible = false;
        return;
      }
      if (/^(TV_WallMounted_UltraThin|TV_Screen)$/i.test(obj.name)) {
        obj.position.z += 0.13;
      }
    });

    // 5. Bedroom: hide old walls/floor/ceiling, old bed & headboard, AND old wardrobe (replaced by bed.glb + lemari.glb)
    const deskNodes: THREE.Object3D[] = [];
    const bedsideNodes: THREE.Object3D[] = [];

    const bedroomDirectChildren = [...bedroom.children];
    bedroomDirectChildren.forEach((child) => {
      if (
        /^(Bedroom_Wall_Back|Bedroom_Wall_Left|Bedroom_Wall_Right|Bedroom_Ceiling|Bedroom_Floor|Bedroom_Baseboard_Back|Bedroom_Baseboard_Right|Bedroom_BackWall_OakSlats|Bedroom_Wardrobe_|Bedroom_Bed_|Bedroom_Pillow_|Bedroom_Headboard_)/i.test(
          child.name
        )
      ) {
        child.visible = false;
        return;
      }
      if (/^(Bedroom_Vanity_|Bedroom_Chair_)/i.test(child.name)) {
        deskNodes.push(child);
      } else {
        bedsideNodes.push(child);
      }
    });

    if (deskNodes.length > 0) {
      const deskGroup = new THREE.Group();
      deskGroup.name = 'Composed_Bedroom_Desk';
      deskGroup.position.set(-1.6, 0, -8.94);
      deskGroup.rotation.set(0, Math.PI, 0);
      deskGroup.scale.set(1, 1, 0.72);

      const deskInner = new THREE.Group();
      deskInner.position.set(-2.365, 0, 8.44);
      deskNodes.forEach((node) => deskInner.add(node));
      deskGroup.add(deskInner);
      bedroom.add(deskGroup);
    }

    if (bedsideNodes.length > 0) {
      const bedsideGroup = new THREE.Group();
      bedsideGroup.name = 'Composed_Bedroom_BedsideCluster';
      bedsideGroup.scale.set(0.86, 1, 0.94);
      bedsideGroup.position.set(0, 0, -0.45);
      bedsideNodes.forEach((node) => bedsideGroup.add(node));
      bedroom.add(bedsideGroup);
    }

    bedroom.traverse((obj) => {
      if (!(obj as THREE.Mesh).isMesh) return;
      const mesh = obj as THREE.Mesh;
      const tag = `${mesh.name} ${mesh.parent?.name ?? ''}`;
      if (/Bedroom_Chair_Seat/i.test(tag)) {
        mesh.geometry.computeVertexNormals();
        applyBoxProjectedUVs(mesh.geometry, 1.0);
        mesh.material = createSoftFabricMaterial(
          'Custom_Bed_ChairSeat',
          '#DDD5C8',
          textures.linenWrinkleBump,
          { bumpScale: 0.03, roughness: 0.88, sheen: 0.32 }
        );
      } else if (/Bedroom_Bedside_Book1/i.test(tag)) {
        mesh.material = new THREE.MeshStandardMaterial({
          name: 'Custom_Book_Olive',
          color: '#5C6B5D',
          roughness: 0.78,
        });
      } else if (/Bedroom_Bedside_Book2/i.test(tag)) {
        mesh.material = new THREE.MeshStandardMaterial({
          name: 'Custom_Book_Terracotta',
          color: '#A15946',
          roughness: 0.78,
        });
      }
    });

    // 6. Polish new custom GLB assets (preserve their authentic materials, add shadows & subtle surface richness)
    // 6a. bed.glb (Walnut/Oak Platform Bed with Linen Pillows & Sage Quilted Duvet)
    customBed.name = 'Custom_Replacement_Bed';
    customBed.traverse((obj) => {
      if (!(obj as THREE.Mesh).isMesh) return;
      const mesh = obj as THREE.Mesh;
      mesh.castShadow = true;
      mesh.receiveShadow = true;
      const mats = Array.isArray(mesh.material) ? mesh.material : [mesh.material];
      mats.forEach((m) => {
        if (!m || !isStandardOrPhysical(m)) return;
        if (/upholstery|linen|sage|cream/i.test(m.name)) {
          applyBoxProjectedUVs(mesh.geometry, 1.0);
          if (!m.bumpMap) {
            m.bumpMap = textures.linenWrinkleBump;
            m.bumpScale = 0.018;
          }
          m.roughness = Math.max(m.roughness, 0.84);
          m.needsUpdate = true;
        }
      });
    });

    // 6b. lemari.glb (Open Oak Hotel Wardrobe with Brass Rail, Safe & Folded Linen)
    customWardrobe.name = 'Custom_Replacement_Wardrobe';
    customWardrobe.traverse((obj) => {
      if (!(obj as THREE.Mesh).isMesh) return;
      const mesh = obj as THREE.Mesh;
      mesh.castShadow = true;
      mesh.receiveShadow = true;
      const mats = Array.isArray(mesh.material) ? mesh.material : [mesh.material];
      mats.forEach((m) => {
        if (!m || !isStandardOrPhysical(m)) return;
        if (/upholstery|linen/i.test(m.name)) {
          applyBoxProjectedUVs(mesh.geometry, 1.1);
          if (!m.bumpMap) {
            m.bumpMap = textures.linenWrinkleBump;
            m.bumpScale = 0.016;
          }
          m.roughness = Math.max(m.roughness, 0.86);
          m.needsUpdate = true;
        }
      });
    });

    // 6c. lampugantung.glb (2x Woven Teak Basket Kitchen Island Pendants with Dim Night Glow)
    [customPendant01, customPendant02].forEach((pendant, idx) => {
      pendant.name = `Custom_Kitchen_Pendant_0${idx + 1}`;
      pendant.traverse((obj) => {
        if (!(obj as THREE.Mesh).isMesh) return;
        const mesh = obj as THREE.Mesh;
        const mats = Array.isArray(mesh.material) ? mesh.material : [mesh.material];
        const isBulb = /bulb|diffuser|luminous/i.test(
          `${mesh.name} ${mats.map((m) => m?.name ?? '').join(' ')}`
        );
        mesh.castShadow = !isBulb;
        mesh.receiveShadow = !isBulb;
        mats.forEach((m) => {
          if (!m || !isStandardOrPhysical(m)) return;
          if (/luminous|diffuser/i.test(m.name) || /bulb/i.test(mesh.name)) {
            m.name = `Custom_Kitchen_Pendant_Bulb_0${idx + 1}`;
            m.color.set('#FFF8EC');
            m.emissive.set('#F5D299');
            m.emissiveIntensity = 0.0;
            m.roughness = 0.25;
            m.needsUpdate = true;
          }
        });
      });
    });

    // 6d. lampumeja.glb (Sculptural Brass & Stacked Offset Diffuser Lamp beside Living Sofa)
    customLivingLamp.name = 'Custom_Living_TableLamp';
    customLivingLamp.traverse((obj) => {
      if (!(obj as THREE.Mesh).isMesh) return;
      const mesh = obj as THREE.Mesh;
      const mats = Array.isArray(mesh.material) ? mesh.material : [mesh.material];
      const isDiffuser = /diffuser|shade|emissive/i.test(
        `${mesh.name} ${mats.map((m) => m?.name ?? '').join(' ')}`
      );
      mesh.castShadow = !isDiffuser;
      mesh.receiveShadow = true;
      mats.forEach((m) => {
        if (!m || !isStandardOrPhysical(m)) return;
        if (/diffuser|shade|emissive/i.test(m.name)) {
          m.name = 'Custom_Living_TableLamp_Diffuser';
          m.color.set('#FFF6E8');
          m.emissive.set('#F6D296');
          m.emissiveIntensity = 0.0;
          m.roughness = 0.35;
          m.needsUpdate = true;
        }
      });
    });

    // 6e. sofa.glb (Plush White Fluffy Fur / Shearling Bouclé Lounge Sofa)
    const whiteFluffySofaMat = new THREE.MeshPhysicalMaterial({
      name: 'Custom_Living_WhiteFluffySofa',
      color: new THREE.Color('#FAF7F2'),
      map: textures.furFleeceMap,
      bumpMap: textures.furFleeceBump,
      bumpScale: 0.048,
      roughness: 0.94,
      metalness: 0.0,
      sheen: 0.75,
      sheenRoughness: 0.62,
      sheenColor: new THREE.Color('#FFFFFF'),
    });

    const sofaLegBronzeMat = new THREE.MeshStandardMaterial({
      name: 'Custom_Living_SofaLegs',
      color: new THREE.Color('#8C7355'),
      roughness: 0.34,
      metalness: 0.68,
    });

    customSofa.name = 'Custom_Replacement_Sofa';
    customSofa.traverse((obj) => {
      if (!(obj as THREE.Mesh).isMesh) return;
      const mesh = obj as THREE.Mesh;
      mesh.castShadow = true;
      mesh.receiveShadow = true;
      mesh.geometry.computeVertexNormals();
      applyBoxProjectedUVs(mesh.geometry, 2.2, { force: true });
      const origMats = Array.isArray(mesh.material) ? mesh.material : [mesh.material];
      const replaced = origMats.map((m) => {
        if (!m) return whiteFluffySofaMat;
        if (/metal/i.test(m.name)) return sofaLegBronzeMat;
        return whiteFluffySofaMat;
      });
      mesh.material = Array.isArray(mesh.material) ? replaced : replaced[0];
    });

    // 6f. towel.glb (Brushed Nickel Bathroom Towel Bar + Warm Grey & White Terry Towels)
    customTowel.name = 'Custom_Bathroom_TowelBar';
    customTowel.traverse((obj) => {
      if (!(obj as THREE.Mesh).isMesh) return;
      const mesh = obj as THREE.Mesh;
      mesh.castShadow = false;
      mesh.receiveShadow = false;
      const mats = Array.isArray(mesh.material) ? mesh.material : [mesh.material];
      mats.forEach((m) => {
        if (!m || !isStandardOrPhysical(m)) return;
        if (/terry|towel/i.test(`${mesh.name} ${m.name}`)) {
          applyBoxProjectedUVs(mesh.geometry, 1.5);
          if (!m.bumpMap) {
            m.bumpMap = textures.fabricBump;
            m.bumpScale = 0.022;
          }
          m.roughness = 0.92;
          m.needsUpdate = true;
        }
      });
    });

    // 7. Bathroom cleanup: remove south entry wall/jambs and replace problematic normal maps with crisp PBR textures
    bathroom.traverse((obj) => {
      if (
        /^(Wall_South_Left|Wall_South_Right|Wall_South_Header|Door_Jamb_Left|Door_Jamb_Right|Door_Jamb_Top|Ceiling_Main|Floor_Main)$/i.test(
          obj.name
        )
      ) {
        obj.visible = false;
      }
      if ((obj as THREE.Mesh).isMesh) {
        const mesh = obj as THREE.Mesh;
        mesh.castShadow = false;
        mesh.receiveShadow = false;
        const mats = Array.isArray(mesh.material) ? mesh.material : [mesh.material];
        mats.forEach((m) => {
          if (!m || !isStandardOrPhysical(m)) return;
          if (/Frameless_Glass/i.test(m.name)) {
            m.transparent = true;
            m.opacity = 0.24;
            m.roughness = 0.08;
            m.depthWrite = false;
          } else if (/Wall_StoneTile/i.test(m.name)) {
            m.map = null;
            m.normalMap = null;
            m.roughnessMap = textures.limewashRoughness;
            m.bumpMap = textures.limewashBump;
            m.bumpScale = 0.012;
            m.metalnessMap = null;
            m.color.set('#EAE4DA');
            m.roughness = 0.78;
            m.metalness = 0.0;
            m.needsUpdate = true;
          } else if (/Floor_StoneTile/i.test(m.name)) {
            m.map = null;
            m.normalMap = null;
            m.roughnessMap = textures.limewashRoughness;
            m.metalnessMap = null;
            m.color.set('#CFC7BA');
            m.roughness = 0.72;
            m.metalness = 0.0;
            m.needsUpdate = true;
          } else if (/Travertine/i.test(m.name)) {
            m.map = textures.marbleMap;
            m.normalMap = null;
            m.roughnessMap = textures.marbleRoughness;
            m.metalnessMap = null;
            m.color.set('#EAE2D4');
            m.roughness = 0.2;
            m.metalness = 0.05;
            m.needsUpdate = true;
          } else if (/Warm_Oak/i.test(m.name)) {
            m.map = textures.oakMap;
            m.normalMap = null;
            m.roughnessMap = textures.oakRoughness;
            m.metalnessMap = null;
            m.color.set('#D2AD84');
            m.roughness = 0.42;
            m.metalness = 0.02;
            m.needsUpdate = true;
          } else if (/Mirror_Glass/i.test(m.name)) {
            m.color.set('#DCE4EC');
            m.metalness = 0.55;
            m.roughness = 0.12;
            m.emissive.set('#C8D4E0');
            m.emissiveIntensity = 0.2;
            m.needsUpdate = true;
          }
        });
      }
    });

    // 8. Balcony: Rich Burgundy Lounge Chairs (#6B1D2F) + Dark Teak Frames (#5C3A21) + Skyline Curtain-Wall Glass
    const skylineGlassMaterial = new THREE.MeshStandardMaterial({
      name: 'Procedural_City_Skyline_Glass',
      color: new THREE.Color('#CBD5E1'),
      map: textures.skylineMap,
      emissive: new THREE.Color('#FFFFFF'),
      emissiveMap: textures.skylineEmissiveMap,
      emissiveIntensity: 0.15,
      metalness: 0.75,
      roughness: 0.25,
    });

    const skylineCrownMaterial = new THREE.MeshStandardMaterial({
      name: 'Procedural_City_Skyline_Crown',
      color: new THREE.Color('#1E293B'),
      metalness: 0.65,
      roughness: 0.35,
    });

    const burgundyCushionMat = new THREE.MeshPhysicalMaterial({
      name: 'Custom_Balcony_BurgundyCushion',
      color: new THREE.Color('#6B1D2F'),
      bumpMap: textures.wovenRopeBump,
      bumpScale: 0.028,
      roughness: 0.78,
      metalness: 0.0,
      sheen: 0.34,
      sheenRoughness: 0.7,
      sheenColor: new THREE.Color('#A64458'),
    });

    const burgundyRopeMat = new THREE.MeshPhysicalMaterial({
      name: 'Custom_Balcony_BurgundyRope',
      color: new THREE.Color('#571524'),
      bumpMap: textures.wovenRopeBump,
      bumpScale: 0.038,
      roughness: 0.82,
      metalness: 0.0,
      sheen: 0.22,
      sheenRoughness: 0.8,
      sheenColor: new THREE.Color('#8E3346'),
    });

    const darkTeakFrameMat = new THREE.MeshStandardMaterial({
      name: 'Custom_Balcony_DarkTeak',
      color: new THREE.Color('#5C3A21'),
      map: textures.oakMap,
      roughnessMap: textures.oakRoughness,
      roughness: 0.44,
      metalness: 0.03,
    });

    balcony.traverse((obj) => {
      if (
        /^(Balcony_Concrete_Slab|Balcony_WPC_Decking_Tiles|Balcony_Railing_BaseChannel|Hotspot_SkyBalcony)$/i.test(
          obj.name
        )
      ) {
        obj.scale.x = 0.52;
      }
      if (obj.name === 'Balcony_Planter_Monstera') {
        obj.position.x = -1.68;
      }
      if (obj.name === 'Balcony_Planter_OliveTree') {
        obj.position.x = 1.68;
      }
      if (obj.name === 'City_Skyline_Lights') {
        obj.position.z = -16.0;
        obj.position.y = -7.0;
        obj.scale.set(0.95, 0.72, 0.95);
      }

      if ((obj as THREE.Mesh).isMesh) {
        const mesh = obj as THREE.Mesh;
        const tag = `${mesh.name} ${mesh.parent?.name ?? ''}`;
        const isSkylineLightsNode = /City_Skyline_Lights/i.test(mesh.name);
        const isSkylineCrownNode = /City_Skyline_Crowns/i.test(mesh.name);

        if (isSkylineLightsNode) {
          applyBoxProjectedUVs(mesh.geometry, 0.058, {
            force: true,
            maskRoofsToDarkCorner: true,
          });
          mesh.material = skylineGlassMaterial;
          mesh.castShadow = false;
          mesh.receiveShadow = false;
          return;
        }

        if (isSkylineCrownNode) {
          mesh.material = skylineCrownMaterial;
          mesh.castShadow = false;
          mesh.receiveShadow = false;
          return;
        }

        if (/LoungeChair|chair|kursi|lounge|seat|cushion/i.test(tag)) {
          const origMats = Array.isArray(mesh.material) ? mesh.material : [mesh.material];
          const replaced = origMats.map((m) => {
            if (!m) return m;
            if (/Cushion/i.test(m.name)) {
              mesh.geometry.computeVertexNormals();
              applyBoxProjectedUVs(mesh.geometry, 1.0);
              return burgundyCushionMat;
            }
            if (/Rope/i.test(m.name)) {
              applyBoxProjectedUVs(mesh.geometry, 1.3);
              return burgundyRopeMat;
            }
            if (/Oak|Wood/i.test(m.name)) {
              applyBoxProjectedUVs(mesh.geometry, 1.0);
              return darkTeakFrameMat;
            }
            return m;
          });
          mesh.material = Array.isArray(mesh.material) ? replaced : replaced[0];
          mesh.castShadow = true;
          mesh.receiveShadow = true;
          return;
        }

        const mats = Array.isArray(mesh.material) ? mesh.material : [mesh.material];
        mats.forEach((m) => {
          if (!m || !isStandardOrPhysical(m)) return;
          if (/Tempered_Glass/i.test(m.name)) {
            m.transparent = true;
            m.opacity = 0.18;
            m.roughness = 0.05;
            m.metalness = 0.1;
            m.depthWrite = false;
          } else {
            enhanceInteriorMaterial(mesh, m, textures);
          }
        });
      }
    });

    // 9. Apply procedural PBR & clean shadow flags across base Foyer, Kitchen, Living, Bedroom, Balcony
    [foyer, kitchen, living, bedroom, balcony].forEach((group) => {
      group.traverse((obj) => {
        if ((obj as THREE.Mesh).isMesh) {
          const mesh = obj as THREE.Mesh;
          if (/City_Skyline/i.test(mesh.name)) return;

          const mats = Array.isArray(mesh.material) ? mesh.material : [mesh.material];
          const matNames = mats.map((m) => m?.name ?? '').join(' ');
          const combined = `${mesh.name} ${mesh.parent?.name ?? ''} ${matNames}`;
          const isGlassOrCurtainOrLight =
            /Glass|Curtain|Mirror|LED|Bulb|Globe|Lamp_Shade|Cove_Warm/i.test(combined);

          mesh.castShadow = !isGlassOrCurtainOrLight;
          mesh.receiveShadow = !/Glass|LED|Bulb|Globe/i.test(combined);

          mats.forEach((m) => {
            if (m && isStandardOrPhysical(m)) {
              enhanceInteriorMaterial(mesh, m, textures);
            }
          });
        }
      });
    });

    return {
      shell,
      foyer,
      kitchen,
      living,
      bedroom,
      bathroom,
      balcony,
      customBed,
      customPendant01,
      customPendant02,
      customLivingLamp,
      customWardrobe,
      customSofa,
      customTowel,
    };
  }, [
    shellGltf.scene,
    foyerGltf.scene,
    kitchenGltf.scene,
    livingGltf.scene,
    bedroomGltf.scene,
    bathroomGltf.scene,
    balconyGltf.scene,
    customBedGltf.scene,
    customPendantGltf.scene,
    customLivingLampGltf.scene,
    customWardrobeGltf.scene,
    customSofaGltf.scene,
    customTowelGltf.scene,
    textures,
  ]);

  // Dynamic Mesh Traversal: detect Hotspot anchors & collect Light_ / Skyline / Custom Lamp emissive targets
  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;

    root.updateMatrixWorld(true);

    const detectedPositions: Record<string, [number, number, number]> = {};
    const seenMaterials = new Set<THREE.Material>();
    const emissiveTargets: EmissiveTarget[] = [];
    const tempBox = new THREE.Box3();
    const tempCenter = new THREE.Vector3();

    root.traverse((obj) => {
      // 1. Hotspot anchor matching
      if (obj.name) {
        for (const hs of HOTSPOTS) {
          if (
            !detectedPositions[hs.id] &&
            (obj.name === hs.meshName || obj.name.includes(hs.meshName))
          ) {
            tempBox.setFromObject(obj);
            if (!tempBox.isEmpty()) {
              tempBox.getCenter(tempCenter);
              const ox = hs.offset?.[0] ?? 0;
              const oy = hs.offset?.[1] ?? 0;
              const oz = hs.offset?.[2] ?? 0;
              detectedPositions[hs.id] = [
                tempCenter.x + ox,
                tempCenter.y + oy,
                tempCenter.z + oz,
              ];
            }
          }
        }
      }

      // 2. Light / Emissive material traversal for Daylight (0.0) <-> Evening (calm dim warm glow)
      if ((obj as THREE.Mesh).isMesh) {
        const mesh = obj as THREE.Mesh;
        const mats = Array.isArray(mesh.material) ? mesh.material : [mesh.material];
        const nameMatchesLight = LIGHT_NAME_REGEX.test(mesh.name);

        mats.forEach((mat) => {
          if (!mat || seenMaterials.has(mat) || !isStandardOrPhysical(mat)) return;

          if (mat.name === 'Procedural_City_Skyline_Glass') {
            seenMaterials.add(mat);
            emissiveTargets.push({
              material: mat,
              dayIntensity: 0.15,
              nightIntensity: 2.4,
              isSkyline: true,
              animProfile: 'standard',
              phase: 0,
            });
            return;
          }

          if (
            mat.name === 'Procedural_City_Skyline_Crown' ||
            /Mirror_Glass/i.test(mat.name)
          ) {
            seenMaterials.add(mat);
            return;
          }

          // Custom Kitchen Hanging Basket Pendants (lampugantung.glb)
          if (/^Custom_Kitchen_Pendant_Bulb/i.test(mat.name)) {
            seenMaterials.add(mat);
            mat.emissive.set('#F5D299');
            emissiveTargets.push({
              material: mat,
              dayIntensity: 0.0,
              nightIntensity: 2.35,
              isSkyline: false,
              animProfile: 'pendant',
              phase: mat.name.endsWith('02') ? 1.85 : 0.35,
            });
            return;
          }

          // Custom Living Sculptural Table/Floor Lamp (lampumeja.glb)
          if (mat.name === 'Custom_Living_TableLamp_Diffuser') {
            seenMaterials.add(mat);
            mat.emissive.set('#F6D296');
            emissiveTargets.push({
              material: mat,
              dayIntensity: 0.0,
              nightIntensity: 2.45,
              isSkyline: false,
              animProfile: 'table-lamp',
              phase: 0.9,
            });
            return;
          }

          const hasNonBlackEmissive =
            mat.emissive.r + mat.emissive.g + mat.emissive.b > 0.05;
          const matNameMatchesLight = LIGHT_NAME_REGEX.test(mat.name);

          if (matNameMatchesLight || hasNonBlackEmissive || nameMatchesLight) {
            seenMaterials.add(mat);
            mat.emissive.set('#F5D9AA');

            const isFixtureLamp =
              /Pendant|Lamp_Shade|Globe|Bulb|Living_Lamp|Wardrobe_LED/i.test(
                `${mesh.name} ${mat.name}`
              );

            emissiveTargets.push({
              material: mat,
              dayIntensity: 0.0,
              nightIntensity: isFixtureLamp ? 2.4 : 2.0,
              isSkyline: false,
              animProfile: 'standard',
              phase: emissiveTargets.length * 1.15,
            });
          }
        });
      }
    });

    emissiveTargetsRef.current = emissiveTargets;

    const merged: Record<string, [number, number, number]> = {};
    for (const hs of HOTSPOTS) {
      merged[hs.id] = detectedPositions[hs.id] ?? hs.fallbackPosition;
    }
    setHotspotPositions(merged);
  }, [scenes]);

  // Smoothly interpolate emissive intensities with realistic calm dim breathing in Evening Mood
  useFrame((state, delta) => {
    const speed = Math.min(1, delta * 3.0);
    const elapsed = state.clock.elapsedTime;
    for (const target of emissiveTargetsRef.current) {
      let desired = isEvening ? target.nightIntensity : target.dayIntensity;
      if (isEvening && !target.isSkyline) {
        if (target.animProfile === 'pendant') {
          // Soft dim warm filament breathing for woven kitchen basket pendants
          const slowBreath = Math.sin(elapsed * 0.62 + target.phase) * 0.09;
          const microWarmth = Math.sin(elapsed * 1.48 + target.phase * 1.7) * 0.035;
          desired *= 1 + slowBreath + microWarmth;
        } else if (target.animProfile === 'table-lamp') {
          // Realistic tranquil dim ambient shimmer for sculptural stacked-disc lamp near sofa
          const primaryWave = Math.sin(elapsed * 0.54 + target.phase) * 0.1;
          const secondaryWave = Math.sin(elapsed * 1.32 + target.phase * 2.1) * 0.04;
          const subtleRipple = Math.sin(elapsed * 2.4 + 0.5) * 0.015;
          desired *= 1 + primaryWave + secondaryWave + subtleRipple;
        } else {
          const breath = 1 + Math.sin(elapsed * 0.7 + target.phase) * 0.06;
          desired *= breath;
        }
      }
      target.material.emissiveIntensity = THREE.MathUtils.lerp(
        target.material.emissiveIntensity,
        desired,
        speed
      );
    }
  });

  return (
    <group ref={rootRef} position={[0, 0, 0]}>
      {/* 00 — Architectural Shell at World Origin */}
      <primitive object={scenes.shell} position={[0, 0, 0]} />

      {/* 01 — Entrance Foyer */}
      <primitive object={scenes.foyer} position={[0, 0.062, -0.15]} />

      {/* 02 — Compact Kitchen & Travertine Island + Custom Woven Teak Pendants (lampugantung.glb) */}
      <primitive object={scenes.kitchen} position={[2.0, 0.062, 0]} />
      <primitive
        object={scenes.customPendant01}
        position={[2.25, 1.72, -2.88]}
        scale={[0.82, 1.05, 0.82]}
      />
      <primitive
        object={scenes.customPendant02}
        position={[2.25, 1.72, -3.62]}
        scale={[0.82, 1.05, 0.82]}
      />

      {/* 03 — Open-Plan Living Sanctuary + White Fluffy Lounge Sofa (sofa.glb) & Sculptural Lamp (lampumeja.glb) */}
      <primitive object={scenes.living} position={[2.25, 0.062, 0]} />
      <LivingTvFeatureBacking
        marbleMap={textures.marbleMap}
        marbleRoughness={textures.marbleRoughness}
      />
      <group
        position={[2.17, 0.062, -5.12]}
        rotation={[0, Math.PI, 0]}
        scale={[1.95, 1.95, 2.1]}
      >
        <primitive object={scenes.customSofa} position={[-0.56, 0, 0.205]} />
      </group>
      <primitive
        object={scenes.customLivingLamp}
        position={[3.58, 0.062, -5.05]}
        scale={[0.92, 0.96, 0.92]}
      />

      {/* 04 — Master Bedroom Suite + Custom Platform Bed (bed.glb) & Open Oak Wardrobe (lemari.glb) */}
      <primitive object={scenes.bedroom} position={[2.25, 0.062, 0.05]} />
      <primitive
        object={scenes.customBed}
        position={[2.25, 0.062, -8.56]}
        scale={[0.82, 0.9, 0.72]}
      />
      <primitive
        object={scenes.customWardrobe}
        position={[4.05, 0.062, -8.5]}
        rotation={[0, -Math.PI / 2, 0]}
        scale={[1.38, 1.18, 1.0]}
      />

      {/* 04b — Sleek Wall-Mounted Bedroom Smart TV & Media Ledge on Bedroom Partition */}
      <BedroomTvWallUnit
        oakMap={textures.oakMap}
        oakRoughness={textures.oakRoughness}
      />

      {/* 05 — En-Suite Bathroom + Custom Wall-Mounted Terry Towels (towel.glb) outside walk-in shower */}
      <primitive
        object={scenes.bathroom}
        position={[-0.93, 0.065, -8.0]}
        rotation={[0, Math.PI / 2, 0]}
        scale={[0.74, 0.96, 0.78]}
      />
      <primitive
        object={scenes.customTowel}
        position={[-0.68, 1.42, -7.265]}
        rotation={[0, Math.PI, 0]}
        scale={[0.85, 0.85, 0.85]}
      />

      {/* 06 — Private Sky Balcony & Panoramic City Skyline */}
      <primitive object={scenes.balcony} position={[2.25, 0.068, 0]} />

      {/* Interactive 3D Hotspot Pins */}
      {showHotspots &&
        HOTSPOTS.map((hs) => {
          const isRelevant = hs.zoneId === activeZoneId;
          const isOpen = activeHotspotId === hs.id;
          if (!isRelevant && !isOpen) return null;

          const pos = hotspotPositions[hs.id] ?? hs.fallbackPosition;

          return (
            <Html key={hs.id} position={pos} center zIndexRange={[25, 0]}>
              <div className="relative flex flex-col items-center select-none pointer-events-auto">
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    onSelectHotspot(isOpen ? null : hs.id);
                  }}
                  aria-label={`Detail material: ${hs.title}`}
                  className={`group relative flex h-9 w-9 items-center justify-center rounded-full border transition-all duration-300 cursor-pointer ${
                    isOpen
                      ? 'bg-[#18181B] text-[#F5F2EB] border-[#18181B] scale-105'
                      : 'bg-white/95 text-[#18181B] border-stone-300/90 hover:bg-[#18181B] hover:text-[#F5F2EB] backdrop-blur-md shadow-md'
                  }`}
                >
                  {!isOpen && (
                    <span className="animate-hotspot-pulse pointer-events-none absolute inset-0 rounded-full border border-white/90 bg-white/40" />
                  )}
                  {isOpen ? <X className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
                </button>

                {isOpen && (
                  <div
                    onClick={(e) => e.stopPropagation()}
                    className="absolute bottom-full mb-3 w-[260px] sm:w-[290px] max-w-[82vw] rounded-xl border border-stone-200/90 bg-[#F5F2EB]/96 p-3.5 text-left text-[#18181B] shadow-xl backdrop-blur-md"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <span className="text-[10px] font-semibold tracking-[0.16em] uppercase text-[#A88B68]">
                        Detail Material
                      </span>
                      <button
                        type="button"
                        onClick={() => onSelectHotspot(null)}
                        aria-label="Tutup detail"
                        className="rounded-full p-0.5 text-stone-500 hover:bg-stone-200/70 hover:text-[#18181B] transition-colors cursor-pointer"
                      >
                        <X className="h-3.5 w-3.5" />
                      </button>
                    </div>
                    <h4 className="mt-1 text-sm font-semibold leading-snug text-[#18181B]">
                      {hs.title}
                    </h4>
                    <p className="mt-1.5 text-xs leading-relaxed text-stone-600">
                      {hs.description}
                    </p>
                  </div>
                )}
              </div>
            </Html>
          );
        })}
    </group>
  );
}
