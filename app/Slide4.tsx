"use client";

import { useEffect, useRef, useState } from "react";
import { useFitTitle } from "./slideUtils";
import "./slide4.css";

type Project = {
    id: string;
    name: string;
    stack: string[];
    domain: string; // link domain live
    readme: string; // deskripsi singkat: web ini apa
};

// Tinggal tambah item baru di sini kalau project makin banyak —
// track otomatis jadi scrollable ke samping.
const PROJECTS: Project[] = [
    {
        id: "albertichal",
        name: "AlbertIchal Portfolio",
        stack: ["Next.js", "TypeScript", "WebGL"],
        domain: "https://albertichal.my.id",
        readme:
            "Portofolio pribadi bertema Spider-Man. Scroll-based single page dengan efek dissolve WebGL di hero, transisi Climber antar slide, dan timeline karier interaktif.",
    },
    {
        id: "altrack",
        name: "AlTrack",
        stack: ["Laravel", "MySQL"],
        domain: "https://www.altrack.my.id/",
        readme:
            "Aplikasi web untuk mencatat workout gym — progress, jadwal, dan riwayat latihan. Backend Laravel + MySQL.",
    },
];

/**
 * Bikin markup path jaring untuk efek "web burst" saat card diklik.
 * Sengaja versi statis (tidak animasi per-path seperti preloader) karena
 * gerakannya dibawa oleh scale-in di CSS (.s4-web), bukan stroke-draw.
 */
function buildWebPaths(spokes = 16, rings = 6, R = 100) {
    const ring = (r: number) =>
        Array.from({ length: spokes }, (_, i) => {
            const a = (i / spokes) * Math.PI * 2 - Math.PI / 2;
            return [Math.cos(a) * r, Math.sin(a) * r];
        });
    const f = (n: number) => n.toFixed(2);
    const d: string[] = [];

    ring(R).forEach(([x, y]) => d.push(`M0 0L${f(x)} ${f(y)}`));
    for (let k = 1; k <= rings; k++) {
        const p = ring((R * k) / rings);
        let s = `M${f(p[0][0])} ${f(p[0][1])}`;
        for (let i = 1; i <= spokes; i++) {
            const a = p[i % spokes];
            s += `L${f(a[0])} ${f(a[1])}`;
        }
        d.push(s);
    }
    return d.map((p) => `<path d="${p}"/>`).join("");
}

export default function Slide4() {
    const titleRef = useRef<HTMLHeadingElement>(null);
    const trackRef = useRef<HTMLDivElement>(null);
    const webPathsRef = useRef<SVGGElement>(null);
    useFitTitle(titleRef);

    const [activeId, setActiveId] = useState<string | null>(null);
    const [origin, setOrigin] = useState({ x: "50%", y: "50%" });
    const active = PROJECTS.find((p) => p.id === activeId) || null;

    // Isi jaring sekali di awal (dipakai ulang tiap overlay dibuka)
    useEffect(() => {
        if (webPathsRef.current) {
            webPathsRef.current.innerHTML = buildWebPaths();
        }
    }, []);

    // Kunci scroll halaman + tombol Escape saat overlay terbuka
    useEffect(() => {
        if (!active) return;
        const prevOverflow = document.body.style.overflow;
        document.body.style.overflow = "hidden";
        const onKey = (e: KeyboardEvent) => {
            if (e.key === "Escape") setActiveId(null);
        };
        window.addEventListener("keydown", onKey);
        return () => {
            document.body.style.overflow = prevOverflow;
            window.removeEventListener("keydown", onKey);
        };
    }, [active]);

    function openProject(e: React.MouseEvent<HTMLButtonElement>, id: string) {
        const r = e.currentTarget.getBoundingClientRect();
        // titik tengah card = titik asal "ledakan" jaring
        setOrigin({
            x: `${r.left + r.width / 2}px`,
            y: `${r.top + r.height / 2}px`,
        });
        setActiveId(id);
    }

    function scrollTrack(dir: 1 | -1) {
        const el = trackRef.current;
        if (!el) return;
        el.scrollBy({ left: dir * el.clientWidth * 0.8, behavior: "smooth" });
    }

    return (
        <section className="s4" aria-labelledby="s4-title">
            <div className="s4-bg" aria-hidden="true" />

            <div className="s4-inner">
                <div className="s4-head">
                    <h2 id="s4-title" ref={titleRef} className="s4-title">
                        <span>Selected</span>
                        <span>Work.</span>
                    </h2>
                    <p className="s4-hint">Scroll sideways →</p>
                </div>

                <div className="s4-track-wrap">
                    <button
                        type="button"
                        className="s4-nav s4-nav-prev"
                        onClick={() => scrollTrack(-1)}
                        aria-label="Project sebelumnya"
                    >
                        ←
                    </button>

                    <div ref={trackRef} className="s4-track" role="list">
                        {PROJECTS.map((p) => (
                            <button
                                key={p.id}
                                type="button"
                                role="listitem"
                                className="s4-card"
                                onClick={(e) => openProject(e, p.id)}
                                aria-haspopup="dialog"
                            >
                                <span className="s4-card-name">{p.name}</span>
                                <span className="s4-card-stack">
                                    {p.stack.map((s) => (
                                        <span key={s} className="s4-chip">
                                            {s}
                                        </span>
                                    ))}
                                </span>
                                <span className="s4-card-cta">View project →</span>
                            </button>
                        ))}
                    </div>

                    <button
                        type="button"
                        className="s4-nav s4-nav-next"
                        onClick={() => scrollTrack(1)}
                        aria-label="Project berikutnya"
                    >
                        →
                    </button>
                </div>
            </div>

            {/* Overlay detail project — jaring "meledak" dari titik klik, lalu panel muncul */}
            <div
                className={`s4-overlay ${active ? "is-open" : ""}`}
                role="dialog"
                aria-modal="true"
                aria-hidden={!active}
                aria-label={active?.name}
                style={{ "--ox": origin.x, "--oy": origin.y } as React.CSSProperties}
            >
                <div className="s4-web" aria-hidden="true">
                    <svg viewBox="-100 -100 200 200" preserveAspectRatio="xMidYMid slice">
                        <g ref={webPathsRef} />
                    </svg>
                </div>

                <button
                    type="button"
                    className="s4-close"
                    onClick={() => setActiveId(null)}
                    aria-label="Tutup"
                >
                    ✕
                </button>

                {active && (
                    <div className="s4-panel">
                        <p className="s4-panel-tag">Project</p>
                        <h3 className="s4-panel-title">{active.name}</h3>
                        <div className="s4-panel-stack">
                            {active.stack.map((s) => (
                                <span key={s} className="s4-chip">
                                    {s}
                                </span>
                            ))}
                        </div>
                        <p className="s4-panel-readme">{active.readme}</p>

                        <a
                            href={active.domain}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="s4-panel-link"
                        >
                            {active.domain.replace("https://", "")} ↗
                        </a>
                    </div>
                )}
            </div>
        </section >
    );
}