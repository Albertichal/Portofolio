"use client";

import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { useFitTitle } from "../../../lib/slideUtils";
import { useLikes } from "../../../lib/stats";
import "./slide4.css";

type Project = {
    id: string;
    name: string;
    stack: string[];
    domain: string;
    readme: string;
};

// PENTING: id di sini harus sama persis dengan whitelist di fungsi toggle_like (Supabase).
// Kalau menambah project baru, tambahkan juga id-nya ke array di SQL.
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

// Jaring laba-laba (dipakai sebagai lingkaran di sekeliling hati)
function WebIcon({ className }: { className?: string }) {
    return (
        <svg className={className} viewBox="0 0 44 44" aria-hidden="true">
            <g fill="none" stroke="currentColor" strokeWidth="0.6" strokeLinecap="round">
                <line x1="22" y1="22" x2="22" y2="2" />
                <line x1="22" y1="22" x2="36.5" y2="7.5" />
                <line x1="22" y1="22" x2="42" y2="22" />
                <line x1="22" y1="22" x2="36.5" y2="36.5" />
                <line x1="22" y1="22" x2="22" y2="42" />
                <line x1="22" y1="22" x2="7.5" y2="36.5" />
                <line x1="22" y1="22" x2="2" y2="22" />
                <line x1="22" y1="22" x2="7.5" y2="7.5" />
                <path d="M22 8.5 L32.5 11.5 L35.5 22 L32.5 32.5 L22 35.5 L11.5 32.5 L8.5 22 L11.5 11.5 Z" />
                <path d="M22 15 L27.5 16.8 L29 22 L27.5 27.2 L22 29 L16.5 27.2 L15 22 L16.5 16.8 Z" />
            </g>
        </svg>
    );
}

// Hati dengan jaring mengelilinginya
function HeartWeb() {
    return (
        <span className="s4-heart" aria-hidden="true">
            <WebIcon className="s4-heart-web" />
            <svg className="s4-heart-icon" viewBox="0 0 24 24">
                <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z" />
            </svg>
        </span>
    );
}

export default function Slide4() {
    const titleRef = useRef<HTMLHeadingElement>(null);
    const trackRef = useRef<HTMLDivElement>(null);
    useFitTitle(titleRef);
    const { ready, counts, mine, toggle } = useLikes();

    const [activeId, setActiveId] = useState<string | null>(null);
    const active = PROJECTS.find((p) => p.id === activeId) || null;
    const activeLiked = active ? mine.includes(active.id) : false;

    const [mounted, setMounted] = useState(false);
    useEffect(() => setMounted(true), []);

    useEffect(() => {
        if (!active) return;

        const onKey = (e: KeyboardEvent) => {
            if (e.key === "Escape") setActiveId(null);
        };
        window.addEventListener("keydown", onKey);

        const html = document.documentElement;
        const prevHtml = html.style.overflow;
        const prevBody = document.body.style.overflow;
        html.style.overflow = "hidden";
        document.body.style.overflow = "hidden";

        return () => {
            window.removeEventListener("keydown", onKey);
            html.style.overflow = prevHtml;
            document.body.style.overflow = prevBody;
        };
    }, [active]);

    return (
        <section className="s4" aria-labelledby="s4-title">
            <div className="s4-bg" aria-hidden="true" />

            <div className="s4-inner">
                <div className="s4-head">
                    <div className="s4-title-wrap">
                        <h2 id="s4-title" ref={titleRef} className="s4-title">
                            <span>Selected</span>
                            <span>Work.</span>
                        </h2>
                        <p className="s4-subtitle">
                            Eksplorasi lini masa pengembangan perangkat lunak dan aplikasi web fungsional yang dibangun dengan ketelitian tingkat tinggi.
                        </p>
                    </div>
                </div>

                <div className="s4-track-wrap">
                    <div ref={trackRef} className="s4-track" role="list">
                        {PROJECTS.map((prop) => (
                            <button
                                key={prop.id}
                                type="button"
                                role="listitem"
                                className="s4-card"
                                onClick={() => setActiveId(prop.id)}
                                aria-haspopup="dialog"
                            >
                                <span className="s4-card-name">{prop.name}</span>
                                <span className="s4-card-stack">
                                    {prop.stack.map((s) => (
                                        <span key={s} className="s4-chip">
                                            {s}
                                        </span>
                                    ))}
                                </span>
                                {ready && (
                                    <span className={`s4-card-likes ${mine.includes(prop.id) ? "is-liked" : ""}`}>
                                        <HeartWeb />
                                        <span>{counts[prop.id] ?? 0}</span>
                                    </span>
                                )}
                                <span className="s4-card-cta">View project →</span>
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            {mounted &&
                createPortal(
                    <div
                        className={`s4-overlay ${active ? "is-open" : ""}`}
                        role="dialog"
                        aria-modal="true"
                        aria-hidden={!active}
                        aria-label={active?.name}
                        onClick={() => setActiveId(null)}
                    >
                        {active && (
                            <div className="s4-panel" onClick={(e) => e.stopPropagation()}>
                                <button
                                    type="button"
                                    className="s4-close"
                                    onClick={() => setActiveId(null)}
                                    aria-label="Tutup"
                                >
                                    ✕
                                </button>

                                <p className="s4-panel-tag">Project Overview</p>
                                <h3 className="s4-panel-title">{active.name}</h3>
                                <div className="s4-panel-stack">
                                    {active.stack.map((s) => (
                                        <span key={s} className="s4-chip">
                                            {s}
                                        </span>
                                    ))}
                                </div>
                                <p className="s4-panel-readme">{active.readme}</p>

                                <div className="s4-panel-actions">
                                    {ready && (
                                        <button
                                            type="button"
                                            className={`s4-like ${activeLiked ? "is-liked" : ""}`}
                                            onClick={() => toggle(active.id)}
                                            aria-pressed={activeLiked}
                                            aria-label={activeLiked ? "Batal suka" : "Suka project ini"}
                                        >
                                            <HeartWeb />
                                            <span>{counts[active.id] ?? 0}</span>
                                        </button>
                                    )}
                                    <a
                                        href={active.domain}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="s4-panel-link"
                                    >
                                        {active.domain.replace("https://", "")} ↗
                                    </a>
                                </div>
                            </div>
                        )}
                    </div>,
                    document.body
                )}
        </section>
    );
}
