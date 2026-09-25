import { Fragment, useRef, useState, type CSSProperties, type PointerEvent } from "react";
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

function getCharacterPositions(text: string) {
  return Array.from(text)
    .map((character, position) => (/\s/.test(character) ? -1 : position))
    .filter((position) => position >= 0);
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

export function TextScrambler({
  text = DEFAULT_TEXT,
  className = "",
  radius = 150,
  maxCharacters = 6,
  exitInterval = 90,
}: TextScramblerProps) {
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

export default TextScrambler;
