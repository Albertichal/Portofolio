"use client";

import { useEffect, useRef } from "react";
import Climber from "../../Climber/Climber";
import { useFitTitle } from "../../../lib/slideUtils";
import "./slide3.css";

type Item = {
  kind: "main" | "left" | "right";
  year: string;
  tag: string;
  title: string;
  org?: string;
  points: string[];
  foot?: string;
  note?: [string, string];
};

const ITEMS: Item[] = [
  {
    kind: "main",
    year: "2023",
    tag: "The start",
    title: "SOFTWARE ENGINEERING STUDENT",
    org: "SMK Ibnu Sina - Batam",
    points: [
      "Started learning web development with PHP, SQL, and Laravel",
      "Built my first database-driven web applications",
      "Developed a strong interest in building software from scratch",
    ],
    foot: "GPA 3.37 — Graduated 2026",
    note: [
      "WHERE IT BEGAN.",
      "Started with curiosity about how websites work and turned it into a passion for building software from scratch.",
    ],
  },

  {
    kind: "right",
    year: "2024",
    tag: "Project",
    title: "E-COMMERCE DEVELOPER",
    org: "Interz1d",
    points: [
      "Developed an e-commerce website from scratch to deployment",
      "Implemented payment integration and inventory management",
    ],
  },

  {
    kind: "main",
    year: "2024",
    tag: "Internship",
    title: "ERP & WEB DEVELOPER",
    org: "Accounting & ERP Company",
    points: [
      "Worked on Point of Sale (POS) and e-commerce applications as part of the company's ERP ecosystem",
      "Integrated POS and e-commerce systems with the company's ERP platform to connect business data and processes",
      "Gained hands-on experience with ERP-based business processes, including sales, products, inventory, and transaction management",
      "Collaborated with the development team to build and integrate software solutions for business and accounting workflows",
    ],
    foot:
      "Learning impact: Gained practical experience developing and integrating web applications within an ERP and accounting environment.",
    note: [
      "TECHNOLOGY IN BUSINESS.",
      "Explored how technology supports real-world business operations through ERP, accounting, POS, and e-commerce systems.",
    ],
  },

  {
    kind: "left",
    year: "2025",
    tag: "Learning & Development",
    title: "AI & AUTOMATION",
    org: "n8n & Python",
    points: [
      "Learned Python and n8n for workflow automation and AI-powered solutions",
      "Built automated workflows and AI-based chatbots using n8n",
      "Integrated AI chatbot automation with ERP systems to support business processes",
    ],
    foot: "Focus: AI, automation, Python, n8n, and ERP integration",
  },

  {
    kind: "main",
    year: "2026",
    tag: "Now",
    title: "FRONT-END DEVELOPMENT",
    org: "JavaScript & TypeScript",
    points: [
      "Started learning modern front-end development with JavaScript and TypeScript",
      "Exploring Next.js, Vue, and Vite for modern web development",
      "Learning component-based architecture and modern front-end development workflows",
    ],
    foot: "Focus: JavaScript, TypeScript, Next.js, Vue, and Vite",
    note: [
      "THE NEXT STEP.",
      "Expanding from automation and backend workflows into modern front-end development.",
    ],
  },
];

export default function Slide3() {
  const titleRef = useRef<HTMLHeadingElement>(null);
  const tlRef = useRef<HTMLOListElement>(null);
  const spiderRef = useRef<HTMLDivElement>(null);

  useFitTitle(titleRef);

  // Laba-laba turun/naik di benang mengikuti scroll.
  // Benang yang sudah dilewati solid, sisanya putus-putus.
  useEffect(() => {
    const tl = tlRef.current!;
    const spider = spiderRef.current!;
    const items = Array.from(
      tl.querySelectorAll<HTMLElement>(".tl-item")
    );

    let raf = 0;
    let lastY = window.scrollY;
    let moveTimer = 0;

    const update = () => {
      raf = 0;

      const mid = window.innerHeight * 0.5;
      const r = tl.getBoundingClientRect();
      const p = Math.min(
        r.height,
        Math.max(0, mid - r.top)
      );

      tl.style.setProperty("--p", `${p}px`);

      // Item yang sedang dilewati garis tengah menjadi aktif
      items.forEach((it) => {
        const b = it.getBoundingClientRect();

        it.classList.toggle(
          "is-active",
          b.top < mid && b.bottom > mid
        );
      });

      // Arah laba-laba
      const y = window.scrollY;

      if (y !== lastY) {
        spider.dataset.dir =
          y > lastY ? "down" : "up";

        spider.classList.add("is-moving");

        window.clearTimeout(moveTimer);

        moveTimer = window.setTimeout(() => {
          spider.classList.remove("is-moving");
        }, 160);

        lastY = y;
      }
    };

    const onScroll = () => {
      if (!raf) {
        raf = requestAnimationFrame(update);
      }
    };

    update();

    window.addEventListener("scroll", onScroll, {
      passive: true,
    });

    window.addEventListener("resize", onScroll);

    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);

      window.clearTimeout(moveTimer);

      if (raf) {
        cancelAnimationFrame(raf);
      }
    };
  }, []);

  return (
    <section className="s3" aria-labelledby="s3-title">
      <div className="s3-bg" aria-hidden="true" />

      <Climber />

      <div className="s3-inner">
        <div className="s3-head">
          <h2
            id="s3-title"
            ref={titleRef}
            className="s3-title"
          >
            <span>From Student</span>
            <span>To Shipping.</span>
          </h2>
        </div>

        <ol ref={tlRef} className="tl">
          <li className="tl-rail" aria-hidden="true">
            <span className="tl-line" />
            <span className="tl-fill" />

            <div
              ref={spiderRef}
              className="tl-spider"
              data-dir="down"
            >
              <svg viewBox="-16 -16 32 32">
                <g
                  fill="none"
                  stroke="#f4f4f6"
                  strokeWidth="1.3"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path
                    className="leg"
                    d="M-2 -4 L-8 -10 L-13 -9"
                  />
                  <path
                    className="leg"
                    d="M-2.5 -2 L-10 -4.5 L-14.5 -1.5"
                  />
                  <path
                    className="leg"
                    d="M-2.5 1 L-10 3 L-14 8"
                  />
                  <path
                    className="leg"
                    d="M-2 3.5 L-8 9 L-10 14"
                  />
                  <path
                    className="leg"
                    d="M2 -4 L8 -10 L13 -9"
                  />
                  <path
                    className="leg"
                    d="M2.5 -2 L10 -4.5 L14.5 -1.5"
                  />
                  <path
                    className="leg"
                    d="M2.5 1 L10 3 L14 8"
                  />
                  <path
                    className="leg"
                    d="M2 3.5 L8 9 L10 14"
                  />
                </g>

                <ellipse
                  cx="0"
                  cy="5"
                  rx="4.2"
                  ry="6.2"
                  fill="#f4f4f6"
                />

                <circle
                  cx="0"
                  cy="-3.5"
                  r="3"
                  fill="#f4f4f6"
                />

                <path
                  d="M-1.7 2 L1.7 2 L0 5 L1.7 8 L-1.7 8 L0 5 Z"
                  fill="#101010"
                />
              </svg>
            </div>
          </li>

          {ITEMS.map((it, index) => (
            <li
              key={it.year + it.title}
              className={`tl-item tl-${it.kind} ${index % 2 === 0
                  ? "tl-year-left"
                  : "tl-year-right"
                }`}
            >
              <span className="tl-year">
                {it.year}
              </span>

              <article className="tl-card">
                <p className="tl-tag">
                  {it.tag}
                </p>

                <h3 className="tl-title">
                  {it.title}
                </h3>

                {it.org && (
                  <p className="tl-org">
                    {it.org}
                  </p>
                )}

                <ul className="tl-points">
                  {it.points.map((p) => (
                    <li key={p}>{p}</li>
                  ))}
                </ul>

                {it.foot && (
                  <p className="tl-foot">
                    {it.foot}
                  </p>
                )}
              </article>

              {it.note && (
                <p className="tl-note">
                  <strong>{it.note[0]}</strong>{" "}
                  {it.note[1]}
                </p>
              )}
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}