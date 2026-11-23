import * as THREE from 'three';

export interface ProceduralTexturePack {
  skylineMap: THREE.CanvasTexture;
  skylineEmissiveMap: THREE.CanvasTexture;
  limewashBump: THREE.CanvasTexture;
  limewashRoughness: THREE.CanvasTexture;
  oakMap: THREE.CanvasTexture;
  oakRoughness: THREE.CanvasTexture;
  fabricBump: THREE.CanvasTexture;
  linenWrinkleBump: THREE.CanvasTexture;
  wovenRopeBump: THREE.CanvasTexture;
  furFleeceMap: THREE.CanvasTexture;
  furFleeceBump: THREE.CanvasTexture;
  marbleMap: THREE.CanvasTexture;
  marbleRoughness: THREE.CanvasTexture;
  cloudPuffTexture: THREE.CanvasTexture;
}

let cachedPack: ProceduralTexturePack | null = null;

function createSeededRandom(seedInit: number) {
  let seed = seedInit;
  return () => {
    seed = (seed * 16807) % 2147483647;
    return (seed - 1) / 2147483646;
  };
}

function finalizeTexture(
  canvas: HTMLCanvasElement,
  isColor: boolean,
  repeatX = 1,
  repeatY = 1,
  clampEdge = false
): THREE.CanvasTexture {
  const tex = new THREE.CanvasTexture(canvas);
  tex.wrapS = clampEdge ? THREE.ClampToEdgeWrapping : THREE.RepeatWrapping;
  tex.wrapT = clampEdge ? THREE.ClampToEdgeWrapping : THREE.RepeatWrapping;
  tex.repeat.set(repeatX, repeatY);
  tex.colorSpace = isColor ? THREE.SRGBColorSpace : THREE.NoColorSpace;
  tex.anisotropy = 4;
  tex.needsUpdate = true;
  return tex;
}

/**
 * Generates 512x512 skyscraper curtain-wall albedo + emissive window-grid textures.
 * Top-left 8x8 corner is kept dark/non-emissive so horizontal roof faces can safely sample it.
 */
function buildSkylineTextures(): {
  skylineMap: THREE.CanvasTexture;
  skylineEmissiveMap: THREE.CanvasTexture;
} {
  const size = 512;
  const albedoCanvas = document.createElement('canvas');
  albedoCanvas.width = size;
  albedoCanvas.height = size;
  const aCtx = albedoCanvas.getContext('2d')!;

  const emissiveCanvas = document.createElement('canvas');
  emissiveCanvas.width = size;
  emissiveCanvas.height = size;
  const eCtx = emissiveCanvas.getContext('2d')!;

  // Base architectural reflective dark blue-grey curtain-wall glass
  aCtx.fillStyle = '#1E293B';
  aCtx.fillRect(0, 0, size, size);

  eCtx.fillStyle = '#000000';
  eCtx.fillRect(0, 0, size, size);

  const cols = 16;
  const rows = 32;
  const cellW = size / cols;
  const cellH = size / rows;
  const rand = createSeededRandom(8317);

  for (let r = 0; r < rows; r++) {
    // Structural spandrel slab band between floors
    aCtx.fillStyle = '#141C2B';
    aCtx.fillRect(0, r * cellH, size, cellH * 0.24);

    // Some floors are brighter office strips, others quiet residential
    const isOfficeFloor = rand() > 0.68;
    const floorLitChance = isOfficeFloor ? 0.62 : rand() > 0.35 ? 0.34 : 0.12;

    for (let c = 0; c < cols; c++) {
      // Reserve top-left cell completely dark for roof UV clamping
      if (r === 0 && c === 0) continue;

      const x = c * cellW;
      const y = r * cellH;
      const padX = cellW * 0.14;
      const padTop = cellH * 0.28;
      const padBot = cellH * 0.1;
      const w = cellW - padX * 2;
      const h = cellH - padTop - padBot;

      // Subtle glass reflection tint variation per pane
      const glassTone = rand();
      aCtx.fillStyle =
        glassTone > 0.65
          ? '#3B4D66'
          : glassTone > 0.3
            ? '#2A394F'
            : '#1E293B';
      aCtx.fillRect(x + padX, y + padTop, w, h);

      // Vertical aluminum mullion highlight
      aCtx.fillStyle = '#0F172A';
      aCtx.fillRect(x, y, 2, cellH);

      // Randomized illuminated windows (Warm Amber #FDE68A & Cool White #E0F2FE)
      if (rand() < floorLitChance) {
        const pick = rand();
        const litColor =
          pick > 0.36
            ? pick > 0.72
              ? '#FDE68A' // Warm amber residential/interior
              : '#FCD34D' // Slightly deeper warm gold
            : '#E0F2FE'; // Cool crisp office white

        // Emissive window pane with soft interior depth gradient
        const grad = eCtx.createLinearGradient(x, y + padTop, x, y + padTop + h);
        grad.addColorStop(0, litColor);
        grad.addColorStop(1, pick > 0.36 ? '#D97706' : '#93C5FD');
        eCtx.fillStyle = grad;
        eCtx.fillRect(x + padX + 1, y + padTop + 1, Math.max(1, w - 2), Math.max(1, h - 2));

        // Subtle warm albedo lift for daytime glass depth
        aCtx.fillStyle =
          pick > 0.36 ? 'rgba(253, 230, 138, 0.16)' : 'rgba(224, 242, 254, 0.15)';
        aCtx.fillRect(x + padX, y + padTop, w, h);
      }
    }
  }

  return {
    skylineMap: finalizeTexture(albedoCanvas, true, 1, 1),
    skylineEmissiveMap: finalizeTexture(emissiveCanvas, true, 1, 1),
  };
}

/**
 * Generates 512x512 multi-layer soft mineral Limewash / Plaster bump + roughness textures
 */
function buildLimewashTextures(): {
  limewashBump: THREE.CanvasTexture;
  limewashRoughness: THREE.CanvasTexture;
} {
  const size = 512;
  const bumpCanvas = document.createElement('canvas');
  bumpCanvas.width = size;
  bumpCanvas.height = size;
  const bCtx = bumpCanvas.getContext('2d')!;

  const roughCanvas = document.createElement('canvas');
  roughCanvas.width = size;
  roughCanvas.height = size;
  const rCtx = roughCanvas.getContext('2d')!;

  bCtx.fillStyle = '#808080';
  bCtx.fillRect(0, 0, size, size);

  rCtx.fillStyle = '#DEDEDE';
  rCtx.fillRect(0, 0, size, size);

  const rand = createSeededRandom(2049);

  // Layer 1: Broad organic limewash trowel clouds
  for (let i = 0; i < 260; i++) {
    const x = rand() * size;
    const y = rand() * size;
    const rad = 26 + rand() * 76;
    const val = Math.floor(108 + rand() * 42);
    const rVal = Math.floor(205 + rand() * 44);

    const bGrad = bCtx.createRadialGradient(x, y, 2, x, y, rad);
    bGrad.addColorStop(0, `rgba(${val},${val},${val},0.18)`);
    bGrad.addColorStop(1, `rgba(${val},${val},${val},0)`);
    bCtx.fillStyle = bGrad;
    bCtx.beginPath();
    bCtx.arc(x, y, rad, 0, Math.PI * 2);
    bCtx.fill();

    const rGrad = rCtx.createRadialGradient(x, y, 2, x, y, rad);
    rGrad.addColorStop(0, `rgba(${rVal},${rVal},${rVal},0.2)`);
    rGrad.addColorStop(1, `rgba(${rVal},${rVal},${rVal},0)`);
    rCtx.fillStyle = rGrad;
    rCtx.beginPath();
    rCtx.arc(x, y, rad, 0, Math.PI * 2);
    rCtx.fill();
  }

  // Layer 2: Fine plaster mineral micro-speckle
  for (let i = 0; i < 7200; i++) {
    const x = rand() * size;
    const y = rand() * size;
    const s = 1 + rand() * 2;
    const v = rand() > 0.5 ? 152 : 104;
    bCtx.fillStyle = `rgba(${v},${v},${v},0.2)`;
    bCtx.fillRect(x, y, s, s);
  }

  return {
    limewashBump: finalizeTexture(bumpCanvas, false, 3, 3),
    limewashRoughness: finalizeTexture(roughCanvas, false, 3, 3),
  };
}

/**
 * Generates 512x512 warm Oak Wood Grain albedo + roughness textures
 */
function buildOakTextures(): {
  oakMap: THREE.CanvasTexture;
  oakRoughness: THREE.CanvasTexture;
} {
  const size = 512;
  const mapCanvas = document.createElement('canvas');
  mapCanvas.width = size;
  mapCanvas.height = size;
  const mCtx = mapCanvas.getContext('2d')!;

  const roughCanvas = document.createElement('canvas');
  roughCanvas.width = size;
  roughCanvas.height = size;
  const rCtx = roughCanvas.getContext('2d')!;

  // Light warm neutral oak base (multiplies naturally with existing material tint)
  mCtx.fillStyle = '#D9C2A3';
  mCtx.fillRect(0, 0, size, size);

  rCtx.fillStyle = '#858585';
  rCtx.fillRect(0, 0, size, size);

  const rand = createSeededRandom(5519);

  // Subtle plank strips & fine longitudinal wood fibers
  const plankCount = 6;
  const plankW = size / plankCount;
  for (let p = 0; p < plankCount; p++) {
    const px = p * plankW;
    const shade = Math.floor((rand() - 0.5) * 16);
    mCtx.fillStyle = `rgb(${216 + shade}, ${191 + shade}, ${158 + shade})`;
    mCtx.fillRect(px, 0, plankW, size);

    // Subtle plank seam
    mCtx.fillStyle = 'rgba(105, 76, 48, 0.26)';
    mCtx.fillRect(px, 0, 1.6, size);
    rCtx.fillStyle = '#D4D4D4';
    rCtx.fillRect(px, 0, 2, size);
  }

  // Fine wavy grain fibers
  for (let i = 0; i < 460; i++) {
    const baseX = rand() * size;
    const alpha = 0.05 + rand() * 0.12;
    const dark = rand() > 0.35;
    mCtx.strokeStyle = dark
      ? `rgba(122, 88, 56, ${alpha})`
      : `rgba(246, 234, 216, ${alpha * 0.85})`;
    mCtx.lineWidth = 0.7 + rand() * 1.6;
    mCtx.beginPath();
    const freq = 0.012 + rand() * 0.015;
    const amp = 1.5 + rand() * 4.5;
    const phase = rand() * Math.PI * 2;
    for (let y = 0; y <= size; y += 16) {
      const x = baseX + Math.sin(y * freq + phase) * amp;
      if (y === 0) mCtx.moveTo(x, y);
      else mCtx.lineTo(x, y);
    }
    mCtx.stroke();

    // Matching roughness grain variation
    const rv = dark ? 162 : 106;
    rCtx.strokeStyle = `rgba(${rv},${rv},${rv},${alpha * 1.45})`;
    rCtx.lineWidth = 1.2;
    rCtx.beginPath();
    rCtx.moveTo(baseX, 0);
    rCtx.lineTo(baseX, size);
    rCtx.stroke();
  }

  return {
    oakMap: finalizeTexture(mapCanvas, true, 2, 2),
    oakRoughness: finalizeTexture(roughCanvas, false, 2, 2),
  };
}

/**
 * Generates 512x512 tactile Bouclé & Wool woven fabric bumpMap (rugs, curtains, towels)
 */
function buildFabricBumpTexture(): THREE.CanvasTexture {
  const size = 512;
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d')!;

  ctx.fillStyle = '#808080';
  ctx.fillRect(0, 0, size, size);

  const rand = createSeededRandom(9133);

  for (let y = 0; y < size; y += 4) {
    const v = Math.floor(118 + rand() * 24);
    ctx.fillStyle = `rgba(${v},${v},${v},0.45)`;
    ctx.fillRect(0, y, size, 2);
  }
  for (let x = 0; x < size; x += 4) {
    const v = Math.floor(112 + rand() * 30);
    ctx.fillStyle = `rgba(${v},${v},${v},0.4)`;
    ctx.fillRect(x, 0, 2, size);
  }

  for (let i = 0; i < 4200; i++) {
    const x = rand() * size;
    const y = rand() * size;
    const rad = 1.2 + rand() * 2.4;
    const bright = rand() > 0.45;
    ctx.fillStyle = bright ? 'rgba(215,215,215,0.32)' : 'rgba(62,62,62,0.28)';
    ctx.beginPath();
    ctx.arc(x, y, rad, 0, Math.PI * 2);
    ctx.fill();
  }

  return finalizeTexture(canvas, false, 4, 4);
}

/**
 * Generates 512x512 high-detail Linen & Organic Fabric Wrinkle bumpMap
 * Combines soft undulating drapery folds with crisp linen cross-hatch threads
 * to visually soften low-poly bedding, pillows, bolsters, and sofa cushions.
 */
function buildLinenWrinkleBumpTexture(): THREE.CanvasTexture {
  const size = 512;
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d')!;

  ctx.fillStyle = '#808080';
  ctx.fillRect(0, 0, size, size);

  const rand = createSeededRandom(6241);

  // Layer 1: Broad soft organic fabric creases & pillow-drape undulations (tileable via wrapped strokes)
  for (let f = 0; f < 46; f++) {
    const startX = rand() * size;
    const startY = rand() * size;
    const angle = (rand() - 0.5) * 1.1 + (f % 2 === 0 ? 0.45 : -0.35);
    const len = 110 + rand() * 220;
    const width = 18 + rand() * 44;
    const bright = rand() > 0.48;
    const v = bright ? 168 : 88;

    const endX = startX + Math.cos(angle) * len;
    const endY = startY + Math.sin(angle) * len;

    // Tile across edges so repeating never produces seams
    for (const ox of [-size, 0, size]) {
      for (const oy of [-size, 0, size]) {
        const sx = startX + ox;
        const sy = startY + oy;
        const ex = endX + ox;
        const ey = endY + oy;
        if (
          Math.max(sx, ex) < -width ||
          Math.min(sx, ex) > size + width ||
          Math.max(sy, ey) < -width ||
          Math.min(sy, ey) > size + width
        ) {
          continue;
        }
        const grad = ctx.createLinearGradient(sx, sy, ex, ey);
        grad.addColorStop(0, `rgba(${v},${v},${v},0)`);
        grad.addColorStop(0.5, `rgba(${v},${v},${v},0.22)`);
        grad.addColorStop(1, `rgba(${v},${v},${v},0)`);
        ctx.strokeStyle = grad;
        ctx.lineWidth = width;
        ctx.lineCap = 'round';
        ctx.beginPath();
        ctx.moveTo(sx, sy);
        ctx.quadraticCurveTo(
          (sx + ex) * 0.5 + (rand() - 0.5) * 32,
          (sy + ey) * 0.5 + (rand() - 0.5) * 32,
          ex,
          ey
        );
        ctx.stroke();
      }
    }
  }

  // Layer 2: Fine crisp linen cross-hatch warp & weft weave
  for (let y = 0; y < size; y += 3) {
    const v = Math.floor(114 + rand() * 28);
    ctx.fillStyle = `rgba(${v},${v},${v},0.38)`;
    ctx.fillRect(0, y, size, 1.5);
  }
  for (let x = 0; x < size; x += 3) {
    const v = Math.floor(110 + rand() * 32);
    ctx.fillStyle = `rgba(${v},${v},${v},0.34)`;
    ctx.fillRect(x, 0, 1.5, size);
  }

  // Layer 3: Subtle natural linen slub fibers
  for (let i = 0; i < 1600; i++) {
    const x = rand() * size;
    const y = rand() * size;
    const horiz = rand() > 0.5;
    const len = 4 + rand() * 14;
    const v = rand() > 0.5 ? 196 : 68;
    ctx.fillStyle = `rgba(${v},${v},${v},0.16)`;
    if (horiz) ctx.fillRect(x, y, len, 1.2);
    else ctx.fillRect(x, y, 1.2, len);
  }

  return finalizeTexture(canvas, false, 2.2, 2.2);
}

/**
 * Generates 512x512 tactile braided/woven outdoor rope & upholstery bumpMap
 * for the Burgundy balcony lounge chairs.
 */
function buildWovenRopeBumpTexture(): THREE.CanvasTexture {
  const size = 512;
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d')!;

  ctx.fillStyle = '#707070';
  ctx.fillRect(0, 0, size, size);

  const cell = 16;
  const rand = createSeededRandom(4421);

  for (let y = 0; y < size; y += cell) {
    for (let x = 0; x < size; x += cell) {
      const isHoriz = ((x / cell + y / cell) & 1) === 0;
      const jitter = Math.floor((rand() - 0.5) * 14);
      if (isHoriz) {
        const g = ctx.createLinearGradient(x, y, x, y + cell);
        g.addColorStop(0, '#444444');
        g.addColorStop(0.5, `rgb(${212 + jitter},${212 + jitter},${212 + jitter})`);
        g.addColorStop(1, '#444444');
        ctx.fillStyle = g;
        ctx.fillRect(x + 1, y + 2, cell - 2, cell - 4);
      } else {
        const g = ctx.createLinearGradient(x, y, x + cell, y);
        g.addColorStop(0, '#444444');
        g.addColorStop(0.5, `rgb(${198 + jitter},${198 + jitter},${198 + jitter})`);
        g.addColorStop(1, '#444444');
        ctx.fillStyle = g;
        ctx.fillRect(x + 2, y + 1, cell - 4, cell - 2);
      }
    }
  }

  return finalizeTexture(canvas, false, 5, 5);
}

/**
 * Generates 512x512 plush White Fluffy Fur / Shearling Bouclé albedo + bump textures
 * for the Living Room white lounge sofa.
 */
function buildFurFleeceTextures(): {
  furFleeceMap: THREE.CanvasTexture;
  furFleeceBump: THREE.CanvasTexture;
} {
  const size = 512;
  const mapCanvas = document.createElement('canvas');
  mapCanvas.width = size;
  mapCanvas.height = size;
  const mCtx = mapCanvas.getContext('2d')!;

  const bumpCanvas = document.createElement('canvas');
  bumpCanvas.width = size;
  bumpCanvas.height = size;
  const bCtx = bumpCanvas.getContext('2d')!;

  // Soft warm-white wool base
  mCtx.fillStyle = '#F5F1E9';
  mCtx.fillRect(0, 0, size, size);

  bCtx.fillStyle = '#747474';
  bCtx.fillRect(0, 0, size, size);

  const rand = createSeededRandom(7731);

  // Layer 1: Soft organic shearling/fleece pillow clusters
  for (let i = 0; i < 620; i++) {
    const x = rand() * size;
    const y = rand() * size;
    const r = 6 + rand() * 14;
    const bright = rand() > 0.35;

    const mGrad = mCtx.createRadialGradient(x, y, 0.5, x, y, r);
    mGrad.addColorStop(0, bright ? 'rgba(255,253,249,0.55)' : 'rgba(222,214,202,0.42)');
    mGrad.addColorStop(1, 'rgba(245,241,233,0)');
    mCtx.fillStyle = mGrad;
    mCtx.beginPath();
    mCtx.arc(x, y, r, 0, Math.PI * 2);
    mCtx.fill();

    const bVal = bright ? Math.floor(175 + rand() * 70) : Math.floor(45 + rand() * 55);
    const bGrad = bCtx.createRadialGradient(x, y, 0.5, x, y, r);
    bGrad.addColorStop(0, `rgba(${bVal},${bVal},${bVal},0.55)`);
    bGrad.addColorStop(1, `rgba(${bVal},${bVal},${bVal},0)`);
    bCtx.fillStyle = bGrad;
    bCtx.beginPath();
    bCtx.arc(x, y, r, 0, Math.PI * 2);
    bCtx.fill();
  }

  // Layer 2: Thousands of fine directional silky fur/wool tuft strokes
  for (let i = 0; i < 9500; i++) {
    const x = rand() * size;
    const y = rand() * size;
    const angle = (rand() - 0.5) * Math.PI * 2;
    const len = 3 + rand() * 9;
    const ex = x + Math.cos(angle) * len;
    const ey = y + Math.sin(angle) * len;
    const bright = rand() > 0.42;

    mCtx.strokeStyle = bright
      ? `rgba(255,254,251,${(0.28 + rand() * 0.35).toFixed(2)})`
      : `rgba(210,202,190,${(0.22 + rand() * 0.28).toFixed(2)})`;
    mCtx.lineWidth = 0.8 + rand() * 1.4;
    mCtx.beginPath();
    mCtx.moveTo(x, y);
    mCtx.lineTo(ex, ey);
    mCtx.stroke();

    const bv = bright ? Math.floor(195 + rand() * 60) : Math.floor(40 + rand() * 55);
    bCtx.strokeStyle = `rgba(${bv},${bv},${bv},0.48)`;
    bCtx.lineWidth = 0.9 + rand() * 1.5;
    bCtx.beginPath();
    bCtx.moveTo(x, y);
    bCtx.lineTo(ex, ey);
    bCtx.stroke();
  }

  return {
    furFleeceMap: finalizeTexture(mapCanvas, true, 3.5, 3.5),
    furFleeceBump: finalizeTexture(bumpCanvas, false, 3.5, 3.5),
  };
}

/**
 * Generates 512x512 Calacatta Marble & Travertine natural mineral vein map + roughnessMap
 */
function buildMarbleTextures(): {
  marbleMap: THREE.CanvasTexture;
  marbleRoughness: THREE.CanvasTexture;
} {
  const size = 512;
  const mapCanvas = document.createElement('canvas');
  mapCanvas.width = size;
  mapCanvas.height = size;
  const mCtx = mapCanvas.getContext('2d')!;

  const roughCanvas = document.createElement('canvas');
  roughCanvas.width = size;
  roughCanvas.height = size;
  const rCtx = roughCanvas.getContext('2d')!;

  mCtx.fillStyle = '#ECE7DF';
  mCtx.fillRect(0, 0, size, size);

  rCtx.fillStyle = '#383838';
  rCtx.fillRect(0, 0, size, size);

  const rand = createSeededRandom(3791);

  for (let i = 0; i < 85; i++) {
    const x = rand() * size;
    const y = rand() * size;
    const rad = 35 + rand() * 85;
    const grad = mCtx.createRadialGradient(x, y, 4, x, y, rad);
    grad.addColorStop(0, 'rgba(208, 196, 178, 0.14)');
    grad.addColorStop(1, 'rgba(208, 196, 178, 0)');
    mCtx.fillStyle = grad;
    mCtx.beginPath();
    mCtx.arc(x, y, rad, 0, Math.PI * 2);
    mCtx.fill();
  }

  for (let v = 0; v < 26; v++) {
    let x = rand() * size;
    let y = rand() * size;
    const isWarm = rand() > 0.45;
    mCtx.strokeStyle = isWarm
      ? `rgba(168, 146, 118, ${0.14 + rand() * 0.2})`
      : `rgba(148, 145, 140, ${0.12 + rand() * 0.18})`;
    mCtx.lineWidth = 0.8 + rand() * 2.4;
    mCtx.beginPath();
    mCtx.moveTo(x, y);

    rCtx.strokeStyle = 'rgba(115, 115, 115, 0.35)';
    rCtx.lineWidth = 1.6;
    rCtx.beginPath();
    rCtx.moveTo(x, y);

    for (let step = 0; step < 22; step++) {
      x += 12 + rand() * 22;
      y += (rand() - 0.38) * 26;
      mCtx.lineTo(x, y);
      rCtx.lineTo(x, y);
    }
    mCtx.stroke();
    rCtx.stroke();
  }

  return {
    marbleMap: finalizeTexture(mapCanvas, true, 1.5, 1.5),
    marbleRoughness: finalizeTexture(roughCanvas, false, 1.5, 1.5),
  };
}

/**
 * Generates a self-contained 512x512 sunlit cumulus cloud puff sprite with feathered alpha
 * and soft pale-sky underside shading (zero external CDN requests).
 */
function buildCloudPuffTexture(): THREE.CanvasTexture {
  const size = 512;
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d')!;
  ctx.clearRect(0, 0, size, size);

  // Soft cumulus multi-lobe silhouette: bright sunlit upper lobes + subtle cool-blue lower shadow
  const lobes: Array<{
    x: number;
    y: number;
    r: number;
    colorTop: string;
    alpha: number;
  }> = [
    // Subtle cool-blue underside shadow puffs
    { x: 200, y: 318, r: 112, colorTop: '214,229,245', alpha: 0.42 },
    { x: 312, y: 316, r: 108, colorTop: '214,229,245', alpha: 0.4 },
    { x: 256, y: 326, r: 122, colorTop: '205,223,242', alpha: 0.45 },
    // Main fluffy sunlit cumulus puffs
    { x: 145, y: 278, r: 102, colorTop: '248,252,255', alpha: 0.62 },
    { x: 368, y: 282, r: 96, colorTop: '248,252,255', alpha: 0.58 },
    { x: 205, y: 242, r: 120, colorTop: '255,255,255', alpha: 0.72 },
    { x: 306, y: 246, r: 115, colorTop: '255,255,255', alpha: 0.7 },
    { x: 256, y: 214, r: 126, colorTop: '255,255,255', alpha: 0.82 },
    { x: 242, y: 258, r: 108, colorTop: '255,255,255', alpha: 0.68 },
  ];

  for (const lobe of lobes) {
    const grad = ctx.createRadialGradient(lobe.x, lobe.y, lobe.r * 0.08, lobe.x, lobe.y, lobe.r);
    grad.addColorStop(0, `rgba(${lobe.colorTop},${lobe.alpha})`);
    grad.addColorStop(0.55, `rgba(${lobe.colorTop},${(lobe.alpha * 0.55).toFixed(3)})`);
    grad.addColorStop(1, `rgba(${lobe.colorTop},0)`);
    ctx.fillStyle = grad;
    ctx.beginPath();
    ctx.arc(lobe.x, lobe.y, lobe.r, 0, Math.PI * 2);
    ctx.fill();
  }

  return finalizeTexture(canvas, true, 1, 1, true);
}

export function getProceduralTextures(): ProceduralTexturePack {
  if (cachedPack) return cachedPack;

  const { skylineMap, skylineEmissiveMap } = buildSkylineTextures();
  const { limewashBump, limewashRoughness } = buildLimewashTextures();
  const { oakMap, oakRoughness } = buildOakTextures();
  const fabricBump = buildFabricBumpTexture();
  const linenWrinkleBump = buildLinenWrinkleBumpTexture();
  const wovenRopeBump = buildWovenRopeBumpTexture();
  const { furFleeceMap, furFleeceBump } = buildFurFleeceTextures();
  const { marbleMap, marbleRoughness } = buildMarbleTextures();
  const cloudPuffTexture = buildCloudPuffTexture();

  cachedPack = {
    skylineMap,
    skylineEmissiveMap,
    limewashBump,
    limewashRoughness,
    oakMap,
    oakRoughness,
    fabricBump,
    linenWrinkleBump,
    wovenRopeBump,
    furFleeceMap,
    furFleeceBump,
    marbleMap,
    marbleRoughness,
    cloudPuffTexture,
  };

  return cachedPack;
}

/**
 * Generates clean tri-planar box-projected UVs for meshes that lack TEXCOORD_0
 * (or forces uniform architectural UVs for skyscraper facades).
 * When `maskRoofsToDarkCorner` is true, horizontal faces (|ny| > 0.72) map to the
 * non-emissive top-left corner so building rooftops never glow with windows.
 */
export function applyBoxProjectedUVs(
  geometry: THREE.BufferGeometry,
  uvScale: number,
  options?: { force?: boolean; maskRoofsToDarkCorner?: boolean }
): void {
  if (!options?.force && geometry.attributes.uv) return;

  const pos = geometry.attributes.position;
  if (!pos) return;

  if (!geometry.attributes.normal) {
    geometry.computeVertexNormals();
  }
  const norm = geometry.attributes.normal;
  const uvs = new Float32Array(pos.count * 2);

  for (let i = 0; i < pos.count; i++) {
    const x = pos.getX(i);
    const y = pos.getY(i);
    const z = pos.getZ(i);

    const nx = Math.abs(norm ? norm.getX(i) : 0);
    const ny = Math.abs(norm ? norm.getY(i) : 1);
    const nz = Math.abs(norm ? norm.getZ(i) : 0);

    if (options?.maskRoofsToDarkCorner && ny > 0.72) {
      // Top-left dark pixel corner of skyline texture (no glowing windows on rooftops)
      uvs[i * 2] = 0.015;
      uvs[i * 2 + 1] = 0.985;
    } else if (ny >= nx && ny >= nz) {
      uvs[i * 2] = x * uvScale;
      uvs[i * 2 + 1] = z * uvScale;
    } else if (nx >= ny && nx >= nz) {
      uvs[i * 2] = z * uvScale;
      uvs[i * 2 + 1] = y * uvScale;
    } else {
      uvs[i * 2] = x * uvScale;
      uvs[i * 2 + 1] = y * uvScale;
    }
  }

  geometry.setAttribute('uv', new THREE.BufferAttribute(uvs, 2));
}
