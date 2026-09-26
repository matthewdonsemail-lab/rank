import { Suspense, useMemo, useRef, useState, useSyncExternalStore } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { Environment, Lightformer, useGLTF } from "@react-three/drei";
import * as THREE from "three";
import { DitheringPass } from "./DitheringPass";

/**
 * Chainlink background for the hero.
 *
 * The model is a single ring, so the chain is built by instancing it: every link
 * shares one geometry and one material, and consecutive links are rotated 90
 * degrees relative to each other so they interlock the way a real chain does.
 * Each instanced link is then its own body in a Verlet simulation, with gravity
 * on every link, distance constraints between neighbours, and a pointer shove for
 * links the cursor is near. The first link is pinned to an anchor at the top of
 * the viewport.
 *
 * Instancing a single link rather than cutting a merged chain into pieces is
 * both simpler and more robust: a sliced chain shows slivers at the seams, and
 * every piece is a slightly different shape.
 *
 * The rig runs in the model's own local units and a single group scale maps it
 * onto the viewport, so the chain fills the same share of the screen at any size.
 *
 * The canvas is inert, so the hero's controls stay clickable while pointer
 * tracking still works through R3F.
 */

const MODEL_URL = "/3D/ring.glb";

/**
 * Brand blue, matching the accent the hero's input caret and CTA use.
 *
 * On a metal this tints the reflection rather than filling it, so the rings read
 * as blue-anodised steel and keep their shading instead of going flat.
 */
const CHAIN_COLOR = "#2A8CFF";

/**
 * Deep blue, filled into the cells the dither knocks out.
 *
 * Both dither colours are passed explicitly rather than left to the effect's
 * defaults, so the chain's whole palette is readable in one place: this plus
 * CHAIN_COLOR, with the render supplying only the luminance that chooses between
 * them.
 */
const CHAIN_SHADOW_COLOR = "#154680";

/**
 * How much of the viewport height the whole chain occupies.
 *
 * The fit follows the chain's total length rather than one link, so the spacing
 * between links stays correct no matter how many are instanced. Fitting a single
 * link instead would make a long chain grow off screen and a short one shrink to
 * a clump.
 */
const CHAIN_HEIGHT_RATIO = 0.6;

/**
 * Horizontal anchor as a fraction of the viewport width. Negative hangs the
 * chain to the left of centre, positive to the right.
 */
const ANCHOR_X_RATIO = -0.75;

/** How many rings are instanced into the chain. */
const LINK_COUNT = 5;

/**
 * Phones get a much shorter, smaller chain.
 *
 * Fourteen rings at desktop scale is more than a phone viewport can show without
 * the tail running off the bottom, and the hero's own content already fills the
 * width there. Five keeps it reading as a chain rather than a texture.
 */
const MOBILE_LINK_COUNT = 5;
const MOBILE_SCALE = 0.28;

/** Matches the breakpoint the hero's own typography switches at. */
const MOBILE_QUERY = "(max-width: 640px)";

/**
 * Subscribes to the mobile breakpoint.
 *
 * useSyncExternalStore rather than a resize listener in an effect: the query is
 * the source of truth, so this stays correct across orientation changes and
 * browser zoom, and the server snapshot keeps the first render deterministic.
 */
function useIsMobile() {
  return useSyncExternalStore(
    (onChange) => {
      const query = window.matchMedia(MOBILE_QUERY);
      query.addEventListener("change", onChange);
      return () => query.removeEventListener("change", onChange);
    },
    () => window.matchMedia(MOBILE_QUERY).matches,
    () => false,
  );
}

/**
 * How the rings are threaded together.
 *
 * The geometry rules out the obvious approach. The model is a circular ring with
 * outer radius R, tube radius t, and hole radius r = R - t. A ring turned
 * edge-on crosses the shared axis at radius R, but its neighbour's hole only
 * reaches r, and since R > r the tube can never pass through the opening. Two
 * identical circular rings therefore cannot interlock at any spacing: they either
 * intersect or float apart. Alternating a clean 90 degrees does not help, because
 * rotating a ring about the chain axis only spins it inside its own plane, which
 * leaves every link coplanar.
 *
 * Rings thread the way a real chain is built: each one is twisted a little past
 * 90 degrees about the chain axis and overlaps its neighbour, so consecutive rings
 * pass through one another. The twist is what makes that overlap legible instead
 * of a solid blob.
 */
const TWIST_PER_LINK = (100 * Math.PI) / 180;

/**
 * How fast the pinned top link spins in place about Z, in radians per second.
 * One revolution every 24 seconds — slow enough to read as ambient motion
 * rather than a spinner, fast enough to be visibly alive.
 *
 * In place, deliberately: the pin it hangs from does not travel. An orbiting pin
 * drags the whole chain around in a circle, which is a different effect.
 */
const ANCHOR_SPIN_SPEED = (Math.PI * 2) / 24;

/**
 * Axis the pinned link spins about: straight up, so it turns like a coin —
 * face-on to the camera, then edge-on, then back, in place.
 *
 * A circular ring turned about its own centre axis renders identically at every
 * angle, which is why a pure Z spin was invisible, and a tilted axis reads as a
 * wobble rather than a spin. About Y the ring's plane itself sweeps through the
 * view, which is the coin motion.
 */
const ANCHOR_SPIN_AXIS = new THREE.Vector3(0, 1, 0);

/**
 * Centre-to-centre spacing as a fraction of the ring's outer diameter.
 *
 * This has to be measured against the ring, not its tube. The tube is only about
 * a sixth of the ring's width, so a pitch taken as a fraction of the tube put
 * centres 0.57 units apart for rings 6.2 units across: a 91% overlap that read as
 * one solid clump at rest and only opened out to the right spacing when dragged,
 * because the deliberately soft solver let the pull stretch it past the rest
 * length. At 0.6 the rings overlap by roughly 40%, which is what a chain of
 * threaded rings actually looks like.
 */
const PITCH_RATIO = 0.6;

/**
 * Downward acceleration, in local units per second squared.
 *
 * Well above earth gravity on purpose. The rig is scaled down to fit the
 * viewport, and the distance constraints keep most of the weight supported, so
 * an earth-like value leaves the chain drifting rather than hanging and swinging.
 */
const GRAVITY = 55;

/**
 * Verlet integration and constraint tuning, in local units.
 *
 * The iteration count is high because the rest length is the whole visual
 * design: it is what makes consecutive rings overlap by the intended amount. A
 * soft solve lets a hard pull stretch the chain to several times its rest
 * length, and since the per-link twist is a fixed angle it cannot compensate at
 * the new spacing — the rings either phase through each other when slack or
 * separate into rings with gaps when taut. Solving firmly keeps the pitch equal
 * to the spacing the links are drawn at, at any length.
 */
const CONSTRAINT_ITERATIONS = 16;
/**
 * Velocity kept from one step to the next.
 *
 * This is a per-frame multiplier, so the difference is large: at 0.93 the chain
 * shed 7% of its energy every frame and felt dead within a second, while 0.985
 * keeps enough momentum for a swing to actually carry. Gravity and damping pull
 * against each other, so raising one usually means easing the other.
 */
const DAMPING = 0.985;
const MAX_STEP = 1 / 30;

/** Grabbing: how close a link must be to the cursor to be picked up, as a
 * fraction of the ring's outer size, and how much of the cursor's movement is
 * handed to it so a flick throws the chain.
 *
 * This is a ratio of the ring rather than a fixed distance because the rig is
 * rescaled to fit the viewport, so any fixed value is either a dot in the middle
 * of the link or the whole chain. At 0.55 you can take hold of any part of the
 * ring you can see, not just its centre. */
const GRAB_RADIUS_RATIO = 0.55;
const GRAB_FOLLOW = 0.45;
const THROW_SCALE = 0.35;

/**
 * Caps on how much energy one frame may inject, in rest lengths.
 *
 * A fast flick — or a hitch that coalesces several frames of cursor movement
 * into one event — can otherwise hand a link an unbounded Verlet velocity in a
 * single step. From there the spring overshoots, the solver diverges, and a link
 * lands at NaN or off at infinity, at which point the canvas stops showing a
 * chain and starts showing a flat field. Capping the throw and the free
 * velocity keeps the worst case a fast chain, never a broken one.
 */
const THROW_LIMIT = 3;
const SPEED_LIMIT = 2;

/**
 * How far the held link may travel in one frame, in rest lengths.
 *
 * Separate from the throw cap because it bounds position, not velocity. Without
 * it a fast drag teleports the grabbed link across the screen, and for that
 * frame its ring covers the viewport — which the post pass renders as a
 * full-screen flash of the chain's colours. 1.5 still tracks the cursor tightly
 * at normal speeds and only binds on violent flicks.
 */
const HELD_LIMIT = 1.5;

/**
 * Fraction of the chain's own length that counts as a full pull.
 *
 * Progress is the tail's displacement divided by the chain length, and a whole
 * chain length of stretch is a lot of dragging before every word flips. At 0.4
 * a firm tug reaches full, which is also what makes the flash and the random
 * clear reachable without yanking the chain off the viewport.
 */
const FULL_PULL = 0.4;

/**
 * How much of an over-stretched correction is applied per iteration, which is
 * what makes the chain elastic rather than rigid.
 *
 * The rings are drawn overlapping, so the distance between neighbouring centres
 * must never grow past the rest length or they stop reading as linked. Solving
 * that rigidly removes all give and the chain cannot be pulled at all; solving it
 * only partway lets a hard drag stretch the chain, and the stored displacement
 * makes it spring back with a little overshoot on release.
 *
 * The per-iteration fraction is scaled by dt squared, so the value is a
 * stiffness in the same units as GRAVITY rather than a raw blend factor.
 */
const STRETCH_SPRING = 220;

/** Extra multiplier on the spring, for tuning the pull back without touching
 * how far the chain can be stretched. */
const STRETCH_DAMPING = 1;

/**
 * Largest angle a link may deviate from dead straight, at each joint.
 *
 * The distance constraints above are one-dimensional: they hold neighbouring
 * centres at a fixed spacing, which stops the chain stretching but does nothing
 * about where the links are laterally. Nothing else in the simulation knows the
 * links are solid, so a chain dragged back on itself folds until non-adjacent
 * rings occupy the same space and visibly pass through one another. Capping the
 * bend stops the fold happening in the first place, which is cheaper and more
 * stable than trying to unpick the resulting interpenetration.
 */
const MAX_BEND = (44 * Math.PI) / 180;

/**
 * How much of a bend correction is applied per iteration.
 *
 * Low on purpose. Bending is a positional constraint fighting the distance
 * constraints, so applying it rigidly makes the two oscillate against each other
 * and the chain jitters. Letting it converge over a few frames reads as weight.
 */
const BEND_STRENGTH = 0.35;

/**
 * Minimum centre distance between links that are not neighbours, as a multiple
 * of the rest length.
 *
 * Neighbours are excluded because they are meant to overlap. Everything else
 * should never be closer than this, so rings cannot stack on top of each other.
 * At rest a straight chain already separates non-adjacent links by two or more
 * rest lengths, so this never fights the resting pose.
 */
const SELF_SEPARATION = 0.9;

/**
 * Push two links apart until they are at least `minimum` apart.
 *
 * `strength` scales the correction, so a call can be rigid or a spring.
 */
function pushApart(a: LinkBody, b: LinkBody, minimum: number, strength: number, pinned: boolean) {
  scratchDelta.copy(b.position).sub(a.position);
  const distance = scratchDelta.length();
  if (distance >= minimum || distance < 1e-9) return;
  const correction = ((minimum - distance) / distance) * strength;
  if (pinned) {
    b.position.addScaledVector(scratchDelta, correction);
    return;
  }
  a.position.addScaledVector(scratchDelta, -correction * 0.5);
  b.position.addScaledVector(scratchDelta, correction * 0.5);
}

/**
 * Tube-level collision, so rings respect each other's surfaces rather than just
 * their centres.
 *
 * Every constraint above is a centre-to-centre distance. That holds spacing but
 * knows nothing about solidity: two centres can sit at exactly the right
 * distance while the tubes themselves pass through each other, and non-adjacent
 * links have no reason at all not to occupy the same space. The visible result
 * is rings phasing through one another, and the physical result is
 * micro-movement as the solver fights itself — which is what makes a held tail
 * jitter around any threshold measured from it.
 *
 * Each ring is therefore sampled as beads around its tube centreline, and beads
 * belonging to different links are kept at least a tube diameter apart. Adjacent
 * links are excluded because they are threaded by design and meant to overlap;
 * everything else is solid to everything else.
 *
 * The bead count is load-bearing, not cosmetic. Eight beads on a sixteen-unit
 * circumference sit two units apart while the tube is one unit thick, so the
 * shell is a sieve and another tube passes through the gaps untouched. Beads
 * must be spaced tighter than the tube diameter or the collision is decorative.
 * Twenty puts them at 0.8 against a 1.03 diameter, which closes the gaps.
 */
const BEADS_PER_LINK = 20;
/** Relaxation passes for the beads, per frame. Orientations are recomputed for
 * each one from the current positions, so a few cheap passes converge. */
const BEAD_ITERATIONS = 3;

/**
 * How much of the anchor's surface motion a touching link picks up.
 *
 * Separation alone cannot turn the chain: it resolves the contact normal, while
 * a spinning surface moves tangentially, which separation ignores. This
 * transfers a fraction of the anchor bead's rigid-body velocity to whatever it
 * touches, which is friction in the one place it is wanted — between the motor
 * and the first link. Gated to pairs involving link 0 so it never adds energy
 * elsewhere.
 */
const ANCHOR_FRICTION = 0.6;

/**
 * How strongly free links are steered toward the anchor's swirl, per frame.
 *
 * The friction above only touches link 1, and a positional solver cannot pass
 * rotation down a chain — each link feels its neighbours through distance
 * alone, which carries no torque. So every free link gets a small steer toward
 * the tangential velocity the motor implies at its own radius. Blended, not
 * assigned, so it can never overpower a grab or go unstable; and it fades with
 * depth so the tail trails the head instead of copying it rigidly.
 */
const ENTRAIN_BLEND = 0.06;
const ENTRAIN_FALLOFF = 0.45;

const beadScratchA: THREE.Vector3[] = Array.from({ length: BEADS_PER_LINK }, () => new THREE.Vector3());
const beadScratchB: THREE.Vector3[] = Array.from({ length: BEADS_PER_LINK }, () => new THREE.Vector3());
const beadOrientation = new THREE.Quaternion();
const beadOffset = new THREE.Vector3();

/**
 * World orientation of a link, composed exactly as the render step composes it,
 * so the collision beads sit where the visible tube is.
 *
 * Index 0 is the exception: it does not follow the chain but turns about a
 * tilted axis at `anchorAngle`, so its pose is that rotation rather than the
 * swing and twist. Both the beads and the mesh must use this, or collision
 * would test a tube that is not where it is drawn.
 */
function linkOrientation(links: LinkBody[], index: number, anchorAngle: number, out: THREE.Quaternion): THREE.Quaternion {
  if (index === 0) return out.setFromAxisAngle(ANCHOR_SPIN_AXIS, anchorAngle);
  swingOrientation(links, index, scratchSwing);
  scratchInterlock.setFromAxisAngle(AXIS_Y, index * TWIST_PER_LINK);
  return out.copy(scratchSwing).multiply(scratchInterlock);
}

/**
 * Bead positions around a link's tube centreline, in world units.
 *
 * The ring lives in its local XY plane, so the beads are a circle of the
 * centreline radius in that plane, rotated by the link's orientation and
 * translated to its position.
 */
function linkBeads(links: LinkBody[], index: number, ringRadius: number, anchorAngle: number, out: THREE.Vector3[]) {
  const link = links[index];
  linkOrientation(links, index, anchorAngle, beadOrientation);
  for (let b = 0; b < BEADS_PER_LINK; b++) {
    const angle = (b / BEADS_PER_LINK) * Math.PI * 2;
    beadOffset.set(Math.cos(angle) * ringRadius, Math.sin(angle) * ringRadius, 0);
    out[b].copy(beadOffset).applyQuaternion(beadOrientation).add(link.position);
  }
}

/**
 * One relaxation pass of bead collision between link pairs.
 *
 * Beads closer than a tube diameter push their parent links apart, split evenly
 * unless the pinned link is involved. Positions only — velocities are left to
 * Verlet, which is what keeps this from adding energy.
 *
 * Adjacent pairs use half the threshold. Neighbours are threaded by design, so
 * a full-diameter exclusion would fight the thread itself; half a diameter only
 * resists deep penetration, which is the phasing rather than the threading.
 */
function collideBeads(links: LinkBody[], ringRadius: number, tubeRadius: number, anchorAngle: number) {
  const minDistance = tubeRadius * 2;
  const adjacentMinDistance = tubeRadius;
  for (let i = 0; i < links.length; i++) {
    linkBeads(links, i, ringRadius, anchorAngle, beadScratchA);
    for (let j = i + 1; j < links.length; j++) {
      const limit = j === i + 1 ? adjacentMinDistance : minDistance;
      linkBeads(links, j, ringRadius, anchorAngle, beadScratchB);
      for (let a = 0; a < BEADS_PER_LINK; a++) {
        for (let b = 0; b < BEADS_PER_LINK; b++) {
          scratchDelta.copy(beadScratchB[b]).sub(beadScratchA[a]);
          const distance = scratchDelta.length();
          if (distance >= limit || distance < 1e-9) continue;
          const correction = ((limit - distance) / distance) * 0.5;
          const aPinned = i === 0;
          const bPinned = j === 0;
          if (!aPinned && !bPinned) {
            links[i].position.addScaledVector(scratchDelta, -correction * 0.5);
            links[j].position.addScaledVector(scratchDelta, correction * 0.5);
          } else if (aPinned) {
            links[j].position.addScaledVector(scratchDelta, correction);
          } else {
            links[i].position.addScaledVector(scratchDelta, -correction);
          }
          // The beads moved with their links, so refresh this link's set before
          // testing its next pair. Cheap, and stops one correction fighting the
          // next inside the same pass.
          linkBeads(links, i, ringRadius, anchorAngle, beadScratchA);
          linkBeads(links, j, ringRadius, anchorAngle, beadScratchB);
        }
      }
    }
  }
  // Link 0 never moves in here: every pair touching it pushes the other link
  // only, so the pin the caller holds needs no restoring.
}

/**
 * Drags link 1 along with the spinning anchor, through contact friction.
 *
 * The pair above deliberately skips neighbours, because adjacent links are
 * threaded and must be allowed to overlap. But the anchor's drive has to enter
 * the chain somewhere, and the only contact it has is link 1. So this tests
 * that one pair for touch — beads within a tube diameter and a half — and hands
 * link 1 a fraction of whatever surface velocity the anchor's bead carries at
 * that point.
 *
 * Surface velocity is rigid-body rotation: v = ω × r, with ω the spin axis
 * scaled by the spin rate and r the bead's offset from the anchor's centre. No
 * separation is applied here, only the tangential carry, because pushing the
 * threaded pair apart would unthread the chain.
 */
const anchorSpinVector = new THREE.Vector3();
const beadRadius = new THREE.Vector3();
const beadVelocity = new THREE.Vector3();

function dragAnchorNeighbor(
  links: LinkBody[],
  ringRadius: number,
  tubeRadius: number,
  anchorAngle: number,
  dt: number,
) {
  if (links.length < 2) return;
  linkBeads(links, 0, ringRadius, anchorAngle, beadScratchA);
  linkBeads(links, 1, ringRadius, anchorAngle, beadScratchB);
  anchorSpinVector.copy(ANCHOR_SPIN_AXIS).multiplyScalar(ANCHOR_SPIN_SPEED);
  const touchDistance = tubeRadius * 3;
  for (let a = 0; a < BEADS_PER_LINK; a++) {
    beadRadius.copy(beadScratchA[a]).sub(links[0].position);
    // v = ω × r: how fast this point of the anchor's surface is moving.
    beadVelocity.copy(anchorSpinVector).cross(beadRadius);
    for (let b = 0; b < BEADS_PER_LINK; b++) {
      scratchDelta.copy(beadScratchB[b]).sub(beadScratchA[a]);
      const distance = scratchDelta.length();
      if (distance >= touchDistance || distance < 1e-9) continue;
      // Full carry at contact, fading to nothing at the edge of reach.
      const grip = 1 - distance / touchDistance;
      links[1].position.addScaledVector(beadVelocity, dt * ANCHOR_FRICTION * grip);
    }
  }
}

/**
 * Absolute limit on stretch, as a multiple of the rest length.
 *
 * A backstop only, sitting well beyond what the spring allows, so a violent flick
 * cannot run a link out to infinity in a single frame.
 */
const MAX_STRETCH = 1.35;

/**
 * Pointer state shared between the wrapper element and the simulation.
 *
 * The canvas has to stay interactive for the chain to be grabbable, so the
 * wrapper tracks the pointer itself and the simulation reads it, rather than
 * relying on R3F's own pointer state.
 */
interface PointerState {
  /** Normalised device coordinates, -1 to 1. */
  x: number;
  y: number;
  /** Previous frame's coordinates, for the throw velocity. */
  lastX: number;
  lastY: number;
  down: boolean;
  /** Index of the grabbed link, or -1. */
  grabbed: number;
  /** Cursor movement this frame, in world units, for the throw. */
  deltaX: number;
  deltaY: number;
}

function createPointerState(): PointerState {
  return { x: 0, y: 0, lastX: 0, lastY: 0, down: false, grabbed: -1, deltaX: 0, deltaY: 0 };
}

/**
 * Custom cursors. The hotspot is the tip of the index finger, which sits about
 * 20 units in from the left edge and level with the top of the 89 unit wide
 * artwork, so `20 1` puts the point under the real cursor.
 */
const HOVER_CURSOR = "url('/cursors/hover.svg') 20 1, auto";
const GRAB_CURSOR = "url('/cursors/grab.svg') 20 1, auto";

interface LinkBody {
  mesh: THREE.Mesh;
  position: THREE.Vector3;
  previous: THREE.Vector3;
}

const AXIS_Y = new THREE.Vector3(0, 1, 0);
const DOWN = new THREE.Vector3(0, -1, 0);
const scratchDelta = new THREE.Vector3();
const scratchPointerWorld = new THREE.Vector3();
const scratchDir = new THREE.Vector3();
const scratchSwing = new THREE.Quaternion();
const scratchInterlock = new THREE.Quaternion();

/**
 * Orientation that points a link's rest-pose "down the chain" axis (-Y) at
 * the real 3D direction to its neighbour.
 *
 * Earlier this was done by computing a separate "sideways lean" angle and a
 * separate "depth tilt" angle and adding the two together as one rotation
 * about Z. That's not a valid way to combine rotations about different axes:
 * it happens to be harmless for a link facing the camera (spinning a
 * symmetric ring about its own centreline is invisible), but for the
 * interlocked link — deliberately turned 90 degrees so it reads edge-on —
 * that same bogus rotation spins its thin edge around the camera axis,
 * skewing it into a diagonal sliver instead of a clean horizontal one.
 *
 * setFromUnitVectors handles arbitrary 3D lean correctly in one step, so
 * there's no decomposition to get wrong.
 */
function swingOrientation(links: LinkBody[], index: number, out: THREE.Quaternion): THREE.Quaternion {
  const link = links[index];
  const next = links[index + 1];
  const looksForward = next !== undefined;
  const neighbour = next ?? links[index - 1];
  if (!neighbour) return out.identity();
  scratchDir.copy(neighbour.position).sub(link.position);
  // The last link has no "next" neighbour, so it looks back at the previous
  // one instead — flip the direction so it still reads as "continuing
  // downward" rather than mirroring back on itself.
  if (!looksForward) scratchDir.negate();
  if (scratchDir.lengthSq() < 1e-18) return out.identity();
  scratchDir.normalize();
  return out.setFromUnitVectors(DOWN, scratchDir);
}

function useChainRig(modelUrl: string, color: string, opacity: number, linkCount: number): ChainRig {
  const { scene } = useGLTF(modelUrl);

  return useMemo(() => {
    let prototype: THREE.Mesh | undefined;
    scene.traverse((child) => {
      if (!prototype && child instanceof THREE.Mesh) prototype = child;
    });
    if (!prototype) throw new Error(`ChainlinkBackground: ${modelUrl} contains no mesh.`);

    // One shared material and geometry across every instanced link.
    //
    // Metalness stays high because that is what gives the rings their form: a
    // metal surface's shading comes almost entirely from what it reflects, and
    // dropping metalness to kill a colour cast also dropped every highlight and
    // left flat silhouettes. The cast is dealt with at the source instead — the
    // environment this reflects is a neutral grey room, so what comes back is
    // white and grey rather than tinted.
    const material = new THREE.MeshStandardMaterial({
      color: new THREE.Color(color),
      metalness: 0.85,
      roughness: 0.28,
      transparent: opacity < 1,
      opacity,
    });

    const links: LinkBody[] = [];
    for (let index = 0; index < linkCount; index += 1) {
      const mesh = new THREE.Mesh((prototype as THREE.Mesh).geometry, material);
      mesh.castShadow = false;
      mesh.receiveShadow = false;
      mesh.frustumCulled = false;
      // Overwritten every frame once the sim starts; set here so the very first
      // frame, before physics has run, already looks like a chain.
      mesh.quaternion.setFromAxisAngle(AXIS_Y, index * TWIST_PER_LINK);
      const position = new THREE.Vector3();
      links.push({ mesh, position, previous: position.clone() });
    }

    // Spacing is a fraction of the ring's own width, so the overlap reads as a
    // threaded chain rather than a clump, and the rest length matches what the
    // chain looks like when pulled taut by hand.
    const bounds = new THREE.Box3().setFromObject(prototype as THREE.Mesh);
    const size = bounds.getSize(new THREE.Vector3());
    const outer = Math.max(size.x, size.y, size.z) || 1;

    // Tube dimensions for collision. The model is a ring in its local XY plane
    // with the tube thickness along Z, so the centreline radius is the face
    // width minus one tube diameter, halved, and the tube is half the depth.
    // These drive the bead collision that keeps neighbouring tubes from passing
    // through each other, so they must describe the tube, not the centres.
    const thickness = Math.max(size.z, 1e-6);
    const face = Math.max(size.x, size.y, 1e-6);
    const ringRadius = Math.max((face - thickness) / 2, 1e-6);
    const tubeRadius = thickness / 2;

    const rest = outer * PITCH_RATIO;
    return { links, rest, length: rest * Math.max(links.length - 1, 1), outer, ringRadius, tubeRadius };
  }, [scene, color, opacity, linkCount]);
}

interface ChainRig {
  links: LinkBody[];
  rest: number;
  /** Total length from the first link to the last, in local units. */
  length: number;
  /** The ring's outer size, which is what gets fitted to the viewport. */
  outer: number;
  /** Centreline radius of the ring's tube, for bead collision. */
  ringRadius: number;
  /** Radius of the tube itself, for bead collision. */
  tubeRadius: number;
}

function Chain({
  modelUrl,
  color,
  scale,
  offset,
  opacity,
  linkCount,
  pointer,
  groupRef,
  onPullRef,
  lastPullRef,
}: {
  modelUrl: string;
  color: string;
  scale: number;
  offset: [number, number, number];
  opacity: number;
  linkCount: number;
  pointer: PointerState;
  groupRef: React.RefObject<THREE.Group>;
  /** Latest pull callback, via ref so the frame loop never re-subscribes. */
  onPullRef: React.MutableRefObject<((progress: number) => void) | undefined>;
  /** Last reported progress, so the callback only fires when it moves. */
  lastPullRef: React.MutableRefObject<number>;
}) {
  const { width, height } = useThree((state) => state.viewport);
  const rig = useChainRig(modelUrl, color, opacity, linkCount);
  const initialised = useRef(false);
  const anchorAngleRef = useRef(0);

  // Fit the whole chain to the viewport height, so link spacing stays correct
  // whatever the link count. Fitting one link instead would grow a long chain
  // off screen and shrink a short one into a clump.
  const groupScale = useMemo(() => {
    const raw = (CHAIN_HEIGHT_RATIO * height) / Math.max(rig.length, 1e-6);
    return Math.min(Math.max(raw, 1e-4), 1e4) * scale;
  }, [height, rig.length, scale]);

  const localRest = rig.rest;
  const anchorX = ((ANCHOR_X_RATIO * width) / 2 + offset[0]) / groupScale;
  const anchorY = height / 2 / groupScale + offset[1] / groupScale;
  const anchorZ = offset[2] / groupScale;
  const localGravity = GRAVITY / groupScale;

  useFrame((_state, delta) => {
    const group = groupRef.current;
    if (!group) return;
    const links = rig.links;
    if (links.length === 0) return;

    const dt = Math.min(delta, MAX_STEP);

    // The pinned link spins in place about the screen axis at a constant rate.
    // Accumulated from clamped dt rather than wall time, so a hitch cannot jump
    // it forward.
    anchorAngleRef.current = (anchorAngleRef.current + dt * ANCHOR_SPIN_SPEED) % (Math.PI * 2);
    const anchorAngle = anchorAngleRef.current;

    // Pointer position on the z = 0 plane, in local units.
    scratchPointerWorld.set(
      (pointer.x * width) / 2 / groupScale,
      (pointer.y * height) / 2 / groupScale,
      anchorZ,
    );
    pointer.deltaX = (pointer.x - pointer.lastX) * width / 2 / groupScale;
    pointer.deltaY = (pointer.y - pointer.lastY) * height / 2 / groupScale;
    pointer.lastX = pointer.x;
    pointer.lastY = pointer.y;

    if (!initialised.current) {
      links.forEach((link, index) => {
        link.position.set(anchorX, anchorY - index * localRest, anchorZ);
        link.previous.copy(link.position);
      });
      initialised.current = true;
    }

    links[0].position.set(anchorX, anchorY, anchorZ);
    links[0].previous.copy(links[0].position);

    // Pick up the nearest link on press, and keep hold of it until release.
    if (pointer.down && pointer.grabbed < 0) {
      let best = -1;
      let bestDistance = rig.outer * GRAB_RADIUS_RATIO;
      links.forEach((link, index) => {
        const distance = link.position.distanceTo(scratchPointerWorld);
        if (distance < bestDistance) {
          bestDistance = distance;
          best = index;
        }
      });
      pointer.grabbed = best;
    }
    if (!pointer.down) pointer.grabbed = -1;

    for (const [index, link] of links.entries()) {
      const held = pointer.grabbed === index;
      if (held) {
        // Kinematic: the link tracks the cursor, and its velocity is taken from
        // the cursor's movement so letting go mid-flick throws the chain.
        link.position.lerp(scratchPointerWorld, GRAB_FOLLOW);
        // The lerp above has no speed limit of its own, so a fast flick moves
        // the held link across the screen in a single frame. For that frame its
        // ring spans the viewport, and the post pass dutifully paints the whole
        // canvas in the chain's colours — the full-screen flash. Capping travel
        // per frame keeps the pull elastic: the cursor may be far away, but the
        // link approaches it over several steps instead of teleporting.
        scratchDelta.copy(link.position).sub(link.previous);
        const travel = scratchDelta.length();
        const maxTravel = localRest * HELD_LIMIT;
        if (travel > maxTravel) {
          link.position.copy(link.previous).addScaledVector(scratchDelta, maxTravel / travel);
        }
        // Verlet's velocity term is a displacement per step, and deltaX is
        // already one frame of cursor movement, so it must not be divided by dt
        // again — doing so threw released links at sixty times the intended speed.
        // Capped, so a hitch cannot deliver several frames of cursor travel as
        // one step's velocity.
        scratchDelta.set(pointer.deltaX, pointer.deltaY, 0).multiplyScalar(THROW_SCALE);
        const throwLength = scratchDelta.length();
        const maxThrow = localRest * THROW_LIMIT;
        if (throwLength > maxThrow) scratchDelta.multiplyScalar(maxThrow / throwLength);
        link.previous.copy(link.position).sub(scratchDelta);
        continue;
      }
      if (pointer.grabbed >= 0 && index === pointer.grabbed + 1) {
        // Let the constraint solve handle the pulled neighbour.
        link.previous.copy(link.position);
        continue;
      }

      // Verlet: velocity from the previous step, then gravity. Nothing else acts
      // on a free link: there is no hover field, so the chain only moves when it
      // is pulled by gravity or held by the cursor.
      // Capped per step, so a released link can never carry more energy than the
      // solver can absorb.
      scratchDelta.copy(link.position).sub(link.previous);
      const speed = scratchDelta.length();
      const maxSpeed = localRest * SPEED_LIMIT;
      if (speed > maxSpeed) scratchDelta.multiplyScalar(maxSpeed / speed);
      scratchDelta.multiplyScalar(DAMPING);
      link.previous.copy(link.position);
      link.position.add(scratchDelta);
      link.position.y -= localGravity * dt * dt;
    }

    // Entrainment toward the anchor's swirl, for free links only.
    //
    // The anchor turns about Y at ANCHOR_SPIN_SPEED, so the air around its axis
    // — in the motor's frame — moves tangentially. Each link is steered a little
    // toward the tangential velocity at its own radius from that axis, scaled by
    // the anchor's own surface speed so the chain stays in step with the motor
    // rather than running on a separate clock. Skips the held link and its
    // pulled neighbour outright, so this never fights the cursor.
    const surfaceSpeed = ANCHOR_SPIN_SPEED * rig.ringRadius;
    const stepDt = Math.max(dt, 1e-6);
    for (const [index, link] of links.entries()) {
      if (index === 0) continue;
      if (pointer.grabbed === index) continue;
      if (pointer.grabbed >= 0 && index === pointer.grabbed + 1) continue;
      scratchDelta.set(link.position.x - anchorX, 0, link.position.z - anchorZ);
      if (scratchDelta.lengthSq() < 1e-12) continue;
      // Tangential, same sense as the anchor: Y cross r.
      scratchDelta.set(-scratchDelta.z, 0, scratchDelta.x).normalize();
      const swirl = surfaceSpeed / (1 + index * ENTRAIN_FALLOFF);
      // Current velocity per second, eased toward the swirl, then written back
      // as a Verlet displacement so the integrator stays consistent.
      scratchDir.copy(link.position).sub(link.previous).divideScalar(stepDt);
      scratchDir.lerp(scratchDelta.multiplyScalar(swirl), ENTRAIN_BLEND);
      link.previous.copy(link.position).addScaledVector(scratchDir, -stepDt);
    }

    // Distance constraints, solved asymmetrically on purpose.
    //
    // The rings are drawn overlapping, so "linked" means the distance between
    // centres must never exceed the rest length. Letting it grow is what made the
    // rings drift apart and pass through each other, so over-stretch is the side
    // that has to be resisted.
    //
    // Over-stretch is corrected only partway, by the spring constant. That is
    // what produces the give: a hard pull stretches the chain, the displacement
    // is stored, and on release the chain oscillates back to rest. Over-
    // compression is corrected rigidly, because nothing should ever push the
    // rings into each other.
    const elasticStep = Math.min(1, STRETCH_SPRING * STRETCH_DAMPING * dt * dt);
    // A joint folded further than MAX_BEND spans a shorter chord between the two
    // links either side of it, so the bend limit is expressed as a minimum
    // distance across the joint. That reuses the distance machinery above rather
    // than adding a second, competing kind of constraint.
    const chordMin = 2 * localRest * Math.cos(MAX_BEND / 2);
    const separationMin = localRest * SELF_SEPARATION;

    for (let iteration = 0; iteration < CONSTRAINT_ITERATIONS; iteration += 1) {
      for (let i = 1; i < links.length; i += 1) {
        const a = links[i - 1];
        const b = links[i];
        scratchDelta.copy(b.position).sub(a.position);
        const distance = scratchDelta.length();
        if (distance < 1e-9) continue;

        // Rigid when too close, elastic when too far.
        const strength = distance < localRest ? 1 : elasticStep;
        const correction = ((distance - localRest) / distance) * strength;
        if (i === 1) {
          b.position.addScaledVector(scratchDelta, -correction);
        } else {
          a.position.addScaledVector(scratchDelta, correction * 0.5);
          b.position.addScaledVector(scratchDelta, -correction * 0.5);
        }
      }

      // Bend limit across every joint.
      for (let i = 1; i < links.length - 1; i += 1) {
        pushApart(links[i - 1], links[i + 1], chordMin, BEND_STRENGTH, i === 1);
      }

      // Collision between links that are not neighbours. This is what stops a
      // ring being dragged through one it is not connected to.
      for (let i = 0; i < links.length; i += 1) {
        for (let j = i + 2; j < links.length; j += 1) {
          pushApart(links[i], links[j], separationMin, 1, i === 0);
        }
      }

      links[0].position.set(anchorX, anchorY, anchorZ);
    }

    // Tube-level collision, after the centre-based solve. This is what stops
    // rings passing through each other rather than just holding their spacing:
    // without it the centres can sit exactly right while the tubes intersect,
    // and the solver micro-jitters fighting itself.
    for (let beadPass = 0; beadPass < BEAD_ITERATIONS; beadPass++) {
      collideBeads(links, rig.ringRadius, rig.tubeRadius, anchorAngle);
    }
    // Friction from the spinning anchor into link 1, once per frame after the
    // separation has settled. This is what visibly couples the motor to the
    // chain; without it the top link turns and nothing below responds.
    dragAnchorNeighbor(links, rig.ringRadius, rig.tubeRadius, anchorAngle, dt);
    links[0].position.set(anchorX, anchorY, anchorZ);

    // Backstop only. The spring is what governs the feel; this exists purely so
    // a violent flick cannot run a link out to infinity between frames.
    const maxDistance = localRest * MAX_STRETCH;
    for (let i = 1; i < links.length; i += 1) {
      const a = links[i - 1];
      const b = links[i];
      scratchDelta.copy(b.position).sub(a.position);
      const distance = scratchDelta.length();
      if (distance <= maxDistance || distance < 1e-9) continue;
      b.position.copy(a.position).addScaledVector(scratchDelta, maxDistance / distance);
    }

    // Report how far the chain is pulled, as the tail's displacement from where
    // it hangs at rest, normalised by the chain's own length. Only while held,
    // and only when the value has actually moved, so a consumer driving React
    // state from it is not re-rendered every frame. Released reports 0.
    if (pointer.down && pointer.grabbed >= 0 && links.length > 1) {
      const tail = links[links.length - 1];
      // Measured from where the tail hangs at rest under the fixed pin.
      const restY = anchorY - (links.length - 1) * localRest;
      scratchDelta.set(tail.position.x - anchorX, tail.position.y - restY, 0);
      const progress = Math.min(1, scratchDelta.length() / Math.max(rig.length * FULL_PULL, 1e-6));
      if (Math.abs(progress - lastPullRef.current) > 0.005) {
        lastPullRef.current = progress;
        onPullRef.current?.(progress);
      }
    } else if (lastPullRef.current !== 0) {
      lastPullRef.current = 0;
      onPullRef.current?.(0);
    }

    // Last line of defence: any link that has gone non-finite is re-hung from
    // the anchor. A NaN in one position poisons every constraint it touches, so
    // without this a single bad step permanently blanks the chain into whatever
    // the post pass makes of garbage — usually a flat field.
    for (const [index, link] of links.entries()) {
      const bad =
        !Number.isFinite(link.position.x + link.position.y + link.position.z) ||
        !Number.isFinite(link.previous.x + link.previous.y + link.previous.z);
      if (!bad) continue;
      link.position.set(anchorX, anchorY - index * localRest, anchorZ);
      link.previous.copy(link.position);
    }

    // Publish transforms.
    //
    // Each link is oriented so its rest-pose chain axis follows the direction to
    // its neighbour, then twisted about that axis by a fixed amount per link. The
    // twist is what makes the rings overlap into a chain instead of stacking as
    // coplanar copies; see the note on TWIST_PER_LINK for why a clean 90 degree
    // alternation cannot work with circular rings.
    group.scale.setScalar(groupScale);
    links.forEach((link, index) => {
      link.mesh.position.copy(link.position);

      // Index 0 turns about the screen axis at the accumulated angle; the rest
      // follow the chain. Same composition the beads use, so what is drawn is
      // what collides.
      linkOrientation(links, index, anchorAngle, link.mesh.quaternion);
    });
  });

  return (
    <group ref={groupRef}>
      {rig.links.map((link, index) => (
        <primitive key={index} object={link.mesh} />
      ))}
    </group>
  );
}

export interface ChainlinkBackgroundProps {
  modelUrl?: string;
  color?: string;
  /** How many rings to instance. */
  linkCount?: number;
  /** Multiplier on the auto-fitted size. */
  scale?: number;
  /** Nudges the anchor, in viewport units before the group scale is applied. */
  offset?: [number, number, number];
  opacity?: number;
  /** Run the ordered-dithering post pass over the chain. */
  dither?: boolean;
  /** Bayer cell size in device pixels. Smaller is finer. */
  ditherGridSize?: number;  /** Luminance treated as fully knocked out. Raise to deepen shadows. */
  ditherBlackPoint?: number;
  /** Luminance treated as fully solid. Lower to bring out highlights. */
  ditherWhitePoint?: number;
  /**
   * Called with how far the chain is pulled from rest, 0 to 1, while it is held.
   * Called with 0 when it is released.
   *
   * Throttled to when the value moves, so a consumer that sets React state —
   * like a headline scrambling in step with the pull — is not re-rendered every
   * frame.
   */
  onPull?: (progress: number) => void;
}

/**
 * A high-contrast studio environment for the metal to reflect.
 *
 * A metal's shading is almost entirely reflection, so a uniform environment —
 * a grey room, or a flat ambient term — gives every ring one even value and
 * there is no gradient for the dither to resolve. Strips of light against a dark
 * surround put a bright-to-dark falloff across the curve of each ring, which is
 * what produces readable shading.
 *
 * The lightformers are white on near-black deliberately. Both dither colours are
 * pinned by uniform now, so nothing here can tint the output: the environment
 * only has to get the *luminance* range right, and the pattern does the rest.
 */
function StudioEnvironment() {
  return (
    <Environment resolution={256} frames={1}>
      <color attach="background" args={["#0B0B0C"]} />
      {/* Key overhead, the broad highlight along the top of each ring. */}
      <Lightformer intensity={5} rotation-x={Math.PI / 2} position={[0, 5, -1]} scale={[12, 12, 1]} />
      {/* Cooler, dimmer fill from below so the underside falls off. */}
      <Lightformer intensity={1.1} rotation-x={-Math.PI / 2} position={[0, -5, 1]} scale={[12, 12, 1]} />
      {/* Narrow side strip: a tight specular line that describes the curvature. */}
      <Lightformer intensity={3} rotation-y={Math.PI / 2} position={[-6, 0, 2]} scale={[8, 3, 1]} />
      <Lightformer intensity={1.6} rotation-y={-Math.PI / 2} position={[6, 1, -2]} scale={[8, 3, 1]} />
    </Environment>
  );
}

export function ChainlinkBackground({
  modelUrl = MODEL_URL,
  color = CHAIN_COLOR,
  linkCount,
  scale,
  offset = [0, 0, 0],
  opacity = 1,
  dither = true,
  ditherGridSize = 4,
  ditherBlackPoint = 0.32,
  ditherWhitePoint = 1,
  onPull,
}: ChainlinkBackgroundProps) {
  const isMobile = useIsMobile();
  // Left undefined by default so the count and size can follow the breakpoint.
  // A fixed default here would win over the responsive value and the chain would
  // stay at its desktop length on a phone.
  const resolvedLinkCount = linkCount ?? (isMobile ? MOBILE_LINK_COUNT : LINK_COUNT);
  const resolvedScale = scale ?? (isMobile ? MOBILE_SCALE : 1);
  const groupRef = useRef<THREE.Group>(null);
  const pointerRef = useRef<PointerState>(createPointerState());
  const [pressed, setPressed] = useState(false);
  // Last pull progress reported, so onPull only fires when the value moves and a
  // consumer setting React state is not re-rendered every frame.
  const lastPullRef = useRef(0);
  // Latest callback without re-subscribing the frame loop to it.
  const onPullRef = useRef(onPull);
  onPullRef.current = onPull;

  /** Client coordinates to normalised device coordinates, -1 to 1. */
  const track = (event: React.PointerEvent<HTMLDivElement>) => {
    const rect = event.currentTarget.getBoundingClientRect();
    if (rect.width === 0 || rect.height === 0) return;
    const pointer = pointerRef.current;
    pointer.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
    pointer.y = -(((event.clientY - rect.top) / rect.height) * 2 - 1);
  };

  return (
    <div
      aria-hidden="true"
      className="absolute inset-0 z-0 overflow-hidden"
      style={{ cursor: pressed ? GRAB_CURSOR : HOVER_CURSOR, touchAction: "none" }}
      onPointerDown={(event) => {
        track(event);
        pointerRef.current.down = true;
        setPressed(true);
        event.currentTarget.setPointerCapture(event.pointerId);
      }}
      onPointerMove={track}
      onPointerUp={(event) => {
        pointerRef.current.down = false;
        pointerRef.current.grabbed = -1;
        setPressed(false);
        event.currentTarget.releasePointerCapture(event.pointerId);
      }}
      onPointerCancel={() => {
        pointerRef.current.down = false;
        pointerRef.current.grabbed = -1;
        setPressed(false);
      }}
      onPointerLeave={() => {
        pointerRef.current.down = false;
        pointerRef.current.grabbed = -1;
        setPressed(false);
      }}
    >
      <Canvas
        camera={{ position: [0, 0, 10], fov: 50 }}
        dpr={[1, 2]}
        gl={{ antialias: true, alpha: true }}
        style={{ background: "transparent" }}
      >
        <StudioEnvironment />
        {/*
          Ambient is deliberately almost off. It is a uniform term: it adds the
          same light to every surface whatever its orientation, so it is the
          single biggest flattener of form there is. At the previous intensity of
          1.1 it drowned out the directional lights, every ring came out one
          uniform value, and a binary dither of one value is one flat shade.
        */}
        <ambientLight intensity={0.12} />
        <directionalLight position={[6, 8, 10]} intensity={1.6} />
        <directionalLight position={[-8, -4, 6]} intensity={0.25} />
        <Suspense fallback={null}>
          <Chain
            modelUrl={modelUrl}
            color={color}
            scale={resolvedScale}
            offset={offset}
            opacity={opacity}
            linkCount={resolvedLinkCount}
            pointer={pointerRef.current}
            groupRef={groupRef}
            onPullRef={onPullRef}
            lastPullRef={lastPullRef}
          />
        </Suspense>
        <DitheringPass
          enabled={dither}
          gridSize={ditherGridSize}
          blackPoint={ditherBlackPoint}
          whitePoint={ditherWhitePoint}
          solidColor={CHAIN_SHADOW_COLOR}
          knockoutColor={CHAIN_COLOR}
          useSolidColor
        />
      </Canvas>
    </div>
  );
}
