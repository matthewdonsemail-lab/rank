import { useCallback, useEffect, useMemo, useRef } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import { Effect, EffectComposer, EffectPass } from "postprocessing";
import * as THREE from "three";

/**
 * Ordered (Bayer) dithering, as a post-processing pass.
 *
 * Adapted from https://github.com/niccolofanton/dithering-shader (MIT), whose
 * dither pattern is in turn from Klems' shadertoy: ltSSzW.
 *
 * The frame is snapped to a grid, brightness is thresholded against a 4x4 Bayer
 * matrix, and matching pixels are knocked out. The result is a retro halftone.
 *
 * Two deliberate departures from upstream, both because the subject here is a
 * light-grey object on a transparent canvas rather than a dark model filling an
 * opaque window:
 *
 * 1. Luminance is normalised Rec.709. Upstream sums the channels
 *    (`dot(rgb, vec3(1, 1, 1))`), which is a sum and so runs 0 to 3, while the
 *    Bayer thresholds only span 1/17 to 16/17. Anything brighter than about a
 *    third intensity therefore never dithered at all, so the effect silently
 *    vanished on light subjects. The weights keep the result in 0 to 1, which is
 *    the range the matrix was authored for.
 *
 * 2. Knocked-out cells are filled with a colour rather than left transparent.
 *    This canvas sits over the page, so a fill is a normal opaque cell: black
 *    inside the chain's silhouette reads as shading, and the empty canvas
 *    around it stays transparent so the page still shows through. The fill is
 *    gated on the subject's own alpha, because inverting the pattern makes the
 *    empty background fail the keep test as well.
 *
 * The Bayer thresholds only span 1/17 to 16/17, but a rendered subject rarely
 * occupies that range: metal lit by a bright environment clusters near the top,
 * where everything is above the ceiling and the whole subject collapses to a
 * single flat shade. blackPoint and whitePoint stretch the subject's actual
 * range across the matrix, which is what turns "one shade" back into a
 * gradient. Without them the effect can only ever show the tonal range that
 * happens to line up with the thresholds.
 */
const ditheringFragmentShader = /* glsl */ `
/**
 * Edge-detect stride, in device pixels.
 *
 * Deliberately small. This kernel's only job is to say *where* the contour is,
 * and the band's width is measured separately by marching outwards. Folding the
 * width into this stride is what made the outline smear into a faint haze.
 */
const float EDGE_STRIDE = 1.5;

/**
 * Steps used to march outwards for the subject's distance.
 *
 * A constant because GLSL ES 1.0 will not accept a uniform loop bound. This is
 * also what quantises the band's coverage, so it sets how visibly the band is
 * stepped.
 */
const int OUTLINE_SAMPLES = 8;

/**
 * Width of the dithered fringe past the band's hard edge, in device pixels.
 *
 * The band itself is solid; only this lip is quantised, so the edge dissolves
 * into dots instead of aliasing into a jagged line.
 */
const float OUTLINE_FRINGE = 2.0;

uniform float ditheringEnabled;
uniform vec2 resolution;
uniform float gridSize;
uniform float pixelSizeRatio;
uniform float invertColor;
uniform float invertPattern;
uniform float grayscaleOnly;
uniform float knockout;
uniform float blackPoint;
uniform float whitePoint;
uniform vec3 knockoutColor;
uniform vec3 solidColor;
uniform float useSolidColor;
uniform float outlineWidth;
uniform float outlineStrength;
uniform vec3 outlineColor;
uniform float outlineCoreWidth;
uniform float outlineCoreLow;
uniform float outlineCoreHigh;
uniform float outlineCoreStrength;
uniform vec3 outlineCoreColor;
uniform float ditherSteps;
uniform float outlineDitherSize;

/**
 * The Bayer threshold for this pixel's position in the 4x4 matrix, normalised to
 * 1/17 to 16/17.
 *
 * The matrix is unrolled into branches rather than indexed. GLSL ES 1.0 has no
 * dynamic array indexing, and this runs once per screen pixel.
 */
float bayerValue(vec2 pos, float cellSize) {
  vec2 cell = floor(mod(pos / cellSize, 4.0));
  int x = int(cell.x);
  int y = int(cell.y);

  if (x == 0) {
    if (y == 0) return 16.0 / 17.0;
    if (y == 1) return 5.0 / 17.0;
    if (y == 2) return 13.0 / 17.0;
    return 1.0 / 17.0;
  } else if (x == 1) {
    if (y == 0) return 8.0 / 17.0;
    if (y == 1) return 12.0 / 17.0;
    if (y == 2) return 4.0 / 17.0;
    return 9.0 / 17.0;
  } else if (x == 2) {
    if (y == 0) return 14.0 / 17.0;
    if (y == 1) return 2.0 / 17.0;
    if (y == 2) return 15.0 / 17.0;
    return 3.0 / 17.0;
  } else {
    if (y == 0) return 6.0 / 17.0;
    if (y == 1) return 10.0 / 17.0;
    if (y == 2) return 7.0 / 17.0;
    return 11.0 / 17.0;
  }
}

/**
 * Whether the pixel survives the dither, as a comparison of brightness against
 * the Bayer threshold for its position.
 *
 * The two clamps are not special cases. The matrix already spans exactly
 * 1/17 to 16/17, so a brightness above the ceiling fails every threshold and one
 * below the floor passes every threshold — the plain comparison gives the same
 * answer without branching.
 */
bool survives(float brightness, vec2 pos) {
  return brightness < bayerValue(pos, gridSize);
}

/**
 * The alpha gradient, as a vector rather than a magnitude.
 *
 * The direction is what makes a wide outline possible: it points from empty
 * space towards the subject, so it can be walked outwards from a pixel to find
 * how far away the contour is.
 */
vec2 sobelAlphaGradient(vec2 uv, vec2 stride) {
  float a00 = texture2D(inputBuffer, uv + stride * vec2(-1.0,  1.0)).a;
  float a10 = texture2D(inputBuffer, uv + stride * vec2( 0.0,  1.0)).a;
  float a20 = texture2D(inputBuffer, uv + stride * vec2( 1.0,  1.0)).a;
  float a01 = texture2D(inputBuffer, uv + stride * vec2(-1.0,  0.0)).a;
  float a21 = texture2D(inputBuffer, uv + stride * vec2( 1.0,  0.0)).a;
  float a02 = texture2D(inputBuffer, uv + stride * vec2(-1.0, -1.0)).a;
  float a12 = texture2D(inputBuffer, uv + stride * vec2( 0.0, -1.0)).a;
  float a22 = texture2D(inputBuffer, uv + stride * vec2( 1.0, -1.0)).a;

  return vec2(
    -a00 - 2.0 * a01 - a02 + a20 + 2.0 * a21 + a22,
    -a00 - 2.0 * a10 - a20 + a02 + 2.0 * a12 + a22
  );
}

/**
 * Whether the subject is within the given radius of this pixel in any direction.
 *
 * Probing a ring rather than marching along an estimated surface normal. A
 * normal is only well defined within a pixel or two of the contour, so across a
 * band tens of pixels wide it is noise and the march drifts to one side; probing
 * outwards needs no direction at all, which is what makes the result symmetric
 * on every side of the shape.
 *
 * Several radii are probed per call, not just the outer one, so that a subject
 * closer than the radius is still found. Probing only the outer ring would let a
 * shape thin enough to sit between two samples slip through and punch a hole in
 * the band.
 */
float nearSubject(vec2 uv, float radius) {
  vec2 texel = 1.0 / resolution;
  for (int r = 0; r < 3; r++) {
    float ringRadius = radius * (0.4 + 0.3 * float(r));
    for (int i = 0; i < OUTLINE_SAMPLES; i++) {
      float angle = (float(i) + 0.5) / float(OUTLINE_SAMPLES) * 6.2831853;
      vec2 offset = vec2(cos(angle), sin(angle)) * ringRadius * texel;
      if (texture2D(inputBuffer, uv + offset).a > 0.5) return 1.0;
    }
  }
  return 0.0;
}

/**
 * Sobel gradient magnitude of luminance, for the edges alpha cannot see.
 *
 * Alpha only steps at the outer silhouette, so it says nothing about where one
 * ring crosses in front of another. Luminance steps at those overlaps, which is
 * what makes the stroke trace each ring individually rather than the chain's
 * outline as one shape.
 */
float sobelLuma(vec2 uv, vec2 stride) {
  vec3 c00 = texture2D(inputBuffer, uv + stride * vec2(-1.0,  1.0)).rgb;
  vec3 c10 = texture2D(inputBuffer, uv + stride * vec2( 0.0,  1.0)).rgb;
  vec3 c20 = texture2D(inputBuffer, uv + stride * vec2( 1.0,  1.0)).rgb;
  vec3 c01 = texture2D(inputBuffer, uv + stride * vec2(-1.0,  0.0)).rgb;
  vec3 c21 = texture2D(inputBuffer, uv + stride * vec2( 1.0,  0.0)).rgb;
  vec3 c02 = texture2D(inputBuffer, uv + stride * vec2(-1.0, -1.0)).rgb;
  vec3 c12 = texture2D(inputBuffer, uv + stride * vec2( 0.0, -1.0)).rgb;
  vec3 c22 = texture2D(inputBuffer, uv + stride * vec2( 1.0, -1.0)).rgb;

  const vec3 k = vec3(0.2126, 0.7152, 0.0722);
  float l00 = dot(c00, k);
  float l10 = dot(c10, k);
  float l20 = dot(c20, k);
  float l01 = dot(c01, k);
  float l21 = dot(c21, k);
  float l02 = dot(c02, k);
  float l12 = dot(c12, k);
  float l22 = dot(c22, k);

  float gx = -l00 - 2.0 * l01 - l02 + l20 + 2.0 * l21 + l22;
  float gy = -l00 - 2.0 * l10 - l20 + l02 + 2.0 * l12 + l22;
  return length(vec2(gx, gy));
}

/**
 * Coverage reduced to a small number of discrete levels, dithered between them.
 *
 * A smoothstep gives a band with a soft, continuous edge, which reads as a blur.
 * Quantising the coverage into a few levels and letting the Bayer matrix choose
 * between adjacent levels per cell turns that into a visible halftone, so the
 * stroke is built from the same ordered dither as the rest of the image and its
 * edge dissolves into dots instead of fading.
 *
 * The cell size is a parameter rather than the chain's gridSize because the two
 * want different scales. The chain is dithered finely, and at that pitch the eye
 * integrates the levels back into a smooth gradient — which is exactly what made
 * the bands look un-dithered. A coarser cell keeps the steps legible.
 */
float steppedCoverage(float coverage, vec2 pos, float cellSize) {
  float levels = max(ditherSteps, 1.0);
  float scaled = clamp(coverage, 0.0, 1.0) * levels;
  float level = floor(scaled);
  float remainder = scaled - level;
  // Ordered dither: this cell takes the next level only if the Bayer threshold
  // for its position falls below how far the coverage is between the two.
  return clamp((level + step(bayerValue(pos, cellSize), remainder)) / levels, 0.0, 1.0);
}

void mainImage(const in vec4 inputColor, const in vec2 uv, out vec4 outputColor) {
  if (ditheringEnabled < 0.5) {
    outputColor = inputColor;
    return;
  }

  // Everything is derived from the undisplaced fragment coordinate, so every
  // fragment sharing a grid cell agrees on the cell it samples and the threshold
  // it is tested against. That is what keeps the pattern seamless at fractional
  // device pixel ratios, where a cell is not a whole number of fragments.
  vec2 fragCoord = uv * resolution;
  float pixelSize = gridSize * pixelSizeRatio;
  vec2 cell = floor(fragCoord / pixelSize);
  vec2 pixelatedUv = cell * pixelSize / resolution;

  // Alpha is taken from the cell centre, not this fragment, so a cell cannot end
  // up half knocked out and half solid.
  vec3 baseColor = texture2D(inputBuffer, pixelatedUv).rgb;
  float alpha = texture2D(inputBuffer, pixelatedUv).a;

  float luminance = clamp(dot(baseColor, vec3(0.2126, 0.7152, 0.0722)), 0.0, 1.0);
  if (grayscaleOnly > 0.5) baseColor = vec3(luminance);

  // Stretch the subject's real tonal range across the thresholds. Without this
  // the matrix only ever sees the slice of the range it happens to cover, and a
  // subject whose values all sit above the ceiling dithers to a single flat
  // shade no matter how fine the grid is.
  float range = max(whitePoint - blackPoint, 1e-4);
  float brightness = clamp((luminance - blackPoint) / range, 0.0, 1.0);

  // Threshold against the Bayer cell for this grid cell, not the raw pixel, so
  // the matrix is indexed in the same units as the pixelation.
  bool keep = survives(brightness, cell * gridSize);

  // The matrix is authored for a dark subject on a dark ground: brighter than
  // 16/17 means knocked out. A light chain on a light page is the opposite case,
  // where the lit faces are the solid parts and the shading carries the pattern.
  // Flipping the comparison is what turns the effect from "the chain disappears"
  // into a halftone that follows its own lighting.
  if (invertPattern > 0.5) {
    keep = !keep;
    brightness = 1.0 - brightness;
  }

  // Only paint where the subject actually is.
  //
  // This canvas is transparent over the page, so a fill is an ordinary opaque
  // cell: black inside the chain's silhouette reads as shading, and the empty
  // canvas around it stays transparent so the page still shows through. The fill
  // is gated on the subject's own alpha, because inverting the pattern makes the
  // empty background fail the keep test too — without this guard a black knockout
  // floods the entire canvas and the hero disappears behind it.
  if (alpha > 0.0) {
    // The render supplies the shading; the palette is pinned exactly.
    //
    // What the 3D pass produces cannot be the brand hex: the rings are metallic,
    // so the pixel colour is mostly the environment reflection tinted by the base
    // colour, and tone mapping shifts it again on the way out. A dither only
    // needs the render for its luminance, which is what decides each cell, so
    // the two colours come from the uniforms instead.
    if (useSolidColor > 0.5) {
      // A straight pick, never a blend.
      //
      // Driving the mix from brightness instead puts every shade between the two
      // colours on the surface, but that is a gradient, not a dither: the hard
      // threshold is what produces the pattern, and a smooth ramp integrated
      // across cells just reads as a flat tint. The tonal range is carried by the
      // density of cells against each other, which is the whole point.
      baseColor = keep ? solidColor : knockoutColor;
    } else if (!keep) {
      baseColor = mix(baseColor, knockoutColor, knockout);
    }
    // An antialiased edge carries fractional alpha; keep the silhouette solid
    // rather than letting the fill weaken it.
    alpha = max(alpha, knockout);
  }

  if (invertColor > 0.5) baseColor = 1.0 - baseColor;

  // Contour stroke, taken from the raw render rather than from the dithered
  // colour above.
  //
  // This has to happen in the same pass. A second pass chained after this one
  // would edge-detect the dithered image, and since adjacent cells alternate
  // between the two palette colours the luminance gradient is huge at every cell
  // boundary — the stroke would trace the entire halftone instead of the rings.
  // Here, inputBuffer is still the untouched render.
  if (outlineStrength > 0.0 && outlineWidth > 0.0) {
    // The band is "is the subject within reach of this pixel", decided by probing
    // a ring of directions rather than by estimating which way the surface faces.
    //
    // Estimating a direction does not survive contact with a band tens of pixels
    // wide. A gradient is only defined within a pixel or two of the contour, so
    // everywhere else it is noise and the march walks off to one side; widening
    // the probes enough to fix that stops measuring the surface and starts
    // averaging across it. Probing a ring has neither problem — there is no
    // direction to get wrong, and every side of the shape is treated the same.
    //
    // A ring of probes is a morphological dilation of the silhouette, which is
    // exactly what an outline is. The band is therefore solid rather than a
    // falloff, and it is measured outward from the shape instead of inward.
    float band = nearSubject(uv, outlineWidth);
    float core = nearSubject(uv, outlineCoreWidth);

    // Gated on the subject's own alpha, so the stroke sits outside each ring
    // rather than darkening the ring and cutting across the dither on top of it.
    float outside = 1.0 - smoothstep(0.0, 0.5, alpha);

    // The dither is kept for a fringe just past the hard edge, where a bare
    // cutoff would otherwise alias into a jagged line.
    float fringe = clamp(nearSubject(uv, outlineWidth + OUTLINE_FRINGE) - band, 0.0, 1.0);

    band = max(band, steppedCoverage(fringe, fragCoord, outlineDitherSize) * 0.85) * outlineStrength * outside;
    core *= outlineCoreStrength * outside;

    baseColor = mix(baseColor, outlineColor, band);
    // Painted last, so the core sits on top of the band it is cut from.
    baseColor = mix(baseColor, outlineCoreColor, core);
    alpha = max(alpha, max(band, core));
  }

  outputColor = vec4(baseColor, alpha);
}
`;

export interface DitheringEffectOptions {
  /**
   * Size of one Bayer matrix cell, in device pixels.
   *
   * This is the effect's whole tonal range. Each cell is binary — kept or
   * knocked out — so mid-tones exist only as the *density* of kept cells. Too
   * fine and the eye averages the pattern back into a flat fill; too coarse and
   * the dots read as chunky blocks rather than shading. 1 to 4 device pixels is
   * the useful band, so this defaults at the fine end.
   */
  gridSize?: number;
  /** Multiplier on the cell size for the pixelation step. */
  pixelSizeRatio?: number;
  /** Collapse the result to greyscale. */
  grayscaleOnly?: boolean;
  /** Swap kept and knocked-out pixels. */
  invertColor?: boolean;
  /**
   * Flip which end of the brightness range the pattern fills in.
   *
   * Off matches the original: bright pixels are knocked out. On suits a light
   * subject on a light background, where the lit faces stay solid and the
   * shading carries the halftone.
   */
  invertPattern?: boolean;
  /**
   * How far to fade knocked-out pixels towards `knockoutColor`. 0 leaves them
   * fully transparent, 1 makes them solid.
   */
  knockout?: number;
  /** Colour filled into the knocked-out cells. */
  knockoutColor?: string;
  /**
   * Half-width of the contour stroke, in device pixels.
   *
   * The kernel is sampled at this stride, so it widens the stroke rather than
   * just moving the samples. 0 disables the stroke.
   */
  outlineWidth?: number;
  /** Opacity of the stroke. 0 disables it, 1 is solid. */
  outlineStrength?: number;
  /** Colour of the wide outer band. */
  outlineColor?: string;
  /**
   * Kernel width of the narrow inner band, in device pixels.
   *
   * Must be smaller than `outlineWidth` for the two to read as concentric
   * borders rather than one band covering the other.
   */
  outlineCoreWidth?: number;
  /**
   * Gradient at which the narrow inner band starts and ends, in the same units
   * as the Sobel output. The band's width is the gap between them, so raising
   * both together widens it without moving it.
   */
  outlineCoreLow?: number;
  outlineCoreHigh?: number;
  /** Opacity of the inner band. 0 disables just the inner band. */
  outlineCoreStrength?: number;
  /** Colour of the narrow inner band, painted on top of the outer one. */
  outlineCoreColor?: string;
  /**
   * How many discrete levels each outline band is quantised to before being
   * dithered.
   *
   * 2 is a plain two-tone dither of the stroke, 4 or so reads as a shaded
   * band, and 1 disables the quantisation so the stroke goes back to a smooth
   * gradient.
   */
  ditherSteps?: number;
  /**
   * Bayer cell size for the outline bands, in device pixels, independent of the
   * chain's own `gridSize`.
   *
   * This is what makes the dithering on the stroke visible. At the chain's finer
   * pitch the levels are integrated by the eye and the band reads as a plain
   * gradient; a coarser cell keeps the steps and dots legible.
   */
  outlineDitherSize?: number;
  /** Colour for the cells that survive. Only used when `useSolidColor` is on. */
  solidColor?: string;
  /**
   * Paint the two colours exactly, instead of taking the kept cells' colour from
   * the render.
   *
   * Off, the kept cells keep whatever the 3D pass produced, so the blue is the
   * metal's reflection rather than the base hex. On, the render contributes only
   * luminance and the output is exactly `solidColor` and `knockoutColor`.
   */
  useSolidColor?: boolean;  /**
   * Luminance mapped to fully knocked out. Raise it to deepen the shadows.
   */
  blackPoint?: number;
  /**
   * Luminance mapped to fully solid. Lower it to bring out the highlights.
   *
   * The gap between the two is the whole tonal range the dither has to work
   * with, so this pair is what decides whether the subject shows a gradient or
   * a single flat shade.
   */
  whitePoint?: number;
}

export class DitheringEffect extends Effect {
  private readonly gridSizeUniform: THREE.Uniform<number>;
  private readonly pixelSizeRatioUniform: THREE.Uniform<number>;
  private readonly grayscaleUniform: THREE.Uniform<number>;
  private readonly invertUniform: THREE.Uniform<number>;
  private readonly invertPatternUniform: THREE.Uniform<number>;
  private readonly knockoutUniform: THREE.Uniform<number>;
  private readonly blackPointUniform: THREE.Uniform<number>;
  private readonly whitePointUniform: THREE.Uniform<number>;
  private readonly knockoutColorUniform: THREE.Uniform<THREE.Color>;
  private readonly solidColorUniform: THREE.Uniform<THREE.Color>;
  private readonly useSolidColorUniform: THREE.Uniform<number>;
  private readonly outlineWidthUniform: THREE.Uniform<number>;
  private readonly outlineStrengthUniform: THREE.Uniform<number>;
  private readonly outlineColorUniform: THREE.Uniform<THREE.Color>;
  private readonly outlineCoreWidthUniform: THREE.Uniform<number>;
  private readonly outlineCoreLowUniform: THREE.Uniform<number>;
  private readonly outlineCoreHighUniform: THREE.Uniform<number>;
  private readonly outlineCoreStrengthUniform: THREE.Uniform<number>;
  private readonly outlineCoreColorUniform: THREE.Uniform<THREE.Color>;
  private readonly ditherStepsUniform: THREE.Uniform<number>;
  private readonly outlineDitherSizeUniform: THREE.Uniform<number>;
  private readonly resolutionUniform: THREE.Uniform<THREE.Vector2>;
  private readonly enabledUniform: THREE.Uniform<number>;

  constructor({
    gridSize = 1,
    pixelSizeRatio = 1,
    grayscaleOnly = false,
    invertColor = false,
    invertPattern = true,
    knockout = 1,
    knockoutColor = "#000000",
    solidColor = "#2A8CFF",
    useSolidColor = false,
    outlineWidth = 28,
    outlineStrength = 1,
    outlineColor = "#0A0A0C",
    outlineCoreWidth = 9,
    outlineCoreLow = 1.1,
    outlineCoreHigh = 3.4,
    outlineCoreStrength = 1,
    outlineCoreColor = "#FFFFFF",
    ditherSteps = 4,
    outlineDitherSize = 1,
    blackPoint = 0.32,
    whitePoint = 1,
  }: DitheringEffectOptions = {}) {
    const gridSizeUniform = new THREE.Uniform(gridSize);
    const pixelSizeRatioUniform = new THREE.Uniform(pixelSizeRatio);
    const grayscaleUniform = new THREE.Uniform(grayscaleOnly ? 1 : 0);
    const invertUniform = new THREE.Uniform(invertColor ? 1 : 0);
    const invertPatternUniform = new THREE.Uniform(invertPattern ? 1 : 0);
    const knockoutUniform = new THREE.Uniform(knockout);
    const knockoutColorUniform = new THREE.Uniform(new THREE.Color(knockoutColor));
    const solidColorUniform = new THREE.Uniform(new THREE.Color(solidColor));
    const useSolidColorUniform = new THREE.Uniform(useSolidColor ? 1 : 0);
    const outlineWidthUniform = new THREE.Uniform(outlineWidth);
    const outlineStrengthUniform = new THREE.Uniform(outlineStrength);
    const outlineColorUniform = new THREE.Uniform(new THREE.Color(outlineColor));
    const outlineCoreWidthUniform = new THREE.Uniform(outlineCoreWidth);
    const outlineCoreLowUniform = new THREE.Uniform(outlineCoreLow);
    const outlineCoreHighUniform = new THREE.Uniform(outlineCoreHigh);
    const outlineCoreStrengthUniform = new THREE.Uniform(outlineCoreStrength);
    const outlineCoreColorUniform = new THREE.Uniform(new THREE.Color(outlineCoreColor));
    const ditherStepsUniform = new THREE.Uniform(ditherSteps);
    const outlineDitherSizeUniform = new THREE.Uniform(outlineDitherSize);
    const blackPointUniform = new THREE.Uniform(blackPoint);
    const whitePointUniform = new THREE.Uniform(whitePoint);
    const resolutionUniform = new THREE.Uniform(new THREE.Vector2(1, 1));
    const enabledUniform = new THREE.Uniform(1);

    super("DitheringEffect", ditheringFragmentShader, {
      uniforms: new Map<string, THREE.Uniform>([
        ["gridSize", gridSizeUniform],
        ["pixelSizeRatio", pixelSizeRatioUniform],
        ["grayscaleOnly", grayscaleUniform],
        ["invertColor", invertUniform],
        ["invertPattern", invertPatternUniform],
        ["knockout", knockoutUniform],
        ["knockoutColor", knockoutColorUniform],
        ["solidColor", solidColorUniform],
        ["useSolidColor", useSolidColorUniform],
        ["outlineWidth", outlineWidthUniform],
        ["outlineStrength", outlineStrengthUniform],
        ["outlineColor", outlineColorUniform],
        ["outlineCoreWidth", outlineCoreWidthUniform],
        ["outlineCoreLow", outlineCoreLowUniform],
        ["outlineCoreHigh", outlineCoreHighUniform],
        ["outlineCoreStrength", outlineCoreStrengthUniform],
        ["outlineCoreColor", outlineCoreColorUniform],
        ["ditherSteps", ditherStepsUniform],
        ["outlineDitherSize", outlineDitherSizeUniform],
        ["blackPoint", blackPointUniform],
        ["whitePoint", whitePointUniform],
        ["resolution", resolutionUniform],
        ["ditheringEnabled", enabledUniform],
      ]),
    });

    this.gridSizeUniform = gridSizeUniform;
    this.pixelSizeRatioUniform = pixelSizeRatioUniform;
    this.grayscaleUniform = grayscaleUniform;
    this.invertUniform = invertUniform;
    this.invertPatternUniform = invertPatternUniform;
    this.knockoutUniform = knockoutUniform;
    this.knockoutColorUniform = knockoutColorUniform;
    this.solidColorUniform = solidColorUniform;
    this.useSolidColorUniform = useSolidColorUniform;
    this.outlineWidthUniform = outlineWidthUniform;
    this.outlineStrengthUniform = outlineStrengthUniform;
    this.outlineColorUniform = outlineColorUniform;
    this.outlineCoreWidthUniform = outlineCoreWidthUniform;
    this.outlineCoreLowUniform = outlineCoreLowUniform;
    this.outlineCoreHighUniform = outlineCoreHighUniform;
    this.outlineCoreStrengthUniform = outlineCoreStrengthUniform;
    this.outlineCoreColorUniform = outlineCoreColorUniform;
    this.ditherStepsUniform = ditherStepsUniform;
    this.outlineDitherSizeUniform = outlineDitherSizeUniform;
    this.blackPointUniform = blackPointUniform;
    this.whitePointUniform = whitePointUniform;
    this.resolutionUniform = resolutionUniform;
    this.enabledUniform = enabledUniform;
  }

  set enabled(value: boolean) {
    this.enabledUniform.value = value ? 1 : 0;
  }

  set gridSize(value: number) {
    this.gridSizeUniform.value = value;
  }

  set pixelSizeRatio(value: number) {
    this.pixelSizeRatioUniform.value = value;
  }

  set grayscaleOnly(value: boolean) {
    this.grayscaleUniform.value = value ? 1 : 0;
  }

  set invertColor(value: boolean) {
    this.invertUniform.value = value ? 1 : 0;
  }

  set invertPattern(value: boolean) {
    this.invertPatternUniform.value = value ? 1 : 0;
  }

  set knockout(value: number) {
    this.knockoutUniform.value = value;
  }

  set blackPoint(value: number) {
    this.blackPointUniform.value = value;
  }

  set whitePoint(value: number) {
    this.whitePointUniform.value = value;
  }

  set knockoutColor(value: string) {
    this.knockoutColorUniform.value.set(value);
  }

  set solidColor(value: string) {
    this.solidColorUniform.value.set(value);
  }

  set useSolidColor(value: boolean) {
    this.useSolidColorUniform.value = value ? 1 : 0;
  }

  set outlineWidth(value: number) {
    this.outlineWidthUniform.value = value;
  }

  set outlineStrength(value: number) {
    this.outlineStrengthUniform.value = value;
  }

  set outlineColor(value: string) {
    this.outlineColorUniform.value.set(value);
  }

  set outlineCoreWidth(value: number) {
    this.outlineCoreWidthUniform.value = value;
  }

  set outlineCoreLow(value: number) {
    this.outlineCoreLowUniform.value = value;
  }

  set outlineCoreHigh(value: number) {
    this.outlineCoreHighUniform.value = value;
  }

  set outlineCoreStrength(value: number) {
    this.outlineCoreStrengthUniform.value = value;
  }

  set outlineCoreColor(value: string) {
    this.outlineCoreColorUniform.value.set(value);
  }

  set ditherSteps(value: number) {
    this.ditherStepsUniform.value = value;
  }

  set outlineDitherSize(value: number) {
    this.outlineDitherSizeUniform.value = value;
  }

  /**
   * Resolution has to track the composer's actual render target, which is in
   * device pixels and changes with both the canvas size and the pixel ratio. The
   * grid is defined in those same device pixels, so a CSS-pixel value would
   * make the pattern change size with the device pixel ratio.
   */
  update(_renderer: THREE.WebGLRenderer, inputBuffer: THREE.WebGLRenderTarget): void {
    this.resolutionUniform.value.set(inputBuffer.width, inputBuffer.height);
  }
}

export interface DitheringPassProps extends DitheringEffectOptions {
  enabled?: boolean;
}

/**
 * Drives a {@link DitheringEffect} over the scene.
 *
 * `useFrame` is given an explicit render priority, which is what takes rendering
 * over from React Three Fiber: any priority above zero suspends the automatic
 * render, so the composer becomes the only thing drawing.
 */
export function DitheringPass({
  enabled = true,
  gridSize = 1,
  pixelSizeRatio = 1,
  grayscaleOnly = false,
  invertColor = false,
  invertPattern = true,
  knockout = 1,
  knockoutColor = "#000000",
  solidColor = "#2A8CFF",
  useSolidColor = false,
  outlineWidth = 28,
  outlineStrength = 1,
  outlineColor = "#0A0A0C",
  outlineCoreWidth = 9,
  outlineCoreLow = 1.1,
  outlineCoreHigh = 3.4,
  outlineCoreStrength = 1,
  outlineCoreColor = "#FFFFFF",
  ditherSteps = 4,
  outlineDitherSize = 1,
  blackPoint = 0.32,
  whitePoint = 1,
}: DitheringPassProps) {
  const gl = useThree((state) => state.gl);
  const scene = useThree((state) => state.scene);
  const camera = useThree((state) => state.camera);
  const size = useThree((state) => state.size);

  const effect = useMemo(
    () =>
      new DitheringEffect({
        gridSize,
        pixelSizeRatio,
        grayscaleOnly,
        invertColor,
        invertPattern,
        knockout,
        knockoutColor,
        solidColor,
        useSolidColor,
        outlineWidth,
        outlineStrength,
        outlineColor,
        outlineCoreWidth,
        outlineCoreLow,
        outlineCoreHigh,
        outlineCoreStrength,
        outlineCoreColor,
        ditherSteps,
        blackPoint,
        whitePoint,
      }),
    // Built once: later prop changes are pushed onto the existing instance, so
    // changing the look never rebuilds the composer or drops a frame.
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [],
  );

  const composer = useMemo(
    () =>
      new EffectComposer(gl, {
        // Multisampling would resolve edges that the dither is about to quantise
        // into hard blocks anyway, and it fights the alpha the knockout relies on.
        // An 8-bit buffer is deliberate: the dither needs no headroom above white,
        // and a half-float target is the usual cause of a black first frame on
        // machines without float render target support.
        multisampling: 0,
      }),
    [gl],
  );

  // The composer is constructed from the renderer alone, so the scene and camera
  // have to be handed to it separately. An EffectPass rather than a bare Effect,
  // because the composer only knows how to run passes.
  const effectPass = useMemo(() => new EffectPass(camera, effect), [camera, effect]);

  const attachPass = useCallback(() => {
    composer.setMainScene(scene);
    composer.setMainCamera(camera);
    composer.addPass(effectPass);
  }, [composer, effectPass, scene, camera]);

  useEffect(() => {
    attachPass();
    return () => {
      composer.removePass(effectPass);
    };
  }, [attachPass, composer, effectPass]);

  useEffect(() => {
    // Genuine GPU context loss is a different failure from anything the sim can
    // produce: every GL object is invalid and the canvas stops painting.
    // preventDefault on the loss event is what allows the browser to restore at
    // all; on restore the composer's buffers are rebuilt and the pass
    // re-attached, so the hero comes back without a reload.
    const canvas = gl.domElement;
    const onContextLost = (event: Event) => {
      event.preventDefault();
    };
    const onContextRestored = () => {
      composer.reset();
      attachPass();
    };
    canvas.addEventListener("webglcontextlost", onContextLost);
    canvas.addEventListener("webglcontextrestored", onContextRestored);
    return () => {
      canvas.removeEventListener("webglcontextlost", onContextLost);
      canvas.removeEventListener("webglcontextrestored", onContextRestored);
    };
  }, [gl, composer, attachPass]);

  useEffect(() => {
    effect.enabled = enabled;
    effect.gridSize = gridSize;
    effect.pixelSizeRatio = pixelSizeRatio;
    effect.grayscaleOnly = grayscaleOnly;
    effect.invertColor = invertColor;
    effect.invertPattern = invertPattern;
    effect.knockout = knockout;
    effect.knockoutColor = knockoutColor;
    effect.solidColor = solidColor;
    effect.useSolidColor = useSolidColor;
    effect.outlineColor = outlineColor;
    effect.outlineCoreWidth = outlineCoreWidth;
    effect.outlineWidth = outlineWidth;
    effect.outlineStrength = outlineStrength;
    effect.outlineCoreLow = outlineCoreLow;
    effect.outlineCoreHigh = outlineCoreHigh;
    effect.outlineCoreStrength = outlineCoreStrength;
    effect.outlineCoreColor = outlineCoreColor;
    effect.ditherSteps = ditherSteps;
    effect.outlineDitherSize = outlineDitherSize;
    effect.blackPoint = blackPoint;
    effect.whitePoint = whitePoint;
  }, [
    effect,
    enabled,
    gridSize,
    pixelSizeRatio,
    grayscaleOnly,
    invertColor,
    invertPattern,
    knockout,
    knockoutColor,
    solidColor,
    useSolidColor,
    outlineWidth,
    outlineStrength,
    outlineColor,
    outlineCoreWidth,
    outlineCoreLow,
    outlineCoreHigh,
    outlineCoreStrength,
    outlineCoreColor,
    ditherSteps,
    outlineDitherSize,
    blackPoint,
    whitePoint,
  ]);

  useEffect(() => {
    // The hero's paper background is painted by the page, so the canvas has to
    // keep clearing to fully transparent or the knockout would reveal black.
    gl.setClearColor(0x000000, 0);
  }, [gl]);

  useEffect(() => {
    // The composer sizes its buffers from the renderer's drawing buffer, so the
    // device pixel ratio is picked up from the renderer rather than set here.
    // updateStyle is false because React Three Fiber owns the canvas element's
    // CSS size and this must not write to it.
    composer.setSize(size.width, size.height, false);
  }, [composer, gl, size]);

  useEffect(() => () => composer.dispose(), [composer]);

  // Taking over the render loop means nothing else draws the scene, so if the
  // composer ever fails the hero would go blank rather than merely losing its
  // post effect. A background decoration is not worth a blank hero, so the first
  // failure latches a fallback to direct rendering for the rest of the session.
  const failed = useRef(false);
  useFrame((_state, delta) => {
    if (failed.current) {
      gl.render(scene, camera);
      return;
    }
    try {
      // The composer runs passes over an input buffer but never draws the scene
      // into it, so that has to happen first. Without this the pass reads an
      // empty buffer and writes a fully transparent frame, which blanks the hero
      // with nothing logged.
      gl.setRenderTarget(composer.inputBuffer);
      gl.clear();
      gl.render(scene, camera);
      gl.setRenderTarget(null);

      composer.render(delta);
    } catch (error) {
      failed.current = true;
      console.error("DitheringPass: composer render failed, falling back to direct render.", error);
    }
  }, 1);

  return null;
}
