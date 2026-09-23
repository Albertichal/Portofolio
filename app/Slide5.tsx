"use client";

// SLIDE 5 — "Let's build something" (ID card lanyard + About statement + Contact)
// Kartu ID di kiri (desktop) bisa ditarik. Talinya berupa jaring laba-laba
// (SVG path) yang dihitung ulang tiap frame dari posisi kartu — bukan div
// yang diputar rotate() — supaya beneran "nempel" ke kartu dan gerakannya
// gak pernah kebalik arahnya. Titik jangkarnya diukur otomatis sampai ke
// paling atas section (bukan cuma di atas kartu), jadi keliatan kayak
// jaring beneran turun dari langit-langit slide.
// Di mobile kartu dibuat statis (lihat komentar di useLayoutEffect kenapa).

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

// TODO: ganti nomor WA, handle IG, dan email dengan yang asli
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

// Fallback kalau pengukuran CSS gagal (harusnya gak pernah kepake).
const DEFAULT_REST_LENGTH = 96;

// Susunan helai yang SENGAJA gak simetris (jarak & lengkungan beda-beda)
// biar kesannya jaring beneran, bukan pola geometris rapi.
const SPOKE_FRACS = [-1, -0.6, -0.2, 0.25, 0.65, 1];
const SPOKE_CURVE = [0.3, 0.42, 0.2, 0.48, 0.32, 0.4];
const CROSS_FRACS = [0.22, 0.4, 0.6, 0.82];
const CROSS_JITTER = [4, -6, 3, -4, 7, -3];

// Bangun path SVG jaring laba-laba: beberapa helai yang mengerucut ke titik
// jangkar (0,0, di paling atas section) lalu melebar ke tepi atas kartu,
// disilang sama beberapa "cincin" yang jaggy (gak lurus), plus 2 helai
// putus pendek buat kesan robek. Semua titik dihitung dari posisi kartu
// SEKARANG (x, y) dan panjang tali sekarang (rest), jadi jaringnya selalu
// bener-bener ketarik ngikutin kartu — gak ada rotate() terpisah yang bisa
// kebalik arahnya.
function buildWebPath(x: number, y: number, rest: number) {
    const endY = rest + y;
    const spread = Math.max(20, rest * 0.34);

    // "kendor": kalau jarak kartu ke titik jangkar lebih pendek dari panjang
    // tali alaminya (misal ditarik ke atas, ngelewatin/mendekati anchor),
    // helainya melengkung turun bikin loop longgar, bukan ketarik lurus kaku
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

    // "cincin" penyilang: dibikin jaggy (naik-turun gak beraturan) biar gak
    // kayak garis lurus kaku antar helai
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

    // helai putus pendek nyantol di badan jaring — detail "robek" biar makin berantakan
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
        const isDesktop = matchMedia("(min-width: 900px)").matches;

        // currentX/currentY/isDragging dideklarasikan di scope terluar (dipakai
        // bareng sama handler resize di kedua mode, mobile maupun desktop)
        let isDragging = false;
        let currentX = 0;
        let currentY = 0;
        let REST = DEFAULT_REST_LENGTH;

        function measure() {
            // ukur jarak dari paling atas .s5-inner (= paling atas Slide 5)
            // sampai ke posisi diam kartu, biar talinya beneran mulai dari
            // puncak section, bukan cuma dari atas kartu doang
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

        measure();

        const onResize = () => {
            measure();
            render(currentX, currentY, isDragging);
        };
        window.addEventListener("resize", onResize);

        // Drag cuma aktif di desktop. Di mobile kartu ini duduk di tengah alur
        // scroll (beda dari jaring pojok Hero yang kecil & di pinggir), jadi
        // drag pointer di sini gampang rebutan sama gesture scroll halaman —
        // daripada berantakan, mobile dibuat statis saja. Jaringnya tetap
        // digambar di posisi diam biar gak kosong.
        if (!isDesktop) {
            render(0, 0, false);
            return () => window.removeEventListener("resize", onResize);
        }

        let startX = 0, startY = 0;
        let targetX = 0, targetY = 0;
        let vx = 0, vy = 0;
        let raf = 0;

        // ================= FISIKA: gravitasi bumi + tali elastis =================
        // Model damped harmonic oscillator (pegas teredam) beneran, BUKAN pegas
        // yang gayanya dibatasi paksa kayak versi sebelumnya — itu penyebab bug
        // "tiba-tiba nyentak ke tengah": gaya yang di-cap flat di angka kecil tapi
        // dipertahankan terus tiap frame selama masih jauh dari tengah itu kayak
        // didorong roket bertenaga konstan, bukan melambat natural kayak pegas.
        //
        // Analoginya di dunia nyata — beban yang digantung di tali elastis (bungee):
        //   • Gravitasi (GRAVITY) selalu narik ke bawah, konstan, di posisi manapun.
        //   • Gaya pegas tali (Hukum Hooke, F = -k·x) itu PROPORSIONAL sama seberapa
        //     jauh diregangkan (makin jauh makin kuat, makin dekat makin lemah —
        //     gak pernah mentok di satu angka), dan cuma aktif kalau tali kenceng
        //     (diregangkan lebih dari panjang alaminya). Kalau tali kendor (kartu
        //     di atas posisi diam), gak ada gaya pegas sama sekali → jatuh bebas.
        //   • Redaman (damping) niru gesekan udara + kelenturan tali, bikin dia
        //     gak mantul selamanya — tiap ayunan makin kecil sampai akhirnya diam.
        //
        // ω (omega) = seberapa cepat pegas "pengen" balik ke posisi diam.
        // ζ (zeta, damping ratio) = seberapa banyak dia mantul sebelum berhenti;
        // ζ < 1 itu "underdamped" (masih keliatan mantul dikit, natural).
        const GRAVITY = 0.6;
        const OMEGA_Y = 0.09;
        const ZETA_Y = 0.5;
        const OMEGA_X = 0.1;
        const ZETA_X = 0.6;

        function updatePhysics() {
            if (isDragging) {
                // pas ditarik: kartu ngikutin kursor dengan sedikit "lag" halus,
                // gak lock 1:1, biar keliatan smooth
                vx += (targetX - currentX) * 0.28;
                vy += (targetY - currentY) * 0.28;
                vx *= 0.72;
                vy *= 0.72;
            } else {
                // horizontal: pegas teredam biasa (kayak bandul ayun balik ke
                // tengah), gaya & redamannya PROPORSIONAL (bukan di-cap), jadi
                // baliknya mulus — gak ada gravitasi ke samping
                const ax = -(OMEGA_X * OMEGA_X) * currentX - 2 * ZETA_X * OMEGA_X * vx;
                vx += ax;

                // vertical: gravitasi bumi + tali elastis (Hukum Hooke, F = -k·x).
                // currentY < 0 artinya kartu masih di atas posisi diam (tali
                // kendor) → jatuh bebas kena gravitasi doang, gak ada tarikan.
                // Begitu currentY >= 0 (tali kenceng), gravitasi + gaya pegas
                // proporsional + redaman jalan bareng, makanya mantul-mantul
                // dulu (makin kecil tiap ayunan) sebelum akhirnya diam.
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

            render(currentX, currentY, isDragging);

            raf = requestAnimationFrame(updatePhysics);
        }
        raf = requestAnimationFrame(updatePhysics);

        const onDown = (e: PointerEvent) => {
            isDragging = true;
            startX = e.clientX - currentX;
            startY = e.clientY - currentY;
            // reset target ke posisi kartu SEKARANG — sebelumnya target sisa
            // dari drag terakhir gak direset, jadi kalau abis itu cuma
            // klik/dobel-klik doang (tanpa gerak), fisika tetap narik ke
            // posisi lama itu dan kartunya keliatan geser sendiri
            targetX = currentX;
            targetY = currentY;
            card.setPointerCapture(e.pointerId);
            card.style.cursor = "grabbing";
            e.preventDefault();
        };
        const onMove = (e: PointerEvent) => {
            if (!isDragging) return;
            // bebas ditarik ke segala arah termasuk ke atas, tapi dikasih
            // batas biar tetap masuk akal (kayak tali yang ada batas
            // panjangnya) dan gak bikin fisikanya "meledak" pas dilepas
            targetX = Math.max(-260, Math.min(260, e.clientX - startX));
            targetY = Math.max(-350, Math.min(420, e.clientY - startY));
        };
        const onUp = (e: PointerEvent) => {
            if (!isDragging) return;
            isDragging = false;
            // vx/vy dari drag terakhir sengaja gak direset — biar momentum
            // pas ngelepas kebawa ke fase jatuh (kesannya lebih hidup)
            card.style.cursor = "grab";
            try { card.releasePointerCapture(e.pointerId); } catch { }
        };

        card.addEventListener("pointerdown", onDown);
        card.addEventListener("pointermove", onMove);
        card.addEventListener("pointerup", onUp);
        card.addEventListener("pointercancel", onUp);

        return () => {
            cancelAnimationFrame(raf);
            window.removeEventListener("resize", onResize);
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