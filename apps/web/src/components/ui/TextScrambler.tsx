import { Fragment, forwardRef, useEffect, useImperativeHandle, useRef, useState, type CSSProperties, type PointerEvent, type Ref } from "react";
import { TextMorph } from "torph/react";
import "./text-scrambler.css";

const DEFAULT_TEXT = `Build links and rank
on autopilot.`;
const SCRAMBLE_CHARACTERS = "^*&@!#";
const BRAND_BLUE = "#2A8CFF";
const HIGHLIGHT_WORD = "autopilot";
const SCRAMBLE_COLORS = [
  "rgb(116, 76, 246)",
  "rgb(255, 80, 4)",
  "rgb(230, 186, 41)",
  "rgb(118, 193, 245)",
  "rgb(125, 168, 56)",
];

interface CharacterOverride {
  value: string;
  color: string;
}

export interface TextScramblerProps {
  text?: string;
  className?: string;
  radius?: number;
  maxCharacters?: number;
  exitInterval?: number;
}

/**
 * External trigger, so something other than the pointer can drive the effect —
 * in this case the hero chain reporting how far it has been pulled.
 */
export interface TextScramblerHandle {
  /** Scrambles the leading `progress` fraction of the letters, in order. */
  scrambleProgress: (progress: number) => void;
  /** Clears any externally driven scramble. */
  clearScramble: () => void;
}

function getCharacterPositions(text: string) {
  return Array.from(text)
    .map((character, position) => (/\s/.test(character) ? -1 : position))
    .filter((position) => position >= 0);
}

/**
 * Word boundaries in the same character-position space the component renders
 * with, so an external driver can address whole words rather than letters.
 *
 * The tokenisation mirrors the render path exactly — per line, split on
 * whitespace runs, offsets accumulated the same way — because a position that
 * is off by one scrambles the wrong letters.
 */
function getWordRanges(source: string): Array<{ start: number; end: number }> {
  const ranges: Array<{ start: number; end: number }> = [];
  const lines = source.split("\n");
  let lineOffset = 0;
  for (const line of lines) {
    const currentLineOffset = lineOffset;
    lineOffset += Array.from(line).length + 1;
    let tokenOffset = 0;
    for (const token of line.split(/(\s+)/)) {
      const currentTokenOffset = tokenOffset;
      tokenOffset += Array.from(token).length;
      if (token.length === 0 || /^\s+$/.test(token)) continue;
      ranges.push({
        start: currentLineOffset + currentTokenOffset,
        end: currentLineOffset + currentTokenOffset + Array.from(token).length,
      });
    }
  }
  return ranges;
}

function getRandomScrambleCharacter() {
  return SCRAMBLE_CHARACTERS[Math.floor(Math.random() * SCRAMBLE_CHARACTERS.length)];
}

function getRandomScrambleColor() {
  return SCRAMBLE_COLORS[Math.floor(Math.random() * SCRAMBLE_COLORS.length)];
}

function getCharacterStyle(color: string | undefined): CSSProperties | undefined {
  return color ? { color } : undefined;
}

function MorphCharacter({
  value,
}: {
  value: string;
}) {
  return (
    <TextMorph
      as="span"
      className="text-scrambler__character-inner hp-ch-i"
      ease={{ stiffness: 1200, damping: 14, mass: 0.35, precision: 0.03 }}
      numbers={false}
      scale={true}
    >
      {value}
    </TextMorph>
  );
}

function TextScramblerInner(
  {
    text = DEFAULT_TEXT,
    className = "",
    radius = 150,
    maxCharacters = 6,
    exitInterval = 90,
  }: TextScramblerProps,
  ref: Ref<TextScramblerHandle>,
) {
  const headingRef = useRef<HTMLHeadingElement>(null);
  const characterRefs = useRef(new Map<number, HTMLSpanElement>());
  const overridesRef = useRef<Record<number, CharacterOverride>>({});
  const closestPositionRef = useRef<number | null>(null);
  const exitTimeoutRef = useRef<number | null>(null);
  const [overrides, setOverrides] = useState<Record<number, CharacterOverride>>({});
  const plainText = text.replace(/\n/g, " ");
  const highlightStart = text.indexOf(HIGHLIGHT_WORD);
  const highlightEnd = highlightStart + HIGHLIGHT_WORD.length;

  const cancelExit = () => {
    if (exitTimeoutRef.current !== null) {
      window.clearTimeout(exitTimeoutRef.current);
      exitTimeoutRef.current = null;
    }
  };

  const handlePointerMove = (event: PointerEvent<HTMLHeadingElement>) => {
    cancelExit();
    const bounds = headingRef.current?.getBoundingClientRect();
    if (!bounds) return;

    const nearestCharacters = getCharacterPositions(text)
      .map((position) => {
        const element = characterRefs.current.get(position);
        if (!element) return null;

        const characterBounds = element.getBoundingClientRect();
        const centerX = characterBounds.left + characterBounds.width / 2;
        const centerY = characterBounds.top + characterBounds.height / 2;
        const distance = Math.hypot(event.clientX - centerX, event.clientY - centerY);

        return { position, distance };
      })
      .filter((character): character is { position: number; distance: number } => character !== null)
      .filter((character) => character.distance <= radius)
      .sort((first, second) => first.distance - second.distance)
      .slice(0, Math.max(0, maxCharacters));

    const closestPosition = nearestCharacters[0]?.position ?? null;
    const nextOverrides: Record<number, CharacterOverride> = {};

    nearestCharacters.forEach(({ position }) => {
      nextOverrides[position] =
        overridesRef.current[position] ?? {
          value: getRandomScrambleCharacter(),
          color: getRandomScrambleColor(),
        };
    });

    if (closestPosition !== null && closestPosition !== closestPositionRef.current) {
      nextOverrides[closestPosition] = {
        value: getRandomScrambleCharacter(),
        color: getRandomScrambleColor(),
      };
    }

    closestPositionRef.current = closestPosition;
    overridesRef.current = nextOverrides;
    setOverrides(nextOverrides);
  };

  const reset = () => {
    cancelExit();
    closestPositionRef.current = null;
    const positions = Object.keys(overridesRef.current).map(Number);

    if (positions.length === 0) {
      overridesRef.current = {};
      setOverrides({});
      return;
    }

    let index = 0;
    const revertNext = () => {
      const position = positions[index];
      const nextOverrides = { ...overridesRef.current };
      delete nextOverrides[position];
      overridesRef.current = nextOverrides;
      setOverrides(nextOverrides);
      index += 1;

      if (index < positions.length) {
        exitTimeoutRef.current = window.setTimeout(revertNext, Math.max(16, exitInterval));
      } else {
        exitTimeoutRef.current = null;
      }
    };

    revertNext();
  };

  // External trigger for the chain pull, in three phases:
  //
  //   1. While held, words flip in reading order — the further the pull, the
  //      more leading words scramble. Overrides already set are reused, so a
  //      letter does not reshuffle while it stays in range.
  //   2. At full stretch the whole headline flashes before it settles. Rising
  //      edge only, so holding at full does not retrigger it every frame.
  //   3. On release the words go out one by one in random order, so the headline
  //      dissolves instead of blinking off together.
  //
  // Chain-driven timers live apart from the hover exit timer, so the two inputs
  // never cancel each other mid-sequence.
  const chainTimersRef = useRef<number[]>([]);
  const flashTokenRef = useRef(0);
  const wasFullRef = useRef(false);
  // Latched once the pull reaches full, so oscillation of the elastic tail
  // around the threshold does not strobe the headline between full-scramble and
  // a partial set. Only a meaningful relax — or release — lets go.
  const latchedFullRef = useRef(false);
  // True while the flash sequence owns the state; progress updates stand down
  // so they cannot rebuild a partial set underneath it.
  const flashingRef = useRef(false);
  // Progress below which the latch releases. Well under full, so ordinary
  // bounce at the top cannot trip it.
  const FULL_RELEASE = 0.8;

  const clearChainTimers = () => {
    chainTimersRef.current.forEach((timer) => window.clearTimeout(timer));
    chainTimersRef.current = [];
    // Invalidates any flash step already queued.
    flashTokenRef.current += 1;
  };

  useEffect(
    () => () => {
      chainTimersRef.current.forEach((timer) => window.clearTimeout(timer));
    },
    [],
  );

  const applyOverrides = (next: Record<number, CharacterOverride>) => {
    overridesRef.current = next;
    setOverrides(next);
  };

  useImperativeHandle(
    ref,
    () => ({
      scrambleProgress(progress: number) {
        cancelExit();
        const clamped = Math.min(1, Math.max(0, progress));

        // A flash in flight owns the state. Progress updates stand down rather
        // than rebuilding underneath it, unless the pull has collapsed — which
        // means the chain was released mid-flash and the stagger must take over.
        if (flashingRef.current) {
          if (clamped < FULL_RELEASE) {
            clearChainTimers();
            flashingRef.current = false;
            latchedFullRef.current = false;
            wasFullRef.current = false;
          } else {
            latchedFullRef.current = true;
            wasFullRef.current = true;
            return;
          }
        }

        // Latched full rides out oscillation at the top without rebuilding.
        if (latchedFullRef.current && clamped > FULL_RELEASE) return;
        if (clamped < FULL_RELEASE) latchedFullRef.current = false;

        const words = getWordRanges(text);
        const count = Math.round(clamped * words.length);
        const next: Record<number, CharacterOverride> = {};
        words.slice(0, count).forEach(({ start, end }) => {
          for (let position = start; position < end; position++) {
            next[position] =
              overridesRef.current[position] ?? {
                value: getRandomScrambleCharacter(),
                color: getRandomScrambleColor(),
              };
          }
        });
        applyOverrides(next);

        if (clamped >= 1 && !wasFullRef.current) {
          wasFullRef.current = true;
          latchedFullRef.current = true;
          flashingRef.current = true;
          const token = ++flashTokenRef.current;
          const all: Record<number, CharacterOverride> = {};
          getCharacterPositions(text).forEach((position) => {
            all[position] =
              overridesRef.current[position] ?? {
                value: getRandomScrambleCharacter(),
                color: getRandomScrambleColor(),
              };
          });
          const step = Math.max(16, exitInterval);
          const guarded = (fn: () => void, delay: number, last = false) => {
            chainTimersRef.current.push(
              window.setTimeout(() => {
                if (flashTokenRef.current !== token) return;
                fn();
                if (last) flashingRef.current = false;
              }, delay),
            );
          };
          guarded(() => applyOverrides({ ...all }), 0);
          guarded(() => applyOverrides({}), step);
          guarded(() => applyOverrides({ ...all }), step * 2, true);
        } else if (clamped < 1) {
          wasFullRef.current = false;
        }
      },
      clearScramble() {
        cancelExit();
        clearChainTimers();
        wasFullRef.current = false;
        latchedFullRef.current = false;
        flashingRef.current = false;
        const words = getWordRanges(text);
        if (words.length === 0) {
          applyOverrides({});
          return;
        }
        const order = words.map((_, index) => index);
        for (let i = order.length - 1; i > 0; i--) {
          const j = Math.floor(Math.random() * (i + 1));
          [order[i], order[j]] = [order[j], order[i]];
        }
        const step = Math.max(16, exitInterval);
        order.forEach((wordIndex, sequence) => {
          chainTimersRef.current.push(
            window.setTimeout(() => {
              const { start, end } = words[wordIndex];
              const next = { ...overridesRef.current };
              let changed = false;
              for (let position = start; position < end; position++) {
                if (position in next) {
                  delete next[position];
                  changed = true;
                }
              }
              if (changed) applyOverrides(next);
            }, (sequence + 1) * step),
          );
        });
      },
    }),
    [text, exitInterval],
  );

  const lines = text.split("\n");
  let lineOffset = 0;

  return (
    <h1
      ref={headingRef}
      className={`headline text-scrambler ${className}`.trim()}
      data-hp-scramble=""
      data-astro-cid-wbltqw2m=""
      aria-label={plainText}
      onPointerEnter={handlePointerMove}
      onPointerMove={handlePointerMove}
      onPointerLeave={reset}
    >
      {lines.map((line, lineIndex) => {
        const currentLineOffset = lineOffset;
        lineOffset += Array.from(line).length + 1;
        let tokenOffset = 0;

        return (
          <Fragment key={`line-${lineIndex}`}>
            {lineIndex > 0 ? <br data-astro-cid-wbltqw2m="" aria-hidden="true" /> : null}
            <span className="text-scrambler__line" aria-hidden="true">
              {line.split(/(\s+)/).map((token, tokenIndex) => {
                const currentTokenOffset = tokenOffset;
                tokenOffset += Array.from(token).length;

                if (/^\s+$/.test(token)) {
                  return <span key={`space-${tokenIndex}`}>{token}</span>;
                }

                return (
                  <span className="text-scrambler__word hp-word" key={`word-${tokenIndex}`}>
                    {Array.from(token).map((character, characterIndex) => {
                      const position = currentLineOffset + currentTokenOffset + characterIndex;
                      const characterOverride = overrides[position];
                      const isHighlighted = position >= highlightStart && position < highlightEnd;
                      const characterColor = characterOverride?.color ?? (isHighlighted ? BRAND_BLUE : undefined);

                      return (
                        <span
                          className="text-scrambler__character hp-ch"
                          style={getCharacterStyle(characterColor)}
                          aria-hidden="true"
                          key={`character-${characterIndex}`}
                          // Marks the letters that are mid-scramble, so the
                          // outline can be scoped to those alone. It cannot be
                          // inferred from the inline colour, because the
                          // highlighted word is coloured the same way whether or
                          // not it is currently scrambling.
                          data-scrambling={characterOverride ? "" : undefined}
                          // The outline is drawn from this text by the
                          // pseudo-elements in text-scrambler.css. It lives here
                          // rather than on the inner span because that one is
                          // rendered by torph, which does not necessarily forward
                          // arbitrary attributes to its DOM node — and an empty
                          // attr() leaves the pseudo-elements with no content, so
                          // no outline at all.
                          data-char={characterOverride?.value ?? character}
                          ref={(element) => {
                            if (element) {
                              characterRefs.current.set(position, element);
                            } else {
                              characterRefs.current.delete(position);
                            }
                          }}
                        >
                          <MorphCharacter
                            value={characterOverride?.value ?? character}
                          />
                        </span>
                      );
                    })}
                  </span>
                );
              })}
            </span>
          </Fragment>
        );
      })}
    </h1>
  );
}

export const TextScrambler = forwardRef<TextScramblerHandle, TextScramblerProps>(TextScramblerInner);

export default TextScrambler;
