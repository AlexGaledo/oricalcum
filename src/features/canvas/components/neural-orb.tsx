"use client";

import { useEffect, useRef } from "react";
import * as THREE from "three";
import { useCanvasStore } from "@/features/canvas/store/canvas.store";

export interface NeuralOrbProps {
  /** Accent hex color (e.g. "#10A37F"). Orb glow, wireframe and synapses derive from it. */
  accent: string;
  /** Glow strength 0–100 (theme store `glow` tweak). */
  glow?: number;
  /** Follow the nodespace camera with a subtle parallax shift. */
  trackCamera?: boolean;
  /**
   * "full": centered hero presence (nodespace, splash, login).
   * "peripheral": small, dim, offset to the upper-right — ambient identity
   * behind content-heavy pages (dashboard, hubs).
   */
  variant?: "full" | "peripheral";
  /** Splash intro: particles converge into the orb, then the camera pushes in. */
  cinematic?: boolean;
  /** Fires once when the cinematic push-in completes (or immediately under reduced motion). */
  onCinematicDone?: () => void;
}

const CINEMATIC_FORM_MS = 1.4; // particle convergence
const CINEMATIC_HOLD_UNTIL = 1.8; // idle beat before the dive
const CINEMATIC_END = 2.4; // push-in complete

/** Quality tier picked once per mount — low-end machines get fewer particles/arcs. */
function pickQuality() {
  const cores =
    typeof navigator !== "undefined" ? (navigator.hardwareConcurrency ?? 8) : 8;
  const low = cores <= 4;
  return {
    pixelRatioCap: low ? 1 : 1.75,
    antialias: !low,
    stars: low ? 500 : 1400,
    innerParticles: low ? 400 : 1100,
    arcs: low ? 8 : 18,
    sphereSegments: low ? 20 : 28,
  };
}

const ORB_RADIUS = 5;
const ARC_SEGMENTS = 24;

/** Random point on a sphere surface. */
function randomOnSphere(radius: number, out: THREE.Vector3) {
  const u = Math.random() * 2 - 1;
  const theta = Math.random() * Math.PI * 2;
  const s = Math.sqrt(1 - u * u);
  return out.set(s * Math.cos(theta) * radius, s * Math.sin(theta) * radius, u * radius);
}

interface SynapseArc {
  line: THREE.Line;
  material: THREE.LineBasicMaterial;
  /** Phase offset so arcs fire out of sync. */
  phase: number;
  /** Firing speed multiplier. */
  speed: number;
}

/** Rebuild an arc's geometry between two fresh random surface points. */
function rerollArc(arc: SynapseArc) {
  const a = randomOnSphere(ORB_RADIUS, new THREE.Vector3());
  const b = randomOnSphere(ORB_RADIUS, new THREE.Vector3());
  const mid = a.clone().add(b).multiplyScalar(0.5);
  // Push the control point outward so the arc bows above the surface.
  mid.setLength(ORB_RADIUS * (1.15 + Math.random() * 0.25));
  const curve = new THREE.QuadraticBezierCurve3(a, mid, b);
  const points = curve.getPoints(ARC_SEGMENTS);
  arc.line.geometry.setFromPoints(points);
  arc.phase = Math.random() * Math.PI * 2;
  arc.speed = 0.5 + Math.random() * 0.7;
}

/**
 * Ambient "AI brain" background: wireframe neural core, inner thought-particle
 * cloud, synapse arcs firing across the surface, atmosphere glow, dim starfield.
 *
 * Perf posture: capped pixel ratio, paused when the tab is hidden, half frame
 * rate while a canvas drag gesture is active, static single frame under
 * prefers-reduced-motion, full disposal on unmount.
 */
export default function NeuralOrb({
  accent,
  glow = 60,
  trackCamera = false,
  variant = "full",
  cinematic = false,
  onCinematicDone,
}: NeuralOrbProps) {
  const mountRef = useRef<HTMLDivElement>(null);
  const accentRef = useRef(accent);
  const glowRef = useRef(glow);
  accentRef.current = accent;
  glowRef.current = glow;
  const trackCameraRef = useRef(trackCamera);
  trackCameraRef.current = trackCamera;
  const variantRef = useRef(variant);
  const cinematicRef = useRef(cinematic);
  const onCinematicDoneRef = useRef(onCinematicDone);
  onCinematicDoneRef.current = onCinematicDone;

  useEffect(() => {
    const mount = mountRef.current;
    if (!mount) return;

    const peripheral = variantRef.current === "peripheral";
    const isCinematic = cinematicRef.current;
    // Peripheral orbs are ambience, not heroes — always run the low tier dimmed.
    const q = peripheral
      ? { pixelRatioCap: 1, antialias: false, stars: 400, innerParticles: 350, arcs: 6, sphereSegments: 20 }
      : pickQuality();
    const intensity = peripheral ? 0.4 : 1;
    const reducedMotionMq = window.matchMedia("(prefers-reduced-motion: reduce)");

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(
      60,
      mount.clientWidth / Math.max(mount.clientHeight, 1),
      0.1,
      400,
    );
    camera.position.z = peripheral ? 30 : 21;

    const renderer = new THREE.WebGLRenderer({
      antialias: q.antialias,
      alpha: true,
      powerPreference: "low-power",
    });
    renderer.setSize(mount.clientWidth, mount.clientHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, q.pixelRatioCap));
    mount.appendChild(renderer.domElement);

    const baseColor = new THREE.Color(accentRef.current);
    // Secondary hue for the inner particle cloud — slightly shifted for depth.
    const innerColor = baseColor.clone().offsetHSL(0.07, 0, 0.08);

    // ── Starfield ──
    const starsGeometry = new THREE.BufferGeometry();
    const starPositions = new Float32Array(q.stars * 3);
    for (let i = 0; i < q.stars; i++) {
      const r = 40 + Math.random() * 120;
      const v = randomOnSphere(r, new THREE.Vector3());
      starPositions[i * 3] = v.x;
      starPositions[i * 3 + 1] = v.y;
      starPositions[i * 3 + 2] = v.z;
    }
    starsGeometry.setAttribute("position", new THREE.BufferAttribute(starPositions, 3));
    const starsMaterial = new THREE.PointsMaterial({
      color: 0xffffff,
      size: 0.35,
      sizeAttenuation: true,
      transparent: true,
      opacity: 0.55 * intensity,
      depthWrite: false,
    });
    const stars = new THREE.Points(starsGeometry, starsMaterial);
    scene.add(stars);

    // ── Wireframe neural core ──
    const wireGeometry = new THREE.SphereGeometry(ORB_RADIUS, q.sphereSegments, q.sphereSegments);
    const wireMaterial = new THREE.MeshBasicMaterial({
      color: baseColor,
      wireframe: true,
      transparent: true,
      opacity: 0.1 * intensity,
      depthWrite: false,
    });
    const wireSphere = new THREE.Mesh(wireGeometry, wireMaterial);
    scene.add(wireSphere);

    // ── Inner thought-particle cloud ──
    const cloudGeometry = new THREE.BufferGeometry();
    const cloudPositions = new Float32Array(q.innerParticles * 3);
    for (let i = 0; i < q.innerParticles; i++) {
      // Bias toward the core with cbrt for uniform volume density.
      const r = ORB_RADIUS * 0.92 * Math.cbrt(Math.random());
      const v = randomOnSphere(r, new THREE.Vector3());
      cloudPositions[i * 3] = v.x;
      cloudPositions[i * 3 + 1] = v.y;
      cloudPositions[i * 3 + 2] = v.z;
    }
    // Cinematic intro: remember where each particle belongs, then scatter it
    // far out — the render loop converges them back into the brain.
    const cloudTargets = isCinematic ? Float32Array.from(cloudPositions) : null;
    const cloudStarts = isCinematic ? new Float32Array(cloudPositions.length) : null;
    if (cloudTargets && cloudStarts) {
      for (let i = 0; i < cloudPositions.length; i++) {
        cloudStarts[i] = cloudTargets[i] * (3 + Math.random() * 4.5);
        cloudPositions[i] = cloudStarts[i];
      }
    }
    cloudGeometry.setAttribute("position", new THREE.BufferAttribute(cloudPositions, 3));
    const cloudMaterial = new THREE.PointsMaterial({
      color: innerColor,
      size: 0.1,
      sizeAttenuation: true,
      transparent: true,
      opacity: 0.35,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    });
    const cloud = new THREE.Points(cloudGeometry, cloudMaterial);
    scene.add(cloud);

    // ── Atmosphere glow (back-side shell, additive) ──
    const atmosphereMaterial = new THREE.ShaderMaterial({
      vertexShader: `
        varying vec3 vNormal;
        void main() {
          vNormal = normalize(normalMatrix * normal);
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
      `,
      fragmentShader: `
        uniform vec3 glowColor;
        uniform float strength;
        varying vec3 vNormal;
        void main() {
          float intensity = pow(0.62 - dot(vNormal, vec3(0.0, 0.0, 1.0)), 2.0);
          gl_FragColor = vec4(glowColor, 1.0) * intensity * strength;
        }
      `,
      blending: THREE.AdditiveBlending,
      side: THREE.BackSide,
      transparent: true,
      depthWrite: false,
      uniforms: {
        glowColor: { value: baseColor.clone() },
        strength: { value: (glowRef.current / 100) * 0.7 },
      },
    });
    const atmosphere = new THREE.Mesh(
      new THREE.SphereGeometry(ORB_RADIUS * 1.24, q.sphereSegments, q.sphereSegments),
      atmosphereMaterial,
    );
    scene.add(atmosphere);

    // ── Synapse arcs ──
    const arcGroup = new THREE.Group();
    const arcs: SynapseArc[] = [];
    for (let i = 0; i < q.arcs; i++) {
      const material = new THREE.LineBasicMaterial({
        color: baseColor,
        transparent: true,
        opacity: 0,
        blending: THREE.AdditiveBlending,
        depthWrite: false,
      });
      const line = new THREE.Line(new THREE.BufferGeometry(), material);
      const arc: SynapseArc = { line, material, phase: 0, speed: 1 };
      rerollArc(arc);
      arcs.push(arc);
      arcGroup.add(line);
    }
    scene.add(arcGroup);

    // ── Runtime state (mutated outside React) ──
    const currentColor = baseColor.clone();
    const targetColor = new THREE.Color(accentRef.current);
    // Peripheral orbs sit pushed into the upper-right so they read as an
    // ambient glow bleeding from the corner, not a centred object.
    const baseOffset = peripheral
      ? new THREE.Vector2(13, 6)
      : new THREE.Vector2(0, 0);
    const parallaxTarget = baseOffset.clone();
    scene.position.set(baseOffset.x, baseOffset.y, 0);
    let dragging = false;
    let hidden = document.hidden;
    let frameToggle = false;
    let animationId = 0;
    // Manual wall-clock delta (THREE.Clock is deprecated in r182 and its
    // getDelta no longer returns reliable seconds). Clamped so a paused tab
    // doesn't produce a giant jump on resume.
    let lastTime = 0;
    let elapsed = 0;
    let cinematicDone = !isCinematic;

    const unsubscribeCanvas = trackCameraRef.current
      ? useCanvasStore.subscribe((s) => {
          // Tiny inverse shift: panning the nodespace drifts the brain the other way.
          parallaxTarget.set(
            baseOffset.x + Math.max(-1.4, Math.min(1.4, -s.camera.x * 0.0012)),
            baseOffset.y + Math.max(-1.4, Math.min(1.4, s.camera.y * 0.0012)),
          );
          dragging = s.drag !== null;
        })
      : null;

    const renderFrame = () => {
      const now = performance.now();
      const dt = lastTime ? Math.min(0.1, (now - lastTime) / 1000) : 1 / 60;
      lastTime = now;
      elapsed += dt;

      // Cinematic intro timeline: converge particles, hold a beat, push in.
      let formP = 1;
      if (isCinematic && !cinematicDone) {
        formP = Math.min(1, elapsed / CINEMATIC_FORM_MS);
        const k = 1 - (1 - formP) ** 3; // easeOutCubic
        if (cloudTargets && cloudStarts && formP < 1) {
          const pos = cloudGeometry.getAttribute("position") as THREE.BufferAttribute;
          const arr = pos.array as Float32Array;
          for (let i = 0; i < arr.length; i++) {
            arr[i] = cloudStarts[i] + (cloudTargets[i] - cloudStarts[i]) * k;
          }
          pos.needsUpdate = true;
        }
        if (elapsed > CINEMATIC_HOLD_UNTIL) {
          const diveP = Math.min(1, (elapsed - CINEMATIC_HOLD_UNTIL) / (CINEMATIC_END - CINEMATIC_HOLD_UNTIL));
          camera.position.z = 21 - (21 - 9) * diveP * diveP; // accelerate into the core
        }
        if (elapsed >= CINEMATIC_END) {
          cinematicDone = true;
          onCinematicDoneRef.current?.();
        }
      }

      // Smooth accent transitions (theme switch recolors the brain).
      targetColor.set(accentRef.current);
      currentColor.lerp(targetColor, Math.min(1, dt * 3));
      wireMaterial.color.copy(currentColor);
      cloudMaterial.color.copy(currentColor).offsetHSL(0.07, 0, 0.08);
      (atmosphereMaterial.uniforms.glowColor.value as THREE.Color).copy(currentColor);
      atmosphereMaterial.uniforms.strength.value =
        (glowRef.current / 100) * 0.7 * intensity * formP;
      wireMaterial.opacity = 0.1 * intensity * formP;

      // Slow ambient rotation, counter-rotating layers for depth.
      wireSphere.rotation.y += dt * 0.03;
      cloud.rotation.y -= dt * 0.015;
      arcGroup.rotation.y += dt * 0.03;
      atmosphere.rotation.y += dt * 0.012;
      stars.rotation.y += dt * 0.004;

      // Cloud "breathing".
      cloudMaterial.opacity = (0.3 + Math.sin(elapsed * 0.6) * 0.08) * intensity;

      // Synapse firing: each arc pulses on its own cycle; reroll when dark.
      const glowScale = (0.35 + (glowRef.current / 100) * 0.65) * intensity * formP;
      for (const arc of arcs) {
        const wave = Math.sin(elapsed * arc.speed + arc.phase);
        const fired = Math.max(0, wave) ** 3;
        arc.material.color.copy(currentColor);
        arc.material.opacity = fired * 0.85 * glowScale;
        if (wave < -0.995) rerollArc(arc); // invisible right now — safe to move
      }

      // Parallax drift toward target.
      scene.position.x += (parallaxTarget.x - scene.position.x) * Math.min(1, dt * 4);
      scene.position.y += (parallaxTarget.y - scene.position.y) * Math.min(1, dt * 4);

      renderer.render(scene, camera);
    };

    const animate = () => {
      animationId = requestAnimationFrame(animate);
      if (hidden) return;
      // Half frame rate while the user drags nodes/camera — keep input smooth.
      frameToggle = !frameToggle;
      if (dragging && frameToggle) return;
      renderFrame();
    };

    const startOrStill = () => {
      cancelAnimationFrame(animationId);
      if (reducedMotionMq.matches) {
        // Static frame; skip the intro entirely and hand control to the page.
        if (isCinematic && !cinematicDone) {
          cinematicDone = true;
          elapsed = CINEMATIC_END;
          if (cloudTargets) {
            const pos = cloudGeometry.getAttribute("position") as THREE.BufferAttribute;
            (pos.array as Float32Array).set(cloudTargets);
            pos.needsUpdate = true;
          }
          window.setTimeout(() => onCinematicDoneRef.current?.(), 300);
        }
        renderFrame(); // single static frame, no loop
      } else {
        lastTime = 0; // next frame uses a nominal delta instead of the stall gap
        animate();
      }
    };
    startOrStill();

    const onVisibility = () => {
      hidden = document.hidden;
      if (!hidden) lastTime = 0;
    };
    document.addEventListener("visibilitychange", onVisibility);
    reducedMotionMq.addEventListener("change", startOrStill);

    const resizeObserver = new ResizeObserver(() => {
      const w = mount.clientWidth;
      const h = Math.max(mount.clientHeight, 1);
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
      if (reducedMotionMq.matches) renderFrame();
    });
    resizeObserver.observe(mount);

    return () => {
      cancelAnimationFrame(animationId);
      document.removeEventListener("visibilitychange", onVisibility);
      reducedMotionMq.removeEventListener("change", startOrStill);
      resizeObserver.disconnect();
      unsubscribeCanvas?.();
      starsGeometry.dispose();
      starsMaterial.dispose();
      wireGeometry.dispose();
      wireMaterial.dispose();
      cloudGeometry.dispose();
      cloudMaterial.dispose();
      atmosphere.geometry.dispose();
      atmosphereMaterial.dispose();
      for (const arc of arcs) {
        arc.line.geometry.dispose();
        arc.material.dispose();
      }
      renderer.dispose();
      mount.removeChild(renderer.domElement);
    };
  }, []);

  return <div ref={mountRef} className="neural-orb" aria-hidden="true" />;
}
