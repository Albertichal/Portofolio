"use client";

// SLIDE 5 — "Let's build something" (ID card lanyard + About statement + Contact)
// Kartu ID bisa ditarik ke kiri/kanan tembus layar, dibatasi ke atas maksimal 2-3 cm, 
// dan dilengkapi hard clamp agar tidak bisa jebol meski dilempar kencang.

import { useLayoutEffect, useRef } from "react";
import { useFitTitle } from "./slideUtils";
import "./slide5.css";

type ContactIcon = "wa" | "ig" | "mail" | "download";

interface ContactItem {
    label: string;
    detail: string;
    href: string;
    icon: ContactIcon;
    download?: string;
}

const CONTACTS: ContactItem[] = [
    {
        label: "WhatsApp",
        detail: "Fastest way to reach me",
        href: "https://wa.me/6289512484424",
        icon: "wa",
    },
    {
        label: "Instagram",
        detail: "@albertichal",
        href: "https://instagram.com/albertichal",
        icon: "ig",
    },
    {
        label: "Email",
        detail: "muhammadeinsteinyudhistira@gmail.com",
        href: "mailto:muhammadeinsteinyudhistira@gmail.com",
        icon: "mail",
    },
    {
        label: "Download CV",
        detail: "PDF, updated 2026",
        href: "/assets/cv-einstein.pdf",
        icon: "download",
        download: "Einstein-Yudhistira-CV.pdf",
    },
];

function Icon({ type }: { type: ContactIcon }) {
    switch (type) {
        case "wa":
            return (
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                    <path d="M4 20l1.3-3.8A8 8 0 1 1 12 20a7.9 7.9 0 0 1-4-1.1L4 20z" />
                    <path d="M8.5 9.5c0 3 2.5 5.5 5.5 5.5" strokeLinecap="round" />
                </svg>
            );
        case "ig":
            return (
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                    <rect x="4" y="4" width="16" height="16" rx="4" />
                    <circle cx="12" cy="12" r="3.5" />
                    <circle cx="16.5" cy="7.5" r="0.8" fill="currentColor" stroke="none" />
                </svg>
            );
        case "mail":
            return (
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                    <rect x="3.5" y="5.5" width="17" height="13" rx="1.5" />
                    <path d="M4 6.5l8 6 8-6" />
                </svg>
            );
        case "download":
            return (
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                    <path d="M12 4v11" strokeLinecap="round" />
                    <path d="M7.5 10.5 12 15l4.5-4.5" strokeLinecap="round" strokeLinejoin="round" />
                    <path d="M4.5 18.5h15" strokeLinecap="round" />
                </svg>
            );
    }
}

const DEFAULT_REST_LENGTH = 96;

const SPOKE_FRACS = [-1, -0.6, -0.2, 0.25, 0.65, 1];
const SPOKE_CURVE = [0.3, 0.42, 0.2, 0.48, 0.32, 0.4];
const CROSS_FRACS = [0.22, 0.4, 0.6, 0.82];
const CROSS_JITTER = [4, -6, 3, -4, 7, -3];

function buildWebPath(x: number, y: number, rest: number) {
    const endY = rest + y;
    const spread = Math.max(20, rest * 0.34);

    const cardDist = Math.hypot(x, endY);
    const slack = Math.max(0, Math.min(1, (rest - cardDist) / rest));

    const ends = SPOKE_FRACS.map((f) => ({ x: x + f * spread, y: endY }));

    const ctrl = (end: { x: number; y: number }, bias: number) => ({
        x: end.x * bias,
        y: endY * (0.4 + bias * 0.22) + slack * rest * 0.55,
    });

    const spokeD = ends
        .map((end, i) => {
            const c = ctrl(end, SPOKE_CURVE[i]);
            return `M 0 0 Q ${c.x.toFixed(1)} ${c.y.toFixed(1)} ${end.x.toFixed(1)} ${end.y.toFixed(1)}`;
        })
        .join(" ");

    const pointAt = (end: { x: number; y: number }, bias: number, t: number) => {
        const c = ctrl(end, bias);
        const mt = 1 - t;
        return {
            x: 2 * mt * t * c.x + t * t * end.x,
            y: 2 * mt * t * c.y + t * t * end.y,
        };
    };

    const crossD = CROSS_FRACS
        .map((t, row) => {
            const pts = ends.map((end, i) => pointAt(end, SPOKE_CURVE[i], t));
            let d = `M ${pts[0].x.toFixed(1)} ${pts[0].y.toFixed(1)}`;
            for (let i = 1; i < pts.length; i++) {
                const prev = pts[i - 1];
                const cur = pts[i];
                const mx = (prev.x + cur.x) / 2;
                const my = (prev.y + cur.y) / 2 + CROSS_JITTER[(i + row) % CROSS_JITTER.length];
                d += ` Q ${mx.toFixed(1)} ${my.toFixed(1)} ${cur.x.toFixed(1)} ${cur.y.toFixed(1)}`;
            }
            return d;
        })
        .join(" ");

    const stubA = pointAt(ends[0], SPOKE_CURVE[0], 0.5);
    const stubB = pointAt(ends[5], SPOKE_CURVE[5], 0.32);
    const stubD = `M ${stubA.x.toFixed(1)} ${stubA.y.toFixed(1)} l -16 11 M ${stubB.x.toFixed(1)} ${stubB.y.toFixed(1)} l 17 -9`;

    return `${spokeD} ${crossD} ${stubD}`;
}

export default function Slide5() {
    const titleRef = useRef<HTMLHeadingElement>(null);
    useFitTitle(titleRef);

    const cardRef = useRef<HTMLDivElement>(null);
    const webRef = useRef<SVGPathElement>(null);
    const svgRef = useRef<SVGSVGElement>(null);

    useLayoutEffect(() => {
        if (!cardRef.current || !webRef.current || !svgRef.current) return;
        const card: HTMLDivElement = cardRef.current;
        const web: SVGPathElement = webRef.current;
        const svg: SVGSVGElement = svgRef.current;
        const lanyardEl = card.parentElement as HTMLElement | null;

        const mq = matchMedia("(min-width: 900px)");
        let isDesktop = mq.matches;

        let isDragging = false;
        let currentX = 0, currentY = 0;
        let vx = 0, vy = 0;
        let REST = DEFAULT_REST_LENGTH;
        let raf = 0;

        let lastPointerX = 0;
        let lastPointerY = 0;

        function measure() {
            const inner = lanyardEl?.closest(".s5-inner") as HTMLElement | null;
            const padTop = inner ? parseFloat(getComputedStyle(inner).paddingTop) || 0 : 0;
            const gap = lanyardEl
                ? parseFloat(getComputedStyle(lanyardEl).getPropertyValue("--lanyard-length")) || DEFAULT_REST_LENGTH
                : DEFAULT_REST_LENGTH;
            REST = padTop + gap;
            svg.style.top = `-${padTop}px`;
        }

        function render(x: number, y: number, dragging: boolean) {
            card.style.transform =
                `translate(${x}px, ${y}px) rotate(${x * 0.04}deg) scale(${dragging ? 1.04 : 1})`;
            web.setAttribute("d", buildWebPath(x, y, REST));
        }

        function applyTouchAction() {
            card.style.touchAction = "none";
            card.style.cursor = isDesktop ? "grab" : "pointer";
        }

        const GRAVITY = 0.6;
        const OMEGA_Y = 0.09;
        const ZETA_Y = 0.5;
        const OMEGA_X = 0.1;
        const ZETA_X = 0.6;
        let targetX = 0, targetY = 0;

        function stepPhysics() {
            if (isDragging) {
                vx += (targetX - currentX) * 0.28;
                vy += (targetY - currentY) * 0.28;
                vx *= 0.72;
                vy *= 0.72;
            } else {
                const ax = -(OMEGA_X * OMEGA_X) * currentX - 2 * ZETA_X * OMEGA_X * vx;
                vx += ax;

                if (currentY < 0) {
                    vy += GRAVITY;
                    vy *= 0.995;
                } else {
                    const ay = GRAVITY - (OMEGA_Y * OMEGA_Y) * currentY - 2 * ZETA_Y * OMEGA_Y * vy;
                    vy += ay;
                }
            }

            currentX += vx;
            currentY += vy;

            // --- HARD CLAMP (Pengaman Mutlak) ---
            // Mencegah kartu jebol ke atas/bawah/samping meskipun dilempar dengan kecepatan tinggi (fling/spin)
            if (currentX < -450) { currentX = -450; vx = 0; }
            if (currentX > 450) { currentX = 450; vx = 0; }
            if (currentY < -100) { currentY = -100; vy = 0; } // Batas atas maksimal 2-3 cm
            if (currentY > 420) { currentY = 420; vy = 0; }

            render(currentX, currentY, isDragging);

            if (isDragging || Math.abs(vx) > 0.01 || Math.abs(vy) > 0.01 || Math.abs(currentX) > 0.01 || Math.abs(currentY) > 0.01) {
                raf = requestAnimationFrame(stepPhysics);
            } else {
                currentX = 0; currentY = 0; vx = 0; vy = 0;
                render(0, 0, false);
                raf = 0;
            }
        }

        function startLoop() {
            if (!raf) raf = requestAnimationFrame(stepPhysics);
        }

        measure();
        applyTouchAction();
        render(0, 0, false);

        const onResize = () => {
            measure();
            render(currentX, currentY, isDragging);
        };
        window.addEventListener("resize", onResize);

        const onModeChange = (e: MediaQueryListEvent) => {
            isDesktop = e.matches;
            applyTouchAction();
        };
        mq.addEventListener("change", onModeChange);

        const onDown = (e: PointerEvent) => {
            lastPointerX = e.clientX;
            lastPointerY = e.clientY;

            isDragging = true;
            targetX = currentX;
            targetY = currentY;
            card.setPointerCapture(e.pointerId);
            card.style.cursor = "grabbing";
            e.preventDefault();
            startLoop();
        };

        const onMove = (e: PointerEvent) => {
            if (!isDragging) return;

            const deltaX = e.clientX - lastPointerX;
            const deltaY = e.clientY - lastPointerY;

            lastPointerX = e.clientX;
            lastPointerY = e.clientY;

            targetX = Math.max(-450, Math.min(450, targetX + deltaX));
            targetY = Math.max(-100, Math.min(420, targetY + deltaY));

            startLoop();
        };

        const onUp = (e: PointerEvent) => {
            if (!isDragging) return;
            isDragging = false;
            card.style.cursor = isDesktop ? "grab" : "pointer";
            try { card.releasePointerCapture(e.pointerId); } catch { }
            startLoop();
        };

        card.addEventListener("pointerdown", onDown);
        card.addEventListener("pointermove", onMove);
        card.addEventListener("pointerup", onUp);
        card.addEventListener("pointercancel", onUp);

        return () => {
            cancelAnimationFrame(raf);
            window.removeEventListener("resize", onResize);
            mq.removeEventListener("change", onModeChange);
            card.removeEventListener("pointerdown", onDown);
            card.removeEventListener("pointermove", onMove);
            card.removeEventListener("pointerup", onUp);
            card.removeEventListener("pointercancel", onUp);
        };
    }, []);

    return (
        <section className="s5">
            <div className="s5-bg" />
            <div className="s5-inner">
                <div className="s5-lanyard">
                    <svg
                        ref={svgRef}
                        className="s5-lanyard-web"
                        viewBox="-160 0 320 700"
                        width={320}
                        height={700}
                        aria-hidden="true"
                    >
                        <path ref={webRef} className="s5-web-path" d="" />
                    </svg>
                    <div className="s5-id-card" ref={cardRef}>
                        <span className="s5-id-hole" aria-hidden="true" />
                        <img className="s5-id-photo" src="/assets/face.webp" alt="Foto profil" draggable={false} />
                        <div className="s5-id-name">M. Einstein Yudhistira</div>
                        <div className="s5-id-role">Software Engineer</div>
                    </div>
                </div>

                <div className="s5-text">
                    <h2 className="s5-title" ref={titleRef}>
                        <span>Let&apos;s build something</span>
                    </h2>

                    <p className="s5-about">
                        Started with PHP and MySQL. Now teaching machines to reason.
                        I&apos;m the guy who ships — payment platforms, trackers, bots
                        that actually work — while learning AI engineering properly, not
                        just prompting. These days I&apos;m also picking up React and
                        Next.js, because a backend guy should be able to ship the whole
                        thing. Currently an Informatics student, full-time builder.
                    </p>

                    <ul className="s5-contacts">
                        {CONTACTS.map((c) => (
                            <li key={c.label} className="s5-contact">
                                <a
                                    href={c.href}
                                    target={c.href.startsWith("http") ? "_blank" : undefined}
                                    rel={c.href.startsWith("http") ? "noreferrer" : undefined}
                                    download={c.download}
                                >
                                    <span className="s5-contact-icon">
                                        <Icon type={c.icon} />
                                    </span>
                                    <span className="s5-contact-text">
                                        <span className="s5-contact-label">{c.label}</span>
                                        <span className="s5-contact-detail">{c.detail}</span>
                                    </span>
                                </a>
                            </li>
                        ))}
                    </ul>
                </div>
            </div>
        </section>
    );
}