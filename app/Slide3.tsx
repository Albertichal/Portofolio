"use client";

import { useEffect, useRef } from "react";
import Climber from "./Climber";
import { useFitTitle } from "./slideUtils";
import "./slide3.css";

type Item = {
  kind: "main" | "left" | "right"; // main = kartu besar di tengah, left/right = kartu kecil di samping
  year: string;
  tag: string;
  title: string;
  org?: string;
  points: string[];
  foot?: string;
  note?: [string, string]; // [kalimat tebal, sisanya]
};

// TEKS SEMENTARA (struktur & isi dari ibnuhakim.id) - ganti sendiri nanti
const ITEMS: Item[] = [
  {
    kind: "main",
    year: "2023",
    tag: "The start",
    title: "software engineering Student",
    org: "SMK Ibnu Sina - Batam",
    points: [
      "First lines of PHP, SQL and Laravel",
      "Built the first database-driven web application",
      "Found the thing worth staying up for",
    ],
    foot: "GPA 3.37 — Graduated 2026",
    note: [
      "Where it began.",
      "This is where it all began. Curiosity about how websites work grew into an interest, which then evolved into a habit of building things from start to finish.",
    ],
  },
  {
    kind: "right",
    year: "2024",
    tag: "Project",
    title: "Web Developer",
    org: "Interz1d",
    points: ["E-commerce from scratch to deployment", "Payment integration & inventory"],
  },
  {
    kind: "main",
    year: "2024",
    tag: "Volunteer",
    title: "Dashboard Developer",
    org: "Humanity Project Batch 2 — Bayah",
    points: [
      "Actively participated in developing a disaster evacuation point dashboard using Tableau",
      "Integrated the dashboard with a website to provide real-time visualization of evacuation locations",
      "Performed data processing and cleaning to ensure disaster information accuracy",
      "Collaborated with the team to provide technology solutions that help communities during disasters",
    ],
    foot: "Social impact: contributed to community safety through accessible disaster information",
    note: [
      "Technology that helps.",
      "A disaster evacuation dashboard built with Tableau and wired into a public website, so the information reaches people when it matters.",
    ],
  },
  {
    kind: "left",
    year: "2025",
    tag: "Certification",
    title: "Revou & CISDV",
    org: "Passas Institute",
    points: ["Tech education programme", "Information system data visualization"],
    foot: "Two certificates",
  },
  {
    kind: "main",
    year: "2025",
    tag: "Internship",
    title: "Back-end Developer Intern",
    org: "Pusdatin Kemhan — Jakarta, Indonesia",
    points: [
      "Developed the Open Data Kemhan prototype website as a national defense data transparency platform",
      "Designed and implemented the database architecture and API contracts",
      "Worked with the front-end team on integration and testing before release",
    ],
    note: [
      "Where the ministry taught me.",
      "Four months on Open Data Kemhan: the database architecture, the API contract with the front end, and the testing that makes it safe to ship.",
    ],
  },
  {
    kind: "main",
    year: "2026",
    tag: "Now",
    title: "Web Application Developer",
    org: "Kemnaker RI — South Jakarta, Indonesia",
    points: [
      "Redesigning the regional IPK measurement system across all 38 provinces of Indonesia",
      "Improving measurement accuracy and consistency so evaluation rests on comparable numbers",
      "Restructuring how the data is organised, making it usable as a basis for policy decisions",
      "Working within a national government platform where reliability matters more than novelty",
    ],
    foot: "Scope: a measurement system used across 38 provinces",
    note: [
      "From student to the ministry.",
      "Now inside Kemnaker RI, rebuilding a measurement system that 38 provinces report through — where being right matters more than being clever.",
    ],
  },
];

export default function Slide3() {
  const titleRef = useRef<HTMLHeadingElement>(null);
  const tlRef = useRef<HTMLOListElement>(null);
  const spiderRef = useRef<HTMLDivElement>(null);
  useFitTitle(titleRef);

  // Laba-laba turun/naik di benang mengikuti scroll (posisinya di tengah layar).
  // Benang yang sudah dilewati solid, sisanya putus-putus.
  useEffect(() => {
    const tl = tlRef.current!;
    const spider = spiderRef.current!;
    const items = Array.from(tl.querySelectorAll<HTMLElement>(".tl-item"));
    let raf = 0;
    let lastY = window.scrollY;
    let moveTimer = 0;

    const update = () => {
      raf = 0;
      const mid = window.innerHeight * 0.5;
      const r = tl.getBoundingClientRect();
      const p = Math.min(r.height, Math.max(0, mid - r.top));
      tl.style.setProperty("--p", `${p}px`);

      // item yang sedang dilewati garis tengah jadi "aktif"
      items.forEach((it) => {
        const b = it.getBoundingClientRect();
        it.classList.toggle("is-active", b.top < mid && b.bottom > mid);
      });

      // arah laba-laba: scroll turun = kepala ke bawah, scroll naik = kepala ke atas
      const y = window.scrollY;
      if (y !== lastY) {
        spider.dataset.dir = y > lastY ? "down" : "up";
        spider.classList.add("is-moving");
        window.clearTimeout(moveTimer);
        moveTimer = window.setTimeout(() => spider.classList.remove("is-moving"), 160);
        lastY = y;
      }
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
      window.clearTimeout(moveTimer);
      if (raf) cancelAnimationFrame(raf);
    };
  }, []);

  return (
    <section className="s3" aria-labelledby="s3-title">
      <div className="s3-bg" aria-hidden="true" />
      <Climber />

      <div className="s3-inner">
        <div className="s3-head">
          <h2 id="s3-title" ref={titleRef} className="s3-title">
            <span>From Student</span>
            <span>To Shipping.</span>
          </h2>
        </div>

        <ol ref={tlRef} className="tl">
          <li className="tl-rail" aria-hidden="true">
            <span className="tl-line" />
            <span className="tl-fill" />
            <div ref={spiderRef} className="tl-spider" data-dir="down">
              <svg viewBox="-16 -16 32 32">
                <g fill="none" stroke="#f4f4f6" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round">
                  <path className="leg" d="M-2 -4 L-8 -10 L-13 -9" />
                  <path className="leg" d="M-2.5 -2 L-10 -4.5 L-14.5 -1.5" />
                  <path className="leg" d="M-2.5 1 L-10 3 L-14 8" />
                  <path className="leg" d="M-2 3.5 L-8 9 L-10 14" />
                  <path className="leg" d="M2 -4 L8 -10 L13 -9" />
                  <path className="leg" d="M2.5 -2 L10 -4.5 L14.5 -1.5" />
                  <path className="leg" d="M2.5 1 L10 3 L14 8" />
                  <path className="leg" d="M2 3.5 L8 9 L10 14" />
                </g>
                <ellipse cx="0" cy="5" rx="4.2" ry="6.2" fill="#f4f4f6" />
                <circle cx="0" cy="-3.5" r="3" fill="#f4f4f6" />
                <path d="M-1.7 2 L1.7 2 L0 5 L1.7 8 L-1.7 8 L0 5 Z" fill="#101010" />
              </svg>
            </div>
          </li>

          {ITEMS.map((it) => (
            <li key={it.year + it.title} className={`tl-item tl-${it.kind}`}>
              <span className="tl-year">{it.year}</span>

              <article className="tl-card">
                <p className="tl-tag">{it.tag}</p>
                <h3 className="tl-title">{it.title}</h3>
                {it.org && <p className="tl-org">{it.org}</p>}
                <ul className="tl-points">
                  {it.points.map((p) => (
                    <li key={p}>{p}</li>
                  ))}
                </ul>
                {it.foot && <p className="tl-foot">{it.foot}</p>}
              </article>

              {it.note && (
                <p className="tl-note">
                  <strong>{it.note[0]}</strong> {it.note[1]}
                </p>
              )}
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}