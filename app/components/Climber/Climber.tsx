"use client";

import { useEffect, useRef } from "react";
import "./climber.css";

const D = "1.1s"; // durasi satu siklus panjat

/** Anggota badan: digambar dua kali (garis tepi putih di bawah, warna suit di atas). */
function Limbs({ list, w }: { list: string[]; w: number }) {
    const anim = (values: string) => (
        <animate attributeName="d" dur={D} repeatCount="indefinite" values={values} />
    );
    return (
        <g fill="none" strokeLinecap="round" strokeLinejoin="round">
            {list.map((v) => (
                <path key={"o" + v} d={v.split(";")[0]} stroke="#f4f4f6" strokeWidth={w + 2.4}>
                    {anim(v)}
                </path>
            ))}
            {list.map((v) => (
                <path key={"f" + v} d={v.split(";")[0]} stroke="#1b1b20" strokeWidth={w}>
                    {anim(v)}
                </path>
            ))}
        </g>
    );
}

/**
 * Transisi antar slide: Spider-Man memanjat benang jaring.
 * Taruh <Climber /> sebagai anak langsung <section> slide yang naik menimpa
 * slide sebelumnya. Figur menempel di tepi atas slide (ikut naik saat scroll),
 * dan benang tersambung ke tepi atas layar, jadi makin naik makin pendek.
 */
export default function Climber() {
    const rootRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const root = rootRef.current!;
        const section = root.parentElement as HTMLElement;
        let raf = 0;

        const update = () => {
            raf = 0;
            const top = section.getBoundingClientRect().top;
            const h = root.offsetHeight;
            // benang: dari genggaman tangan (70% tinggi figur) sampai tepi atas layar
            root.style.setProperty("--len", `${Math.max(0, top - h * 0.7)}px`);
            // muncul pelan di awal scroll, hilang setelah keluar dari atas layar
            const progress = 1 - top / window.innerHeight; // 0 = slide baru mau masuk, 1 = menutup penuh
            root.style.opacity = String(Math.min(1, Math.max(0, progress * 8)));
            root.style.visibility = top <= 0 ? "hidden" : "visible";
        };
        const onScroll = () => {
            if (!raf) raf = requestAnimationFrame(update);
        };

        update();
        window.addEventListener("scroll", onScroll, { passive: true });
        window.addEventListener("resize", onScroll);
        return () => {
            window.removeEventListener("scroll", onScroll);
            window.removeEventListener("resize", onScroll);
            if (raf) cancelAnimationFrame(raf);
        };
    }, []);

    return (
        <div ref={rootRef} className="sm" aria-hidden="true">
            <div className="sm-thread" />
            <svg className="sm-fig" viewBox="0 0 100 160">
                {/* kaki (bergantian menekuk) */}
                <Limbs
                    w={6.5}
                    list={[
                        "M46 100 L36 118 L42 138;M46 100 L45 122 L47 146;M46 100 L36 118 L42 138",
                        "M54 100 L55 122 L53 146;M54 100 L64 118 L58 138;M54 100 L55 122 L53 146",
                    ]}
                />

                {/* badan */}
                <path d="M37 66 Q50 62 63 66 L57 101 L43 101 Z" fill="#1b1b20" stroke="#f4f4f6" strokeWidth="1.2" strokeLinejoin="round" />
                {/* logo laba-laba di dada */}
                <ellipse cx="50" cy="81" rx="1.9" ry="4.6" fill="#f4f4f6" />
                <path d="M49 77 L42 71 M49 80 L41 79 M49 83 L42 89 M51 77 L58 71 M51 80 L59 79 M51 83 L58 89"
                    stroke="#f4f4f6" strokeWidth="1" strokeLinecap="round" fill="none" />

                {/* kepala + topeng */}
                <ellipse cx="50" cy="52" rx="8.5" ry="10" fill="#1b1b20" stroke="#f4f4f6" strokeWidth="1.2" />
                <path d="M50 42.5 L50 61.5 M42.5 47 Q50 51.5 57.5 47 M42.3 56.5 Q50 60 57.7 56.5"
                    stroke="#f4f4f6" strokeWidth=".45" fill="none" opacity=".55" />
                <polygon points="42.5,49.5 49,52 43.5,56" fill="#f4f4f6" />
                <polygon points="57.5,49.5 51,52 56.5,56" fill="#f4f4f6" />

                {/* lengan (bergantian menarik benang) */}
                <Limbs
                    w={5.5}
                    list={[
                        "M41 68 L31 51 L48 30;M41 68 L29 62 L47.5 46;M41 68 L31 51 L48 30",
                        "M59 68 L71 62 L52.5 46;M59 68 L69 51 L52 30;M59 68 L71 62 L52.5 46",
                    ]}
                />
            </svg>
        </div>
    );
}