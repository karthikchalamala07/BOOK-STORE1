import React, { useEffect, useState } from "react";

interface CinematicIntroProps {
  onComplete: () => void;
}

export default function CinematicIntro({ onComplete }: CinematicIntroProps) {
  const [phase, setPhase] = useState<"point" | "drawing" | "revealed" | "exiting" | "done">("point");
  const [isReducedMotion, setIsReducedMotion] = useState(false);

  useEffect(() => {
    const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    if (mediaQuery.matches) {
      setIsReducedMotion(true);
      const reducedTimer = setTimeout(() => {
        setPhase("done");
        onComplete();
      }, 900);
      return () => clearTimeout(reducedTimer);
    }

    // Fast non-blocking timeline sequence (Max 2.45s total)
    const timerDrawing = setTimeout(() => setPhase("drawing"), 250);
    const timerRevealed = setTimeout(() => setPhase("revealed"), 1400);
    const timerExiting = setTimeout(() => setPhase("exiting"), 1800);
    const timerDone = setTimeout(() => {
      setPhase("done");
      onComplete();
    }, 2450);

    return () => {
      clearTimeout(timerDrawing);
      clearTimeout(timerRevealed);
      clearTimeout(timerExiting);
      clearTimeout(timerDone);
    };
  }, [onComplete]);

  if (phase === "done") return null;

  return (
    <div
      className={`fixed inset-0 z-[99999] pointer-events-none select-none flex items-center justify-center transition-opacity duration-500 ${
        phase === "exiting" ? "opacity-0" : "opacity-100"
      }`}
      style={{
        backgroundColor: "#0D0D0D",
        background:
          "radial-gradient(circle at 50% 45%, rgba(36, 21, 26, 0.85) 0%, rgba(21, 21, 21, 0.95) 55%, #0D0D0D 85%)",
        willChange: "opacity",
      }}
      aria-hidden="true"
    >
      {/* Subtle Background Emblem Outline */}
      <div
        className="absolute inset-0 flex items-center justify-center transition-all duration-700 ease-out"
        style={{
          opacity: phase === "revealed" ? 0.14 : phase === "drawing" ? 0.05 : 0.02,
          transform: phase === "revealed" ? "scale(1.02)" : "scale(1.0)",
        }}
      >
        <svg
          width="420"
          height="420"
          viewBox="0 0 200 200"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="text-[#C9A227]"
        >
          <circle cx="100" cy="100" r="92" stroke="currentColor" strokeWidth="1" strokeDasharray="4 4" opacity="0.6" />
          <circle cx="100" cy="100" r="84" stroke="currentColor" strokeWidth="0.8" opacity="0.8" />
          <path
            d="M 60 70 C 60 70 80 65 100 75 C 120 65 140 70 140 70 L 140 135 C 140 135 120 130 100 140 C 80 130 60 135 60 135 Z"
            stroke="currentColor"
            strokeWidth="1.2"
            strokeLinejoin="round"
          />
          <path d="M 100 75 L 100 140" stroke="currentColor" strokeWidth="1.2" />
          <path
            d="M 100 90 C 95 90 92 94 94 98 C 96 101 98 103 98 107 L 98 118 L 102 118 L 102 107 C 102 103 104 101 106 98 C 108 94 105 90 100 90 Z"
            stroke="currentColor"
            strokeWidth="1"
            fill="none"
          />
        </svg>
      </div>

      {/* Main Center Composition */}
      <div
        className="relative z-10 flex flex-col items-center justify-center px-4 w-full max-w-4xl transition-all duration-700 ease-out"
        style={{
          transform: phase === "exiting" ? "translateY(-12px)" : "translateY(0)",
          opacity: phase === "exiting" ? 0 : 1,
        }}
      >
        {/* Antique Gold Center Point */}
        <div
          className={`w-2.5 h-2.5 rounded-full bg-[#C9A227] shadow-[0_0_14px_#C9A227] absolute transition-all duration-300 ${
            phase === "point" ? "opacity-100 scale-100" : "opacity-0 scale-50"
          }`}
          style={{ top: "40%" }}
        />

        {/* Fountain Pen Luxury Handwritten Signature SVG */}
        <div className="w-full max-w-[720px] px-4 flex items-center justify-center">
          <svg
            viewBox="0 0 1000 240"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className="w-full h-auto overflow-visible"
            style={{
              filter:
                phase === "drawing" || phase === "revealed"
                  ? "drop-shadow(0px 0px 8px rgba(201, 162, 39, 0.45)) drop-shadow(0px 0px 18px rgba(201, 162, 39, 0.15))"
                  : "none",
            }}
          >
            <g
              stroke="#C9A227"
              strokeWidth="2.8"
              strokeLinecap="round"
              strokeLinejoin="round"
              className={isReducedMotion ? "" : "sv-signature-paths"}
            >
              {/* S */}
              <path
                d="M 110 95 C 100 70, 70 55, 48 70 C 30 82, 35 110, 65 122 C 95 135, 105 155, 80 175 C 58 190, 30 178, 20 162 M 35 70 C 50 65, 90 60, 115 65"
                className="sv-stroke sv-stroke-1"
              />
              {/* T */}
              <path
                d="M 145 175 C 150 140, 155 90, 160 55 M 120 62 C 145 58, 175 56, 205 60 C 215 62, 220 65, 210 70"
                className="sv-stroke sv-stroke-2"
              />
              {/* O */}
              <path
                d="M 270 120 C 270 85, 235 85, 225 120 C 215 155, 255 160, 270 125 C 275 112, 270 102, 285 105"
                className="sv-stroke sv-stroke-3"
              />
              {/* R */}
              <path
                d="M 305 165 C 310 145, 315 120, 318 100 C 322 95, 345 85, 355 105 C 362 120, 340 135, 320 135 C 335 145, 350 160, 365 170"
                className="sv-stroke sv-stroke-4"
              />
              {/* Y */}
              <path
                d="M 385 102 C 390 120, 395 135, 400 150 M 430 100 C 420 125, 400 165, 390 195 C 382 220, 365 225, 355 210"
                className="sv-stroke sv-stroke-5"
              />
              {/* V */}
              <path
                d="M 470 100 C 480 125, 492 155, 498 172 C 505 155, 520 125, 535 98"
                className="sv-stroke sv-stroke-6"
              />
              {/* A */}
              <path
                d="M 555 172 C 572 135, 588 98, 595 82 C 605 110, 622 145, 638 172 M 570 142 Q 600 140 625 142"
                className="sv-stroke sv-stroke-7"
              />
              {/* U */}
              <path
                d="M 660 100 C 665 130, 665 168, 690 168 C 715 168, 722 135, 725 98"
                className="sv-stroke sv-stroke-8"
              />
              {/* L */}
              <path
                d="M 755 55 C 758 95, 755 140, 752 172 C 765 170, 790 168, 810 170"
                className="sv-stroke sv-stroke-9"
              />
              {/* T */}
              <path
                d="M 845 172 C 850 135, 855 90, 860 55 M 825 62 C 855 58, 885 56, 915 60 C 930 62, 945 66, 960 72"
                className="sv-stroke sv-stroke-10"
              />
              {/* Underline Flourish */}
              <path
                d="M 30 198 C 220 188, 480 208, 740 195 C 840 190, 930 196, 970 202"
                strokeWidth="1.8"
                className="sv-stroke sv-stroke-11"
              />
            </g>
          </svg>
        </div>

        {/* Sub-tagline reveal */}
        <div
          className={`mt-4 overflow-hidden transition-all duration-700 ease-out flex items-center justify-center ${
            phase === "revealed" || phase === "exiting"
              ? "opacity-100 translate-y-0"
              : "opacity-0 translate-y-2"
          }`}
        >
          <div className="flex items-center gap-3">
            <span className="h-[1px] w-8 bg-gradient-to-r from-transparent to-[#C9A227]/70" />
            <p className="font-serif text-[11px] sm:text-[13px] md:text-[14px] uppercase tracking-[0.32em] text-[#F5F1E8]/90 font-medium whitespace-nowrap">
              Unlock Timeless Stories
            </p>
            <span className="h-[1px] w-8 bg-gradient-to-l from-transparent to-[#C9A227]/70" />
          </div>
        </div>
      </div>
    </div>
  );
}