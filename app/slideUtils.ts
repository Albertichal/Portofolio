import { useEffect, type RefObject } from "react";

/**
 * Menyesuaikan ukuran judul slide dengan lebar layar (cara yang sama seperti
 * fitHeadline di page.tsx), jadi ukurannya tetap pas walau font display
 * belum termuat / berbeda.
 * Atur angka di bawah kalau mau lebih kecil/besar.
 */
const WIDE_RATIO = 0.32; // desktop: judul memakai ±32% lebar layar
const WIDE_MAX_PX = 96;
const MOBILE_RATIO = 0.78; // mobile: ±78% lebar layar (dikurangi padding)
const MOBILE_MAX_PX = 60;

export function useFitTitle(ref: RefObject<HTMLElement | null>) {
  useEffect(() => {
    const h = ref.current;
    if (!h) return;

    const fit = () => {
      const wide = window.innerWidth >= 900;
      const avail = wide
        ? window.innerWidth * WIDE_RATIO
        : (window.innerWidth - 40) * MOBILE_RATIO;
      h.style.fontSize = "60px";
      let w = 0;
      h.querySelectorAll("span").forEach((s) => {
        w = Math.max(w, s.getBoundingClientRect().width);
      });
      if (w) {
        h.style.fontSize =
          Math.min((avail / w) * 60, wide ? WIDE_MAX_PX : MOBILE_MAX_PX) + "px";
      }
    };

    fit();
    document.fonts?.ready.then(fit);
    window.addEventListener("resize", fit);
    return () => window.removeEventListener("resize", fit);
  }, [ref]);
}