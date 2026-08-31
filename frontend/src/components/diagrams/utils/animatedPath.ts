'use client';

import { RefObject, useEffect } from 'react';

/**
 * Triggers a "draw-on" reveal animation for an SVG <path> element.
 * Measures the path's total length, sets up dasharray/dashoffset,
 * then transitions dashoffset to 0 so the path appears to draw itself.
 *
 * @param pathRef  React ref to the SVGPathElement
 * @param duration CSS transition duration string, e.g. '1.2s'
 * @param delay    CSS transition delay string, e.g. '0.2s'
 */
export function useDrawOnReveal(
  pathRef: RefObject<SVGPathElement | null>,
  duration = '1.2s',
  delay    = '0s',
): void {
  useEffect(() => {
    const el = pathRef.current;
    if (!el) return;

    const len = el.getTotalLength();
    el.style.strokeDasharray  = `${len}`;
    el.style.strokeDashoffset = `${len}`;

    // Force reflow so the initial state is painted before transition starts
    void el.getBoundingClientRect();

    el.style.transition = `stroke-dashoffset ${duration} ease-out ${delay}`;
    el.style.strokeDashoffset = '0';
  }, [pathRef, duration, delay]);
}
