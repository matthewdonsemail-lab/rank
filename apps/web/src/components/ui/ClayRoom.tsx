import { Suspense, useCallback, useEffect, useMemo, useRef, useSyncExternalStore, type ReactNode } from "react";
import { useFrame } from "@react-three/fiber";
import { useGLTF } from "@react-three/drei";
import * as THREE from "three";
import { applyClayDither } from "./ClayDither";
import {
  Chain,
  StudioEnvironment,
  createPointerState,
  type PointerState,
  type TetherMetrics,
} from "./ChainlinkBackground";
import { PAGE_COLOR } from "./SceneCanvas";
import { useSceneDrag, type DragRecord } from "./useSceneDrag";

/**
 * A white clay room with a Nokia phone standing on its floor.
 *
 * The room is one continuous shell swept from the back wall forward: the
 * interior holds the exact room dimensions, then past the old rim the same
 * surface rolls outward with a large radius and fades to the page until it is
 * indistinguishable from it. The far rim lands behind the camera, so the room
 * never visibly terminates.
 *
 * There is no wall behind the camera. An interior needs an opening for the
 * light to come through and for the camera to see in from, and the open mouth
 * rolling outward is what makes the room read as a room rather than as a
 * closed box seen from outside.
 */

/** The phone model, in the app's public 3D folder. */
const NOKIA_URL = "/3D/nokia.glb";

/**
 * The room is a cube, and all three dimensions come from this one number so they
 * cannot drift apart.
 *
 * A rectangular room reads as a box drawn in perspective, and it fights the page:
 * the area it sits in is not a square either, so there is no shape for the room to
 * agree with. A cube is symmetric about its own centre on all three axes at once,
 * which is what lets the floor and the ceiling mirror each other, the two side
 * walls match, and the verticals stay vertical — and only then can the whole thing
 * line up with whatever frame it is dropped into without the eye being able to
 * say which of the two is out of step.
 *
 * Also small on purpose, and close. A room whose side walls are far out to the
 * sides is never reached by a normal lens at all, and renders as a back wall with
 * a floor in front of it.
 */
const ROOM_EDGE = 4;
const ROOM_WIDTH = ROOM_EDGE;
const ROOM_HEIGHT = ROOM_EDGE;
const ROOM_DEPTH = ROOM_EDGE;

/**
 * Clay surface.
 *
 * Fully rough and fully non-metallic. A metal reflects the environment and its
 * shading comes from that, and there is no environment here — a metal in a lit
 * but empty room comes out as one dark value. Roughness at the top of the range
 * is what makes the material read as pressed clay, and the colour is left white
 * so the painted wash below carries the tone on its own.
 */
const CLAY_SURFACE = { color: "#FFFFFF", metalness: 0, roughness: 0.95 } as const;

/** Longest edge of the phone once placed, in world units. */
const NOKIA_SIZE = 1.15;

/** How far each phone is turned off square to the camera. */
const NOKIA_TURN = -0.45;

/**
 * The dither palette, for everything in the room that is dithered.
 *
 * The chain's own two blues, unchanged.
 *
 * Both have to clear the room. The room is white, so a lit-cell colour at or
 * near paper leaves a subject with nothing to read against and the dither turns
 * into a faint tint rather than a pattern — the tonal range is carried by the
 * density of the two colours against each other, and two near-whites have no
 * density to carry it. Deep blue and brand blue are also far enough apart that
 * the pattern survives being small on screen.
 *
 * Brighter than the chain would need on its dark backdrop, because this dither
 * is resolved before tone mapping rather than after — see `ClayDither`.
 */
const CLAY_DITHER = {
  solidColor: "#2A8CFF",
  shadeColor: "#154680",
  cellSize: 1,
  blackPoint: 0.12,
  whitePoint: 0.95,
} as const;

/**
 * Where the camera stands, and how much it sees.
 *
 * 1.5 m up — eye level, the standard interior camera height, because a level
 * camera at eye level is what keeps the vertical corners of a room vertical. Tip
 * the camera down even slightly and they splay, and the room stops reading as a
 * room. Centred for the same reason: off the centre line and one side wall
 * leaves the frame.
 *
 * A metre back from the room's open front, not inside it. Standing inside puts
 * the camera between the side walls, where they are almost edge-on to the lens
 * and converge to nothing; standing back lets them splay outward and run out of
 * the bottom corners of the frame. That splay is the extrusion.
 *
 * 55° across the frame, which is about a 24 mm lens on full frame. Interior work
 * needs a wide lens for exactly the reason above — the room's walls are at the
 * edges of vision, not in front of you — and this is about as wide as it goes
 * before the phone near the frame edge starts to stretch. It is the horizontal
 * angle that is fixed, so the room keeps its width in frame on a narrow phone
 * and a wide desktop panel alike.
 */
export const CLAY_ROOM_CAMERA: [number, number, number] = [-5.0, 2, 21];
export const CLAY_ROOM_HORIZONTAL_FOV = 51;

/**
 * The radius of the fillet, and with it the whole shape of the room.
 *
 * A hard 90 degree corner is the one thing that never reads as clay. Everything
 * else about the look — matte, uniform, softly lit — is a property of the
 * material, but the corner is geometry, and a pressed shape has no knife edge
 * anywhere on it. At this radius the key light runs along each fillet as a
 * highlight, which is the part that actually reads as pressed rather than cut.
 */
const FILLET_RADIUS = 0.22;

const ROOM_HALF_WIDTH = ROOM_WIDTH / 2;
const ROOM_HALF_DEPTH = ROOM_DEPTH / 2;

function clamp01(value: number) {
  return Math.min(Math.max(value, 0), 1);
}

function lerp(from: number, to: number, t: number) {
  return from + (to - from) * t;
}

/** How far towards the back of the room a point is, 0 at the open front. */
const BACKNESS = (z: number) => clamp01((ROOM_HALF_DEPTH - z) / (2 * ROOM_HALF_DEPTH));

/** The two ends of the room's shading: the cool end and the lit end. */
const SHADE_COOL = new THREE.Color("#E4E8EE");
const SHADE_LIT = new THREE.Color("#FFFDF8");

/**
 * The room's shading, per vertex, as a colour.
 *
 * Painted into vertex colours rather than sampled from a texture, because the
 * room is now one continuous curved surface with no UV chart to sample — the
 * fillets are not flat faces, and flattening the shading back onto faces would
 * undo the one thing the geometry just bought.
 *
 * It carries what the per-face washes used to: the pool of light on the floor
 * under the key, the two side walls at different values because the key is at +x
 * and one of them faces it, a vertical falloff on the walls, and darkening into
 * every seam. The seam term is the part that got better — it now runs
 * continuously into the fillets and around them, which is the ambient occlusion
 * a directional light cannot produce and the reason a corner reads as a corner
 * at all.
 */
function roomShading(x: number, y: number, z: number, out: THREE.Color) {
  const toSide = Math.min(ROOM_HALF_WIDTH - Math.abs(x), ROOM_HALF_DEPTH - Math.abs(z));
  const toVertical = Math.min(y, ROOM_HEIGHT - y);
  // One at the surface, zero a fillet's radius in from it.
  const seam = 1 - clamp01(Math.min(toSide, toVertical) / FILLET_RADIUS);

  let tone: number;
  if (y <= toVertical) {
    // Floor: brightest under the key, which lands on the room's centre line.
    const pool = 1 - clamp01(Math.hypot(x / (ROOM_HALF_WIDTH * 0.6), z / (ROOM_HALF_DEPTH * 0.6)));
    tone = lerp(0.9, 0.99, pool);
  } else if (y >= ROOM_HEIGHT - toVertical) {
    // Ceiling: brightest at the open front, where the light comes in.
    tone = lerp(0.99, 0.93, BACKNESS(z));
  } else {
    // Walls. The key is at +x, so the wall at -x faces it and the one at +x faces
    // away. The camera is dead centre, so the two are the same size on screen and
    // this value difference is the only thing saying which is nearer.
    const back = BACKNESS(z);
    const facesTheKey = x < 0;
    tone = lerp(facesTheKey ? 0.93 : 0.9, facesTheKey ? 0.99 : 0.94, back);
    // White at the ceiling, cooler at the floor line.
    tone *= lerp(0.95, 1.02, clamp01(y / ROOM_HEIGHT));
  }

  tone *= 1 - 0.18 * seam * seam;
  out.copy(SHADE_COOL).lerp(SHADE_LIT, clamp01(tone));
  return out;
}

/**
 * The room itself: one filleted box, drawn from the inside.
 *
 * A single mesh rather than five planes with fillets laid over their edges. The
 * difference is not cosmetic — planes and fillets meet along a curve and
 * intersect there, and however well the pieces line up that seam shows as a
 * crease running the length of every corner, which is precisely the hard edge the
 * fillet was added to remove. Here there is no seam because there is no seam: the
 * floor runs into the wall, the wall into the ceiling and the wall into the next
 * wall as one surface, and a grazing key finds no break in it anywhere.
 *
 * Back faces, because the geometry is a solid box with outward normals and what
 * is wanted is its interior. That also gives the cutaway for free: the near wall
 * faces the camera and is culled, so the room is open towards the viewer, while
 * the floor, the ceiling and the far walls all face away and are drawn.
 */
/**
 * The room itself: one continuous shell, drawn from the inside.
 *
 * A single swept mesh rather than a box plus an apron. The cross-section is a
 * rounded rectangle swept from the back wall forward: back fillet, straight
 * interior at the exact room dimensions, then past the old rim a large-radius
 * roll that flares outward (floor down, ceiling up, walls out) and fades to the
 * page. There is no second mesh and no join along the way — the floor runs
 * into the wall, the wall into the ceiling, the interior into the roll as one
 * surface with shared vertices throughout, so a grazing key finds no break
 * anywhere, including around the corners.
 *
 * Double-sided, because the camera stands outside the room looking in through
 * the open mouth: the interior is seen from within the tube while the roll's
 * far rim ends up behind the camera.
 */
const RIM_Z = ROOM_HALF_DEPTH;
const BACK_Z = -ROOM_HALF_DEPTH;
/** Large roll radius: the green roll-off region, not the small clay fillet. */
const ROLL_RADIUS = 2.4;
/** How far the roll bends: just past facing the camera, so the rim lands behind it. */
const ROLL_ARC = (100 * Math.PI) / 180;
const ROLL_STEPS = 22;
/** Rings resolving the back-wall fillet. */
const BACK_STEPS = 6;
/** Rings resolving the straight interior (floor light pool needs a few). */
const STRAIGHT_STEPS = 6;
/** Samples per straight edge and per corner of the rounded-rectangle section. */
const EDGE_SEGMENTS = 18;
const CORNER_SEGMENTS = 10;

function smoothstep01(t: number) {
  const clamped = clamp01(t);
  return clamped * clamped * (3 - 2 * clamped);
}

/** One rounded-rectangle loop in the XY plane, clockwise, no duplicated seam. */
function roundedRectLoop(
  halfW: number,
  yBottom: number,
  yTop: number,
  radius: number,
): [number, number][] {
  const points: [number, number][] = [];
  const straight = Math.max(halfW - radius, 1e-6);
  const push = (x: number, y: number) => {
    points.push([x, y]);
  };
  // Top edge, left to right (includes start, excludes end).
  for (let i = 0; i < EDGE_SEGMENTS; i += 1) {
    push(lerp(-straight, straight, i / EDGE_SEGMENTS), yTop);
  }
  // Top-right corner, 90° → 0°.
  for (let i = 0; i < CORNER_SEGMENTS; i += 1) {
    const a = Math.PI / 2 - (i / CORNER_SEGMENTS) * (Math.PI / 2);
    push(straight + Math.cos(a) * radius, yTop - radius + Math.sin(a) * radius);
  }
  // Right edge, top to bottom.
  for (let i = 0; i < EDGE_SEGMENTS; i += 1) {
    push(halfW, lerp(yTop - radius, yBottom + radius, i / EDGE_SEGMENTS));
  }
  // Bottom-right corner, 0° → −90°.
  for (let i = 0; i < CORNER_SEGMENTS; i += 1) {
    const a = 0 - (i / CORNER_SEGMENTS) * (Math.PI / 2);
    push(straight + Math.cos(a) * radius, yBottom + radius + Math.sin(a) * radius);
  }
  // Bottom edge, right to left.
  for (let i = 0; i < EDGE_SEGMENTS; i += 1) {
    push(lerp(straight, -straight, i / EDGE_SEGMENTS), yBottom);
  }
  // Bottom-left corner, −90° → −180°.
  for (let i = 0; i < CORNER_SEGMENTS; i += 1) {
    const a = -Math.PI / 2 - (i / CORNER_SEGMENTS) * (Math.PI / 2);
    push(-straight + Math.cos(a) * radius, yBottom + radius + Math.sin(a) * radius);
  }
  // Left edge, bottom to top.
  for (let i = 0; i < EDGE_SEGMENTS; i += 1) {
    push(-halfW, lerp(yBottom + radius, yTop - radius, i / EDGE_SEGMENTS));
  }
  // Top-left corner, 180° → 90°.
  for (let i = 0; i < CORNER_SEGMENTS; i += 1) {
    const a = Math.PI - (i / CORNER_SEGMENTS) * (Math.PI / 2);
    push(-straight + Math.cos(a) * radius, yTop - radius + Math.sin(a) * radius);
  }
  return points;
}

interface ShellRing {
  z: number;
  half: number;
  yBottom: number;
  yTop: number;
  radius: number;
  fade: number;
}

/**
 * Stations along z: back fillet (tangent to the back wall, tangent to the
 * tube), straight interior at the exact room size, then the large roll whose
 * derivatives start at zero outward speed — tangent to the interior — and bend
 * through ROLL_ARC. Fade reaches the page well before the rim, which lands at
 * z ≈ 4.36, behind the camera at 3.5, so the termination is never in frame.
 */
function shellStations(): ShellRing[] {
  const rings: ShellRing[] = [];
  for (let k = 0; k <= BACK_STEPS; k += 1) {
    const t = k / BACK_STEPS;
    const a = t * (Math.PI / 2);
    const inset = FILLET_RADIUS * (1 - Math.sin(a));
    rings.push({
      z: BACK_Z + FILLET_RADIUS * (1 - Math.cos(a)),
      half: ROOM_HALF_WIDTH - inset,
      yBottom: inset,
      yTop: ROOM_HEIGHT - inset,
      radius: lerp(0.08, FILLET_RADIUS, Math.sin(a)),
      fade: 0,
    });
  }
  for (let s = 1; s <= STRAIGHT_STEPS; s += 1) {
    rings.push({
      z: lerp(BACK_Z + FILLET_RADIUS, RIM_Z, s / STRAIGHT_STEPS),
      half: ROOM_HALF_WIDTH,
      yBottom: 0,
      yTop: ROOM_HEIGHT,
      radius: FILLET_RADIUS,
      fade: 0,
    });
  }
  for (let k = 1; k <= ROLL_STEPS; k += 1) {
    const u = k / ROLL_STEPS;
    const angle = u * ROLL_ARC;
    const reach = ROLL_RADIUS * (1 - Math.cos(angle));
    rings.push({
      z: RIM_Z + ROLL_RADIUS * Math.sin(angle),
      half: ROOM_HALF_WIDTH + reach,
      yBottom: -reach,
      yTop: ROOM_HEIGHT + reach,
      radius: FILLET_RADIUS + reach * 0.35,
      fade: smoothstep01((u - 0.08) / 0.67),
    });
  }
  return rings;
}

function makeRoomShellGeometry() {
  const rings = shellStations();
  const template = roundedRectLoop(1, 0, 1, 0.1);
  const loopCount = template.length;
  const positions: number[] = [];
  const colors: number[] = [];
  const fades: number[] = [];
  const indices: number[] = [];
  const color = new THREE.Color();
  const page = new THREE.Color(PAGE_COLOR);

  const pushVertex = (x: number, y: number, z: number, fade: number) => {
    positions.push(x, y, z);
    roomShading(x, y, z, color);
    color.lerp(page, fade);
    colors.push(color.r, color.g, color.b);
    fades.push(fade);
  };

  // Back-wall centre, fanned to the first ring (flat wall, fade 0).
  pushVertex(0, ROOM_HEIGHT / 2, BACK_Z, 0);
  const ringStart: number[] = [];
  for (const ring of rings) {
    ringStart.push(positions.length / 3);
    const loop = roundedRectLoop(ring.half, ring.yBottom, ring.yTop, ring.radius);
    for (const [x, y] of loop) pushVertex(x, y, ring.z, ring.fade);
  }
  for (let i = 0; i < loopCount; i += 1) {
    indices.push(0, ringStart[0] + ((i + 1) % loopCount), ringStart[0] + i);
  }
  for (let r = 0; r < rings.length - 1; r += 1) {
    const a0 = ringStart[r];
    const b0 = ringStart[r + 1];
    for (let i = 0; i < loopCount; i += 1) {
      const j = (i + 1) % loopCount;
      indices.push(a0 + i, b0 + i, a0 + j, a0 + j, b0 + i, b0 + j);
    }
  }

  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute("position", new THREE.Float32BufferAttribute(positions, 3));
  geometry.setAttribute("color", new THREE.Float32BufferAttribute(colors, 3));
  geometry.setAttribute("aFade", new THREE.Float32BufferAttribute(fades, 1));
  geometry.setIndex(indices);
  // One indexed surface, so normals are continuous through the interior, the
  // back fillet, the corners and the roll — no crease anywhere.
  geometry.computeVertexNormals();
  return geometry;
}

/**
 * The room material: lit clay inside, page outside, one program.
 *
 * A single mesh cannot carry two materials without a shading step at the
 * handoff, so the fade rides along instead: at the very end of the fragment
 * shader — after tone mapping and the colour-space conversion — the colour is
 * mixed toward the page by the per-vertex fade. Interior (fade 0) keeps its
 * untouched tone-mapped clay shading; the far roll (fade 1) writes the page's
 * own sRGB value, bypassing ACES entirely. Mixing any earlier would run the
 * page colour through tone mapping and darken it to a visible grey edge.
 */
function makeRoomShellMaterial() {
  const material = new THREE.MeshStandardMaterial({
    ...CLAY_SURFACE,
    vertexColors: true,
    side: THREE.DoubleSide,
  });
  const existing = material.onBeforeCompile;
  material.onBeforeCompile = (shader, renderer) => {
    existing?.(shader, renderer);
    // Raw sRGB 0–1 components, because this is written after the colour-space
    // conversion — the value here is the value the screen shows. Same pattern
    // as ClayDither, which also writes post-conversion.
    shader.uniforms.roomPage = { value: new THREE.Color(PAGE_COLOR).convertLinearToSRGB() };
    shader.vertexShader = shader.vertexShader
      .replace("#include <common>", "#include <common>\nattribute float aFade;\nvarying float vRoomFade;")
      .replace("#include <begin_vertex>", "#include <begin_vertex>\nvRoomFade = aFade;");
    shader.fragmentShader = shader.fragmentShader
      .replace("#include <common>", "#include <common>\nvarying float vRoomFade;\nuniform vec3 roomPage;")
      .replace(
        "#include <colorspace_fragment>",
        "#include <colorspace_fragment>\ngl_FragColor.rgb = mix(gl_FragColor.rgb, roomPage, clamp(vRoomFade, 0.0, 1.0));",
      );
  };
  material.customProgramCacheKey = () => "clay-room-shell-page-fade";
  return material;
}

function useRoomShell() {
  const geometry = useMemo(makeRoomShellGeometry, []);
  const material = useMemo(makeRoomShellMaterial, []);
  useEffect(
    () => () => {
      geometry.dispose();
      material.dispose();
    },
    [geometry, material],
  );
  return { geometry, material };
}

/**
 * Scales a model to a target height and stands it on the floor.
 *
 * Fitted from the model's own bounding box rather than given a hand-tuned scale,
 * because the export's units and its authored orientation are not something to
 * guess at. Taking the longest edge as the size means the object fills the same
 * share of the room whichever way up it was exported, and only the base is
 * pinned to the floor.
 *
 * The scene is detached when this runs, so its world matrix is identity and the
 * box is in the model's own space — the space the scale below applies to.
 *
 * A plain function rather than a hook, because the poles are each placed at their
 * own height inside one loop, and a hook cannot be called a varying number of
 * times.
 */
function floorPlacement(scene: THREE.Object3D, size: number) {
  scene.updateMatrixWorld(true);
  const box = new THREE.Box3().setFromObject(scene);
  const bounds = box.getSize(new THREE.Vector3());
  const center = box.getCenter(new THREE.Vector3());
  const scale = size / Math.max(bounds.x, bounds.y, bounds.z, 1e-6);
  // Offsets in scaled units, because a group's own scale does not apply to its
  // own position. Nested group: the outer one places the object in the room, the
  // inner one scales it and slides it so its base sits on y = 0.
  return {
    scale,
    center,
    offset: new THREE.Vector3(-center.x * scale, -box.min.y * scale, -center.z * scale),
  };
}

function useFloorModel(scene: THREE.Object3D, size: number) {
  return useMemo(() => floorPlacement(scene, size), [scene, size]);
}

/**
 * The phone, placed and dithered.
 *
 * castShadow is set by walking the graph, because it does not inherit. A GLB
 * scene is a group of meshes and the flag is read per mesh, so setting it on the
 * group does nothing and the phone renders shadowless — which is why it appeared
 * to hang in mid air with nothing underneath it.
 */
function usePlacedModel(scene: THREE.Object3D, size: number) {
  const placed = useFloorModel(scene, size);

  useEffect(() => {
    scene.traverse((child) => {
      if (!(child instanceof THREE.Mesh)) return;
      child.castShadow = true;
      child.receiveShadow = true;
      // Patched per material rather than per mesh: a GLB shares one material
      // across every mesh that uses it, so this compiles the shader once however
      // many pieces the handset is modelled in.
      const materials = Array.isArray(child.material) ? child.material : [child.material];
      for (const material of materials) applyClayDither(material, CLAY_DITHER);
    });
  }, [scene]);

  return placed;
}

/**
 * The outline around the phone, as the chain has it: a dark band outside the
 * silhouette and a light core inside it.
 *
 * The post pass draws its outline by probing a ring of neighbouring pixels for
 * the subject, which it can only do because it sees the whole frame at once. A
 * material cannot — it has no idea what is next to it. The per-object way to get
 * the same edge is an inverted hull: draw the same geometry a second time, from
 * the inside, pushed out past the surface, so the part that now sticks out beyond
 * the silhouette is the band. Two of them, a wide dark one and a narrow light
 * one, and they draw in that order so the light one lands inside the dark.
 *
 * Pushing out from the bounding-box centre rather than along the vertex normals
 * is what keeps a hard-edged model intact. A handset is a box with rounded
 * corners, and its normals point in four different directions across one flat
 * face; offsetting along them splits the shell apart at every crease and the
 * outline comes out as a row of gaps.
 */
const OUTLINE_COLOR = "#0A0A0C";
const OUTLINE_CORE_COLOR = "#FFFFFF";
/** How far past the surface each shell is pushed, as a fraction of the model. */
const OUTLINE_WIDTH = 0.06;
const OUTLINE_CORE_WIDTH = 0.022;

/**
 * The two outline materials, shared by every phone.
 *
 * Plain unlit, because an outline is a flat band rather than a lit surface —
 * shading it would make the band's apparent thickness depend on where the light
 * happened to fall, so the edge would be heavy on one side of the room and
 * invisible on the other.
 */
function useOutlineMaterials() {
  return useMemo(
    () => [
      new THREE.MeshBasicMaterial({ color: OUTLINE_COLOR, side: THREE.BackSide }),
      new THREE.MeshBasicMaterial({ color: OUTLINE_CORE_COLOR, side: THREE.BackSide }),
    ],
    [],
  );
}

/**
 * One outline shell, scaled about the model's own centre.
 *
 * A group's scale grows it about its own origin, and the model's origin is
 * nowhere near its middle, so scaling it directly would slide the shell off to
 * one side instead of fattening it. Three nested groups put the centre on the
 * pivot: shift to the centre, scale, shift back.
 */
function shellPivot(
  object: THREE.Object3D,
  center: THREE.Vector3,
  width: number,
): THREE.Group {
  const pivot = new THREE.Group();
  pivot.position.copy(center);
  const scaler = new THREE.Group();
  scaler.scale.setScalar(1 + width);
  const restore = new THREE.Group();
  restore.position.set(-center.x, -center.y, -center.z);
  restore.add(object);
  scaler.add(restore);
  pivot.add(scaler);
  return pivot;
}

/**
 * The same geometry again, drawn from the inside with a flat material.
 *
 * Cloned rather than reloaded, so the shell shares the phone's geometry buffers
 * and costs a draw call and nothing else.
 */
function outlineClone(scene: THREE.Object3D, material: THREE.Material): THREE.Object3D {
  const object = scene.clone(true);
  object.traverse((child) => {
    if (!(child instanceof THREE.Mesh)) return;
    child.material = material;
    // The phone itself casts; a shell two sizes larger would cast a second,
    // fatter shadow right beside the first.
    child.castShadow = false;
    child.receiveShadow = false;
  });
  return object;
}

function ClayRoomShell() {
  const { geometry, material } = useRoomShell();

  return (
    <group>
      <mesh geometry={geometry} material={material} receiveShadow />
    </group>
  );
}



/**
 * The phones: how many, how they get thrown about, and how they stop.
 *
 * Several handsets rather than one, because one object drifting round a room
 * reads as a demo of a single asset while several reads as a room full of
 * things. They arrive one after another rather than all at once, so the scene
 * builds in front of the visitor rather than being handed over finished.
 */
const PHONE_COUNT = 0;
/**
 * The swarm does not fly: four handsets stand in a row at the back of the room
 * and breathe up and down in place, sequentially, looping forever. No drive,
 * no bounce, no separation — the flight sim is off.
 */
const STATIC_SWARM = false;
const BREATHE_AMP = 0.16;
const BREATHE_RATE = 1.6;
const BREATHE_STEP = 1.1;
/**
 * How far forward (+z, out through the mouth toward the pulled-back camera)
 * the contents sit.
 *
 * Large values lift the phones and poles clear out of the room into the void
 * in front of it, so the room reads as a backdrop behind them rather than a
 * container around them.
 */
const ITEM_FORWARD = 3;
/**
 * Front wall of the swarm's flight slab: the roamers stay in the back of the
 * room, well behind the hero hanging out front.
 */
const ROAMER_Z_MAX = -0.5;
/** Seconds between one phone appearing and the next. */
const SPAWN_STAGGER = 0.14;
/** How long one phone takes to reach full size once it starts. */
const SPAWN_TIME = 0.4;

/**
 * How hard each phone is pushed, in world units per second squared.
 *
 * Large, because the drag term below is what sets the top speed and the two have
 * to be balanced against each other: speed settles where the push and the loss
 * cancel, and a gentle push against a heavy drag is a gentle top speed however
 * the two are written down.
 */
const DRIVE = 2;
/**
 * Fraction of a phone's speed kept after one second.
 *
 * Well below 1, so a phone that is thrown barely slows before it is pushed again
 * and spends its life crossing the room rather than nudging along a wall.
 * Written as a per-second figure and raised to the power of the frame time, so a
 * phone moves the same distance per second at 30fps as at 144 — a per-frame
 * multiplier is frame-rate dependent, and a scene that only behaves on a 60Hz
 * monitor is a scene that is wrong on half the machines that run it.
 */
const DRAG = 0.5;
/**
 * The launch.
 *
 * Every phone arrives already travelling, hard, in its own direction. Starting
 * them from rest means the first second of the scene is six handsets drifting
 * out of a slow field, which is nothing like being fired across a room; the
 * impulse is what gives the ricochet its character, because the bounce is only
 * interesting when there is speed left to lose.
 */
const SHOT_SPEED = 1.5;
/** Speed kept when a phone hits something. Below 1 or it never settles. */
const RESTITUTION = 0.92;
/**
 * Hard cap on speed, and the thing that stops a phone tunnelling through a wall.
 *
 * Bounded to a fraction of the room's smallest half-extent per frame, so no
 * matter how fast it is going, a phone can never cross the whole room in one
 * step and come out the other side.
 */
const SPEED_LIMIT = 2.5;
/** Sideways kick added on every bounce, so successive hits diverge. */
const KICK = 2.5;
/**
 * Soft leash around the swarm's slab.
 *
 * Free flight inside CONTAIN_FREE of the anchor; past that a spring pulls back
 * toward it, harder the further out. The hard bounce stays as the last resort,
 * but with the leash phones rarely arrive at a wall carrying speed — which is
 * what was making them ricochet out through the mouth.
 */
const CONTAIN_ANCHOR = new THREE.Vector3(0, ROOM_HEIGHT / 2, (ROAMER_Z_MAX - ROOM_HALF_DEPTH) / 2);
const CONTAIN_FREE = 1.4;
const CONTAIN_PULL = 5;
/** Tumble, in radians per second, per axis. */
const SPIN = 0.9;
/** A shared roll to the right, over and above each phone's own tumble. */
const SPIN_RIGHT = 1.4;
/**
 * The squeeze, stretch and expand, as a multiple of the rate in radians.
 *
 * Fast enough to read as a flutter rather than a breath. Runs on its own clock
 * rather than off the bounces, because a pulse tied to impacts only fires on
 * impact and the room is mostly not being hit.
 */
const PULSE_RATE = 6;
const PULSE = 0.08;
/** How hard a phone squashes when it lands, as a fraction of its size. */
const IMPACT_SQUASH = 0.24;

/**
 * The one that stays in the middle.
 *
 * The rest are ricocheting, which is the point of them, but a room where
 * everything is in motion has nothing to look at. This one hangs at the centre,
 * held, turning slowly and bobbing a little, so the room has a middle and the
 * others have something to travel around. It is the largest thing in the room
 * for the same reason.
 *
 * Floated rather than simulated: a second solver for a body that is not supposed
 * to move would be more code to be wrong in a way nobody would notice. And it is
 * not turned either — it is the one still thing in the room, and a slow spin
 * would make it read as just another one of them.
 */
const FLOAT_SCALE = 3.0;
/** Extra height for the hero phone above its centred position. */
const HERO_LIFT = 1.2;
/** Extra push toward the camera for the hero phone, over ITEM_FORWARD. */
const HERO_PUSH = 2.5;
/** While held, the hero rides this much further toward the camera. */
const HERO_DRAG_FORWARD = 1.5;
/**
 * Sideways swing pulls forward: dragging left or right arcs the hero toward
 * you as if swinging on the tether, capped so the chain's reach is respected.
 */
const HERO_SWING_PULL = 0.8;
const HERO_SWING_MAX = 1.0;
/**
 * How far the hero may be pulled from home. Past this the tether runs out of
 * reach and links start clipping through the room's rolled edges to cover the
 * extra distance — so the pull simply stops here instead.
 */
const HERO_PULL_MAX = 2.5;
/** Slack kept in reserve when measuring the pull against the chain's reach. */
const TETHER_SLACK = 1.0;
/** Rolling radius for contact roll: tangential travel per radian. */
const HERO_ROLL_RADIUS = 1.2;
/** How far off the yellow the phone parks, facing it. */
const TOUCH_STANDOFF = 0.8;
/** Hero scale sway: swells up and down in place, looping. */
const HERO_SWAY_AMP = 0.12;
const HERO_SWAY_RATE = 4.5;
/**
 * Hero yank along Z: pulled back toward the chain's anchor, then springing
 * forward past rest, looping. The tether's tail hangs onto the hero, so the
 * chain stretches and slackens with it.
 */
const HERO_YANK_AMP = 0.8;
const HERO_YANK_RATE = 0.9;
/**
 * The connection chain, in the hero's own frame (+z is the phone's front).
 *
 *   ring -> yellow (drawn by the chain, on the ring edge) -> red -> phone
 *
 * These are the original, known-good numbers: the red ball sits at RED_LOCAL
 * and the tail link is pinned BRIDGE_TO_PIN straight behind it, which is what
 * puts the chain's own yellow knob on the ring edge touching the red. The pin
 * is always derived from RED_LOCAL, so the two can never drift apart.
 */
const RED_RADIUS = 0.25;
const RED_LOCAL = new THREE.Vector3(0, 1.9, -0.55);
const BRIDGE_TO_PIN = 1.2;
const PIN_LOCAL = new THREE.Vector3(RED_LOCAL.x, RED_LOCAL.y, RED_LOCAL.z - BRIDGE_TO_PIN);
/** Tether tail attach: up the hero's back, off its surface so links rest on it. */
const HERO_PIN_UP = 2.0;
const HERO_PIN_BACK = 0.35;
/**
 * The phone's yaw inside the hero frame. Fixed: the phone's front is the frame's
 * +z and the red ball is on -z, so the two can never rotate against each other.
 * Set to Math.PI if the model's screen turns out to face the ball.
 */
const HERO_FRONT_YAW = 0;
/** Where the tether hangs from, for the frames before the chain has measured it. */
const TETHER_ANCHOR_FALLBACK = new THREE.Vector3(0, 2.2, 2.2);
const scratchFace = new THREE.Vector3();
const WORLD_UP = new THREE.Vector3(0, 1, 0);
/**
 * Crowd clearance: if the tail link gets closer than this to the body, the
 * hero slides forward to hold the gap instead of being clipped by the rings.
 */
const PHONE_KEEP_OUT = 1.4;
const PHONE_KEEP_RATE = 3;
/** Live tether measurements, written by ChainTether, read by the hero. */
const tetherMetrics: { current: TetherMetrics | null } = { current: null };
/**
 * The hero's world position, published every frame for the tether's tail pin.
 * Written by Phones (which owns the hero), read by ChainTether, which mounts
 * after it so the pin is always fresh.
 */
export const heroPin: { current: THREE.Vector3 | null } = { current: null };
const heroPinVec = new THREE.Vector3(0, 2, 5.5);
heroPin.current = heroPinVec;
/**
 * No-go bubble around the hero's body for the tether's middle links, so they
 * rest on the phone instead of phasing through it. The tail itself is exempt
 * (the pin places it after).
 */
export const heroCapsule: {
  current: { bottom: THREE.Vector3; top: THREE.Vector3; radius: number } | null;
} = { current: null };
const heroCapsuleCore = {
  bottom: new THREE.Vector3(0, 0.5, 5.5),
  top: new THREE.Vector3(0, 3.8, 5.5),
  radius: 0.55,
};
heroCapsule.current = heroCapsuleCore;
/**
 * World-space room confine for the tether: walls, floor, ceiling and back.
 * No max-Z — the mouth stays open so the chain can run out front to the hero.
 */
const ROOM_CONFINE = {
  min: new THREE.Vector3(-1.85, 0.15, -1.85),
  max: new THREE.Vector3(1.85, 3.85, Infinity),
};
const FLOAT_BOB = 0.14;
const FLOAT_BOB_RATE = 1.8;

/**
 * Size spread.
 *
 * Every phone the same size reads as a repeated asset, which is exactly what it
 * is. A range from just over half scale to rather more than full gives the room
 * a foreground and a back, and the smaller ones read as further away even when
 * they are not.
 */
const SCALE_LOW = 1.05;
const SCALE_RANGE = 0.8;

/**
 * How close two phones may come before they push each other apart.
 *
 * A push field on its own does not keep a room's worth of objects apart. They
 * converge, settle into a clump, and from then on the field moves the clump
 * around as one thing. This is the term that actually separates them: pairwise,
 * strongest when they are nearly touching and gone by the time they are a body's
 * width apart, so it never fights the drift and never looks like a force.
 */
const SEPARATION = 9;
const SEPARATION_RANGE = 0.9;

/**
 * A phone's half-diagonal per unit of scale: the distance from its centre to its
 * furthest corner.
 *
 * This is what the walls are tested against, and it is deliberately the *largest*
 * half-extent rather than the one for the axis being tested. A tumbling phone
 * presents its long edge sideways as often as it does upright, so per-axis
 * half-extents would let it through a wall the moment it rolled onto its side.
 * The sphere is conservative � it bounces a phone off the wall slightly early,
 * while it is still flat to it � and that is the right way round: a phone that
 * stops short looks fine, one that passes through a wall breaks the room.
 */
const RADIUS_PER_SCALE = 0.58;

/** Whether the visitor has asked for less motion. */
function useReducedMotion() {
  const reduced = useRef(false);
  useEffect(() => {
    const query = window.matchMedia("(prefers-reduced-motion: reduce)");
    const update = () => {
      reduced.current = query.matches;
    };
    update();
    query.addEventListener("change", update);
    return () => query.removeEventListener("change", update);
  }, []);
  return reduced;
}

interface Phone {
  /** The animated transform. Everything under it is the model. */
  group: THREE.Group;
  /**
   * Hero only: the rigid connection frame (yellow, red) riding under `group`.
   * Its scale is the inverse of the group's, so the assembly is carried by the
   * group's position and rotation but never stretched by its sway.
   */
  bridge?: THREE.Group;
  position: THREE.Vector3;
  velocity: THREE.Vector3;
  spin: THREE.Vector3;
  /** The size this phone was built at, and the room its centre is kept inside. */
  scale: number;
  radius: number;
  /** Decides which way this phone is pushed. */
  seed: number;
  /** Seconds after the scene starts before this phone appears. */
  born: number;
  /** Counts down after a collision, driving the squash. */
  impact: number;
  /** Bounces so far, which is what makes the next kick different from the last. */
  hits: number;
  /**
   * Held at the middle of the room instead of thrown.
   *
   * Still a full participant in separation — it is an obstacle the others bounce
   * off, and a hole in the middle of the room would be worse than no middle at
   * all — but never pushed itself.
   */
  floating: boolean;
}

/**
 * One handset: the model, stood on the floor, with its two outline shells round it.
 */
function buildPhone(
  scene: THREE.Object3D,
  placed: ReturnType<typeof usePlacedModel>,
  outlineMaterials: THREE.Material[],
  scale: number,
  turn: number = NOKIA_TURN,
): THREE.Group {
  const model = new THREE.Group();
  model.position.copy(placed.offset);
  model.scale.setScalar(placed.scale * scale);
  model.rotation.set(0, turn, 0);
  model.add(
    shellPivot(outlineClone(scene, outlineMaterials[0]), placed.center, OUTLINE_WIDTH),
    shellPivot(outlineClone(scene, outlineMaterials[1]), placed.center, OUTLINE_CORE_WIDTH),
  );
  const body = scene.clone(true);
  body.traverse((child) => {
    if (child instanceof THREE.Mesh) {
      child.castShadow = true;
      child.receiveShadow = true;
    }
  });
  model.add(body);
  const group = new THREE.Group();
  group.add(model);
  return group;
}

/**
 * A number in 0 to 1 that is spread rather than clustered.
 *
 * Successive values multiplied by the golden ratio, which is the cheapest way to
 * keep one phone off another's spot. A plain index clumps them into pairs, and
 * two handsets at the same depth read as one handset drawn twice.
 */
function spread(index: number) {
  return (index * 0.6180339887) % 1;
}

const scratchDrive = new THREE.Vector3();
const scratchPush = new THREE.Vector3();
const scratchLeash = new THREE.Vector3();

function usePhones(scene: THREE.Object3D, placed: ReturnType<typeof usePlacedModel>) {
  const outlineMaterials = useOutlineMaterials();

  return useMemo(() => {
    const phones: Phone[] = [];
    for (let index = 0; index < PHONE_COUNT; index += 1) {
      const scale = SCALE_LOW + spread(index + 11) * SCALE_RANGE;
      const a = spread(index);
      const b = spread(index + 3);
      const c = spread(index + 6);
      const radius = NOKIA_SIZE * scale * RADIUS_PER_SCALE;
      const group = buildPhone(scene, placed, outlineMaterials, scale);
      // How a raycast hit is traced back to the phone that owns it, since the
      // hit may well have landed on one of the outline shells.
      group.userData.phone = index;
      // Facing the camera with a slight turn each, held for the static swarm.
      group.rotation.y = (spread(index + 30) - 0.5) * 0.7;
      // Fired out on arrival rather than drifting away from a stop. The
      // direction is the same golden sequence the spawn point came from, so no
      // two phones are launched across each other's path.
      scratchDrive
        .set(a * 2 - 1, b * 1.2 - 0.4, c * 2 - 1)
        .normalize()
        .multiplyScalar(SHOT_SPEED);
      phones.push({
        group,
        position: new THREE.Vector3(
          // Each its own spot across the back, resting near the floor, so the
          // slow drift starts spread out instead of tangled. Only the hero
          // hangs out front.
          Math.min(
            Math.max((a * 2 - 1) * 1.2, -(ROOM_WIDTH / 2 - radius)),
            ROOM_WIDTH / 2 - radius,
          ),
          radius,
          Math.min(
            Math.max(-1.5 + (b * 2 - 1) * 0.3, -(ROOM_DEPTH / 2 - radius)),
            ROAMER_Z_MAX,
          ),
        ),
        velocity: scratchDrive.clone(),
        spin: new THREE.Vector3(
          // Every phone carries the same roll to the right, over its own tumble.
          // A shared bias is what makes the room read as one system rather than
          // seven unrelated objects happening to be in it.
          SPIN_RIGHT + Math.sin(index * 1.7) * SPIN,
          Math.cos(index * 2.21) * SPIN,
          Math.sin(index * 1.19) * SPIN * 0.6,
        ),
        scale,
        radius,
        seed: index * 1.7,
        born: index * SPAWN_STAGGER,
        impact: 0,
        hits: 0,
        floating: false,
      });
    }

    // The one in the middle. Its group sits a whole phone below the room's
    // centre line, because the placement slides the model up from its own base —
    // the geometry runs from y = 0 upward, so the group is not the body's middle
    // and putting the group at the middle would hang the phone half into the
    // ceiling.
    const floatRadius = NOKIA_SIZE * FLOAT_SCALE * RADIUS_PER_SCALE;
    const heroGroup = buildPhone(scene, placed, outlineMaterials, FLOAT_SCALE, HERO_FRONT_YAW);
    // The red ball, on the phone's back. It lives in a rigid frame under the hero
    // group that carries the inverse of the group's scale (kept up to date in the
    // frame loop), so the sway can neither stretch it nor change its distance
    // from the pin the chain's yellow knob hangs off.
    const bridge = new THREE.Group();
    const red = new THREE.Mesh(
      new THREE.SphereGeometry(RED_RADIUS, 24, 18),
      new THREE.MeshStandardMaterial({ color: "#E0261B", roughness: 0.55, metalness: 0 }),
    );
    red.position.copy(RED_LOCAL);
    red.castShadow = true;
    bridge.add(red);
    heroGroup.add(bridge);
    phones.push({
      group: heroGroup,
      bridge,
      position: new THREE.Vector3(0, ROOM_HEIGHT / 2 - (NOKIA_SIZE * FLOAT_SCALE) / 2 + HERO_LIFT, ITEM_FORWARD + HERO_PUSH),
      velocity: new THREE.Vector3(),
      spin: new THREE.Vector3(),
      scale: FLOAT_SCALE,
      radius: floatRadius,
      seed: 0,
      born: 0,
      impact: 0,
      hits: 0,
      floating: true,
    });

    return phones;
  }, [scene, placed, outlineMaterials]);
}

/**
 * Bounces one phone off one wall, if it is against it.
 *
 * Position is put back on the inside and the velocity along that axis is
 * reversed and damped. Reflecting the velocity is what makes this a bounce
 * rather than a stop: a phone that only had its position corrected would grind
 * along the wall, and one that had its speed zeroed would sit there.
 */
function bounceAxis(phone: Phone, axis: "x" | "y" | "z", low: number, high: number): boolean {
  if (phone.position[axis] < low) {
    phone.position[axis] = low;
    phone.velocity[axis] = Math.abs(phone.velocity[axis]) * RESTITUTION;
    return true;
  }
  if (phone.position[axis] > high) {
    phone.position[axis] = high;
    phone.velocity[axis] = -Math.abs(phone.velocity[axis]) * RESTITUTION;
    return true;
  }
  return false;
}

/** Keeps a phone's centre inside the room at its own size. */
function keepInside(phone: Phone) {
  return (
    bounceAxis(phone, "x", -(ROOM_WIDTH / 2 - phone.radius), ROOM_WIDTH / 2 - phone.radius) ||
    // The floor's fillet curves up, so a phone's floor limit is the fillet radius
    // below the wall base line: that is where the surface is still flat enough to
    // stand on, and stopping there keeps it clear of the curve.
    bounceAxis(phone, "y", phone.radius - FILLET_RADIUS, ROOM_HEIGHT - phone.radius) ||
    bounceAxis(phone, "z", -(ROOM_DEPTH / 2 - phone.radius), ROAMER_Z_MAX)
  );
}

/**
 * Pushes two phones apart if they are too close.
 *
 * Done on position alone, never on velocity. Separating by moving the bodies and
 * letting the integrator read the difference is what makes it free � pushing
 * velocities as well would inject energy every frame, and two phones would end
 * up oscillating against each other and climbing.
 */
function separate(phones: Phone[], carried: DragRecord | null) {
  for (let i = 0; i < phones.length; i += 1) {
    const a = phones[i];
    if (!a.group.visible) continue;
    for (let j = i + 1; j < phones.length; j += 1) {
      const b = phones[j];
      if (!b.group.visible) continue;
      // The hero hangs far out front on its own; its giant radius would
      // otherwise shove the whole swarm every single frame.
      if (a.floating || b.floating) continue;
      scratchPush.copy(b.position).sub(a.position);
      const distance = scratchPush.length();
      const closest = a.radius + b.radius + SEPARATION_RANGE;
      if (distance >= closest || distance < 1e-6) continue;
      // Straight away when barely touching, fading to nothing at arm's length.
      const push = ((closest - distance) / distance) * SEPARATION * (1 - distance / closest);
      // The middle one is furniture, not a body: the others go around it and it
      // does not go anywhere. A phone in a hand is the same — the cursor and the
      // separation must not end up fighting over the same body.
      if (!a.floating && a !== carried) a.position.addScaledVector(scratchPush, -push);
      if (!b.floating && b !== carried) b.position.addScaledVector(scratchPush, push);
    }
  }
}

function Phones() {
  const { scene } = useGLTF(NOKIA_URL);
  const placed = usePlacedModel(scene, NOKIA_SIZE);
  const phones = usePhones(scene, placed);
  const reduced = useReducedMotion();

  // The hero is floaty but grabbable: pull it anywhere and it springs back
  // into place on release. Only the hero registers — the swarm is scenery.
  const heroHeld = useRef(false);
  // The hero's yaw, held across frames only so a degenerate frame keeps the last one.
  const heroYaw = useRef(0);
  // Eased grab blend: 0 free, 1 held. The forward pull rides this so taking
  // hold glides the phone toward you instead of snapping it there.
  const heroGrabEase = useRef(0);
  // Where the phone was taken, in its own local space: the tail hangs off the
  // grip itself while held, not off a fixed point on the body.
  const heroGrabLocal = useRef(new THREE.Vector3(0, HERO_PIN_UP, -HERO_PIN_BACK));
  const heroOnly = useMemo(() => phones.filter((phone) => phone.floating), [phones]);
  const heroHome = useMemo(
    () =>
      new THREE.Vector3(
        0,
        ROOM_HEIGHT / 2 - (NOKIA_SIZE * FLOAT_SCALE) / 2 + HERO_LIFT,
        ITEM_FORWARD + HERO_PUSH,
      ),
    [],
  );
  useSceneDrag(heroOnly, ({ released, point }) => {
    heroHeld.current = !released;
    if (!released && point) {
      // Remember the grip in the phone's own space, so the tail hangs off
      // where it was taken however the phone turns afterward.
      const hero = heroOnly[0];
      if (hero) {
        hero.group.updateWorldMatrix(true, false);
        heroGrabLocal.current.copy(point);
        hero.group.worldToLocal(heroGrabLocal.current);
      }
    }
  });

  // No drag interaction: touching the scene changes nothing and the loop plays
  // on. The frame loop below owns every transform.

  useFrame((state, delta) => {
    const seconds = state.clock.getElapsedTime();
    // Clamped, so a hitch cannot hand a phone enough movement in one step to
    // jump a wall. At the speed cap that is a seventh of the room.
    const step = Math.min(delta, 1 / 30);
    const dragFactor = Math.pow(DRAG, step);

    for (const phone of phones) {
      const age = seconds - phone.born;

      // Not here yet, or just arriving.
      if (age < 0) {
        phone.group.visible = false;
        continue;
      }
      phone.group.visible = true;

      if (reduced.current) {
        // Static, spread out, and never moving. The room is still the room; it
        // just is not throwing handsets at the walls.
        phone.group.position.copy(phone.position);
        phone.group.quaternion.identity();
        phone.group.scale.setScalar(1);
        continue;
      }

      // Arriving: grows in over SPAWN_TIME. Scaled rather than faded, because a
      // fade needs a transparent material and these are dithered and outlined �
      // growing keeps the halftone and the outline intact the whole way.
      const grow = Math.min(age / SPAWN_TIME, 1);

      if (phone.floating) {
        // Held at the middle. It keeps its separation from the others but is
        // never itself pushed, thrown or bounced — only turned and bobbed, so it
        // reads as suspended rather than as one of the ricocheting ones.
      } else if (STATIC_SWARM) {
        // Standing still: no drive, no leash, no integration. The breathe
        // below is the whole performance.
      } else {
        // A slow field pushing each phone its own way, so they spread out instead
        // of travelling as a flock. Three incommensurate frequencies, so the
        // field never repeats on a cycle a visitor could count.
        scratchDrive.set(
          Math.sin(seconds * 0.71 + phone.seed),
          Math.sin(seconds * 0.53 + phone.seed * 2.1) * 0.6,
          Math.cos(seconds * 0.61 + phone.seed * 1.7),
        );
        phone.velocity.addScaledVector(scratchDrive.normalize(), DRIVE * step);
        // The leash: no force inside the free radius, spring pullback outside.
        scratchPush.copy(CONTAIN_ANCHOR).sub(phone.position);
        const leash = scratchPush.length();
        if (leash > CONTAIN_FREE) {
          phone.velocity.addScaledVector(
            scratchPush.normalize(),
            CONTAIN_PULL * (leash - CONTAIN_FREE) * step,
          );
        }
        phone.velocity.multiplyScalar(dragFactor);
        // Capped before the integration, not after: a phone that is over the cap
        // for one frame has already moved too far to be caught.
        const speed = phone.velocity.length();
        if (speed > SPEED_LIMIT) phone.velocity.multiplyScalar(SPEED_LIMIT / speed);
        phone.position.addScaledVector(phone.velocity, step);
      }

      // Walls, floor and ceiling, whether it hit them or was dragged there. The
      // floating one is exempt: it is placed inside the room and never leaves.
      // The static swarm never moves, so there is nothing to bounce.
      if (!STATIC_SWARM && !phone.floating && keepInside(phone)) {
        phone.impact = IMPACT_SQUASH;
        // A bounce that only mirrors the speed sends a phone back the way it
        // came, and the room ends up looking like two phones on a rail. The kick
        // is sideways and is different every time, so the path diverges on each
        // hit and the ricochet wanders instead of retracing.
        phone.hits += 1;
        const kick = phone.hits * 2.399 + phone.seed;
        phone.velocity.x += Math.sin(kick) * KICK;
        phone.velocity.y += Math.sin(kick * 1.7) * KICK * 0.6;
        phone.velocity.z += Math.cos(kick * 1.3) * KICK;
        phone.velocity.clampLength(0, SPEED_LIMIT);
      }

      phone.group.position.copy(phone.position);
      if (phone.floating) {
        // Before the first tether measurements arrive, a plain leash home.
        if (!tetherMetrics.current && scratchLeash.copy(phone.position).sub(heroHome).length() > HERO_PULL_MAX) {
          phone.position.copy(heroHome).addScaledVector(scratchLeash.normalize(), HERO_PULL_MAX);
        }
        // Suspended: a slow rise and fall on the spot, and no tumble at all. The
        // bob is applied to the drawn transform rather than to the position the
        // solver keeps, so separation still treats it as sitting still at the
        // centre and the others bounce off where it actually is.
        heroGrabEase.current +=
          ((heroHeld.current ? 1 : 0) - heroGrabEase.current) * Math.min(1, 8 * step);
        const grabEase = heroGrabEase.current;
        if (heroHeld.current) {
          // In hand: exactly at the cursor, pulled forward toward you — and
          // swinging sideways arcs it further forward on the tether.
          phone.group.position.z += HERO_DRAG_FORWARD * grabEase;
          phone.group.position.z +=
            Math.min(
              Math.abs(phone.position.x - heroHome.x) * HERO_SWING_PULL,
              HERO_SWING_MAX,
            ) * grabEase;
        } else {
          // Released: spring back into place, then the usual hover loop.
          phone.position.lerp(heroHome, 1 - Math.pow(0.0005, step));
          phone.group.position.y += Math.sin(seconds * FLOAT_BOB_RATE) * FLOAT_BOB;
          // Yanked back toward the anchor, springing forward past rest. The
          // tether tail follows the pin below, so the chain takes the yank.
          phone.group.position.z += HERO_YANK_AMP * Math.sin(seconds * HERO_YANK_RATE);
          // Clearance: a crowding tail link pushes the hero forward to hold
          // the gap — the pin follows, so the pair settles off the body.
          const tm = tetherMetrics.current;
          if (tm) {
            scratchLeash.set(
              phone.group.position.x,
              phone.group.position.y + HERO_PIN_UP,
              phone.group.position.z,
            );
            const gap = tm.tailWorld.distanceTo(scratchLeash);
            if (gap < PHONE_KEEP_OUT) {
              phone.group.position.z += (PHONE_KEEP_OUT - gap) * Math.min(1, PHONE_KEEP_RATE * step);
            }
          }
        }
        // The pin (the ring centre, where the yellow hangs) is the pivot, and the
        // phone is derived from it — never the other way round. One closed-form
        // pass, each step reading only what the step before wrote:
        //   1. scale
        //   2. the pin's wanted position: the phone's wanted spot plus the pin's
        //      fixed offset behind it
        //   3. rope clamp, applied to the pin
        //   4. yaw: straight away from the anchor, measured at the pin
        //   5. phone position: the pin minus the rotated offset, so the phone
        //      swings round the pin instead of spinning about its own origin
        // Nothing reads last frame's chain result, so nothing can feed back.
        const swayNow = 1 + HERO_SWAY_AMP * Math.sin(seconds * HERO_SWAY_RATE);
        phone.group.scale.set(1 / Math.sqrt(swayNow), swayNow, 1 / Math.sqrt(swayNow));
        phone.bridge?.scale.set(Math.sqrt(swayNow), 1 / swayNow, Math.sqrt(swayNow));
        const tmRope = tetherMetrics.current;
        const anchorNow = tmRope ? tmRope.anchorWorld : TETHER_ANCHOR_FALLBACK;
        heroPinVec.copy(phone.group.position).add(PIN_LOCAL);
        if (tmRope) {
          scratchLeash.copy(heroPinVec).sub(tmRope.anchorWorld);
          const pinDist = scratchLeash.length();
          const maxSpan = Math.max(tmRope.reachWorld - TETHER_SLACK, 0.5);
          if (pinDist > maxSpan && pinDist > 1e-6) {
            const over = pinDist - maxSpan;
            scratchLeash.divideScalar(pinDist);
            phone.position.addScaledVector(scratchLeash, -over);
            heroPinVec.addScaledVector(scratchLeash, -over);
          }
        }
        scratchFace.copy(heroPinVec).sub(anchorNow);
        if (scratchFace.x * scratchFace.x + scratchFace.z * scratchFace.z > 1e-6) {
          heroYaw.current = Math.atan2(scratchFace.x, scratchFace.z);
        }
        phone.group.rotation.set(0, heroYaw.current, 0);
        // The bridge cancels the group's scale, so the pin sits exactly PIN_LOCAL
        // from the group's origin in the rotated frame.
        scratchFace.copy(PIN_LOCAL).applyAxisAngle(WORLD_UP, heroYaw.current);
        phone.group.position.copy(heroPinVec).sub(scratchFace);
        // The body capsule follows the final position, after the clamp.
        heroCapsuleCore.bottom.set(phone.group.position.x, phone.group.position.y + 0.3, phone.group.position.z);
        heroCapsuleCore.top.set(phone.group.position.x, phone.group.position.y + 3.3, phone.group.position.z);
      } else if (!STATIC_SWARM) {
        phone.group.rotateX(phone.spin.x * step);
        phone.group.rotateY(phone.spin.y * step);
        phone.group.rotateZ(phone.spin.z * step);
      }

      // The squeeze, the stretch, the expand: one fast oscillation on the long
      // axis, counter-scaled across the other two so the volume holds, with a
      // faster beat riding on it for the snap at the top of the stretch.
      const beat = Math.sin(seconds * PULSE_RATE + phone.seed * 3.1);
      const snap = Math.sin(seconds * PULSE_RATE * 2.7 + phone.seed);
      const pulse = 1 + PULSE * beat + PULSE * 0.4 * snap;

      // Relaxing squash from landing, on top of the pulse.
      phone.impact *= Math.pow(0.02, step);
      const squash = phone.impact;
      if (phone.floating) {
        // The hero's own sway: swells up and down in place, volume held.
        // Already applied above, before the pin was read; kept identical here so
        // the two can never disagree.
        const sway = 1 + HERO_SWAY_AMP * Math.sin(seconds * HERO_SWAY_RATE);
        phone.group.scale.set(1 / Math.sqrt(sway), sway, 1 / Math.sqrt(sway));
      } else if (!phone.floating && STATIC_SWARM) {
        // The breathe: each phone swells up after the previous one, looping.
        // Scaled on the group, whose origin sits on the floor, so every phone
        // stays anchored at its base while it stretches.
        const wave = Math.sin(seconds * BREATHE_RATE - phone.seed * BREATHE_STEP);
        phone.group.scale.set(grow, grow * (1 + BREATHE_AMP * wave), grow);
      } else {
        phone.group.scale.set(
          grow * (1 + squash * 0.5) / Math.sqrt(pulse),
          grow * (1 - squash) * pulse,
          grow * (1 + squash * 0.5) / Math.sqrt(pulse),
        );
      }
    }

    if (!STATIC_SWARM) {
      separate(phones, null);
      // Separation shoves positions without touching velocity, so clamp strays
      // back inside before the next frame renders them.
      for (const phone of phones) {
        if (!phone.floating) keepInside(phone);
      }
    }
  });

  return (
    <group>
      {phones.map((phone) => (
        <primitive key={phone.born} object={phone.group} />
      ))}
    </group>
  );
}

/**
 * The poles, standing at the back of the room behind the floating phone.
 *
 * Set back far enough to read as behind it rather than beside it, and near enough
 * to the back wall that the two do not fight for the same depth. A pole is the
 * one tall vertical in the room, and the reason the room needs a back — without
 * something standing against the far wall the space reads as a lit backdrop with
 * objects in front of it rather than as somewhere with a depth.
 *
 * Left plain: no dither and no outline. The handsets carry those because they
 * are the subject; the poles are scenery, and halftoning them would compete with
 * the phone hanging in front of them. One call to `applyClayDither` changes that.
 */
const POLE_URL = "/3D/pole.glb";
/**
 * Where the poles stand.
 *
 * Hand-placed: dragged into position in the scene and the numbers read back off
 * the readout. A table rather than generated placement because a pole is
 * furniture, and furniture wants a composition — scatter reads as loose and
 * these were arranged. Turns are in radians.
 *
 * There is no y, and that is not an oversight. The drag moves a pole in all
 * three axes and every one of them came back below the floor, because the drag
 * plane is parallel to the screen and a pole picked up near its middle sinks as
 * it is carried. A pole stands on the floor, so y is zero and only x and z are
 * recorded. The values came out at -0.29 to -0.44, which would have put all four
 * of them underground.
 */
const POLE_PLACEMENT: readonly { x: number; z: number; turn: number }[] = [
  { x: -0.68, z: -1.54, turn: 5.67 },
  { x: 1.39, z: -1.2, turn: 3.27 },
  { x: 1.39, z: -0.6, turn: 0.87 },
  { x: -1.35, z: 0.11, turn: 4.75 },
  // Second rank: inside the room, behind the hero phone, so the phone hangs
  // in front of them from the camera's view.
  { x: -1.5, z: -3.5, turn: 1.2 },
  { x: 1.6, z: -3.2, turn: 2.4 },
  { x: -1.2, z: -2.4, turn: 5.1 },
  { x: 1.4, z: -4.2, turn: 0.3 },
];
const POLE_HEIGHT = 2.6;
/**
 * Sequential vertical breathe, looping down the line of poles.
 *
 * Each pole swells on Y after the previous one and the wave loops forever.
 * Applied to the group — whose origin sits on the floor — so every pole stays
 * anchored at its base while it stretches.
 */
const POLE_PULSE_AMP = 0.22;
const POLE_PULSE_RATE = 1.8;
const POLE_PULSE_STEP = 0.9;
/** Poles are not all the same height, because four identical verticals read as a fence. */
const POLE_HEIGHT_RANGE = 0.35;

interface Pole extends DragRecord {
  object: THREE.Object3D;
  placed: ReturnType<typeof floorPlacement>;
  turn: number;
}

/**
 * Where the poles ended up, readable from outside the canvas.
 *
 * A store rather than React state because the scene is handed in as children and
 * cannot be given a setter, while a readout has to live outside the canvas to be
 * readable and selectable. Follows the same shape as the breakpoint store in the
 * chain background, for the same reason.
 */
interface PoleReport {
  x: string;
  y: string;
  z: string;
  turn: string;
}

const poleStore = (() => {
  let snapshot: PoleReport[] = [];
  const listeners = new Set<() => void>();
  return {
    get: () => snapshot,
    set: (next: PoleReport[]) => {
      snapshot = next;
      for (const listener of listeners) listener();
    },
    subscribe: (listener: () => void) => {
      listeners.add(listener);
      return () => {
        listeners.delete(listener);
      };
    },
  };
})();

function usePolePositions() {
  return useSyncExternalStore(poleStore.subscribe, poleStore.get, poleStore.get);
}

/** The pole positions, on screen. Read-only, so the numbers can be copied out. */
export function PoleReadout() {
  const poles = usePolePositions();
  if (poles.length === 0) return null;
  return (
    <div
      aria-hidden="true"
      className="pointer-events-none absolute right-3 top-3 rounded-xl bg-white/90 px-3 py-2 text-xs leading-relaxed text-ink shadow-[0_1px_3px_rgba(26,26,25,0.18)]"
    >
      <p className="font-bold">poles</p>
      {poles.map((pole, index) => (
        <p key={index}>
          {index}: {pole.x}, {pole.y}, {pole.z} · {pole.turn}
        </p>
      ))}
    </div>
  );
}

function Poles() {
  const { scene } = useGLTF(POLE_URL);
  const outlineMaterials = useOutlineMaterials();

  // Dithered and outlined exactly as the handsets are, so the room reads as one
  // set of materials rather than as phones in front of unstyled scenery. Patched
  // on the loaded model rather than on each clone, because the clones share its
  // material objects — patching per clone would compile the same program once
  // per pole for no difference in the result.
  useEffect(() => {
    scene.traverse((child) => {
      if (!(child instanceof THREE.Mesh)) return;
      const materials = Array.isArray(child.material) ? child.material : [child.material];
      for (const material of materials) applyClayDither(material, CLAY_DITHER);
    });
  }, [scene]);

  // A clone per pole. They share the model's geometry buffers and materials, so
  // four of them cost four draw calls and no extra memory — but an Object3D can
  // only have one parent, so a single instance cannot be placed four times.
  const poles = useMemo<Pole[]>(
    () =>
      POLE_PLACEMENT.map((spot, index) => {
        const height = POLE_HEIGHT * (1 - POLE_HEIGHT_RANGE / 2 + spread(index + 20) * POLE_HEIGHT_RANGE);
        const placed = floorPlacement(scene, height);
        const object = scene.clone(true);
        object.traverse((child) => {
          if (!(child instanceof THREE.Mesh)) return;
          child.castShadow = true;
          child.receiveShadow = true;
        });
        const group = new THREE.Group();
        group.rotation.y = spot.turn;
        const model = new THREE.Group();
        model.position.copy(placed.offset);
        model.scale.setScalar(placed.scale);
        // Outermost first, so the narrow light core lands inside the dark band.
        model.add(
          shellPivot(outlineClone(scene, outlineMaterials[0]), placed.center, OUTLINE_WIDTH),
          shellPivot(outlineClone(scene, outlineMaterials[1]), placed.center, OUTLINE_CORE_WIDTH),
        );
        model.add(object);
        group.add(model);
        return {
          object,
          placed,
          group,
          turn: spot.turn,
          // Forward with everything else, clamped so no pole crosses the rim.
          position: new THREE.Vector3(spot.x, 0, Math.min(spot.z + ITEM_FORWARD, 64)),
        };
      }),
    [scene],
  );

  // Published only when a rounded value actually changes, so a drag does not
  // re-render the readout sixty times a second.
  const published = useRef("");
  const report = useCallback(() => {
    const next = poles
      .map(
        (pole) =>
          `${pole.position.x.toFixed(2)}|${pole.position.y.toFixed(2)}|${pole.position.z.toFixed(
            2,
          )}|${pole.turn.toFixed(2)}`,
      )
      .join(",");
    if (next === published.current) return;
    published.current = next;
    poleStore.set(
      poles.map((pole) => ({
        x: pole.position.x.toFixed(2),
        y: pole.position.y.toFixed(2),
        z: pole.position.z.toFixed(2),
        turn: pole.turn.toFixed(2),
      })),
    );
  }, [poles]);

  useEffect(report, [report]);

  useFrame((state) => {
    const seconds = state.clock.getElapsedTime();
    poles.forEach((pole, index) => {
      pole.group.position.copy(pole.position);
      const wave = Math.sin(seconds * POLE_PULSE_RATE - index * POLE_PULSE_STEP);
      pole.group.scale.set(1, 1 + POLE_PULSE_AMP * wave, 1);
    });
  });

  return (
    <group>
      {poles.map((pole, index) => (
        <primitive key={index} object={pole.group} />
      ))}
    </group>
  );
}

useGLTF.preload(NOKIA_URL);

/**
 * Grow-in for the tether on reveal.
 *
 * The auto-fit reads the viewport before the room camera has applied its first
 * framing, so the first frames size the rings wrong (huge). Fading up from
 * nothing over half a second covers that settle and reads as an entrance.
 * Mounted inside the suspense boundary so its clock starts at reveal, and
 * around the chain only — the positioning group above stays put.
 */
function TetherFade({ children }: { children: ReactNode }) {
  const ref = useRef<THREE.Group>(null);
  const age = useRef(0);
  useFrame((_, delta) => {
    age.current += delta;
    const t = Math.min(age.current / 0.5, 1);
    ref.current?.scale.setScalar(Math.max(t * t * (3 - 2 * t), 1e-4));
  });
  return <group ref={ref}>{children}</group>;
}

/**
 * A second copy of the chain, living inside the room.
 *
 * Anchored in the middle of the box with its hang direction tipped forward,
 * so it spans from the anchor out to the hero phone; the tail is pinned to
 * the hero every frame, so when the yank pulls the hero back and springs it
 * forward, the middle links take it. Pointer-grabbable like the hero's own:
 * move over it and it moves.
 */
function ChainTether() {
  const groupRef = useRef<THREE.Group>(null);
  const pointer = useMemo(() => createPointerState(), []);
  const onPullRef = useRef<((progress: number) => void) | undefined>(undefined);
  const lastPullRef = useRef(0);
  return (
    <group position={[0, 2.2, 2.2]} rotation-x={-Math.PI / 2}>
      {/* The metal needs something to reflect; the room's own lights are flat. */}
      <StudioEnvironment />
      <Suspense fallback={null}>
        <TetherFade>
          <Chain
          modelUrl="/3D/ring.glb"
          color="#2A8CFF"
          scale={0.9}
          offset={[0, 0, 0]}
          opacity={1}
          linkCount={4}
          pointer={pointer as PointerState}
          groupRef={groupRef}
          onPullRef={onPullRef}
          lastPullRef={lastPullRef}
          anchorOverride={[0, 0, 0]}
          tailPinWorld={heroPin}
          trackPointer
          dithered
          shadows
          confineWorld={ROOM_CONFINE}
          avoidCapsule={heroCapsule}
          beadIterations={5}
          metricsRef={tetherMetrics}
          tailKnobColor="#F5C518"
        />
        </TetherFade>
      </Suspense>
    </group>
  );
}

/** The scene, for mounting inside a `SceneCanvas`. */
export function ClayRoomScene() {
  return (
    <group>
      <ClayRoomShell />
      <Poles />
      <Phones />
      <ChainTether />
    </group>
  );
}
