import { useEffect, useRef, type MutableRefObject } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";

/**
 * A hand-crank for a scene's framing.
 *
 * A camera is three numbers and a field of view, and guessing at them from a
 * screenshot is a slow way to converge on the right ones. This puts the numbers
 * under the pointer: drag to move the camera, shift-drag to move what it looks
 * at, wheel to change how far back it stands, square brackets for the angle.
 * The readout then shows the values, which can be pasted straight back into the
 * scene's constants and the whole thing deleted.
 *
 * The look target is held at the camera's own height rather than at a point in
 * the room, so moving the camera up moves the eye line with it and the view
 * stays level. Aiming at a fixed point in the room instead would pitch the
 * camera down as soon as it is raised, which is exactly the distortion an
 * interior must not have.
 */

export interface SceneFraming {
  /** Camera position in world units. */
  position: [number, number, number];
  /** What the camera looks at, on the floor plane, as x and z. */
  target: [number, number];
  /** Field of view across the area, in degrees. */
  horizontalFov: number;
}

/** World units per pixel of drag, and per notch of wheel. */
const DRAG_SCALE = 0.02;
const WHEEL_SCALE = 0.01;

/** Degrees per bracket keypress. */
const FOV_STEP = 2;

/** How far the camera and target may be pushed, so a stray drag cannot lose the scene. */
const LIMITS = { x: 12, yLow: 0.2, yHigh: 8, zLow: -8, zHigh: 20 } as const;

function clamp(value: number, low: number, high: number) {
  return Math.min(Math.max(value, low), high);
}

function copy(framing: SceneFraming): SceneFraming {
  return {
    position: [...framing.position] as [number, number, number],
    target: [...framing.target] as [number, number],
    horizontalFov: framing.horizontalFov,
  };
}

/**
 * Set while a scene element has taken the pointer for itself.
 *
 * The camera tuner and anything in the scene that can be picked up both listen on
 * the canvas, and without this a drag that starts on a phone would move the phone
 * and the camera at once. Whoever grabs the pointer claims it, and the other one
 * stands down for the length of the drag.
 */
export const pointerClaimed = { value: false };

export interface SceneCameraProps {
  framing: MutableRefObject<SceneFraming>;
  /** When on, the pointer and keyboard drive the framing. */
  tune: boolean;
  onChange?: (framing: SceneFraming) => void;
  /**
   * Gentle looping drift of the camera position between two framings.
   *
   * Cosine-interpolated, so it eases out of each end and back. Target and
   * field of view stay on the framing; only the position sways. Pauses while
   * a tune-drag holds the camera, and stays parked at `from` for reduced
   * motion.
   */
  sway?: {
    from: [number, number, number];
    to: [number, number, number];
    /** Loop period in seconds. Defaults to 14. */
    seconds?: number;
  };
}

/**
 * Applies the framing to the camera, and hands it to the pointer when tuning.
 *
 * Applied every frame rather than on change, so the camera is correct on the
 * first frame and stays correct across a resize that changes the aspect.
 */
export function SceneCamera({ framing, tune, onChange, sway }: SceneCameraProps) {
  const gl = useThree((state) => state.gl);
  const camera = useThree((state) => state.camera) as THREE.PerspectiveCamera;
  const drag = useRef<{ x: number; y: number; aim: boolean } | null>(null);
  // Latest callback without re-binding every listener on every change.
  const onChangeRef = useRef(onChange);
  onChangeRef.current = onChange;

  useEffect(() => {
    if (!tune) return;
    const element = gl.domElement;
    // Drag has to win over scrolling on a touch screen, or the page scrolls out
    // from under the tuning gesture.
    element.style.touchAction = "none";

    const report = () => onChangeRef.current?.(copy(framing.current));

    const down = (event: PointerEvent) => {
      if (pointerClaimed.value) return;
      drag.current = { x: event.clientX, y: event.clientY, aim: event.shiftKey };
      element.setPointerCapture(event.pointerId);
    };
    const move = (event: PointerEvent) => {
      const from = drag.current;
      if (!from) return;
      const current = framing.current;
      const dx = (event.clientX - from.x) * DRAG_SCALE;
      const dy = (event.clientY - from.y) * DRAG_SCALE;
      from.x = event.clientX;
      from.y = event.clientY;
      if (from.aim) {
        current.target[0] = clamp(current.target[0] - dx, -LIMITS.x, LIMITS.x);
        current.target[1] = clamp(current.target[1] + dy, -LIMITS.x, LIMITS.x);
      } else {
        current.position[0] = clamp(current.position[0] + dx, -LIMITS.x, LIMITS.x);
        current.position[1] = clamp(current.position[1] - dy, LIMITS.yLow, LIMITS.yHigh);
      }
      report();
    };
    const up = (event: PointerEvent) => {
      drag.current = null;
      if (element.hasPointerCapture(event.pointerId)) element.releasePointerCapture(event.pointerId);
    };
    const wheel = (event: WheelEvent) => {
      event.preventDefault();
      const current = framing.current;
      current.position[2] = clamp(
        current.position[2] + event.deltaY * WHEEL_SCALE,
        LIMITS.zLow,
        LIMITS.zHigh,
      );
      report();
    };
    const key = (event: KeyboardEvent) => {
      if (event.key !== "[" && event.key !== "]") return;
      event.preventDefault();
      const current = framing.current;
      current.horizontalFov = clamp(
        current.horizontalFov + (event.key === "[" ? -FOV_STEP : FOV_STEP),
        10,
        110,
      );
      report();
    };

    element.addEventListener("pointerdown", down);
    element.addEventListener("pointermove", move);
    element.addEventListener("pointerup", up);
    element.addEventListener("pointercancel", up);
    element.addEventListener("wheel", wheel, { passive: false });
    window.addEventListener("keydown", key);
    return () => {
      element.removeEventListener("pointerdown", down);
      element.removeEventListener("pointermove", move);
      element.removeEventListener("pointerup", up);
      element.removeEventListener("pointercancel", up);
      element.removeEventListener("wheel", wheel);
      window.removeEventListener("keydown", key);
    };
  }, [gl, tune, framing]);

  useFrame((state) => {
    const current = framing.current;
    if (sway && !drag.current) {
      const period = sway.seconds ?? 14;
      const reduced =
        typeof window !== "undefined" &&
        typeof window.matchMedia !== "undefined" &&
        window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      const t = reduced ? 0 : state.clock.getElapsedTime();
      const k = 0.5 - 0.5 * Math.cos((2 * Math.PI * t) / period);
      camera.position.set(
        sway.from[0] + (sway.to[0] - sway.from[0]) * k,
        sway.from[1] + (sway.to[1] - sway.from[1]) * k,
        sway.from[2] + (sway.to[2] - sway.from[2]) * k,
      );
    } else {
      camera.position.set(current.position[0], current.position[1], current.position[2]);
    }
    // The target's height is the camera's height, so the view is always level.
    camera.lookAt(current.target[0], camera.position.y, current.target[1]);
    // Three.js measures field of view vertically; the framing is specified across
    // the area, so it is converted here on every frame.
    const aspect = camera.aspect || 1;
    const halfWidth = Math.tan(THREE.MathUtils.degToRad(current.horizontalFov) / 2);
    camera.fov = THREE.MathUtils.radToDeg(2 * Math.atan(halfWidth / aspect));
    camera.updateProjectionMatrix();
  });

  return null;
}

/**
 * The numbers, on screen.
 *
 * Outside the squircle so the clip does not cut the corners off it, and inside
 * the area's `img` role, so a tuning overlay is never announced to anyone using
 * a screen reader.
 */
export function FramingReadout({ framing }: { framing: SceneFraming }) {
  const [x, y, z] = framing.position;
  return (
    <div
      aria-hidden="true"
      className="pointer-events-none absolute bottom-3 left-3 rounded-xl bg-white/90 px-3 py-2 text-xs leading-relaxed text-ink shadow-[0_1px_3px_rgba(26,26,25,0.18)]"
    >
      <p className="font-bold">position {x.toFixed(2)}, {y.toFixed(2)}, {z.toFixed(2)}</p>
      <p>target {framing.target[0].toFixed(2)}, {framing.target[1].toFixed(2)}</p>
      <p>horizontal fov {framing.horizontalFov.toFixed(1)}</p>
      <p className="mt-1 text-ink/60">drag to move, shift-drag to aim, wheel for distance, [ and ] for angle</p>
    </div>
  );
}
