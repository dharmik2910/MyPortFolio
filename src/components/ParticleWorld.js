import React, { useEffect, useRef } from "react";
import {
  AdditiveBlending,
  BufferAttribute,
  BufferGeometry,
  Color,
  NormalBlending,
  PerspectiveCamera,
  Points,
  Scene,
  ShaderMaterial,
  Vector2,
  Vector3,
  WebGLRenderer,
} from "three";
import { prefersReducedMotion } from "../lib/scroll";

// One particle cloud lives behind the whole page and re-forms for each section
// as you scroll: wave → </> code mark → galaxy ring → warp tunnel → your initials.
// Every particle stores its position in all five formations; the vertex shader
// blends between neighbours, so morphing costs nothing on the CPU.
const SECTIONS = ["home", "about", "skills", "projects", "contact"];
const SHAPES = SECTIONS.length;
const TUNNEL = 3; // index of the formation that streams toward the camera
const WAVE = 0; // index of the formation that ripples

const vertex = /* glsl */ `
  attribute vec3 p0;
  attribute vec3 p1;
  attribute vec3 p2;
  attribute vec3 p3;
  attribute vec3 p4;
  attribute vec3 scatter;
  attribute vec4 rand; // size, colour pick, phase, spare

  uniform float uTime;
  uniform float uMorph;   // 0..4, fractional between formations
  uniform float uIntro;   // 0 scattered → 1 assembled
  uniform vec2 uMouse;    // NDC
  uniform float uAspect;
  uniform float uSize;
  uniform float uPixelRatio;
  uniform vec3 uCenter[${SHAPES}];
  uniform float uSpin[${SHAPES}];
  uniform float uTilt[${SHAPES}];
  uniform float uScale[${SHAPES}];
  uniform float uAlpha[${SHAPES}];

  varying float vAlpha;
  varying float vPick;

  vec3 local(int i) {
    if (i == 0) return p0;
    if (i == 1) return p1;
    if (i == 2) return p2;
    if (i == 3) return p3;
    return p4;
  }

  vec3 rotY(vec3 p, float a) {
    float c = cos(a), s = sin(a);
    return vec3(c * p.x + s * p.z, p.y, -s * p.x + c * p.z);
  }

  vec3 rotX(vec3 p, float a) {
    float c = cos(a), s = sin(a);
    return vec3(p.x, c * p.y - s * p.z, s * p.y + c * p.z);
  }

  vec3 formation(int i, out float fade) {
    vec3 p = local(i);
    fade = 1.0;
    if (i == ${WAVE}) {
      p.y += sin(p.x * 0.55 + uTime * 0.7) * 0.32 + cos(p.z * 0.7 + uTime * 0.5) * 0.28;
      p.y += sin((p.x + p.z) * 1.3 + uTime) * 0.06;
      fade = smoothstep(-9.0, -3.0, p.z);
    }
    if (i == ${TUNNEL}) {
      p.z = mod(p.z + uTime * 2.4, 28.0) - 20.0;
      fade = smoothstep(-20.0, -12.0, p.z) * (1.0 - smoothstep(4.0, 8.0, p.z));
    }
    p = rotY(p, uTime * uSpin[i]);
    p = rotX(p, uTilt[i]);
    return p * uScale[i] + uCenter[i];
  }

  void main() {
    int a = int(clamp(floor(uMorph), 0.0, ${SHAPES - 1}.0));
    int b = int(min(float(a) + 1.0, ${SHAPES - 1}.0));
    float t = smoothstep(0.0, 1.0, uMorph - float(a));
    // Particles travel at slightly different times so the morph reads as a swarm.
    t = clamp((t - rand.z * 0.25) / 0.75, 0.0, 1.0);

    float fa, fb;
    vec3 pos = mix(formation(a, fa), formation(b, fb), t);
    float alpha = mix(uAlpha[a] * fa, uAlpha[b] * fb, t);

    // Gentle drift so nothing is ever perfectly still
    float ph = rand.z * 6.2831;
    pos += vec3(sin(uTime * 0.6 + ph), cos(uTime * 0.5 + ph * 1.3), sin(uTime * 0.4 + ph * 0.7)) * 0.04;
    pos = mix(scatter, pos, uIntro);

    vec4 mv = modelViewMatrix * vec4(pos, 1.0);

    // Push particles away from the cursor in screen space
    vec4 clip = projectionMatrix * mv;
    vec2 ndc = clip.xy / clip.w;
    vec2 d = (ndc - uMouse) * vec2(uAspect, 1.0);
    float dist = length(d);
    float push = (1.0 - smoothstep(0.0, 0.35, dist)) * 0.5;
    mv.xy += normalize(d + 1e-5) / vec2(uAspect, 1.0) * push * (-mv.z) * 0.12;

    gl_Position = projectionMatrix * mv;
    gl_PointSize = uSize * (0.5 + rand.x) * uPixelRatio * (10.0 / -mv.z);
    vAlpha = alpha * uIntro * (0.55 + rand.x * 0.45);
    vPick = rand.y;
  }
`;

const fragment = /* glsl */ `
  uniform vec3 uColorA;
  uniform vec3 uColorB;
  uniform vec3 uColorC;
  varying float vAlpha;
  varying float vPick;

  void main() {
    float r = length(gl_PointCoord - 0.5);
    float soft = smoothstep(0.5, 0.0, r);
    if (soft < 0.01) discard;
    vec3 col = vPick < 0.62 ? uColorA : vPick < 0.88 ? uColorB : uColorC;
    gl_FragColor = vec4(col, vAlpha * soft);
  }
`;

// Raw sRGB triplets; the shader writes them straight to the screen.
const THEMES = {
  dark: { a: [1.0, 0.345, 0.137], b: [1.0, 0.62, 0.38], c: [0.95, 0.92, 0.88], blending: AdditiveBlending, gain: 1 },
  light: { a: [0.93, 0.29, 0.09], b: [0.7, 0.2, 0.05], c: [0.35, 0.3, 0.26], blending: NormalBlending, gain: 1.15 },
};

const rnd = (a, b) => a + Math.random() * (b - a);

// --- Formations (local space, centred on the origin) -----------------------

const wave = (n, out) => {
  const cols = Math.ceil(Math.sqrt(n * 1.8));
  for (let i = 0; i < n; i++) {
    const cx = i % cols;
    const cz = Math.floor(i / cols);
    const rows = Math.ceil(n / cols);
    out.set([(cx / (cols - 1) - 0.5) * 18 + rnd(-0.03, 0.03), 0, (cz / rows) * -11 + 3], i * 3);
  }
};

const galaxy = (n, out) => {
  for (let i = 0; i < n; i++) {
    const r = 3.1 + Math.pow(Math.random(), 1.6) * 3.6;
    const arm = (i % 3) * ((Math.PI * 2) / 3);
    const a = arm + r * 0.55 + rnd(-0.35, 0.35);
    out.set([Math.cos(a) * r, rnd(-0.12, 0.12) * (r - 2.5), Math.sin(a) * r], i * 3);
  }
};

const tunnel = (n, out) => {
  for (let i = 0; i < n; i++) {
    const a = Math.random() * Math.PI * 2;
    const r = rnd(2.4, 4.8);
    out.set([Math.cos(a) * r, Math.sin(a) * r * 0.75, rnd(-20, 8)], i * 3);
  }
};

const DISPLAY_FONT = ["800", "Syne, system-ui, sans-serif"];
const CODE_FONT = ["600", '"JetBrains Mono", ui-monospace, monospace'];

// Samples filled pixels of text drawn to an offscreen canvas (the initials, the </> mark).
const lettering = (n, out, text, [weight, family] = DISPLAY_FONT) => {
  const W = 600;
  const H = 260;
  const canvas = document.createElement("canvas");
  canvas.width = W;
  canvas.height = H;
  const ctx = canvas.getContext("2d");
  ctx.fillStyle = "#fff";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.font = `${weight} ${H * 0.92}px ${family}`;
  ctx.fillText(text, W / 2, H / 2 + 8);
  const data = ctx.getImageData(0, 0, W, H).data;
  const filled = [];
  for (let y = 0; y < H; y += 2) {
    for (let x = 0; x < W; x += 2) if (data[(y * W + x) * 4 + 3] > 128) filled.push(x, y);
  }
  if (!filled.length) return galaxy(n, out);
  const scale = 7 / W;
  for (let i = 0; i < n; i++) {
    const k = Math.floor(Math.random() * (filled.length / 2)) * 2;
    out.set(
      [(filled[k] - W / 2) * scale + rnd(-0.02, 0.02), -(filled[k + 1] - H / 2) * scale + rnd(-0.02, 0.02), rnd(-0.25, 0.25)],
      i * 3
    );
  }
};

const buildGeometry = (n, initials) => {
  const geometry = new BufferGeometry();
  const shapes = [
    wave,
    (count, out) => lettering(count, out, "</>", CODE_FONT),
    galaxy,
    tunnel,
    (count, out) => lettering(count, out, initials),
  ];
  shapes.forEach((fill, i) => {
    const arr = new Float32Array(n * 3);
    fill(n, arr);
    geometry.setAttribute(`p${i}`, new BufferAttribute(arr, 3));
  });
  const scatter = new Float32Array(n * 3);
  const v = new Vector3();
  for (let i = 0; i < n; i++) {
    v.randomDirection().multiplyScalar(rnd(6, 16));
    scatter.set(v.toArray(), i * 3);
  }
  geometry.setAttribute("scatter", new BufferAttribute(scatter, 3));
  geometry.setAttribute("position", new BufferAttribute(scatter.slice(), 3)); // bounds only
  const rand = new Float32Array(n * 4);
  for (let i = 0; i < n * 4; i++) rand[i] = Math.random();
  geometry.setAttribute("rand", new BufferAttribute(rand, 4));
  return geometry;
};

// Where each formation sits, per layout. Kept clear of each section's main text.
const LAYOUT = {
  wide: {
    center: [[0, -2.1, 0], [4.3, -2.0, -1.5], [0, 0, -2], [0, 0, 0], [3.1, 1.7, -1]],
    scale: [1, 0.55, 1, 1, 0.6],
    tilt: [0, 0.15, 1.15, 0, 0],
    alpha: [0.9, 0.6, 0.65, 0.6, 0.7],
  },
  narrow: {
    center: [[0, -2.6, -1], [1.5, 1.2, -3], [0, 0, -3], [0, 0, 0], [0, 2.6, -3]],
    scale: [0.8, 0.42, 0.7, 0.6, 0.4],
    tilt: [0, 0.15, 1.15, 0, 0],
    alpha: [0.85, 0.32, 0.55, 0.5, 0.35],
  },
};
// Radians per second around each formation's own axis; text formations stay put so they read.
const SPIN = [0, 0, 0.06, 0, 0];

const ParticleWorld = ({ theme = "dark", ready = true, initials = "DR" }) => {
  const wrapRef = useRef(null);
  const glRef = useRef(null);
  const readyRef = useRef(ready);
  readyRef.current = ready;

  useEffect(() => {
    const wrap = wrapRef.current;
    if (!wrap) return;

    let renderer;
    try {
      renderer = new WebGLRenderer({ antialias: false, alpha: true, powerPreference: "high-performance" });
    } catch (err) {
      return; // No WebGL: the page simply has no particle layer.
    }
    const dpr = Math.min(window.devicePixelRatio, 1.75);
    renderer.setPixelRatio(dpr);
    const canvas = renderer.domElement;
    canvas.style.width = "100%";
    canvas.style.height = "100%";
    canvas.style.display = "block";
    wrap.appendChild(canvas);

    const scene = new Scene();
    const camera = new PerspectiveCamera(35, 1, 0.1, 60);
    camera.position.set(0, 0, 10);

    const count = window.innerWidth < 768 ? 4000 : 8000;
    const geometry = buildGeometry(count, initials);
    const material = new ShaderMaterial({
      vertexShader: vertex,
      fragmentShader: fragment,
      transparent: true,
      depthWrite: false,
      uniforms: {
        uTime: { value: 0 },
        uMorph: { value: 0 },
        uIntro: { value: 0 },
        uMouse: { value: new Vector2(9, 9) },
        uAspect: { value: 1 },
        uSize: { value: 2.6 },
        uPixelRatio: { value: dpr },
        uCenter: { value: Array.from({ length: SHAPES }, () => new Vector3()) },
        uSpin: { value: SPIN },
        uTilt: { value: [...LAYOUT.wide.tilt] },
        uScale: { value: [...LAYOUT.wide.scale] },
        uAlpha: { value: [...LAYOUT.wide.alpha] },
        uColorA: { value: new Color() },
        uColorB: { value: new Color() },
        uColorC: { value: new Color() },
      },
    });
    const points = new Points(geometry, material);
    points.frustumCulled = false; // real positions are computed on the GPU
    scene.add(points);
    const u = material.uniforms;

    const applyTheme = (name) => {
      const t = THEMES[name];
      u.uColorA.value.setRGB(...t.a);
      u.uColorB.value.setRGB(...t.b);
      u.uColorC.value.setRGB(...t.c);
      material.blending = t.blending;
      material.needsUpdate = true;
    };

    // Section centres in page coordinates, refreshed when layout changes.
    let anchors = [];
    const measure = () => {
      anchors = SECTIONS.map((id) => {
        const el = document.getElementById(id);
        if (!el) return null;
        const r = el.getBoundingClientRect();
        return r.top + window.scrollY + r.height / 2;
      });
    };
    const morphFor = (y) => {
      const pts = anchors.map((a, i) => [a, i]).filter(([a]) => a !== null);
      if (!pts.length) return 0;
      if (y <= pts[0][0]) return pts[0][1];
      for (let k = 0; k < pts.length - 1; k++) {
        const [a0, i0] = pts[k];
        const [a1, i1] = pts[k + 1];
        if (y <= a1) {
          // Hold each formation through most of its section, morph near the seams.
          const f = (y - a0) / (a1 - a0);
          return i0 + (i1 - i0) * Math.min(Math.max((f - 0.3) / 0.4, 0), 1);
        }
      }
      return pts[pts.length - 1][1];
    };

    const resize = () => {
      const w = window.innerWidth;
      const h = window.innerHeight;
      renderer.setSize(w, h, false);
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      u.uAspect.value = camera.aspect;
      const layout = camera.aspect > 1 ? LAYOUT.wide : LAYOUT.narrow;
      layout.center.forEach((c, i) => u.uCenter.value[i].set(...c));
      u.uTilt.value = [...layout.tilt];
      u.uScale.value = [...layout.scale];
      u.uAlpha.value = [...layout.alpha];
      measure();
    };
    resize();
    window.addEventListener("resize", resize);
    const ro = new ResizeObserver(measure);
    ro.observe(document.body);

    const target = new Vector2(9, 9);
    const onMove = (e) => target.set((e.clientX / window.innerWidth) * 2 - 1, -(e.clientY / window.innerHeight) * 2 + 1);
    const onLeave = () => target.set(9, 9);
    window.addEventListener("pointermove", onMove);
    document.documentElement.addEventListener("pointerleave", onLeave);

    const still = prefersReducedMotion();
    const state = { intro: 0, morph: 0 };
    const start = performance.now();
    let raf;

    const frame = (now) => {
      const time = still ? 4 : (now - start) / 1000;
      const goal = morphFor(window.scrollY + window.innerHeight / 2);
      state.morph = still ? goal : state.morph + (goal - state.morph) * 0.08;
      if (readyRef.current) state.intro = still ? 1 : Math.min(1, state.intro + 0.012);
      // Snap when the pointer enters or leaves (parked at 9 = no repulsion), ease otherwise.
      if (target.x > 5 || u.uMouse.value.x > 5) u.uMouse.value.copy(target);
      else u.uMouse.value.lerp(target, 0.15);

      u.uTime.value = time;
      u.uMorph.value = state.morph;
      u.uIntro.value = 1 - Math.pow(1 - state.intro, 3);
      renderer.render(scene, camera);
      raf = requestAnimationFrame(frame);
    };
    applyTheme(theme);
    raf = requestAnimationFrame(frame);

    glRef.current = { applyTheme };

    // Text formations need the site fonts; redraw them once each has loaded.
    let alive = true;
    const redraw = (attrName, text, font) =>
      document.fonts?.load(`${font[0]} 100px ${font[1]}`).then(() => {
        if (!alive) return;
        const attr = geometry.getAttribute(attrName);
        lettering(count, attr.array, text, font);
        attr.needsUpdate = true;
      });
    redraw("p1", "</>", CODE_FONT);
    redraw("p4", initials, DISPLAY_FONT);

    // Pause when the tab is hidden
    const onVisibility = () => {
      cancelAnimationFrame(raf);
      if (!document.hidden) raf = requestAnimationFrame(frame);
    };
    document.addEventListener("visibilitychange", onVisibility);

    return () => {
      alive = false;
      cancelAnimationFrame(raf);
      ro.disconnect();
      window.removeEventListener("resize", resize);
      window.removeEventListener("pointermove", onMove);
      document.documentElement.removeEventListener("pointerleave", onLeave);
      document.removeEventListener("visibilitychange", onVisibility);
      geometry.dispose();
      material.dispose();
      renderer.dispose();
      renderer.forceContextLoss();
      if (canvas.parentNode === wrap) wrap.removeChild(canvas);
      glRef.current = null;
    };
    // The GL context is created once; theme and readiness are applied below.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initials]);

  useEffect(() => {
    glRef.current?.applyTheme(theme);
  }, [theme]);


  return <div ref={wrapRef} aria-hidden="true" className="pointer-events-none fixed inset-0 z-0" />;
};

export default ParticleWorld;
