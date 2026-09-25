import { useLayoutEffect, useRef, useState } from "react";
import { TextMorph } from "torph/react";

const IDLE_SVG_WIDTH = 548;
const EMPTY_FOCUSED_SVG_WIDTH = 320;
const MIN_SVG_WIDTH = 288;
const MAX_SVG_WIDTH = 720;
const SVG_TEXT_PADDING = 168;

function createCtaPath(svgWidth: number) {
  const left = 16;
  const right = svgWidth - 16;
  const middle = svgWidth / 2;
  const top = 16;
  const bottom = 139;

  return [
    `M ${middle} ${top}`,
    `L ${right - 48} ${top}`,
    "c 22.6274 0 33.9411 0 40.9706 7.0294",
    "c 7.0294 7.0294 7.0294 18.3431 7.0294 40.9706",
    `L ${right} 91`,
    "c 0 22.6274 0 33.9411 -7.0294 40.9706",
    "c -7.0294 7.0294 -18.3431 7.0294 -40.9706 7.0294",
    `L ${left + 48} ${bottom}`,
    "c -22.6274 0 -33.9411 0 -40.9706 -7.0294",
    "c -7.0294 -7.0294 -7.0294 -18.3431 -7.0294 -40.9706",
    `L ${left} 64`,
    "c 0 -22.6274 0 -33.9411 7.0294 -40.9706",
    "c 7.0294 -7.0294 18.3431 -7.0294 40.9706 -7.0294",
    "Z",
  ].join(" ");
}

interface FindCustomersToolsProps {
  /** Called with what was typed after "www." when the box is submitted. */
  onSubmit?: (value: string) => void;
  /** True while a run is in progress: the box stays visible but a second run cannot be started. */
  busy?: boolean;
}

export function FindCustomersTools({ onSubmit, busy = false }: FindCustomersToolsProps = {}) {
  const [value, setValue] = useState("");
  const [focused, setFocused] = useState(false);
  const [textWidth, setTextWidth] = useState(0);
  const [inputTextWidth, setInputTextWidth] = useState(0);
  const sizerRef = useRef<HTMLSpanElement>(null);
  const inputSizerRef = useRef<HTMLSpanElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useLayoutEffect(() => {
    const node = sizerRef.current;
    const inputNode = inputSizerRef.current;
    if (!node || !inputNode) return;

    const updateWidths = () => {
      setTextWidth(node.getBoundingClientRect().width);
      setInputTextWidth(inputNode.getBoundingClientRect().width);
    };
    updateWidths();
    const observer = new ResizeObserver(updateWidths);
    observer.observe(node);
    observer.observe(inputNode);
    document.fonts?.ready.then(updateWidths);

    return () => observer.disconnect();
  }, [value]);

  const svgWidth = value.length > 0
    ? Math.min(MAX_SVG_WIDTH, Math.max(MIN_SVG_WIDTH, textWidth + SVG_TEXT_PADDING))
    : focused
      ? EMPTY_FOCUSED_SVG_WIDTH
      : IDLE_SVG_WIDTH;
  const ctaPath = createCtaPath(svgWidth);
  const inputUnderlineWidth = value.length === 0
    ? "min(100%, 18rem)"
    : `${Math.min(Math.max(inputTextWidth + 24, 80), 680)}px`;
  const responsiveCtaWidth = `min(${svgWidth - 32}px, calc(100vw - 2rem))`;
  const responsiveSvgWidth = `min(${svgWidth}px, calc(100vw - 1rem))`;
  return (
    <form
      onSubmit={(event) => {
        event.preventDefault();
        if (!busy) onSubmit?.(value);
      }}
      aria-busy={busy}
      data-hp-cursor-label="press enter to submit"
      data-astro-cid-nrqvy5fv=""
      className="group relative isolate mx-auto grid h-[98px] w-full max-w-[calc(100vw_-_2rem)] place-items-center text-ink transition-[width] duration-300 ease-out motion-reduce:transition-none sm:h-[123px]"
      style={{ width: responsiveCtaWidth }}
      onClick={() => inputRef.current?.focus()}
    >
      <svg
        className="cta-dashes pointer-events-none absolute left-1/2 top-1/2 z-0 h-[130px] -translate-x-1/2 -translate-y-1/2 overflow-visible transition-[width] duration-300 ease-out motion-reduce:transition-none sm:h-[156px]"
        viewBox={`0 0 ${svgWidth} 155`}
        width={svgWidth}
        height={155}
        style={{ width: responsiveSvgWidth, maxWidth: "calc(100vw - 1rem)" }}
        preserveAspectRatio="none"
        aria-hidden="true"
        focusable="false"
        data-astro-cid-nrqvy5fv=""
      >
        <path
          className="cta-ground fill-none stroke-[#0D2A4C] stroke-[6] [stroke-dasharray:18_18] transition-[stroke-width] duration-200 group-hover:stroke-[28] group-focus-within:stroke-[28]"
          d={ctaPath}
          fill="none"
          stroke="#0D2A4C"
          data-astro-cid-nrqvy5fv=""
        />
        <path
          className="cta-ring fill-none stroke-[#2A8CFF] stroke-[6] [stroke-dasharray:18_18] [stroke-dashoffset:18] transition-[stroke-width] duration-200 group-hover:stroke-[28] group-focus-within:stroke-[28]"
          d={ctaPath}
          fill="none"
          stroke="#2A8CFF"
          data-astro-cid-nrqvy5fv=""
        />
        <path
          className="cta-fill fill-[#1A1A19]"
          d={ctaPath}
          fill="#1A1A19"
          data-astro-cid-nrqvy5fv=""
        />
      </svg>
      <span className="pointer-events-none absolute inset-0 z-20 rounded-full" aria-hidden="true" />
      <label className="sr-only" htmlFor="website-input" data-astro-cid-nrqvy5fv="">
        Your website address
      </label>
      <span
        ref={sizerRef}
        className="pointer-events-none absolute h-px w-max whitespace-nowrap text-3xl font-black leading-none opacity-0 sm:text-6xl"
        aria-hidden="true"
      >
        {`www.${value}`}
      </span>
      <span
        ref={inputSizerRef}
        className="pointer-events-none absolute h-px w-max whitespace-nowrap text-3xl font-black leading-none opacity-0 sm:text-6xl"
        aria-hidden="true"
      >
        {value || "\u00a0"}
      </span>
      <div className="relative z-10 flex h-[68px] w-full items-center overflow-hidden sm:h-[91px]">
        <span
          className="pointer-events-none relative z-20 shrink-0 pl-7 text-3xl font-black leading-none text-[#F8F8F8] opacity-70 sm:pl-10 sm:text-6xl"
          aria-hidden="true"
        >
          www.
        </span>
        <div className="relative min-w-0 flex-1 self-stretch overflow-hidden">
          <span
            className="pointer-events-none absolute bottom-3 left-0 z-0 h-1 max-w-full -translate-y-2 bg-[#F8F8F8] opacity-60 transition-[width,opacity,transform] duration-300 ease-out motion-reduce:transition-none"
            style={{ width: inputUnderlineWidth }}
            aria-hidden="true"
          />
          <div className="pointer-events-none absolute inset-0 z-10 flex items-center overflow-hidden">
            <TextMorph
              as="span"
              className="inline-block whitespace-nowrap text-3xl font-black leading-none text-[#F8F8F8] sm:text-6xl"
              ease={{ stiffness: 1200, damping: 14, mass: 0.35, precision: 0.03 }}
              numbers={false}
              scale
            >
              {value}
            </TextMorph>
          </div>
          <input
            ref={inputRef}
            className="relative z-20 h-full w-full min-w-0 appearance-none border-0 bg-transparent px-0 text-left text-3xl font-black leading-none text-transparent outline-none transition-colors duration-200 caret-[#2A8CFF] selection:bg-[#2A8CFF]/40 focus:ring-0 sm:text-6xl"
            onFocus={() => setFocused(true)}
            onBlur={() => setFocused(false)}
            value={value}
            onChange={(event) => setValue(event.target.value)}
            id="website-input"
            data-hp-cursor-text=""
            name="website"
            type="text"
            autoComplete="off"
            autoCapitalize="none"
            autoCorrect="off"
            spellCheck={false}
            maxLength={60}
            inputMode="url"
            data-astro-cid-nrqvy5fv=""
          />
        </div>
      </div>
      <button className="sr-only" type="submit" disabled={busy} data-astro-cid-nrqvy5fv="">
        Find sites that should link to me
      </button>
    </form>
  );
}
