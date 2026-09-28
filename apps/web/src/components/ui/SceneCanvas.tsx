import { Suspense, useCallback, useEffect, useRef, useState, type ReactNode } from "react";
import { Canvas } from "@react-three/fiber";
import { SquircleFrame } from "./SquircleFrame";
import { FramingReadout, SceneCamera, type SceneFraming } from "./SceneTuner";

/**
 * The white 3D area a scene is mounted into.
 *
 * A section on the page owns the copy; this owns everything that makes a scene
 * look like it belongs to the page rather than being pasted onto it:
 *
 * - The area is a white card and the clear colour is the same white, so the space
 *   around the geometry is the card and the card's edge stays the only boundary
 *   on screen. Any other clear colour draws a second, invisible-to-CSS edge.
 * - The lights are shared, so two scenes side by side are lit identically
 *   instead of each shipping its own rig.
 * - The framing is specified as an angle across the area and re-derived on every
 *   resize, so a scene is framed the same on a phone and on a wide panel.
 * - The canvas is squircle-clipped like the rest of the page's panels.
 * - The context is only created once the area is near the screen. A WebGL
 *   context is the expensive part of a scene and there is no reason to pay for
 *   one that is four screens down.
 *
 * The scene itself is passed as children and owns nothing but its own geometry,
 * so a scene is a plain React tree with no knowledge of the frame around it.
 */

/**
 * The colour the area clears to.
 *
 * The page's paper, not white, and that is the whole of the seam. Any difference
 * between what the canvas clears to and what the section around it is painted
 * draws a line across the page that no amount of layout will remove — the canvas
 * is a box inside a box, so its edge is a real edge and the browser has no way to
 * hide it. Clearing to the same value as the section behind it is the only thing
 * that makes the scene look like it is part of the page rather than a picture
 * pasted on it.
 *
 * Named here rather than read from CSS so the three.js side and the DOM side
 * cannot drift apart; if the page's background is ever changed, this is the one
 * line that has to change with it.
 */
export const PAGE_COLOR = "#F8F8F8";

/** Start building the scene this far before the area scrolls into view. */
const MOUNT_MARGIN = "400px";

/**
 * The shared light rig.
 *
 * Deliberately directional, and deliberately strong everywhere else. Matte
 * geometry has no highlights to describe its form, so the form has to come from
 * falloff across each surface — and falloff is only visible if the surfaces are
 * not already sitting at the top of the range. A hemisphere term strong enough
 * to light a room on its own is the single thing that makes a lit scene read as
 * a flat fill, because it fills every surface to the same value no matter which
 * way it faces.
 *
 * But there is a floor on how dark a shadowed side is allowed to get. The
 * hemisphere's ground colour is what lands on every downward-facing surface and
 * every surface turned away from the key, and where it is a mid grey the whole
 * room picks up a cast that has nothing to do with the light in it — the shadows
 * read as dirt on the lens rather than as the absence of the key. A light, cool
 * ground colour keeps the shade legible as shade and still part of a white room.
 */
export function ClayLights() {
  return (
    <>
      <hemisphereLight args={["#FFFFFF", "#E4E8EE", 1.3]} />
      <directionalLight
        position={[1.6, 4.5, 4]}
        intensity={2.2}
        castShadow
        shadow-mapSize={[2048, 2048]}
        shadow-bias={-0.0006}
        shadow-camera-near={0.5}
        shadow-camera-far={16}
        shadow-camera-left={-4}
        shadow-camera-right={4}
        shadow-camera-top={4}
        shadow-camera-bottom={-4}
      />
      <directionalLight position={[-4, 1.5, 4]} intensity={0.55} />
      {/*
        A brand-blue rim from behind and to the left. Blue is the accent the
        rest of the app uses, and a coloured rim is what separates a shaded
        surface from a dark one — without it the far corners of a white room are
        just grey.
      */}
      <directionalLight position={[-4, 2, -4]} intensity={0.45} color="#2A8CFF" />
    </>
  );
}

export interface SceneCanvasProps {
  /** The scene graph. Renders inside the canvas, after the lights. */
  children: ReactNode;
  /** Sizes the area. The canvas fills whatever box this produces. */
  className?: string;
  /**
   * What the scene shows, for anyone who cannot see it.
   *
   * Given, the area is exposed as an image with this name and the canvas inside
   * it is hidden from the tree. Left out, the whole area is decorative and is
   * hidden instead.
   */
  label?: string;
  /** Clear colour, and the colour the area is painted behind the canvas. */
  background?: string;
  /**
   * How the area's edges are drawn.
   *
   * Flush by default, which means the canvas is a plain rectangle whose colour
   * matches the section behind it, so nothing marks where it begins. A squircle
   * is the other option and it is a deliberate edge: it says this is a panel on
   * the page, which is right for a card with its own content and wrong for a
   * scene meant to be part of the page.
   */
  shape?: "flush" | "squircle";
  /** Camera position in world units, level and looking down the scene's own axis. */
  cameraPosition?: [number, number, number];
  /**
   * How wide the scene is held, in degrees, across the area.
   *
   * Horizontal rather than vertical, because width is what a scene's framing
   * actually depends on. Pin the vertical angle instead and a narrower area
   * quietly crops the scene's left and right edges off — the walls stop being
   * visible, and a scene framed on one screen is framed wrongly on another.
   */
  horizontalFov?: number;
  /** What the camera looks at, on the floor plane, as x and z. Defaults ahead of the camera. */
  cameraTarget?: [number, number];
  /**
   * Hands the framing to the pointer and shows the numbers on screen.
   *
   * A tuning aid for settling a camera by hand rather than by arithmetic. Off by
   * default, because a scene that can be dragged is a scene a visitor can drag
   * out of frame.
   */
  tune?: boolean;
  /**
   * Gentle looping drift of the camera position between two framings.
   * Cosine-interpolated; see `SceneCamera` for details.
   */
  sway?: {
    from: [number, number, number];
    to: [number, number, number];
    seconds?: number;
  };
}

/**
 * Creates the WebGL context only once the area is near the screen.
 *
 * Fallback is `true` rather than `false` where IntersectionObserver is missing,
 * so an environment without it still gets a scene instead of a permanently
 * blank panel.
 */
function useNearViewport<T extends HTMLElement>() {
  const ref = useRef<T>(null);
  const [near, setNear] = useState(() => typeof IntersectionObserver === "undefined");

  useEffect(() => {
    const node = ref.current;
    if (near || !node) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return;
        setNear(true);
        observer.disconnect();
      },
      { rootMargin: MOUNT_MARGIN },
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, [near]);

  return { ref, near };
}

export function SceneCanvas({
  children,
  className = "h-full w-full",
  label,
  background = PAGE_COLOR,
  shape = "flush",
  cameraPosition = [0, 1.5, 3.5],
  cameraTarget,
  horizontalFov = 55,
  tune = false,
  sway,
}: SceneCanvasProps) {
  const { ref, near } = useNearViewport<HTMLDivElement>();
  // In a ref, so dragging the camera re-renders the readout and nothing else.
  const [framing, setFraming] = useState<SceneFraming>(() => ({
    position: cameraPosition,
    target: cameraTarget ?? [0, cameraPosition[2] - 4],
    horizontalFov,
  }));
  const framingRef = useRef(framing);
  framingRef.current = framing;
  const handleChange = useCallback((next: SceneFraming) => setFraming(next), []);

  const canvas = (
    <Canvas
      shadows
      dpr={[1, 2]}
      camera={{ position: cameraPosition, fov: horizontalFov }}
      gl={{ antialias: true, alpha: false, powerPreference: "low-power" }}
      // Absolutely filling the area rather than sizing itself from a percentage
      // chain. R3F lays its canvas out at whatever height it measures, and a
      // canvas element takes its CSS size from its own width/height attributes —
      // so a measurement taken a frame early leaves a strip of bare page along
      // the bottom edge. Sizing the wrapper with `inset` removes the chain that
      // had to be measured.
      style={{ position: "absolute", inset: 0 }}
      onCreated={({ gl }) => {
        // At 1, so a white surface lit by the key lands where it was painted.
        // Below that everything in the room is scaled down on the way out, which
        // is a different way of saying the room is too dark and is much harder to
        // tune: it flattens the palette, the halftone and the outline at the same
        // time as it darkens the walls.
        gl.toneMappingExposure = 1;
      }}
    >
      <color attach="background" args={[background]} />
      <ClayLights />
      <SceneCamera framing={framingRef} tune={tune} onChange={handleChange} sway={sway} />
      {/* A scene that loads a model suspends; the lights outside the boundary stay
          lit so the area never flashes unlit geometry. */}
      <Suspense fallback={null}>{children}</Suspense>
    </Canvas>
  );

  return (
    <div
      ref={ref}
      // The background is on the wrapper as well as in the canvas, and both are
      // the page's own colour. The wrapper covers the frames between the area
      // scrolling into view and the context being created, and if the two
      // disagreed that hand-off would be the seam instead.
      className={`relative ${className}`}
      style={{ backgroundColor: background }}
      role={label ? "img" : undefined}
      aria-label={label}
      aria-hidden={label ? undefined : true}
    >
      {shape === "squircle" ? (
        <SquircleFrame className="relative h-full w-full">{near ? canvas : null}</SquircleFrame>
      ) : (
        near && canvas
      )}
      {tune ? <FramingReadout framing={framing} /> : null}
    </div>
  );
}
