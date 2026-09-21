'use client';

import { useEffect } from 'react';
import Slide2 from './Slide2';
import Slide3 from './Slide3';

export default function Home() {
  useEffect(() => {
    let alive = true; // false saat komponen unmount (aman untuk React Strict Mode)
    const SRC = { mask: "/assets/mask.webp", face: "/assets/face.webp" };

    const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
    const isMobile = matchMedia('(max-width: 899px)').matches;
    const $ = (s: string) => document.querySelector(s) as HTMLElement | null;
    const stage = $('#stage'), canvas = $('#gl') as HTMLCanvasElement | null, pre = $('#pre'), hint = $('#hint');
    const sleep = (ms: number) => new Promise(r => setTimeout(r, ms));
    const easeInOut = (k: number) => k < .5 ? 4 * k * k * k : 1 - Math.pow(-2 * k + 2, 3) / 2;
    const easeOut = (k: number) => 1 - Math.pow(1 - k, 3);

    function tween(ms: number, ease: (k: number) => number, fn: (val: number) => void) {
      return new Promise<void>(res => {
        if (ms <= 0) { fn(1); res(); return; }
        const t0 = performance.now();
        (function tick(now: number) {
          const k = Math.min(1, (now - t0) / ms);
          fn(ease(k));
          k < 1 ? requestAnimationFrame(tick) : res();
        })(t0);
      });
    }

    // ---- Interactive Elastic Corners (Spring Physics) ----
    function makeDraggable(el: HTMLElement) {
      let isDragging = false;
      let startX = 0, startY = 0;
      let currentX = 0, currentY = 0;
      let vx = 0, vy = 0;

      function updatePhysics() {
        if (!isDragging) {
          vx += (0 - currentX) * 0.15;
          vy += (0 - currentY) * 0.15;
          vx *= 0.8;
          vy *= 0.8;
          currentX += vx;
          currentY += vy;
        }
        el.style.transform = `translate(${currentX}px, ${currentY}px) scale(${isDragging ? 1.15 : 1})`;
        requestAnimationFrame(updatePhysics);
      }
      requestAnimationFrame(updatePhysics);

      el.addEventListener('pointerdown', (e: PointerEvent) => {
        isDragging = true;
        startX = e.clientX - currentX;
        startY = e.clientY - currentY;
        el.setPointerCapture(e.pointerId);
        // di HP jangan blokir gesture bawaan, supaya halaman tetap bisa di-scroll
        if (e.pointerType !== 'touch') e.preventDefault();
      });

      el.addEventListener('pointermove', (e: PointerEvent) => {
        if (!isDragging) return;
        currentX = e.clientX - startX;
        currentY = e.clientY - startY;
      });

      const stopDrag = (e: PointerEvent) => {
        if (!isDragging) return;
        isDragging = false;
        try { el.releasePointerCapture(e.pointerId); } catch (err) { }
      };

      el.addEventListener('pointerup', stopDrag);
      el.addEventListener('pointercancel', stopDrag);
    }

    document.querySelectorAll('.interactive-corner').forEach(el => makeDraggable(el as HTMLElement));

    // ---- Headline Sizing ----
    // Ukuran ditulis langsung ke style h1, jadi font-size di CSS tidak berpengaruh.
    // Atur ukuran mobile lewat dua konstanta ini.
    const MOBILE_WIDTH_RATIO = .6; // headline memakai ±60% lebar layar di mobile
    const MOBILE_MAX_PX = 52;      // batas atas font headline di mobile
    const h1 = $('h1');
    function fitHeadline() {
      if (!h1) return;
      const wide = innerWidth >= 900;
      const avail = wide ? innerWidth * .46 : (innerWidth - 40) * MOBILE_WIDTH_RATIO;
      h1.style.fontSize = '60px';
      let w = 0;
      h1.querySelectorAll('span').forEach(s => { w = Math.max(w, s.getBoundingClientRect().width); });
      if (w) h1.style.fontSize = Math.min(avail / w * 60, wide ? 110 : MOBILE_MAX_PX) + 'px';
    }
    fitHeadline();
    if (document.fonts) { document.fonts.ready.then(fitHeadline); document.fonts.addEventListener('loadingdone', fitHeadline); }
    addEventListener('resize', fitHeadline);

    // ---- Web Geometry ----
    function web(R: number, spokes: number, rings: number, sag: number, animated: boolean, r0 = 0, base = 0) {
      const ring = (r: number) => Array.from({ length: spokes }, (_, i) => {
        const a = i / spokes * Math.PI * 2 - Math.PI / 2;
        return [Math.cos(a) * r, Math.sin(a) * r];
      });
      const f = (n: number) => n.toFixed(2);
      const d: string[] = [], delays: number[] = [];
      const inner = ring(r0);
      ring(R).forEach(([x, y], i) => { d.push(`M${f(inner[i][0])} ${f(inner[i][1])}L${f(x)} ${f(y)}`); delays.push(base + i * 30); });
      for (let k = 1; k <= rings; k++) {
        const p = ring(r0 + (R - r0) * Math.pow(k / rings, .92));
        let s = `M${f(p[0][0])} ${f(p[0][1])}`;
        for (let i = 1; i <= spokes; i++) {
          const a = p[i % spokes], b = p[i - 1];
          s += `Q${f((a[0] + b[0]) / 2 * (1 - sag))} ${f((a[1] + b[1]) / 2 * (1 - sag))} ${f(a[0])} ${f(a[1])}`;
        }
        d.push(s); delays.push(base + 260 + k * 85);
      }
      return d.map((p, i) => `<path pathLength="1" d="${p}"${animated ? ` style="--d:${delays[i]}ms"` : ''}/>`).join('');
    }
    const bgWebEl = $('#bgWeb');
    if (bgWebEl) bgWebEl.innerHTML = web(100, 14, 9, .34, false);

    // Jaring preloader: digambar dari tepi logo ke luar (r0 = radius awal, samakan dengan lebar logo).
    // Argumen terakhir = jeda (ms) sebelum jaring mulai, supaya logo muncul duluan.
    const preWebEl = $('#preWebPaths');
    if (preWebEl) preWebEl.innerHTML = web(80, 14, 4, .20, true, 40, 350);

    // ---- Cursor Trail (peta "bekas kursor" untuk efek intip foto sebelumnya) ----
    // Canvas 2D kecil: kursor "mengecat" putih, lalu pelan-pelan memudar ke hitam.
    // Hasilnya dikirim ke shader sebagai texture uTrail.
    const TR = 256;
    const trailCv = document.createElement('canvas');
    trailCv.width = trailCv.height = TR;
    const tctx = trailCv.getContext('2d')!;
    tctx.fillStyle = '#000';
    tctx.fillRect(0, 0, TR, TR);
    const BRUSH = TR * (isMobile ? .07 : .05); // ukuran efek; jari lebih besar dari kursor
    const TRAIL_LIFE = 450;                    // ms sebelum jejak hilang total
    const MAX_SHARDS = 500;

    // Tiap pecahan disimpan dengan waktu lahirnya, lalu digambar ulang tiap frame
    // dengan alpha yang turun linear ke 0. Jadi jejak pasti hilang bersih
    // (tidak ada sisa samar seperti pada cara "memudar bertahap" di canvas).
    type Shard = { pts: number[]; born: number; a: number };
    const shards: Shard[] = [];

    // Kuas acak: tiap stamp menebar beberapa pecahan bersudut dengan ukuran,
    // posisi, dan rotasi acak di sekitar kursor, jadi bentuknya tidak pernah bulat.
    function stamp(x: number, y: number) {
      const now = performance.now();
      const count = 4 + Math.floor(Math.random() * 3); // 4-6 pecahan
      for (let i = 0; i < count; i++) {
        const a = Math.random() * Math.PI * 2;
        const dist = Math.random() * BRUSH * .7;
        const cx = x + Math.cos(a) * dist;
        const cy = y + Math.sin(a) * dist;
        const r = BRUSH * (.2 + Math.random() * .35);
        const n = 5 + Math.floor(Math.random() * 3);
        const rot = Math.random() * Math.PI * 2;
        const pts: number[] = [];
        for (let k = 0; k < n; k++) {
          const ang = rot + k / n * Math.PI * 2 + (Math.random() - .5) * .6;
          const rr = r * (.45 + Math.random() * .75);
          pts.push(cx + Math.cos(ang) * rr, cy + Math.sin(ang) * rr);
        }
        shards.push({ pts, born: now, a: .75 + Math.random() * .25 });
      }
      if (shards.length > MAX_SHARDS) shards.splice(0, shards.length - MAX_SHARDS);
    }

    // Gambar ulang peta jejak dari nol. Mengembalikan jumlah pecahan yang masih hidup.
    function paintTrail() {
      const now = performance.now();
      tctx.fillStyle = '#000';
      tctx.fillRect(0, 0, TR, TR);
      let w = 0;
      for (let i = 0; i < shards.length; i++) {
        const s = shards[i];
        const life = 1 - (now - s.born) / TRAIL_LIFE;
        if (life <= 0) continue;
        shards[w++] = s;
        tctx.fillStyle = `rgba(255,255,255,${(s.a * life).toFixed(3)})`;
        tctx.beginPath();
        tctx.moveTo(s.pts[0], s.pts[1]);
        for (let k = 2; k < s.pts.length; k += 2) tctx.lineTo(s.pts[k], s.pts[k + 1]);
        tctx.closePath();
        tctx.fill();
      }
      shards.length = w;
      return w;
    }

    // ---- Peta alpha foto (hit-test) ----
    // Dipakai supaya di HP: sentuhan DI LUAR bentuk foto tidak diambil alih,
    // jadi halaman tetap bisa di-scroll ke Slide 2. Sentuhan DI ATAS foto
    // tetap menjalankan efek intip seperti biasa.
    const HT = 128;                 // resolusi peta; kecil sudah cukup
    const HT_ALPHA = 24;            // ambang alpha (0-255) yang dianggap "ada isinya"
    let htData: Uint8ClampedArray | null = null;

    function buildHitMap(...imgs: HTMLImageElement[]) {
      const c = document.createElement('canvas');
      c.width = c.height = HT;
      const x = c.getContext('2d', { willReadFrequently: true });
      if (!x) return;
      // gabungkan mask + face supaya area yang dipakai kedua foto ikut terhitung
      imgs.forEach(im => { try { x.drawImage(im, 0, 0, HT, HT); } catch (e) { } });
      try { htData = x.getImageData(0, 0, HT, HT).data; } catch (e) { htData = null; }
    }

    // true kalau titik layar ini jatuh di piksel foto yang kelihatan
    function onPhoto(clientX: number, clientY: number) {
      if (!stage) return false;
      if (!htData) return true; // peta gagal dibuat -> pakai perilaku lama
      const r = stage.getBoundingClientRect();
      const u = (clientX - r.left) / r.width;
      const v = (clientY - r.top) / r.height;
      if (u < 0 || u > 1 || v < 0 || v > 1) return false;
      const px = Math.min(HT - 1, Math.max(0, Math.floor(u * HT)));
      const py = Math.min(HT - 1, Math.max(0, Math.floor(v * HT)));
      // cek 3x3 biar tepi foto tetap enak disentuh dengan jari
      for (let dy = -1; dy <= 1; dy++) {
        for (let dx = -1; dx <= 1; dx++) {
          const qx = px + dx, qy = py + dy;
          if (qx < 0 || qy < 0 || qx >= HT || qy >= HT) continue;
          if (htData[(qy * HT + qx) * 4 + 3] > HT_ALPHA) return true;
        }
      }
      return false;
    }

    // true selama jari yang sedang menyentuh layar memang mendarat di atas foto
    let touchOnPhoto = false;

    // ---- WebGL & Dissolve Effect ----
    const VERT = `attribute vec2 a; varying vec2 vUv;
      void main(){ vUv = a * .5 + .5; gl_Position = vec4(a, 0., 1.); }`;
    const FRAG = `
      #ifdef GL_FRAGMENT_PRECISION_HIGH
      precision highp float;
      #else
      precision mediump float;
      #endif
      varying vec2 vUv;
      uniform sampler2D uMask, uFace, uTrail;
      uniform float uP, uSeed, uTime, uEdge, uDir, uAlt;
      uniform vec2 uShift;

      float hash(vec2 p){ p = fract(p * vec2(123.34, 456.21)); p += dot(p, p + 45.32); return fract(p.x * p.y); }
      float vnoise(vec2 p){
        vec2 i = floor(p), f = fract(p); f = f * f * (3. - 2. * f);
        return mix(mix(hash(i), hash(i + vec2(1., 0.)), f.x),
                   mix(hash(i + vec2(0., 1.)), hash(i + vec2(1., 1.)), f.x), f.y);
      }
      float fbm(vec2 p){
        float v = 0., a = .5;
        for (int i = 0; i < 4; i++){ v += a * vnoise(p); p *= 2.03; a *= .5; }
        return v;
      }

      void main(){
        float n = smoothstep(.12, .88, fbm(vUv * vec2(4., 5.5) + uSeed) / .9375);
        n = .8 * n + .2 * mix(vUv.y, 1. - vUv.y, uDir);
        float t = mix(-uEdge, 1. + uEdge, uP);
        float d = t - n;
        float band = 1. - smoothstep(0., uEdge, abs(d));
        vec2 off = vec2(sin(vUv.y * 90. + uTime * 18.), 0.) * band * .006;
        // foto bergeser pelan mengikuti kursor; peta jejak (uTrail) tetap di ruang layar
        vec2 uv = vUv - uShift;
        vec4 m = texture2D(uMask, uv + off);
        vec4 f = texture2D(uFace, uv + off);
        vec4 c = mix(m, f, smoothstep(-.006, .006, d));

        // --- Intip foto sebelumnya di area kursor ---
        // uAlt = 1 -> foto sekarang wajah, jadi yang diintip = topeng (dan sebaliknya)
        float tr = texture2D(uTrail, vUv).r;
        float tn = fbm(vUv * 16. + uSeed * .37 + uTime * .2) / .9375;
        float tv = tr + (tn - .5) * .6;               // tepi bergerigi & terkikis acak
        float rev = smoothstep(.40, .48, tv);
        float rim = smoothstep(.30, .42, tv) * (1. - smoothstep(.48, .60, tv));
        vec4 alt = mix(f, m, uAlt);
        c = mix(c, alt, rev);
        c.rgb = min(c.rgb + vec3(.74, .82, 1.) * rim * .8 * c.a, vec3(c.a));

        vec2 center = vec2(0.5, 0.68);
        float dist = distance(vUv, center);
        float halo = smoothstep(0.45, 0.0, dist) * (0.08 + 0.04 * sin(uTime * 1.5));
        c.rgb += vec3(halo) * c.a;
        
        float core = 1. - smoothstep(0., uEdge * .28, abs(d));
        vec3 glow = vec3(.74, .82, 1.) * band * band * 1.0 + vec3(1.) * core * .9;
        c.rgb = min(c.rgb + glow * c.a, vec3(c.a));
        gl_FragColor = c;
      }`;

    const st = { p: 0, seed: Math.random() * 100, dir: 1, sx: 0, sy: 0 };
    let gl: WebGLRenderingContext | null = null, draw = () => { };

    function loadImg(src: string): Promise<HTMLImageElement> {
      return new Promise((res, rej) => {
        const im = new Image();
        im.onload = () => res(im);
        im.onerror = rej;
        im.src = src;
      });
    }

    function initGL(imgMask: HTMLImageElement, imgFace: HTMLImageElement) {
      if (!canvas) return false;
      gl = canvas.getContext('webgl', { alpha: true, premultipliedAlpha: true, antialias: false, powerPreference: 'low-power' });
      if (!gl) return false;
      const sh = (type: number, src: string) => {
        if (!gl) return null;
        const s = gl.createShader(type);
        if (!s) return null;
        gl.shaderSource(s, src); gl.compileShader(s);
        if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) throw new Error(gl.getShaderInfoLog(s) || '');
        return s;
      };
      const prog = gl.createProgram();
      if (!prog) return false;
      const vs = sh(gl.VERTEX_SHADER, VERT);
      const fs = sh(gl.FRAGMENT_SHADER, FRAG);
      if (!vs || !fs) return false;

      gl.attachShader(prog, vs);
      gl.attachShader(prog, fs);
      gl.linkProgram(prog);
      if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) throw new Error(gl.getProgramInfoLog(prog) || '');
      gl.useProgram(prog);

      const buf = gl.createBuffer();
      gl.bindBuffer(gl.ARRAY_BUFFER, buf);
      gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]), gl.STATIC_DRAW);
      const loc = gl.getAttribLocation(prog, 'a');
      gl.enableVertexAttribArray(loc);
      gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0);

      gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
      gl.pixelStorei(gl.UNPACK_PREMULTIPLY_ALPHA_WEBGL, true);
      const tex = (unit: number, img: HTMLImageElement | HTMLCanvasElement) => {
        if (!gl) return null;
        const t = gl.createTexture();
        gl.activeTexture(gl.TEXTURE0 + unit);
        gl.bindTexture(gl.TEXTURE_2D, t);
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, img);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
        return t;
      };
      tex(0, imgMask); tex(1, imgFace);
      const trailTex = tex(2, trailCv);
      gl.uniform1i(gl.getUniformLocation(prog, 'uMask'), 0);
      gl.uniform1i(gl.getUniformLocation(prog, 'uFace'), 1);
      gl.uniform1i(gl.getUniformLocation(prog, 'uTrail'), 2);
      gl.uniform1f(gl.getUniformLocation(prog, 'uEdge'), .055);
      const uP = gl.getUniformLocation(prog, 'uP');
      const uSeed = gl.getUniformLocation(prog, 'uSeed');
      const uTime = gl.getUniformLocation(prog, 'uTime');
      const uDir = gl.getUniformLocation(prog, 'uDir');
      const uAlt = gl.getUniformLocation(prog, 'uAlt');
      const uShift = gl.getUniformLocation(prog, 'uShift');

      draw = () => {
        if (!gl) return;
        // update texture jejak kursor tiap frame
        gl.activeTexture(gl.TEXTURE2);
        gl.bindTexture(gl.TEXTURE_2D, trailTex);
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, trailCv);

        gl.uniform1f(uP, st.p);
        gl.uniform1f(uSeed, st.seed);
        gl.uniform1f(uDir, st.dir);
        gl.uniform1f(uAlt, st.p > .5 ? 1 : 0);
        gl.uniform2f(uShift, st.sx, st.sy);
        gl.uniform1f(uTime, performance.now() / 1000);
        gl.clearColor(0, 0, 0, 0);
        gl.clear(gl.COLOR_BUFFER_BIT);
        gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
      };

      const fit = () => {
        if (!stage || !canvas) return;
        // di HP resolusi dibatasi 1.5x supaya ringan
        const w = Math.max(2, Math.round(stage.getBoundingClientRect().width * Math.min(devicePixelRatio || 1, isMobile ? 1.5 : 2)));
        if (canvas.width !== w) { canvas.width = canvas.height = w; gl?.viewport(0, 0, w, w); draw(); }
      };
      const resizeObserver = new ResizeObserver(fit);
      if (stage) resizeObserver.observe(stage);
      fit();
      return true;
    }

    let busy = true, ready = false, idleTimer: NodeJS.Timeout | number = 0;

    function idle() {
      clearTimeout(idleTimer as number);
      if (reduce) return;
      idleTimer = setTimeout(async () => {
        if (document.hidden || busy || st.p < .99) { idle(); return; }
        busy = true;
        st.seed = Math.random() * 100;
        st.dir = 0;
        await tween(170, easeOut, k => { st.p = 1 - .26 * k; draw(); });
        await tween(650, easeInOut, k => { st.p = .74 + .26 * k; draw(); });
        busy = false;
        idle();
      }, 4500 + Math.random() * 3500);
    }

    function toggle(e?: Event) {
      if (!ready || busy) return;
      // klik/tap di luar bentuk foto: abaikan, biar area kosong terasa "bukan tombol"
      if (e && 'clientX' in (e as MouseEvent)) {
        const me = e as MouseEvent;
        if (!onPhoto(me.clientX, me.clientY)) return;
      }
      hint?.classList.add('gone');
      if (!gl) { stage?.classList.toggle('is-mask'); return; }
      busy = true;
      st.seed = Math.random() * 100;
      const from = st.p, to = from > .5 ? 0 : 1;
      st.dir = to;
      tween(reduce ? 0 : 1500, easeInOut, k => { st.p = from + (to - from) * k; draw(); })
        .then(() => { busy = false; if (to === 1) idle(); });
    }
    const clickHandler = (e: Event) => toggle(e);
    stage?.addEventListener('click', clickHandler);
    const keyHandler = (e: KeyboardEvent) => {
      if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); toggle(); }
    };
    stage?.addEventListener('keydown', keyHandler);

    // ---- Cursor / jari digeser -> area sekitar kembali ke foto sebelumnya ----
    let lastPt: { x: number; y: number } | null = null;
    let trailRaf = 0, lastT = 0;
    // Seberapa jauh foto bergeser mengikuti kursor (satuan: fraksi lebar foto).
    // Naikkan untuk gerak lebih terasa, turunkan untuk lebih halus.
    const SHIFT = isMobile ? .2 : .4;
    let tShiftX = 0, tShiftY = 0;

    function trailLoop(now: number) {
      trailRaf = 0;
      if (!alive) return;
      const dt = Math.min(50, lastT ? now - lastT : 16);
      lastT = now;
      const alivePieces = paintTrail();
      // foto mengejar target dengan gerak halus (berbasis waktu)
      const ease = 1 - Math.pow(.88, dt / 16.7);
      st.sx += (tShiftX - st.sx) * ease;
      st.sy += (tShiftY - st.sy) * ease;
      draw();
      const settling = Math.abs(tShiftX - st.sx) > .0002 || Math.abs(tShiftY - st.sy) > .0002;
      if (alivePieces > 0 || settling) trailRaf = requestAnimationFrame(trailLoop);
      else lastT = 0;
    }
    function kickTrail() {
      if (!trailRaf) trailRaf = requestAnimationFrame(trailLoop);
    }

    const onMove = (e: PointerEvent) => {
      if (!gl || !ready || reduce || !stage) return;
      // jari yang mendarat di luar foto: jangan diproses sama sekali,
      // supaya scroll halaman berjalan normal
      if (e.pointerType === 'touch' && !touchOnPhoto) return;
      // mouse: efek hanya aktif saat kursor benar-benar di atas foto
      if (e.pointerType !== 'touch' && !onPhoto(e.clientX, e.clientY)) { releasePt(); return; }
      const r = stage.getBoundingClientRect();
      const x = (e.clientX - r.left) / r.width * TR;
      const y = (e.clientY - r.top) / r.height * TR;
      // target geser foto: kursor di kanan -> foto ke kanan, kursor di atas -> foto ke atas
      tShiftX = (x / TR - .5) * SHIFT;
      tShiftY = -(y / TR - .5) * SHIFT;
      if (lastPt) {
        // isi jarak antar event supaya goresan mulus, tidak putus-putus
        const dx = x - lastPt.x, dy = y - lastPt.y;
        const steps = Math.max(1, Math.ceil(Math.hypot(dx, dy) / (BRUSH * .6)));
        for (let i = 1; i <= steps; i++) stamp(lastPt.x + dx * i / steps, lastPt.y + dy * i / steps);
      } else {
        stamp(x, y);
      }
      lastPt = { x, y };
      kickTrail();
    };
    const resetPt = () => { lastPt = null; };
    // kursor/jari meninggalkan foto -> foto pelan-pelan balik ke tengah
    const releasePt = () => { lastPt = null; tShiftX = 0; tShiftY = 0; kickTrail(); };
    stage?.addEventListener('pointermove', onMove);
    stage?.addEventListener('pointerdown', resetPt);
    stage?.addEventListener('pointerup', resetPt);
    stage?.addEventListener('pointerleave', releasePt);
    stage?.addEventListener('pointercancel', releasePt);

    // ---- Touch: tentukan sekali di awal, jari ini di atas foto atau bukan ----
    // CSS memberi .stage touch-action: pan-y di mobile, jadi scroll baru benar-benar
    // diblokir kalau kita preventDefault() di touchmove (hanya saat di atas foto).
    const onTouchStart = (e: TouchEvent) => {
      const t = e.touches[0];
      touchOnPhoto = !!t && ready && !reduce && onPhoto(t.clientX, t.clientY);
    };
    const onTouchMove = (e: TouchEvent) => {
      if (touchOnPhoto && e.cancelable) e.preventDefault();
    };
    const onTouchEnd = () => { touchOnPhoto = false; releasePt(); };
    stage?.addEventListener('touchstart', onTouchStart, { passive: true });
    stage?.addEventListener('touchmove', onTouchMove, { passive: false });
    stage?.addEventListener('touchend', onTouchEnd);
    stage?.addEventListener('touchcancel', onTouchEnd);

    async function main() {
      let imgs;
      try { imgs = await Promise.all([loadImg(SRC.mask), loadImg(SRC.face)]); }
      catch (e) { pre?.classList.add('done'); return; }
      if (!alive) return;

      buildHitMap(imgs[0], imgs[1]);

      let ok = false;
      try { ok = initGL(imgs[0], imgs[1]); } catch (e) { ok = false; }
      if (!ok) {
        gl = null;
        stage?.classList.add('nogl');
        const fbFace = $('#fbFace') as HTMLImageElement | null;
        const fbMask = $('#fbMask') as HTMLImageElement | null;
        if (fbFace) fbFace.src = SRC.face;
        if (fbMask) fbMask.src = SRC.mask;
      }

      await Promise.race([document.fonts ? document.fonts.ready : Promise.resolve(), sleep(1200)]);
      if (!alive) return;

      if (reduce) {
        st.p = 1; draw();
        if (canvas) canvas.style.opacity = '1';
        pre?.classList.add('done');
        ready = true; busy = false;
        return;
      }

      // tahan preloader sampai animasi logo + jaring selesai
      await sleep(2200);
      if (!alive) return;
      fitHeadline();
      pre?.classList.add('done');
      if (gl && canvas) {
        const a = canvas.animate(
          [{ opacity: 0, transform: 'translateY(7%)' }, { opacity: 1, transform: 'none' }],
          { duration: 950, easing: 'cubic-bezier(.2,.7,.2,1)', fill: 'forwards' }
        );
        a.finished.then(() => { if (canvas) canvas.style.opacity = '1'; a.cancel(); });
      } else {
        stage?.classList.add('is-mask');
      }
      await sleep(isMobile ? 900 : 1600);
      if (!alive) return;
      st.dir = 1;
      if (gl) await tween(1900, easeInOut, k => { st.p = k; draw(); });
      else stage?.classList.remove('is-mask');
      ready = true; busy = false;
      idle();
    }
    main();

    return () => {
      alive = false;
      cancelAnimationFrame(trailRaf);
      clearTimeout(idleTimer as number);
      stage?.removeEventListener('click', clickHandler);
      stage?.removeEventListener('keydown', keyHandler);
      stage?.removeEventListener('pointermove', onMove);
      stage?.removeEventListener('pointerdown', resetPt);
      stage?.removeEventListener('pointerup', resetPt);
      stage?.removeEventListener('pointerleave', releasePt);
      stage?.removeEventListener('pointercancel', releasePt);
      stage?.removeEventListener('touchstart', onTouchStart);
      stage?.removeEventListener('touchmove', onTouchMove);
      stage?.removeEventListener('touchend', onTouchEnd);
      stage?.removeEventListener('touchcancel', onTouchEnd);
    };
  }, []);

  return (
    <>
      <div className="pre" id="pre" aria-hidden="true">
        <div className="pre-mark">
          <svg className="pre-svg" viewBox="-100 -100 200 200">
            <defs>
              <radialGradient id="preHoleFade">
                <stop offset="0" stopColor="#000" />
                <stop offset=".8" stopColor="#000" />
                <stop offset="1" stopColor="#fff" />
              </radialGradient>
              {/* Lubang di tengah: garis jaring tidak tampil di area logo (hitam = tersembunyi) */}
              <mask id="preHole" maskUnits="userSpaceOnUse" x="-300" y="-300" width="600" height="600">
                <rect x="-300" y="-300" width="600" height="600" fill="#fff" />
                <circle r="46" fill="url(#preHoleFade)" />
              </mask>
            </defs>
            <g id="preWebPaths" mask="url(#preHole)"></g>
          </svg>
          <div className="pre-logo"></div>
        </div>
      </div>

      <div className="hero-wrap">
        <main className="hero">

          <div className="copy">
            <p className="subtitle">HELLO WORLD, im Software Engineer</p>
            <h1 style={{ display: 'flex', flexDirection: 'column', lineHeight: 1.1, marginBottom: '16px' }}>
              <span>M.Einstein</span>
              <span>Yudhistira</span>
            </h1>
            <div style={{ fontSize: '1.4rem', fontWeight: 600, marginBottom: '16px', opacity: 0.9 }}>
              A.K.A ALBERTICHAL
            </div>
            <p className="lede">Build robust web apps from the database core to the frontend interface</p>
          </div>

          <div className="interactive-corner c-tr" title="Tarik dan geser aku!">
            <div className="cw" style={{ '--dur': '2s', '--del': '0s', '--dir': 'normal', '--wr': '0deg', '--sx': '52%', '--sy': '50%', '--rot': '0deg' } as React.CSSProperties}>
              <div className="cw-web"></div>
              <div className="cw-spider"></div>
            </div>
          </div>

          <div className="interactive-corner c-mr" title="Tarik dan geser aku!">
            <div className="cw" style={{ '--dur': '3s', '--del': '-.5s', '--dir': 'reverse', '--wr': '10deg', '--sx': '50%', '--sy': '50%', '--rot': '-160deg' } as React.CSSProperties}>
              <div className="cw-web"></div>
              <div className="cw-spider"></div>
            </div>
          </div>

          <div className="interactive-corner c-ml" title="Tarik dan geser aku!">
            <div className="cw" style={{ '--dur': '2s', '--del': '-3s', '--dir': 'normal', '--wr': '30deg', '--sx': '50%', '--sy': '50%', '--rot': '25deg', '--ss': '34%' } as React.CSSProperties}>
              <div className="cw-web"></div>
              <div className="cw-spider"></div>
            </div>
          </div>

          <div className="interactive-corner c-bl" title="Tarik dan geser aku!">
            <div className="cw" style={{ '--dur': '6.2s', '--del': '-1s', '--dir': 'reverse', '--wr': '-15deg', '--sx': '48%', '--sy': '52%', '--rot': '-35deg' } as React.CSSProperties}>
              <div className="cw-web"></div>
              <div className="cw-spider"></div>
            </div>
          </div>

          <div className="interactive-corner c-br" title="Tarik dan geser aku!">
            <div className="cw" style={{ '--dur': '5.5s', '--del': '-2s', '--dir': 'reverse', '--wr': '20deg', '--sx': '50%', '--sy': '50%', '--rot': '180deg' } as React.CSSProperties}>
              <div className="cw-web"></div>
              <div className="cw-spider"></div>
            </div>
          </div>

          <div className="stage" id="stage" role="button" tabIndex={0} aria-label="Ganti antara foto bertopeng dan foto wajah">
            <svg className="web" id="bgWeb" viewBox="-100 -100 200 200" aria-hidden="true"></svg>
            <canvas id="gl"></canvas>
            <img className="fb face" id="fbFace" alt="" />
            <img className="fb mask" id="fbMask" alt="" />
          </div>
        </main>
      </div>
      <Slide2 />
      <Slide3 />
    </>
  );
}