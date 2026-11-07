"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import type { ComponentProps, MouseEvent } from "react";

const BAYER = [0, 32, 8, 40, 2, 34, 10, 42, 48, 16, 56, 24, 50, 18, 58, 26, 12, 44, 4, 36, 14, 46, 6, 38, 60, 28, 52, 20, 62, 30, 54, 22, 3, 35, 11, 43, 1, 33, 9, 41, 51, 19, 59, 27, 49, 17, 57, 25, 15, 47, 7, 39, 13, 45, 5, 37, 63, 31, 55, 23, 61, 29, 53, 21].map((v) => (v + 0.5) / 64);

let canvas: HTMLCanvasElement | null = null;

function wipe(midway: () => void) {
  if (matchMedia("(prefers-reduced-motion: reduce)").matches) return midway();
  if (!canvas) {
    canvas = document.createElement("canvas");
    canvas.className = "wipe";
    document.body.append(canvas);
  }
  const cv = canvas, ctx = cv.getContext("2d")!;
  const w = Math.ceil(innerWidth / 9), h = Math.ceil(innerHeight / 9);
  cv.width = w;
  cv.height = h;
  const img = ctx.createImageData(w, h), px = new Uint32Array(img.data.buffer);
  const n = parseInt(getComputedStyle(document.documentElement).getPropertyValue("--fg").trim().slice(1), 16);
  const colour = ((255 << 24) | ((n & 255) << 16) | (((n >> 8) & 255) << 8) | ((n >> 16) & 255)) >>> 0;
  const start = performance.now();
  let swapped = false;
  cv.style.display = "block";
  const frame = (t: number) => {
    const p = (t - start) / 240;
    if (p >= 1 && !swapped) {
      swapped = true;
      midway();
    }
    if (p >= 2) {
      cv.style.display = "none";
      return;
    }
    const k = p < 1 ? p : 2 - p;
    px.fill(0);
    for (let y = 0; y < h; y++)
      for (let x = 0; x < w; x++)
        if (BAYER[(y & 7) * 8 + (x & 7)] * 0.72 + (x / w) * 0.14 + (y / h) * 0.14 < k * 1.02) px[y * w + x] = colour;
    ctx.putImageData(img, 0, 0);
    requestAnimationFrame(frame);
  };
  requestAnimationFrame(frame);
}

export function TransitionLink({ href, onClick, ...props }: ComponentProps<typeof Link> & { href: string }) {
  const router = useRouter();
  const go = (e: MouseEvent<HTMLAnchorElement>) => {
    onClick?.(e);
    if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
    e.preventDefault();
    if (location.pathname === href) return;
    wipe(() => router.push(href));
  };
  return <Link href={href} onClick={go} {...props} />;
}
