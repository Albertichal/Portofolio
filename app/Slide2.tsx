"use client";

import { useEffect, useRef } from "react";
import Climber from "./Climber";
import { useFitTitle } from "./slideUtils";
import "./slide2.css";

const LEDE =
  "Mahasiswa Full Stack Developer. Saya telah membangun aplikasi Laravel yang dipakai sungguhan, dan memakai AI untuk bekerja lebih cerdas — bukan sekadar lebih keras.";

const SKILLS: [string, number][] = [
  ["Laravel", 95],
  ["PHP", 90],
  ["JavaScript", 85],
  ["TypeScript", 85],
  ["MySQL", 88],
  ["Tailwind CSS", 92],
  ["Python", 78],
  ["Stitch With Google", 72],
  ["ERP Implementation", 80],
  ["N8N Automation", 80],
];

const TOOLS: [string, string][] = [
  ["Claude", "Code review & architecture"],
  ["ChatGPT", "Problem solving & research"],
  ["Gemini", "brainstorming & Editting AI"],
];

const STATS: [string, string][] = [
  ["10", "Projects shipped"],
];

export default function Slide2() {
  const sectionRef = useRef<HTMLElement>(null);
  const titleRef = useRef<HTMLHeadingElement>(null);
  useFitTitle(titleRef);

  // Slide ini di-pin (sticky) supaya slide 3 bisa menimpanya. Kalau isinya lebih
  // tinggi dari layar (mis. di HP), top dibuat negatif supaya bagian bawahnya
  // tetap bisa dibaca sebelum slide 3 datang.
  useEffect(() => {
    const el = sectionRef.current!;
    const setTop = () => {
      el.style.top = `${Math.min(0, window.innerHeight - el.offsetHeight)}px`;
    };
    setTop();
    const ro = new ResizeObserver(setTop);
    ro.observe(el);
    window.addEventListener("resize", setTop);
    return () => {
      ro.disconnect();
      window.removeEventListener("resize", setTop);
    };
  }, []);

  return (
    <>
    <section ref={sectionRef} className="s2" aria-labelledby="s2-title">
      <div className="s2-wall" aria-hidden="true" />
      <Climber />

      <div className="s2-inner">
        <div className="s2-main">
          <h2 id="s2-title" ref={titleRef} className="s2-title">
            <span>The Journey</span>
            <span>So Far.</span>
          </h2>

          <p className="s2-lede">{LEDE}</p>

          <h3 className="s2-label">Technical skills</h3>
          <ul className="s2-skills">
            {SKILLS.map(([name, level]) => (
              <li key={name}>
                {name} <b>{level}</b>
              </li>
            ))}
          </ul>
        </div>

        <div className="s2-bottom">
          <ul className="s2-tools">
            {TOOLS.map(([name, role]) => (
              <li key={name}>
                <strong>{name}</strong>
                <span>{role}</span>
              </li>
            ))}
          </ul>

          <dl className="s2-stats">
            {STATS.map(([value, label]) => (
              <div key={label}>
                <dt>{value}</dt>
                <dd>{label}</dd>
              </div>
            ))}
          </dl>
        </div>
      </div>
    </section>

    {/* Jarak scroll kosong: slide 2 tetap diam & terbaca penuh sebelum slide 3 naik menimpa.
        Atur tingginya lewat .s2-dwell di slide2.css */}
    <div className="s2-dwell" aria-hidden="true" />
    </>
  );
}