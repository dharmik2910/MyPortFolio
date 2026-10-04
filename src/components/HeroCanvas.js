import React, { useEffect, useRef } from "react";
import { Mesh, Program, Renderer, Triangle } from "ogl";
import { prefersReducedMotion } from "../lib/scroll";

const vertex = /* glsl */ `
  attribute vec2 uv;
  attribute vec2 position;
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = vec4(position, 0.0, 1.0);
  }
`;

// Domain-warped fbm: slow molten ember flowing over warm ink, brightened near the pointer.
const fragment = /* glsl */ `
  precision highp float;
  uniform float uTime;
  uniform vec2 uRes;
  uniform vec2 uMouse;
  uniform vec3 uInk;
  uniform vec3 uDeep;
  varying vec2 vUv;

  float hash(vec2 p) {
    p = fract(p * vec2(123.34, 456.21));
    p += dot(p, p + 45.32);
    return fract(p.x * p.y);
  }

  float noise(vec2 p) {
    vec2 i = floor(p);
    vec2 f = fract(p);
    vec2 u = f * f * (3.0 - 2.0 * f);
    return mix(
      mix(hash(i), hash(i + vec2(1.0, 0.0)), u.x),
      mix(hash(i + vec2(0.0, 1.0)), hash(i + vec2(1.0, 1.0)), u.x),
      u.y
    );
  }

  float fbm(vec2 p) {
    float v = 0.0;
    float a = 0.5;
    mat2 m = mat2(1.6, 1.2, -1.2, 1.6);
    for (int i = 0; i < 5; i++) {
      v += a * noise(p);
      p = m * p;
      a *= 0.5;
    }
    return v;
  }

  void main() {
    vec2 p = (gl_FragCoord.xy - 0.5 * uRes) / uRes.y;
    float t = uTime * 0.05;

    vec2 q = vec2(fbm(p * 1.3 + t), fbm(p * 1.3 + vec2(5.2, 1.3) - t));
    vec2 r = vec2(
      fbm(p * 1.5 + 2.0 * q + vec2(1.7, 9.2) + t * 1.4),
      fbm(p * 1.5 + 2.0 * q + vec2(8.3, 2.8) - t)
    );
    float f = fbm(p * 1.1 + 2.4 * r);

    vec2 m = (uMouse - 0.5) * vec2(uRes.x / uRes.y, 1.0);
    float glow = smoothstep(0.75, 0.0, length(p - m));

    vec3 ink = uInk;
    vec3 deep = uDeep;
    vec3 ember = vec3(1.0, 0.345, 0.137);
    vec3 gold = vec3(1.0, 0.62, 0.38);

    vec3 col = mix(ink, deep, smoothstep(0.3, 0.75, f));
    col = mix(col, ember, smoothstep(0.55, 0.95, f + glow * 0.18) * 0.75);
    col = mix(col, gold, smoothstep(0.82, 1.05, f + glow * 0.12) * 0.5);

    // Keep the left/bottom calm so type stays legible, and fade into the page below.
    float side = smoothstep(-0.2, 1.0, vUv.x * 0.7 + vUv.y * 0.5);
    col = mix(ink, col, side * 0.85);
    col = mix(ink, col, smoothstep(0.0, 0.4, vUv.y));

    gl_FragColor = vec4(col, 1.0);
  }
`;

// Base surface + mid-tone per theme; ember/gold highlights are shared.
const PALETTES = {
  dark: { ink: [0.051, 0.047, 0.043], deep: [0.22, 0.06, 0.025] },
  light: { ink: [0.957, 0.937, 0.902], deep: [1.0, 0.7, 0.54] },
};

const HeroCanvas = ({ className = "", theme = "dark" }) => {
  const wrapRef = useRef(null);
  const glRef = useRef(null); // { program, redraw } once WebGL is up

  useEffect(() => {
    const wrap = wrapRef.current;
    if (!wrap) return;

    let renderer;
    try {
      renderer = new Renderer({ dpr: Math.min(window.devicePixelRatio, 1.5), alpha: false });
    } catch (err) {
      return; // No WebGL: the CSS gradient fallback behind stays visible.
    }
    const gl = renderer.gl;
    gl.clearColor(0.051, 0.047, 0.043, 1);
    gl.canvas.style.width = "100%";
    gl.canvas.style.height = "100%";
    gl.canvas.style.display = "block";
    wrap.appendChild(gl.canvas);

    const program = new Program(gl, {
      vertex,
      fragment,
      uniforms: {
        uTime: { value: 0 },
        uRes: { value: [1, 1] },
        uMouse: { value: [0.72, 0.6] },
        uInk: { value: PALETTES[theme].ink },
        uDeep: { value: PALETTES[theme].deep },
      },
    });
    const mesh = new Mesh(gl, { geometry: new Triangle(gl), program });

    const resize = () => {
      renderer.setSize(wrap.clientWidth, wrap.clientHeight);
      program.uniforms.uRes.value = [gl.drawingBufferWidth, gl.drawingBufferHeight];
    };
    resize();
    window.addEventListener("resize", resize);

    const target = [0.72, 0.6];
    const onMove = (e) => {
      const r = wrap.getBoundingClientRect();
      target[0] = (e.clientX - r.left) / r.width;
      target[1] = 1 - (e.clientY - r.top) / r.height;
    };
    window.addEventListener("pointermove", onMove);

    const still = prefersReducedMotion();
    let visible = true;
    let raf;
    const start = performance.now();
    const render = (now) => {
      const mouse = program.uniforms.uMouse.value;
      mouse[0] += (target[0] - mouse[0]) * 0.04;
      mouse[1] += (target[1] - mouse[1]) * 0.04;
      program.uniforms.uTime.value = still ? 12 : (now - start) / 1000 + 12;
      renderer.render({ scene: mesh });
      if (!still && visible) raf = requestAnimationFrame(render);
    };
    raf = requestAnimationFrame(render);
    // Theme changes need an explicit redraw when the loop isn't running.
    glRef.current = { program, redraw: () => (still || !visible) && renderer.render({ scene: mesh }) };

    // Stop rendering when the hero is off screen
    const io = new IntersectionObserver(([entry]) => {
      const was = visible;
      visible = entry.isIntersecting;
      if (visible && !was && !still) raf = requestAnimationFrame(render);
    });
    io.observe(wrap);

    return () => {
      cancelAnimationFrame(raf);
      io.disconnect();
      window.removeEventListener("resize", resize);
      window.removeEventListener("pointermove", onMove);
      if (gl.canvas.parentNode === wrap) wrap.removeChild(gl.canvas);
      const ext = gl.getExtension("WEBGL_lose_context");
      if (ext) ext.loseContext();
      glRef.current = null;
    };
    // Theme is applied by the effect below; the GL context is created once.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!glRef.current) return;
    const { program, redraw } = glRef.current;
    program.uniforms.uInk.value = PALETTES[theme].ink;
    program.uniforms.uDeep.value = PALETTES[theme].deep;
    redraw();
  }, [theme]);

  return (
    <div
      ref={wrapRef}
      aria-hidden="true"
      className={`bg-[radial-gradient(ellipse_at_75%_35%,rgba(255,88,35,0.25),transparent_60%)] ${className}`}
    />
  );
};

export default HeroCanvas;
