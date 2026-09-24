"use client";

import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { useFitTitle } from "./slideUtils";
import "./slide4.css";

type Project = {
    id: string;
    name: string;
    stack: string[];
    domain: string;
    readme: string;
};

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

export default function Slide4() {
    const titleRef = useRef<HTMLHeadingElement>(null);
    const trackRef = useRef<HTMLDivElement>(null);
    useFitTitle(titleRef);

    const [activeId, setActiveId] = useState<string | null>(null);
    const active = PROJECTS.find((p) => p.id === activeId) || null;

    // document belum ada saat SSR, jadi portal baru dirender setelah mount
    const [mounted, setMounted] = useState(false);
    useEffect(() => setMounted(true), []);

    // Escape untuk menutup + kunci scroll di html DAN body
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
                                <span className="s4-card-cta">View project →</span>
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            {/* Overlay Detail Project — di-portal ke body supaya keluar dari
                stacking context .s4 dan selalu di atas Slide 5 */}
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
                            <div
                                className="s4-panel"
                                onClick={(e) => e.stopPropagation()}
                            >
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
                    </div>,
                    document.body
                )}
        </section>
    );
}