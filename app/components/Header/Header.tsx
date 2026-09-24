"use client";

import { useEffect, useState } from "react";
import "./header.css";

const NAV_ITEMS = [
    { id: "hero-section", label: "Home" },
    { id: "slide2", label: "Journey" },
    { id: "slide3", label: "Timeline" },
    { id: "slide4", label: "Work" },
    { id: "slide5", label: "Contact" },
];

function EyeIcon() {
    return (
        <svg className="site-views-eye" viewBox="0 0 24 24" aria-hidden="true">
            <path d="M2 12s3.6-7 10-7 10 7 10 7-3.6 7-10 7S2 12 2 12Z" />
            <circle cx="12" cy="12" r="3" />
        </svg>
    );
}

type HeaderProps = {
    /** jumlah view/read; kalau null/undefined pill mata disembunyikan */
    views?: number | null;
};

export default function Header({ views = null }: HeaderProps) {
    const [open, setOpen] = useState(false);

    // Escape untuk menutup menu + kunci scroll body selagi menu terbuka
    useEffect(() => {
        const onKey = (e: KeyboardEvent) => {
            if (e.key === "Escape") setOpen(false);
        };
        window.addEventListener("keydown", onKey);

        const prevBody = document.body.style.overflow;
        if (open) document.body.style.overflow = "hidden";
        return () => {
            window.removeEventListener("keydown", onKey);
            document.body.style.overflow = prevBody;
        };
    }, [open]);

    const goTo = (id: string) => {
        setOpen(false);
        document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });
    };

    return (
        <>
            <header className="site-header">
                {views !== null && (
                    <div className="site-views" aria-label={`${views} kali dibaca`}>
                        <EyeIcon />
                        <span className="site-views-count">{views}</span>
                    </div>
                )}

                <button
                    type="button"
                    className={`site-burger ${open ? "is-open" : ""}`}
                    onClick={() => setOpen((v) => !v)}
                    aria-expanded={open}
                    aria-controls="site-nav"
                    aria-label={open ? "Tutup menu" : "Buka menu"}
                >
                    <span />
                    <span />
                    <span />
                </button>
            </header>

            <div
                className={`site-nav-scrim ${open ? "is-open" : ""}`}
                onClick={() => setOpen(false)}
                aria-hidden="true"
            />

            <nav id="site-nav" className={`site-nav ${open ? "is-open" : ""}`} aria-hidden={!open}>
                <ul>
                    {NAV_ITEMS.map((item, i) => (
                        <li key={item.id} style={{ "--i": i } as React.CSSProperties}>
                            <button type="button" onClick={() => goTo(item.id)}>
                                <span className="site-nav-index">0{i + 1}</span>
                                <span className="site-nav-label">{item.label}</span>
                            </button>
                        </li>
                    ))}
                </ul>
            </nav>
        </>
    );
}
