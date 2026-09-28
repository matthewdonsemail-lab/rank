import * as THREE from "three";
import { BAYER_GLSL } from "./DitheringPass";

/**
 * The chain's ordered dither, compiled into a material instead of applied to the
 * frame.
 *
 * `DitheringPass` is a post-processing pass, so it can only dither everything:
 * run it over a room and the walls, the floor and the phone all go to the same
 * halftone. That is right for a chain filling its own canvas and wrong for a
 * single object inside a larger scene, where the effect is supposed to belong to
 * the object.
 *
 * Patching the material puts the effect where it belongs — the object draws its
 * halftone, the room around it stays smooth — and it needs no second render
 * pass, no silhouette mask and no layer split. The trade is that the dither is
 * resolved before tone mapping rather than after, so the quantised colour is
 * tone-mapped along with everything else. That shifts the two palette colours a
 * little; pick them a touch brighter than the post pass would need.
 */

export interface ClayDitherOptions {
  /** Bayer cell size, in device pixels. */
  cellSize?: number;
  /** Luminance mapped to fully shaded. Raise it to deepen the shadows. */
  blackPoint?: number;
  /** Luminance mapped to fully solid. Lower it to bring out the highlights. */
  whitePoint?: number;
  /** Colour of the cells above the threshold — the subject's lit faces. */
  solidColor?: string;
  /** Colour of the cells below it — the subject's shading. */
  shadeColor?: string;
}

/** Materials already carrying the chunk, so a second call is a no-op. */
const PATCHED = new WeakSet<THREE.Material>();

/**
 * The injected chunk.
 *
 * Placed at the very end of the fragment shader, after tone mapping and the
 * colour-space conversion, so the luminance it thresholds is the luminance that
 * actually reaches the screen. Reading it any earlier would dither in linear
 * light, where the mid-tones the matrix is built for do not exist.
 */
const CLAY_DITHER_GLSL = /* glsl */ `
uniform float clayCellSize;
uniform float clayBlackPoint;
uniform float clayWhitePoint;
uniform vec3 claySolid;
uniform vec3 clayShade;

${BAYER_GLSL}

/**
 * Replaces this fragment's colour with whichever of the two palette colours the
 * Bayer matrix picks for its cell.
 *
 * The comparison is flipped relative to the post pass. That pass was written for
 * a bright subject on a dark ground, where the lit faces are the solid parts and
 * the shading carries the pattern; here the lit faces are white and the room
 * behind is white too, so the subject only reads if the darker cells are the
 * filled ones.
 */
vec3 clayDither(vec3 colour, vec2 fragCoord) {
  vec2 cell = floor(fragCoord / clayCellSize);
  float luminance = dot(colour, vec3(0.2126, 0.7152, 0.0722));
  // Stretch the subject's real tonal range across the thresholds. The matrix
  // only spans 1/17 to 16/17, so a subject sitting entirely above that range
  // would otherwise collapse to one flat shade.
  float range = max(clayWhitePoint - clayBlackPoint, 1e-4);
  float brightness = clamp((luminance - clayBlackPoint) / range, 0.0, 1.0);
  return brightness <= clayBayerValue(cell * clayCellSize, clayCellSize)
    ? clayShade
    : claySolid;
}
`;

/**
 * The two places the chunk has to go.
 *
 * Declarations and the call cannot share a position. `#include <common>` sits at
 * file scope, so the uniforms and the function go there; the call goes at the
 * end of `main()`. Splicing the lot in at the end compiles a declaration inside
 * a function body, which is not valid GLSL — the program fails to link, the
 * object silently stops drawing, and because the shadow pass compiles its own
 * depth material the shadow carries on appearing with nothing casting it.
 */
const DECLARATIONS_HOOK = "#include <common>";
const CALL_HOOK = "#include <dithering_fragment>";

/**
 * Whether a material has somewhere to put the code.
 *
 * Every lit material in three.js ends with the same chunk, so the real test is
 * "is this a shader three.js compiles for us". A ShaderMaterial or
 * RawShaderMaterial from a GLB has its own fragment shader with none of that
 * tail, and is left alone rather than silently losing the effect.
 */
function isPatchable(material: THREE.Material) {
  return !(
    material instanceof THREE.ShaderMaterial ||
    material instanceof THREE.RawShaderMaterial
  ) && (material as THREE.MeshStandardMaterial).isMeshStandardMaterial === true;
}

/**
 * Puts the dither on a material, in place.
 *
 * Mutates rather than returning a copy because a GLB hands out one material shared
 * by many meshes, and replacing it per mesh would compile the same program once
 * per mesh. The uniforms live on the material's own shader object, so the values
 * can still be changed after the first compile.
 */
export function applyClayDither(
  material: THREE.Material,
  options: ClayDitherOptions = {},
): boolean {
  if (!isPatchable(material)) return false;
  const target = material as THREE.MeshStandardMaterial;
  // Idempotent, and it has to be. useGLTF caches the loaded scene, so the same
  // material instance comes back on every mount — and chaining a second copy of
  // the chunk onto the first declares clayBayerValue and clayDither twice, which
  // is a link error and an object that silently stops drawing.
  if (PATCHED.has(material)) return false;

  const {
    cellSize = 3,
    blackPoint = 0.15,
    whitePoint = 0.9,
    solidColor = "#2A8CFF",
    shadeColor = "#154680",
  } = options;
  PATCHED.add(material);

  const existing = target.onBeforeCompile;
  // A THREE.Color stores working-space — linear — components, because that is
  // what the renderer wants for its own colour uniforms. This shader writes
  // after the colour-space conversion, so it wants the sRGB components the hex
  // actually denotes. Converting back is what makes the output the exact colour
  // that was asked for rather than a darker version of it.
  const solid = new THREE.Color(solidColor).convertLinearToSRGB();
  const shade = new THREE.Color(shadeColor).convertLinearToSRGB();

  target.onBeforeCompile = (shader, renderer) => {
    // Chain rather than replace, so a material that is already patched keeps
    // whatever it was doing before this.
    existing?.(shader, renderer);
    const source = shader.fragmentShader;
    if (!source.includes(DECLARATIONS_HOOK) || !source.includes(CALL_HOOK)) return;
    shader.uniforms.clayCellSize = { value: cellSize };
    shader.uniforms.clayBlackPoint = { value: blackPoint };
    shader.uniforms.clayWhitePoint = { value: whitePoint };
    shader.uniforms.claySolid = { value: solid };
    shader.uniforms.clayShade = { value: shade };
    shader.fragmentShader = source
      .replace(DECLARATIONS_HOOK, `${DECLARATIONS_HOOK}\n${CLAY_DITHER_GLSL}`)
      .replace(
        CALL_HOOK,
        `gl_FragColor.rgb = clayDither(gl_FragColor.rgb, gl_FragCoord.xy);\n${CALL_HOOK}`,
      );
  };
  // Without this, two materials patched with different options would share one
  // compiled program, because the cache key is otherwise the material's own type.
  target.customProgramCacheKey = () =>
    `clay-dither:${cellSize}:${blackPoint}:${whitePoint}:${solidColor}:${shadeColor}`;
  target.needsUpdate = true;
  return true;
}
